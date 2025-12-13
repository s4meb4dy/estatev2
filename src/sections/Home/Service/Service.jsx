
import ModalForm from '@/components/ModalForm';
import './Service.scss'

const Services = () => {
    return (
        <section className="services" data-js-modal-menu="">
            <div className="services-container">
                <div className="service-item">
                    <a href="/" className="service-link">
                        <p className="service-title">Срочный<br/>выкуп квартир</p>
                        <p className="service-description">с любыми обременениями и сложностями</p>
                        
                    </a>
                    <button className="service-button" id="openModalForm" data-js-modal-menu-open-first="">Заказать консультацию</button>
                </div>

                <div className="service-item">
                    <a href="/" className="service-link">
                        <p className="service-title">Продажа<br/>квартир</p>
                        <p className="service-description">Комплексное сопровождение сделок по продаже квартир</p>
                    </a>
                    <button className="service-button" id="openModalForm"  data-js-modal-menu-open-second="">Заказать консультацию</button>
                </div>

                <div className="service-item hidden-mobile">
                    <a href="/" className="service-link">
                        <p className="service-title">Приватизация<br/>квартир с<br/>долгами</p>
                        <p className="service-description">Юридическая помощь в приватизации квартир с долгами и обременениями</p>
                    </a>
                    <button className="service-button" id="openModalForm"  data-js-modal-menu-open-third="">Заказать консультацию</button>
                </div>

                <div className="service-item">
                    <a href="/" className="service-link">
                        <p className="service-title">Помощь в<br/>покупке квартиры</p>
                        <p className="service-description">Под любые цели.<br />Сопровождаем от подбора идеального варианта до заключения сделки</p>
                       
                    </a>
                    <button className="service-button" id="openModalForm"  data-js-modal-menu-open-fourth="">Заказать консультацию</button>
                </div>

                <div className="service-item service-take hidden-mobile">
                    <a className="service-link service-link-take">
                        <p className="service-title service-price-list">Получите прайс-лист<br />на все услуги компании </p>
                        <form id="consulationForm" action="https://api.web3forms.com/submit" method="POST">
                            <input type="hidden" name="access_key" value="0019b786-9ec4-4f2d-a771-7529d847cff6"></input>
                            <label htmlFor="phone" className="service-label-take">Введите номер телефона</label>
                            <input type="tel" id="phone" className="phone-input" name='phone' required="required" placeholder='+7(___)___-__-__' autocomplete="off"/>

                            <button type='submit' className="service-button-take service-button">Оставить заявку</button>
                        </form>
                    </a>
                </div>

                <div className="service-item">
                    <a href="/" className="service-link">
                        <p className="service-title">Юридическое сопровождение</p>
                        <p className="service-description">Обеспечиваем и гарантируем юридическую чистоту сделок с недвижимостью</p>

                    </a>
                    <button className="service-button" id="openModalForm"  data-js-modal-menu-open-fifth="">Заказать консультацию</button>
                </div>
            </div>
            <ModalForm />
        </section>
    );
};

export default Services;