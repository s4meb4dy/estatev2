export const metadata = {
    title: 'Переход',
}

export async function getStaticData() {
    return {
        props: {
            title: 'Переход',
            redirectTo: '/Catalog/kvartira-3-komnaty-131-m2-pushkina-20',
            noindex: true,
        },
    }
}

export default function CurrentCatalogCardThird() {
    return <p>Перенаправление в каталог…</p>
}
