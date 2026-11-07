import PropertyPhoto from '@/components/PropertyPhoto'
import { formatPrice, formatPricePerM2 } from '@shared/catalog/format'
import './Card.scss'

const Card = ({ property }) => {
  const {
    title,
    address,
    price,
    pricePerM2,
    description,
    images = [],
    slug,
  } = property

  const photos = images
    .map((image) => (typeof image === 'string' ? image : image?.url))
    .filter(Boolean)

  const extraCount = Math.max(photos.length - 4, 0)
  const thumbnailPhotos = photos.slice(1, extraCount > 0 ? 4 : 5)
  const priceText = formatPrice(price)
  const pricePerM2Text = formatPricePerM2(pricePerM2)

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
            <a className="link-to-current-page" href={`/Catalog/${slug}`}>{title}</a>
            <p className="address">{address}</p>
            {priceText && <p className="price">{priceText} ₽</p>}
            {pricePerM2Text && <p className="smallPrice">{pricePerM2Text}</p>}
            {description && <p className="description">{description}</p>}
          </div>
        </article>
        <p className="nothing-line"></p>
      </div>
    </div>
  )
}

export default Card
