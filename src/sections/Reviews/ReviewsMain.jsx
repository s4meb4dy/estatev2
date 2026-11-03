import './ReviewsMain.scss'

const ReviewsMain = () => {
    const reviewsImages = [
        '/reviews/reviews-1.png',
        '/reviews/reviews-2.png',
        '/reviews/reviews-3.png',
        '/reviews/reviews-4.png',
        '/reviews/reviews-5.png',
        '/reviews/reviews-6.png',
        '/reviews/reviews-7.png',
        '/reviews/reviews-8.png',
        '/reviews/reviews-9.png',
        '/reviews/reviews-10.png',
        '/reviews/reviews-11.png',
        '/reviews/reviews-12.png',
        '/reviews/reviews-13.png',
        '/reviews/reviews-14.png',
        '/reviews/reviews-15.png',
    ]

    return(
        <section className="reviews">
            <p className="reviews-header">
                Некоторые отзывы о нашей работе
            </p>
            <div className="reviews-slider">
                <div className="slider-sec">
                    {reviewsImages.slice(0,8).map((item) => (
                        <img src={item} alt="Отзыв клиента" className="slider-item" key={item}/>
                    ))}
                </div>
                <div className="slider-sec">
                    {reviewsImages.slice(8, 15).map((item) => (
                        <img src={item} alt="Отзыв клиента" className="slider-item" key={item}/>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default ReviewsMain