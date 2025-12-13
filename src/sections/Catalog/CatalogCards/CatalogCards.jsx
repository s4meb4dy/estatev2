import Card from '@/components/Card'
import './CatalogCards.scss'

const CatalogCards = () => {
    const catalogCardsInfo = [
        {
            id: 1,
            title: "Квартира 3 комнат площадью 131м² 17/25 этаж",
            address: "Москва, ул. Пушкина, д. 20",
            price: "30 500 000",
            smallPrice: "232 470",
            description: "Просторная, огромная светлая трёхкомнатная квартира на 17 этаже 25-этажного дома в ЖК Град Московский. ",
            images: [
            '/img/property3-1.jpg',
            '/img/property3-2.jpg',
            '/img/property3-3.jpg',
            '/img/property3-4.jpg',
            '/img/property3-5.jpg',
            '/img/property3-6.jpg',
            '/img/property3-7.jpg',
            '/img/property3-8.jpg',
            '/img/property3-9.jpg',
            ],
            linkToPage: '/CurrentCatalogCardThird'

        },
        {
            id: 2,
            title: "Квартира 3 комнаты площадью 131м² 17/25 этаж",
            address: "Москва, ул. Тверская, д. 10",
            price: "25 000 000",
            smallPrice: "190 840",
            description: "Просторная квартира с панорамными окнами, ремонт премиум-класса.",
            images: [
            '/img/property1-1.jpg',
            '/img/property1-2.jpg',
            '/img/property1-3.jpg',
            '/img/property1-4.jpg',
            '/img/property1-5.jpg'
            ],
            linkToPage: '/CurrentCatalogCardFirst'
        },
        {
            id: 3,
            title: "Квартира 1 комната площадью 50м² 4/5 этаж",
            address: "Москва, ул. Пушкина, д. 20",
            price: "1 000 000",
            smallPrice: "200 000",
            description: "Небольшая квартира с лоджией",
            images: [
            '/img/property2-1.jpg',
            '/img/property2-2.jpg',
            '/img/property2-3.jpg',
            '/img/property2-4.jpg',
            '/img/property2-5.jpg'
            ],
            linkToPage: '/CurrentCatalogCardSecond'

        },

    ]

    return (
        <section
            className="catalog-cards-sec"
        >
            <p className="catalog-header">
                Каталог недвижимости агентства недвижимости <span>Город</span>
            </p>
            {catalogCardsInfo.map((item, index) => (
                <Card {...item} key = {index} />
            ))}

        </section>
    )
}

export default CatalogCards



