import './Advantages.scss'

const Advantages = () => {
    return (
        <section className="section">
            <div className="left-adv adv-block">

                <div className="left-adv-1 left-adv-item adv-item">
                    {/* <img src="/" alt="#" className="left-adv-item-1-img" /> */}
                    <div className="left-adv-item-1-header adv-header">
                        Преимущества
                    </div>
                    <div className="left-adv-item-1-show-text adv-text">
                        Более 10 лет опыта
                        <div className="left-adv-item-1-show-text adv-show-text visible-mobile">
                            Наш приоритет - решение любых ваших задач по недвижимости, вне зависимости от сложности.
                        </div>
                    </div>
                    
                </div>

                <div className="left-adv-2 left-adv-item adv-item">
                    {/* <img src="/" alt="#" className="left-adv-item-2-img" /> */}
                    <div className="left-adv-item-2-header adv-header">
                        Преимущества
                    </div>
                    <div className="left-adv-item-2-show-text adv-text">
                        Внимательны к каждому клиенту
                        <div className="left-adv-item-2-show-text adv-show-text visible-mobile">
                            Команда лучших специалистов поможет вам по сделке
                        </div>
                    </div>
                </div>
            </div>

            <div className="right-adv adv-block">
                <div className="right-adv-item adv-item">
                    {/* <img src="/" alt="#" className="right-adv-item-img" /> */}
                    <div className="right-adv-item-header adv-header">
                        Преимущества
                    </div>
                    <div className="right-adv-item-show-text adv-text">
                        Честны и открыты в работе
                        <div className="right-adv-item-show-text adv-show-text visible-mobile">
                            Гарантируем юридическую чистоту сделок
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default Advantages