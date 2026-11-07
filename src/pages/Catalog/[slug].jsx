import NotFound from '@/components/NotFound'
import PropertyDetail from '@/sections/Catalog/PropertyDetail'
import { getPublishedProperties } from '@/lib/catalog/repository'

const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '')

const absoluteUrl = (url) => {
    if (!url) {
        return undefined
    }
    if (/^https?:\/\//.test(url)) {
        return url
    }
    return siteUrl ? `${siteUrl}${url}` : url
}

export const metadata = {
    title: 'Недвижимость',
}

export async function getStaticData() {
    const properties = await getPublishedProperties()

    if (properties.length === 0) {
        return [
            {
                paths: { slug: 'not-found' },
                props: {
                    notFound: true,
                    title: 'Объект не найден',
                    noindex: true,
                },
            },
        ]
    }

    return properties.map((property) => ({
        paths: { slug: property.slug },
        props: {
            property,
            title: property.title,
            description: property.description || property.about,
            ogImage: absoluteUrl(property.images[0]?.url),
            ogType: 'product',
            canonical: siteUrl ? `${siteUrl}/Catalog/${property.slug}` : undefined,
        },
    }))
}

export default function PropertyPage({ property, notFound }) {
    if (notFound || !property) {
        return (
            <NotFound
                title="Объект не найден"
                text="Возможно, объект уже продан или ссылка устарела."
            />
        )
    }

    return <PropertyDetail property={property} />
}
