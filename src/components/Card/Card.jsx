import "./Card.scss"

const Card = (props) => {
  const {
    id,
    title,
    address,
    price,
    smallPrice,
    description,
    images,
    linkToPage
  } = props

  return (
    <div className="cards-container">
      <div className="card-n-nothing" key={id}>
        <div className="real-estate-card">

          <div className="gallery-section">
            <div className="main-image">
              <img src={images[0]} alt="Главное фото" />
            </div>

            <div className="thumbnails">

                {[1, 2, 3].map((idx) => (
                      <div className="thumbnail">
                        <img src={images[idx]} alt={`Фото ${idx}`} />
                      </div>
                  ))}


                <div className="thumbnail more-photos">
                  <img 
                    src={images[4] || images[0]} 
                    style={{ filter: 'blur(2px)' }} 
                    alt="Еще фото"
                  />
                  <span>+{images.length - 4}</span>
                </div>

            </div>
          </div>

          <div className="info-section">
            <a className="link-to-current-page" href={linkToPage}>{title}</a>
            <p className="address">{address}</p>
            <p className="price">{price.toLocaleString()} ₽</p>
            <p className="smallPrice">{smallPrice.toLocaleString()} ₽/м²</p>


            <p className="description">{description}</p>
          </div>
        </div>
        <p className="nothing-line"></p>
      </div>
    </div>
  )
}

export default Card;