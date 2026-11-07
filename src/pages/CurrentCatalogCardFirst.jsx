export const metadata = {
    title: 'Переход',
}

export async function getStaticData() {
    return {
        props: {
            title: 'Переход',
            redirectTo: '/Catalog/kvartira-3-komnaty-131-m2-tverskaya-10',
            noindex: true,
        },
    }
}

export default function CurrentCatalogCardFirst() {
    return <p>Перенаправление в каталог…</p>
}
