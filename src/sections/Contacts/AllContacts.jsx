import './AllContacts.scss'

const AllContacts = () => {
    return(
        <section className="contacts">
            <div className="contacts-left">
                <div className="contacts-adress">
                    г.Воткинск, улица Ленина, <br/>
                    дом 3, офис 3
                </div>
                <div className="contacts-worktime">
                    Пн-Пт 9:00 - 18:00
                </div>
                <div className="contacts-number">
                    <p className="contacts-number-text">
                        Заявки принимаем 24/7
                    </p>
                    <a className="contacts-number-link" href="tel:+7 (982) 826-31-80">
                        <span className="contacts-number-tel">
                            +7 (982) 826-31-80
                        </span>
                    </a>
                </div>
                <div className="contacts-social">
                    Пишите, будем ждать
                    <ul className="social-list">
                        <li className="social-item">
                            <a href="https://wa.me/79828263180" className="social-link whatsapp">
                                <svg className="whatsapp-link" viewBox="0 0 40 40">
                                    <path className="whatsapp-path" d="M19.8966 0C8.91238 0 0 8.9587 0 20C0 24.4212 1.42367 28.4933 3.83117 31.8092L1.29635 39.3485L9.20174 36.8703C12.2921 38.8482 15.9613 40 19.8966 40C30.8808 40 39.7932 31.0413 39.7932 20C39.7932 8.9587 30.8808 0 19.8966 0ZM29.0057 30.7272C25.3945 32.1815 21.0888 30.7737 16.3779 27.1786C11.6671 23.5835 8.56514 18.5224 8.3568 14.7644C8.14846 11.0064 11.1926 9.10995 12.8477 9.12158C14.5029 9.13322 16.3201 14.4503 16.3432 15.2647C16.3664 16.0907 14.3177 17.5567 14.2367 18.2548C14.1556 18.9529 17.0261 22.3967 18.2414 23.3275C19.4452 24.2467 21.9337 26.0151 23.2185 25.8522C24.4917 25.6777 25.3366 23.1065 26.1468 22.9436C26.9571 22.7807 31.3785 24.9913 31.8184 25.5614C32.2582 26.1431 32.2119 29.4474 29.0057 30.7272Z" fill="white"></path>
                                </svg>
                            </a>
                        </li>
                        <li className="social-item">
                            <a href="https://t.me/s4meb4dy" className="social-link telegram">
                                <img src="/svg-telegram-logo.svg" alt="" />
                            </a>
                        </li>
                        <li className="social-item">
                            <a href="https://vk.com/id292026890" className="social-link vk">
                                <img src="/svg-vk-logo.svg" alt="" />
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="contacts-adress-full">
                    ООО "НЕДВИЖИМОСТЬ ГОРОД" <br/>
                    Юр. адрес: 427430, г. Воткинск, <br/>
                    ул. Ленина, д. 3, офис 3<br/>
                    ОГРН: 1241800000408<br/>
                    ИНН: 1800011684<br/>
                </div>
            </div>

            <div className="contacts-map">    
                <a className="contacts-map-link" href="https://yandex.ru/maps/?um=constructor%3A41b1194af990a9b06d82be54ceddee1f7d980d769380200cf09d9fb3ba5f2c58&amp;source=constructorStatic" target="_blank">
                    <img src="https://api-maps.yandex.ru/services/constructor/1.0/static/?um=constructor%3A41b1194af990a9b06d82be54ceddee1f7d980d769380200cf09d9fb3ba5f2c58&amp;width=397&amp;height=450&amp;lang=ru_RU" alt="" style={{border: 0}} />
                </a>
            </div>

            <div className="contacts-right">
                <div className="contacts-textus">
                    Свяжитесь с нами, и мы вам поможем
                </div>
                <form action="https://api.web3forms.com/submit" method="POST">
                   <input type="hidden" name="access_key" value="0019b786-9ec4-4f2d-a771-7529d847cff6"></input>

                    <p className="contacts-form-name">
                        Введите имя
                    </p>
                    <input type="text" required placeholder='Ваше имя' className="contacts-form-name-input"/>
                    
                    <p className="contacts-form-tel">
                        Введите номер телефона
                    </p>
                    <input type="tel" required placeholder='Ваш номер телефона' className="contacts-form-tel-input"/>
                    
                    <p className="contacts-form-mail">
                        Введит эл.почту
                    </p>
                    <input type="mail" required placeholder='E-mail'className="contacts-form-mail-input" />
                    
                    <p className="contacts-form-text">
                        Введите сообщение
                    </p>
                    <textarea type="text"required placeholder='Текст сообщения' className="contacts-form-text-input" />
                    
                    <button className="contacts-form-but">Отправить</button>
                </form>
            </div>

        </section>
    )
}

export default AllContacts