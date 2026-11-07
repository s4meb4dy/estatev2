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
                    <li className='nav-list-item'><a href="/Services">услуги</a></li>
                    <p className='nothing-vertical'></p>
                    <li className='nav-list-item'><a href='/Catalog'>каталог недвижимости</a></li>
                    <p className='nothing-vertical'></p>
                    <li className='nav-list-item'><a href='/About'>о компании</a></li>
                    <p className='nothing-vertical'></p>
                    <li className='nav-list-item'><a href='/Reviews'>отзывы</a></li>
                    <p className='nothing-vertical'></p>
                    <li className='nav-list-item'><a href='/Contacts'>контакты</a></li>
                </ul>
            </nav>
        </dialog>
        
    )
    
}

export default Navigation