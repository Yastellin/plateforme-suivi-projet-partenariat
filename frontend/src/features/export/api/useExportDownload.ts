import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import type { FiltresExport, FormatExport, PorteeExport } from '../types/export.types';

function nomDepuisEntetes(disposition: string | undefined, filtres: FiltresExport): string {
  const utf8 = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (utf8) {
    try {
      return decodeURIComponent(utf8.replace(/^"|"$/g, ''));
    } catch {
      // Utilise le nom de repli si le nom d'en-tête est invalide.
    }
  }
  const classique = disposition?.match(/filename="?([^";]+)"?/i)?.[1];
  if (classique) return classique;
  const extension = filtres.format === 'CSV' ? 'zip' : filtres.format.toLowerCase();
  return `export_${filtres.portee.toLowerCase()}.${extension}`;
}

function nomFallback(portee: PorteeExport, format: FormatExport): string {
  const extension = format === 'CSV' ? 'zip' : format.toLowerCase();
  return `export_${portee.toLowerCase()}.${extension}`;
}

export function useExportDownload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (filtres: FiltresExport) => {
      const reponse = await apiClient.post<Blob>('/exports', filtres, {
        responseType: 'blob',
      });
      const typeMime = reponse.headers['content-type'];
      const blob =
        reponse.data instanceof Blob
          ? reponse.data
          : new Blob([reponse.data as BlobPart], {
              type: typeof typeMime === 'string' ? typeMime : 'application/octet-stream',
            });
      const nom = nomDepuisEntetes(
        reponse.headers['content-disposition'],
        filtres,
      ) || nomFallback(filtres.portee, filtres.format);
      const url = window.URL.createObjectURL(blob);
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = nom;
      lien.style.display = 'none';
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
      return nom;
    },
    onSuccess: async () => {
      toast.success('Export téléchargé');
      await queryClient.invalidateQueries({ queryKey: ['exports', 'historique'] });
    },
    onError: (erreur) => {
      toast.error(
        erreur instanceof Error
          ? erreur.message
          : 'Le téléchargement a échoué. Réessayez.',
      );
    },
  });
}
