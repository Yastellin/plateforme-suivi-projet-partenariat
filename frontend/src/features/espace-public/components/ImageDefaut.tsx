// Image institutionnelle utilisée lorsqu'une couverture attendue est absente.
interface ImageDefautProps {
  alt?: string
  className?: string
}

export function ImageDefaut({ alt = "", className = "" }: ImageDefautProps) {
  return (
    <img
      src="/images/icone_aucune_image.jpg"
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  )
}
