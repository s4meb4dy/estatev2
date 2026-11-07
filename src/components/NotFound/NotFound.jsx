import './NotFound.scss'

const NotFound = ({
    title = 'Страница не найдена',
    text = 'Такой страницы нет или она была перемещена.',
}) => {
    return (
        <section className="not-found">
            <p className="not-found__code">404</p>
            <h1 className="not-found__title">{title}</h1>
            <p className="not-found__text">{text}</p>
            <a className="not-found__link" href="/Catalog">
                Вернуться в каталог
            </a>
        </section>
    )
}

export default NotFound
