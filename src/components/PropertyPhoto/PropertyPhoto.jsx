import './PropertyPhoto.scss'

const PropertyPhoto = ({
  src,
  srcSet,
  sizes,
  alt = '',
  className = '',
  loading = 'lazy',
  width,
  height,
}) => {
  const setOrientation = (image) => {
    if (!image || !image.naturalWidth || !image.naturalHeight) return

    const frame = image.closest('.property-photo')

    if (frame) {
      frame.dataset.orientation =
        image.naturalWidth >= image.naturalHeight ? 'landscape' : 'portrait'
    }
  }

  // Фото может загрузиться ещё до гидратации React, поэтому проверяем
  // готовность изображения при монтировании, а не только по onLoad.
  const handleImageRef = (image) => {
    if (image?.complete) {
      setOrientation(image)
    }
  }

  if (!src) {
    return (
      <div
        className={`property-photo property-photo--empty ${className}`.trim()}
        aria-hidden="true"
      />
    )
  }

  return (
    <div className={`property-photo ${className}`.trim()}>
      <img
        className="property-photo__backdrop"
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt=""
        aria-hidden="true"
        loading={loading}
        decoding="async"
      />
      <img
        ref={handleImageRef}
        className="property-photo__image"
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        onLoad={(event) => setOrientation(event.currentTarget)}
      />
    </div>
  )
}

export default PropertyPhoto
