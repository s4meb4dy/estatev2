export const metadata = {
    title: 'Переход',
}

export async function getStaticData() {
    return {
        props: {
            title: 'Переход',
            redirectTo: '/Catalog/kvartira-1-komnata-50-m2-pushkina-20',
            noindex: true,
        },
    }
}

export default function CurrentCatalogCardSecond() {
    return <p>Перенаправление в каталог…</p>
}
