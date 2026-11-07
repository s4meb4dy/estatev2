import CatalogList from '@/sections/Catalog/CatalogList'
import { getPublishedProperties } from '@/lib/catalog/repository'

const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '')

export const metadata = {
    title: 'Каталог',
}

export async function getStaticData() {
    const properties = await getPublishedProperties()

    return {
        props: {
            properties,
            title: 'Каталог недвижимости',
            description: 'Каталог квартир и недвижимости агентства «Город»: актуальные объекты, цены, площадь и этаж.',
            canonical: siteUrl ? `${siteUrl}/Catalog` : undefined,
        },
    }
}

export default function CatalogPage({ properties = [] }) {
    return <CatalogList properties={properties} />
}
