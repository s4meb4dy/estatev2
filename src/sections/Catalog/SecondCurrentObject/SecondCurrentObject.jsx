import './SecondCurrentObject.scss'

const SecondCurrentObject = () => {
    const objectsCardsInfo = {
        id: 3,
        title: "Квартира 3 комнаты площадью 131м² 17/25 этаж",
        address: "Москва, ул. Пушкина, д. 20",
        price: "30 500 000 ₽",
        smallPrice: "232 470 ₽",
        description: "Просторная, огромная светлая трёхкомнатная квартира на 17 этаже 25-этажного дома в ЖК Град Московский.",
        images: [
            '/img/property3-1.jpg',
            '/img/property3-2.jpg',
            '/img/property3-3.jpg',
            '/img/property3-4.jpg',
            '/img/property3-5.jpg',
            '/img/property3-6.jpg',
            '/img/property3-7.jpg',
            '/img/property3-8.jpg',
        ],
        condition: "Свободная продажа",
        numberTel: "+7(982)826-31-80",
        nameOfSpecialist: "Иванов Дмитрий",
        roleOfSpecialist: "Риэлтор",
        floor: "17 / 25",
        area: "131м²",
        about: "Квартира с качественным дизайнерским ремонтом. Шикарная ванная комната совмещенная с санузлом (кафель-плитка) имеется окно для проветривания и душевая комната совмещенная с санузлом так же (кафель - плитка). Есть удобная прачечная комната. Взрослая спальня с утеплённой лоджией. Площадь кухни 27 кв.м., а комнат 25+20+22.4 кв.м. Паркетная доска из дуба, качественные межкомнатные двери, в прихожей установлен видеодомофон. Система света распределена по зонам и имеет разные уровни освещения. Для нового собственника остается вся мебель и бытовая техника. Полы в коридоре и на кухне выполнены из качественной плитки. На кухне и в ванной полы с подогревом."
    }

    return (
        <section className="current-object-section">
            <h4 className="object-header">{objectsCardsInfo.title}</h4>
            <div className="case-inner">
                <div className="case-left-wrapper">
                    <div className="case-left">
                        <div classname="roulette-all">
                            <div className="left-roulette-big">
                                {objectsCardsInfo.images.map((items, index) => (
                                    <div className="left-roulette-item-big">
                                        <img src={items} key={index} className="big-img-for-script" alt="/"/>
                                    </div>
                                ))}
                            </div>

                        </div>

                        <div className="left-roulette-small">
                            {objectsCardsInfo.images.map((items, index) => (
                                <div className="left-roulette-item-small">
                                    <img src={items} key={index} className="small-img-for-script" alt="/"/>
                                </div>
                            ))}
                        </div>

                        <div className="left-mini-info">
                            <div className="left-mini-info-left">
                                <img src="/svg-area-icon-short.svg" />
                                <span>
                                    Общая площадь
                                    <br />
                                    {objectsCardsInfo.area}
                                </span>
                            </div>

                            <div className="left-mini-info-right">
                                <img src="/svg-stairs-icon.svg" alt="" />
                                <span>
                                    Этаж
                                    <br />
                                    {objectsCardsInfo.floor}
                                </span>
                            </div>
                        </div>

                        <div className="left-about-object">
                            <p className="left-about-object-description">{objectsCardsInfo.description}</p>
                            <p className="left-about-object-text">О недвижимости:</p>
                            <p className="left-about-object-about">{objectsCardsInfo.about}</p>
                        </div>
                    </div>
                    <div className="buttons">
                        <button class="paginate left"><i></i><i></i></button>
                        <button class="paginate right"><i></i><i></i></button>
                    </div>
                </div>

                
                <div className="case-right">
                    <div className="right-top-win">
                        <div className="right-top-win-price">
                            {objectsCardsInfo.price}
                        </div>
                        <div className="right-top-win-items">
                            <div className="case-item">
                                <p className="case-item-key">
                                    Стоимость метра
                                </p>
                                <p className="case-item-value">
                                    {objectsCardsInfo.smallPrice}
                                </p>
                            </div>
                            <div className="case-item">
                                <p className="case-item-key">
                                    Условия сделки
                                </p>
                                <p className="case-item-value">
                                    {objectsCardsInfo.condition}
                                </p>
                            </div>
                        </div>
                        <div className="right-top-win-number">
                            {objectsCardsInfo.numberTel}
                        </div>
                    </div>

                    <div className="right-bottom-win">
                        <div className="case-persons">
                            <div className="case-persons-img">
                                <img src="/" alt="" />
                            </div>
                            <div className="case-persons-text">
                                <p className="case-persons-text-name">
                                    {objectsCardsInfo.nameOfSpecialist}
                                </p>
                                <p className="case-persons-text-role">
                                    {objectsCardsInfo.roleOfSpecialist}
                                </p>
                            </div>
                        </div>
                        <a 
                            href="https://wa.me/79828263180"   
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
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SecondCurrentObject