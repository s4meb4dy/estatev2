import './ModalForm.scss'

const ModalForm = () => {
    return (
        <dialog className="modal__overlay-menu-dialog" id="myModal" data-js-modal-menu-dialog="">
            <div className="modal-content">
                <button className="close" data-js-modal-menu-close="">
                    &times;
                </button>
                <p className="callback-slog">Оставить заявку</p>
                <p className="callback-text">Свяжемся с вами как можно быстрее</p>
                <form id="consulationForm" action="https://api.web3forms.com/submit" method="POST">
                    <input type="hidden" name="access_key" value="0019b786-9ec4-4f2d-a771-7529d847cff6"></input>
                    <label htmlFor="phone">Введите номер телефона</label>
                    <input type="tel" id="phone" name='phone' required="required" placeholder='+7(___)___-__-__' autocomplete="off"/>

                    <button type='submit'>Оставить заявку</button>
                </form>
            </div>
        </dialog>
    )
}

export default ModalForm