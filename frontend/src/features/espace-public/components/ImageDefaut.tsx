// Image institutionnelle utilisée lorsqu'aucune image propre à l'entité n'est disponible.
interface ImageDefautProps {
  alt?: string
  className?: string
}

export function ImageDefaut({
  alt = "Image indisponible",
  className = "",
}: ImageDefautProps) {
  return (
    <img
      src="/images/icone_aucune_image.jpg"
      alt={alt}
      className={className}
      loading="lazy"
    />
  )
}
