import PropertyPhoto from '@/components/PropertyPhoto'
import './Card.scss'

const Card = (props) => {
  const {
    title,
    address,
    price,
    smallPrice,
    description,
    images = [],
    linkToPage
  } = props

  const photos = Array.isArray(images) ? images.filter(Boolean) : []
  const extraCount = Math.max(photos.length - 4, 0)
  const thumbnailPhotos = photos.slice(1, extraCount > 0 ? 4 : 5)

  const formatPrice = (value) => {
    if (value === undefined || value === null || value === '') return ''
    return typeof value === 'number' ? value.toLocaleString('ru-RU') : value
  }

  return (
    <div className="cards-container">
      <div className="card-n-nothing">
        <article className="real-estate-card">
          <div className="gallery-section">
            <PropertyPhoto
              className="main-image"
              src={photos[0]}
              alt={title ? `${title} — главное фото` : 'Фото объекта'}
              loading="lazy"
            />

            {thumbnailPhotos.length > 0 && (
              <div className="thumbnails">
                {thumbnailPhotos.map((photo, idx) => (
                  <div className="thumbnail" key={`${photo}-${idx}`}>
                    <img
                      src={photo}
                      alt={title ? `${title} — фото ${idx + 2}` : `Фото ${idx + 2}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}

                {extraCount > 0 && (
                  <div className="thumbnail more-photos">
                    <img
                      src={photos[4]}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                    />
                    <span>+{extraCount}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="info-section">
            <a className="link-to-current-page" href={linkToPage}>{title}</a>
            <p className="address">{address}</p>
            <p className="price">{formatPrice(price)} ₽</p>
            <p className="smallPrice">{formatPrice(smallPrice)} ₽/м²</p>
            <p className="description">{description}</p>
          </div>
        </article>
        <p className="nothing-line"></p>
      </div>
    </div>
  )
}

export default Card
