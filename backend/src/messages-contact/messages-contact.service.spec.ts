import { BadRequestException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MessagesContactService } from './messages-contact.service';
import { CreateMessageContactDto } from './dto/create-message-contact.dto';
import { Role } from '../common/enums/role.enum';

const valide = {
  nom: 'Jean Rakoto',
  email: 'jean.rakoto@example.mg',
  sujet: 'Demande de partenariat',
  message: 'Bonjour, je souhaite un partenariat avec votre établissement.',
};

describe('CreateMessageContactDto', () => {
  const erreurs = async (extra: Record<string, unknown>) => {
    const dto = plainToInstance(CreateMessageContactDto, {
      ...valide,
      ...extra,
    });
    return validate(dto);
  };

  it('accepte un message valide', async () => {
    expect(await erreurs({})).toHaveLength(0);
  });

  it('refuse un nom avec des chiffres', async () => {
    const e = await erreurs({ nom: 'Jean2' });
    expect(e.map((x) => x.property)).toContain('nom');
  });

  it('refuse un message trop court', async () => {
    const e = await erreurs({ message: 'court' });
    expect(e.map((x) => x.property)).toContain('message');
  });

  it('refuse un email invalide', async () => {
    const e = await erreurs({ email: 'pas-un-email' });
    expect(e.map((x) => x.property)).toContain('email');
  });

  it('refuse un identifiant d’établissement qui n’est pas un UUID', async () => {
    const e = await erreurs({ etablissement_id: '123' });
    expect(e.map((x) => x.property)).toContain('etablissement_id');
  });

  it('nettoie les espaces et met l’email en minuscules', async () => {
    const dto = plainToInstance(CreateMessageContactDto, {
      ...valide,
      nom: '  Jean Rakoto  ',
      email: '  Jean.Rakoto@Example.MG ',
    });
    expect(dto.nom).toBe('Jean Rakoto');
    expect(dto.email).toBe('jean.rakoto@example.mg');
  });
});

describe('MessagesContactService', () => {
  let messageRepo: any;
  let etablissementRepo: any;
  let service: MessagesContactService;

  beforeEach(() => {
    messageRepo = {
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => ({
        id: 'm1',
        date_creation: new Date('2026-10-19'),
        ...x,
      })),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
      count: jest.fn().mockResolvedValue(0),
      findOne: jest.fn(),
    };
    etablissementRepo = { findOneBy: jest.fn() };
    service = new MessagesContactService(messageRepo, etablissementRepo);
  });

  it('refuse un établissement destinataire inconnu', async () => {
    etablissementRepo.findOneBy.mockResolvedValue(null);
    await expect(
      service.creer({
        ...valide,
        etablissement_id: '11111111-1111-4111-8111-111111111111',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('enregistre le téléphone au format international', async () => {
    await service.creer({ ...valide, telephone: '034 22 330 54' });
    expect(messageRepo.save.mock.calls[0][0].telephone).toBe('+261342233054');
  });

  it('refuse un téléphone invalide', async () => {
    await expect(
      service.creer({ ...valide, telephone: '00000000' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('un utilisateur ETABLISSEMENT ne voit que les messages de son établissement', async () => {
    await service.findAll(
      { page: 1, limit: 20 },
      {
        id: 'u1',
        role: Role.ETABLISSEMENT,
        etablissement_id: 'e1',
      },
    );
    expect(messageRepo.findAndCount.mock.calls[0][0].where).toEqual({
      etablissement_id: 'e1',
    });
  });

  it('un utilisateur ETABLISSEMENT sans établissement ne reçoit rien', async () => {
    const r = await service.findAll(
      { page: 1, limit: 20 },
      {
        id: 'u1',
        role: Role.ETABLISSEMENT,
        etablissement_id: null,
      },
    );
    expect(r.data).toEqual([]);
    expect(messageRepo.findAndCount).not.toHaveBeenCalled();
  });

  it('la Présidence voit tous les messages', async () => {
    await service.findAll(
      { page: 1, limit: 20 },
      {
        id: 'u2',
        role: Role.PRESIDENCE,
        etablissement_id: null,
      },
    );
    expect(messageRepo.findAndCount.mock.calls[0][0].where).toEqual({});
  });

  it('refuse de marquer lu un message qui n’est pas destiné à l’établissement', async () => {
    messageRepo.findOne.mockResolvedValue(null);
    await expect(
      service.marquerLu('m1', {
        id: 'u1',
        role: Role.ETABLISSEMENT,
        etablissement_id: 'e2',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(messageRepo.findOne.mock.calls[0][0].where).toEqual({
      id: 'm1',
      etablissement_id: 'e2',
    });
  });

  it('marque lu une seule fois et enregistre la date de lecture', async () => {
    const message = {
      id: 'm1',
      est_lu: false,
      date_lecture: null,
      nom: 'X',
      etablissement: null,
    };
    messageRepo.findOne.mockResolvedValue(message);
    await service.marquerLu('m1', {
      id: 'u2',
      role: Role.PRESIDENCE,
      etablissement_id: null,
    });
    expect(message.est_lu).toBe(true);
    expect(message.date_lecture).toBeInstanceOf(Date);
    expect(messageRepo.save).toHaveBeenCalledTimes(1);
  });
});
