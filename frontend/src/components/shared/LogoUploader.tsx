import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { LogoMedia } from "@/components/shared/ImageMedia";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface LogoUploaderProps {
  endpoint: string;
  logoUrl?: string | null;
  nom: string;
  queryKeys?: readonly (readonly unknown[])[];
  lectureSeule?: boolean;
}

interface ReponseTeleversementLogo {
  logo_url?: string | null;
}

/** Uploader commun aux logos Présidence, établissement et partenaire. */
export function LogoUploader({
  endpoint,
  logoUrl,
  nom,
  queryKeys = [],
  lectureSeule = false,
}: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [apercu, setApercu] = useState<string | null>(null);
  const [dialogueRetraitOuvert, setDialogueRetraitOuvert] = useState(false);
  const [logoTeleverse, setLogoTeleverse] = useState<{
    endpoint: string;
    url: string | null;
    urlAvantTeleversement: string | null;
  } | null>(null);

  useEffect(
    () => () => {
      if (apercu) URL.revokeObjectURL(apercu);
    },
    [apercu],
  );

  const mutation = useMutation({
    mutationFn: async (fichier: File) => {
      const donnees = new FormData();
      donnees.append("fichier", fichier);
      return (
        await apiClient.post<ReponseTeleversementLogo>(endpoint, donnees)
      ).data;
    },
    onSuccess: async (reponse) => {
      if (reponse.logo_url) {
        // La réponse de l'upload est la source de vérité immédiate. L'aperçu
        // local peut ainsi être retiré sans attendre un nouveau rendu parent.
        setLogoTeleverse({
          endpoint,
          url: reponse.logo_url,
          urlAvantTeleversement: logoUrl ?? null,
        });
      }
      await Promise.allSettled(
        queryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
      toast.success("Logo mis à jour");
      setApercu(null);
    },
    onError: (erreur: Error) => {
      toast.error(erreur.message);
      setApercu(null);
    },
  });

  const suppression = useMutation({
    mutationFn: async () =>
      (await apiClient.delete<ReponseTeleversementLogo>(endpoint)).data,
    onSuccess: async (reponse) => {
      setLogoTeleverse({
        endpoint,
        url: reponse.logo_url ?? null,
        urlAvantTeleversement: logoUrl ?? null,
      });
      await Promise.allSettled(
        queryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
      setDialogueRetraitOuvert(false);
      toast.success('Logo retiré');
    },
    onError: (erreur: Error) => toast.error(erreur.message),
  });

  function choisir(fichier?: File) {
    if (inputRef.current) inputRef.current.value = "";
    if (!fichier) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(fichier.type)) {
      toast.error("Choisissez une image JPEG, PNG ou WebP.");
      return;
    }
    if (fichier.size > 2 * 1024 * 1024) {
      toast.error("Le logo ne doit pas dépasser 2 Mo.");
      return;
    }
    const url = URL.createObjectURL(fichier);
    setApercu(url);
    mutation.mutate(fichier);
  }

  const reponseUploadEnAttenteDuCache =
    logoTeleverse?.endpoint === endpoint &&
    (logoUrl ?? null) === logoTeleverse.urlAvantTeleversement;
  const logoConfirme = reponseUploadEnAttenteDuCache
    ? logoTeleverse?.url
    : logoUrl;
  const source = apercu ?? logoConfirme;
  return (
    <div className="flex items-center gap-4">
      <LogoMedia
        key={source ?? "sans-logo"}
        src={source}
        nom={nom}
        className="h-20 w-20 flex-shrink-0 rounded-lg border border-[var(--color-border)] bg-white object-contain p-1 text-lg"
      />
      {!lectureSeule ? (
        <div>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => choisir(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={mutation.isPending || suppression.isPending}
            className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-xs font-semibold hover:border-[var(--color-brand)] disabled:opacity-60"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {logoConfirme ? "Remplacer le logo" : "Ajouter un logo"}
          </button>
          {logoConfirme ? (
            <button
              type="button"
              onClick={() => setDialogueRetraitOuvert(true)}
              disabled={mutation.isPending || suppression.isPending}
              className="ml-2 rounded-[var(--radius-sm)] px-2 py-2 text-xs font-semibold text-[var(--status-expire-fg)] hover:bg-[var(--color-chrome-hover)] disabled:opacity-60"
            >
              Retirer le logo
            </button>
          ) : null}
          <p
            className="mt-1 text-[11px] text-[var(--color-text-secondary)]"
            data-aide-contextuelle-contenu
          >
            JPEG, PNG ou WebP — 2 Mo maximum
          </p>
        </div>
      ) : null}
      <ConfirmDialog
        ouvert={dialogueRetraitOuvert}
        onFermer={() => setDialogueRetraitOuvert(false)}
        onConfirmer={() => suppression.mutate()}
        titre="Retirer le logo ?"
        description={`Le logo de ${nom} sera retiré.`}
        libelleAction="Retirer le logo"
        enCours={suppression.isPending}
        destructif
      />
    </div>
  );
}
