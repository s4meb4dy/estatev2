import PropertyPhoto from '@/components/PropertyPhoto'
import { formatArea, formatFloor, formatPrice, formatPricePerM2 } from '@shared/catalog/format'
import './PropertyDetail.scss'

const PropertyDetail = ({ property }) => {
    if (!property) {
        return null
    }

    const images = property.images.map((image) =>
        typeof image === 'string' ? { url: image, alt: '' } : image
    )
    const specialist = property.specialist || {}
    const specialistName = specialist.name || 'Специалист агентства'
    const specialistRole = specialist.role || 'Риэлтор'
    const specialistPhoto = specialist.photo || '/logo-main-no-bg.png'
    const phone = specialist.phone || property.phone || ''
    const whatsapp = String(specialist.whatsapp || property.whatsapp || '').replace(/\D/g, '')
    const priceText = formatPrice(property.price)
    const pricePerM2Text = formatPricePerM2(property.pricePerM2)
    const areaText = formatArea(property.area)
    const floorText = formatFloor(property)
    const condition = property.condition || 'Свободная продажа'

    return (
        <section className="current-object-section">
            <h1 className="object-header">{property.title}</h1>

            <div className="case-inner">
                <div className="case-left-wrapper" data-js-property-gallery>
                    <div className="case-left">
                        <div className="roulette-all">
                            <div className="left-roulette-big">
                                {images.map((image, index) => (
                                    <div className="left-roulette-item-big" key={`${image.url}-${index}`}>
                                        <PropertyPhoto
                                            className="detail-photo"
                                            src={image.url}
                                            alt={image.alt || `${property.title} — фото ${index + 1}`}
                                            loading={index === 0 ? 'eager' : 'lazy'}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="left-roulette-small">
                            {images.map((image, index) => (
                                <button
                                    type="button"
                                    className="left-roulette-item-small"
                                    key={`${image.url}-thumb-${index}`}
                                    data-js-gallery-thumb={index}
                                    aria-label={`Показать фото ${index + 1}`}
                                >
                                    <img
                                        src={image.url}
                                        className="small-img-for-script"
                                        alt={`${property.title} — миниатюра ${index + 1}`}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="left-mini-info">
                            <div className="left-mini-info-left">
                                <img src="/svg-area-icon-short.svg" alt="" />
                                <span>
                                    Общая площадь
                                    <br />
                                    {areaText}
                                </span>
                            </div>

                            <div className="left-mini-info-right">
                                <img src="/svg-stairs-icon.svg" alt="" />
                                <span>
                                    Этаж
                                    <br />
                                    {floorText}
                                </span>
                            </div>
                        </div>

                        <div className="left-about-object">
                            {property.description && (
                                <p className="left-about-object-description">{property.description}</p>
                            )}
                            {property.about && (
                                <>
                                    <p className="left-about-object-text">О недвижимости:</p>
                                    <p className="left-about-object-about">{property.about}</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="buttons">
                        <button
                            type="button"
                            className="paginate left"
                            aria-label="Предыдущее фото"
                            data-js-gallery-prev
                        >
                            <i></i><i></i>
                        </button>
                        <button
                            type="button"
                            className="paginate right"
                            aria-label="Следующее фото"
                            data-js-gallery-next
                        >
                            <i></i><i></i>
                        </button>
                    </div>
                </div>

                <div className="case-right">
                    <div className="right-top-win">
                        <div className="right-top-win-price">
                            {priceText} ₽
                        </div>
                        <div className="right-top-win-items">
                            {pricePerM2Text && (
                                <div className="case-item">
                                    <p className="case-item-key">
                                        Стоимость метра
                                    </p>
                                    <p className="case-item-value">
                                        {pricePerM2Text}
                                    </p>
                                </div>
                            )}
                            <div className="case-item">
                                <p className="case-item-key">
                                    Условия сделки
                                </p>
                                <p className="case-item-value">
                                    {condition}
                                </p>
                            </div>
                        </div>
                        {phone && (
                            <div className="right-top-win-number">
                                {phone}
                            </div>
                        )}
                    </div>

                    <div className="right-bottom-win">
                        <div className="case-persons">
                            <div className="case-persons-img">
                                <img src={specialistPhoto} alt={specialistName} />
                            </div>
                            <div className="case-persons-text">
                                <p className="case-persons-text-name">
                                    {specialistName}
                                </p>
                                <p className="case-persons-text-role">
                                    {specialistRole}
                                </p>
                            </div>
                        </div>

                        {whatsapp ? (
                            <a
                                href={`https://wa.me/${whatsapp}`}
                                className="write-to-spec-link"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className="write-to-spec-link-text">
                                    <span className="letter">Н</span>аписать на <span className="letter">W</span>hats<span className="letter">A</span>pp
                                </span>
                                <svg className="write-to-spec-logo" viewBox="0 0 40 40">
                                    <path className="path-fill" d="M19.8966 0C8.91238 0 0 8.9587 0 20C0 24.4212 1.42367 28.4933 3.83117 31.8092L1.29635 39.3485L9.20174 36.8703C12.2921 38.8482 15.9613 40 19.8966 40C30.8808 40 39.7932 31.0413 39.7932 20C39.7932 8.9587 30.8808 0 19.8966 0ZM29.0057 30.7272C25.3945 32.1815 21.0888 30.7737 16.3779 27.1786C11.6671 23.5835 8.56514 18.5224 8.3568 14.7644C8.14846 11.0064 11.1926 9.10995 12.8477 9.12158C14.5029 9.13322 16.3201 14.4503 16.3432 15.2647C16.3664 16.0907 14.3177 17.5567 14.2367 18.2548C14.1556 18.9529 17.0261 22.3967 18.2414 23.3275C19.4452 24.2467 21.9337 26.0151 23.2185 25.8522C24.4917 25.6777 25.3366 23.1065 26.1468 22.9436C26.9571 22.7807 31.3785 24.9913 31.8184 25.5614C32.2582 26.1431 32.2119 29.4474 29.0057 30.7272Z" fill="white"></path>
                                </svg>
                            </a>
                        ) : phone ? (
                            <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="write-to-spec-link">
                                <span className="write-to-spec-link-text">Позвонить специалисту</span>
                            </a>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default PropertyDetail
