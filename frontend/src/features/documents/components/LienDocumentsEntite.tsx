import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  creerLienDocuments,
  type EntiteDocuments,
} from '../lib/cible-documents';

interface LienDocumentsEntiteProps {
  entite: EntiteDocuments;
  id: string;
  nom: string;
  cheminBase: string;
}

export function LienDocumentsEntite({
  entite,
  id,
  nom,
  cheminBase,
}: LienDocumentsEntiteProps) {
  return (
    <Link
      to={creerLienDocuments(cheminBase, entite, id)}
      title={`Ouvrir les documents liés à ${nom}`}
      aria-label={`Ouvrir les documents liés à ${nom}`}
      className="inline-flex min-h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-primary/30 bg-background px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <FileText aria-hidden="true" className="h-4 w-4" />
      <span>Documents</span>
    </Link>
  );
}
