import Logo from '@/components/Logo'
import './Footer.scss'

const Footer = () => {
    return (
        <footer className='footer'>
            <div className="footer-top">
                <div className="footer-item-header">
                    <Logo className="footer-logo"/>
                    <p className="footer-item-header-slog visible-mobile">
                        Специализированное агентство на<br/>рынке вторичной недвижимости<br/>Воткинска. 
                        <b> Работаем более 10 лет.</b>
                    </p>
                </div>

                <div className="footer-item footer-navigation hidden-mobile">
                    <p className="footer-navigation-about footer-main-text">
                        <b>Навигация по сайту</b>
                    </p>
                    <ul className="footer-navigation-list footer-list">
                        <li className="footer-navigatoin-list-item item-1">
                            <a href="/" className="footer-navigation-to link-1">
                                Главная
                            </a>
                        </li>
                        <li className="footer-navigatoin-list-item item-2">
                            <a href="/Services" className="footer-navigation-to link-2">
                                Все услуги
                            </a>
                        </li>
                        <li className="footer-navigatoin-list-item item-3">
                            <a href="/Catalog" className="footer-navigation-to link-3">
                                Каталог недвижимости
                            </a>
                        </li>
                        <li className="footer-navigatoin-list-item item-4">
                            <a href="/About" className="footer-navigation-to link-4">
                                О компании
                            </a>
                        </li>
                        <li className="footer-navigatoin-list-item item-5">
                            <a href="/Reviews" className="footer-navigation-to link-5">
                                Отзывы
                            </a>
                        </li>
                        <li className="footer-navigatoin-list-item item-6">
                            <a href="/Contacts" className="footer-navigation-to link-6">
                                Контакты
                            </a>
                        </li>
                    </ul>                    
                </div>

                <div className="footer-item footer-services hidden-mobile">
                    <p className="footer-services-about footer-main-text">
                        <b>Услуги</b>
                    </p>
                    <ul className="footer-services-list footer-list">
                        <li className="footer-services-list-item item-1">
                            Юридическое сопровождение
                        </li>
                        <li className="footer-services-list-item item-2">
                            Покупка недвижимости
                        </li>
                        <li className="footer-services-list-item item-3">
                            Продажа недвижимости
                        </li>
                        <li className="footer-services-list-item item-4">
                            Оценка недвижимости
                        </li>
                        <li className="footer-services-list-item item-5">
                            Ускорение продажи
                        </li>
                        <li className="footer-services-list-item item-6">
                            Повышение стоимости недвижимости
                        </li>
                    </ul>
                </div>

                <div className="footer-item footer-advantages hidden-mobile">
                    <p className="footer-advantages-about footer-main-text">
                        <b>Преимущества</b>
                    </p>
                    <ul className="footer-advantages-list footer-list">
                        <li className="footer-advantages-list-item item-1">
                            Более 10 лет на рынке
                        </li>
                        <li className="footer-advantages-list-item item-2">
                            Точная оценка недвижимости
                        </li>
                        <li className="footer-advantages-list-item item-3">
                            1000+ довольных клиентов
                        </li>
                        <li className="footer-advantages-list-item item-4">
                            Гарантия юр. чистоты
                        </li>
                        <li className="footer-advantages-list-item item-5">
                            Помощь в покупке и продаже
                        </li>
                        <li className="footer-advantages-list-item item-6">
                            Отзывчивовсть и вовлеченность
                        </li>
                    </ul>
                </div>

                <div className="footer-item footer-contacts">
                    <p className="footer-contacts-about footer-main-text hidden-mobile">
                        <b>Контакты</b>
                    </p>
                    <div className="footer-contacts-social">
                        <p className="footer-contacts-social-text">
                            Спрашивайте, отвечаем онлайн
                        </p>
                        <ul className="footer-contacts-list">
                            <li className="footer-contacts-list-item item-whatsup">
                                <a href="https://wa.me/79828263180" className="footer-contacts-links">
                                    <img src="/free-icon-whatsapp-4494494.png" alt="whatsup" className="footer-link footer-link-whatsup" />
                                </a>
                            </li>
                            <li className="footer-contacts-list-item item-telegram">
                                <a href="https://t.me/s4meb4dy" className="footer-contacts-links">
                                    <img src="/free-icon-telegram-2111646.png" alt="telegram" className="footer-link footer-link-telegram" />
                                </a>
                            </li>

                            <li className="footer-contacts-list-item item-vk">
                                <a href="https://vk.com/id292026890" className="footer-contacts-links">
                                    <img src="/free-icon-vk-2504953.png" alt="vk" className="footer-link footer-link-vk" />
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="footer-contacts-wait">
                        <p className="footer-contacts-wait-text">
                            <b>Ждем вас в офисе</b>
                        </p>
                        <p className="footer-contacts-wait-adress">
                            Воткинск, Ленина 3, офис 3
                        </p>
                    </div>
                    <div className="footer-contacts-ooo hidden-mobile">                            
                        ООО «НЕДВИЖИМОСТЬ ГОРОД»
                        <br />
                        Юр. адрес: 427430, г. Воткинск,
                        <br /> 
                        ул. Ленина, д. 3, офис 3
                        <br />
                        ОГРН: 1241800000408
                        <br />
                        ИНН: 1800011684                  
                    </div>
                   
                </div>
            </div>

            <p className="footer-nothing-line">

            </p>

            <div className="footer-bottom">
                <p className="footer-bottom-item footer-bottom-name">
                    Агенство недвижимости "Город"
                </p>
                <p className="footer-bottom-creators">Made by&nbsp;
                    <a className='creators somebody' href='https://t.me/s4meb4dy'>somebody&nbsp;</a>
                </p>
            </div>
        </footer>
    )
}

export default Footer