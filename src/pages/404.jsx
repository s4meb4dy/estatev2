import NotFound from '@/components/NotFound'

export const metadata = {
    title: 'Страница не найдена',
}

export async function getStaticData() {
    return {
        props: {
            title: 'Страница не найдена',
            noindex: true,
        },
    }
}

export default function NotFoundPage() {
    return (
        <NotFound
            title="Страница не найдена"
            text="Такой страницы нет или она была перемещена. Попробуйте вернуться в каталог."
        />
    )
}
