import Card from '@/components/Card'
import './CatalogList.scss'

const CatalogList = ({ properties = [] }) => {
    return (
        <section className="catalog-cards-sec">
            <h1 className="catalog-header">
                Каталог недвижимости агентства <span>«Город»</span>
            </h1>

            {properties.length > 0 ? (
                properties.map((property) => <Card property={property} key={property.id} />)
            ) : (
                <p className="catalog-empty">
                    Сейчас нет опубликованных объектов. Загляните позже — каталог обновляется.
                </p>
            )}
        </section>
    )
}

export default CatalogList
