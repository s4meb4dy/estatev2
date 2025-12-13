import './Navigation.scss'

const Navigation = () => {
    return (
        <dialog className="navbar__overlay-menu-dialog" data-js-overlay-menu-dialog="">
            <nav className="navbar">
                <ul className="nav-list">
                    <li>
                    <a href='/'>
                        <img className='navbar__house-button' src="/house-custom.svg"/>
                    </a>
                    </li>
                    <p className='nothing-vertical'></p>
                    <li className='nav-list-item'><a href="/services">услуги</a></li>
                    <p className='nothing-vertical'></p>
                    <li className='nav-list-item'><a href='/catalog'>каталог недвижимости</a></li>
                    <p className='nothing-vertical'></p>
                    <li className='nav-list-item'><a href='/about'>о компании</a></li>
                    <p className='nothing-vertical'></p>
                    <li className='nav-list-item'><a href='/reviews'>отзывы</a></li>
                    <p className='nothing-vertical'></p>
                    <li className='nav-list-item'><a href='/contacts'>контакты</a></li>
                </ul>
            </nav>
        </dialog>
        
    )
    
}

export default Navigation