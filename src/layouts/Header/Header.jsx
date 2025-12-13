import Logo from '@/components/Logo'
import './Header.scss'
import BurgerButton from '@/components/BurgerButton'

const Header = () => {
    return (
        <header className='header-main' data-js-overlay-menu="">                        
            <div className='header'>
                <dialog className='header__overlay-menu-dialog'>
                    <p className="header-main-slog text">
                        Специализированное агентство на рынке вторичной недвижимости Воткинска. <br/>
                        <b>Работаем более 10 лет.</b>
                    </p>      
                </dialog>
                      
                
                <Logo 
                    className="header-logo"
                    loading="eager"
                />

                <div className="header-th">
                    <p className="header-th-slog text">
                        Заявки принимаем 24/7
                    </p>
                    <a className="header-th-links number-link" href="tel:+7 (982) 826-31-80">
                        <span className="header-th-links-number">
                            +7 (982) 826-31-80
                        </span>
                    </a>
                    <a className="header-th-links-call callback" href="#openModal" data-js-modal-menu-open-sixth="">
                        Заказать обратный звонок
                    </a>
                </div>
            </div>
            <BurgerButton 
                className='header__burger-button visible-mobile'
                extraAttrs={{
                    'data-js-overlay-menu-burger-button': '',
                }}
            />
        </header>
        
    )
}

export default Header