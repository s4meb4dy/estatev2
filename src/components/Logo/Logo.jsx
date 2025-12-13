import './Logo.scss'

const Logo = () => {
    const title = "Home"

    return (
        <a 
            className='logo'
            href='/'
            title={title}
            aria-label={title}
        >
            <img 
                src="/logo-main-no-bg.png" 
                alt="" 
                className="logo__image" 
                loading="lazy"
            />
        </a>
    )
}

export default Logo