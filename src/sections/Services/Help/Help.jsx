import './Help.scss'

const Help = () => {
    return (
        <section className="help">
            <p className="help-main-text">Не нашли нужную услугу?</p>
            <div className="help-main-sec">
                <div className="help-sec-left">
                    <p className="left-header">Получите бесплатную консультацию</p>
                    <p className="left-list-header">На консультации:</p>
                    <ul className="left-list">
                        <li className="left-list-item">
                            выслушаем вашу ситуацию
                        </li>
                        <li className="left-list-item">
                            объясним, что будем делать
                        </li>
                        <li className="left-list-item">
                            расскажем о гарантиях для вас при работе с нами
                        </li>
                        <li className="left-list-item">
                            соориентируем по срокам и стоимости
                        </li>
                    </ul>
                </div>

                <div className="help-sec-right">
                    <p className="right-header">Заполните форму, и мы свяжемся с вами как можно быстрее</p>
                    <form action="https://api.web3forms.com/submit" method="POST" className="help-form-header" id="HelpForm">
                        <input type="hidden" name="access_key" value="0019b786-9ec4-4f2d-a771-7529d847cff6"></input>
                        <input type="tel" id="HelpPhone" name="first-name" required="required" placeholder='+7(___)___-__-__' autocomplete="off"/>
                        <button type="submit" className="right-button-send"><span>Оставить заявку</span></button>
                    </form>
                    <a 
                        href="https://wa.me/79828263180"   
                        className="right-link"
                        target="_blank"
                    >
                        <span className="right-link-text"><span className="letter">Н</span>аписать на <span className="letter">W</span>hats<span className="letter">A</span>pp</span>
                        <svg className="right-whatsapp-logo" viewBox="0 0 40 40">
                            <path className="path-fill" d="M19.8966 0C8.91238 0 0 8.9587 0 20C0 24.4212 1.42367 28.4933 3.83117 31.8092L1.29635 39.3485L9.20174 36.8703C12.2921 38.8482 15.9613 40 19.8966 40C30.8808 40 39.7932 31.0413 39.7932 20C39.7932 8.9587 30.8808 0 19.8966 0ZM29.0057 30.7272C25.3945 32.1815 21.0888 30.7737 16.3779 27.1786C11.6671 23.5835 8.56514 18.5224 8.3568 14.7644C8.14846 11.0064 11.1926 9.10995 12.8477 9.12158C14.5029 9.13322 16.3201 14.4503 16.3432 15.2647C16.3664 16.0907 14.3177 17.5567 14.2367 18.2548C14.1556 18.9529 17.0261 22.3967 18.2414 23.3275C19.4452 24.2467 21.9337 26.0151 23.2185 25.8522C24.4917 25.6777 25.3366 23.1065 26.1468 22.9436C26.9571 22.7807 31.3785 24.9913 31.8184 25.5614C32.2582 26.1431 32.2119 29.4474 29.0057 30.7272Z" fill="white"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    )
}

export default Help