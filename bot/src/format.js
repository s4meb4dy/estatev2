const priceFormatter = new Intl.NumberFormat('ru-RU')
const areaFormatter = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
})

const STATUS_LABELS = {
    draft: 'черновик',
    published: 'опубликован',
    sold: 'продан',
    archived: 'архив',
}

const STATUS_ICONS = {
    draft: '📝',
    published: '✅',
    sold: '💰',
    archived: '📦',
}

export function formatPrice(value) {
    return `${priceFormatter.format(value)} ₽`
}

export function formatArea(value) {
    return `${areaFormatter.format(value)} м²`
}

export function formatStatus(status) {
    return STATUS_LABELS[status] ?? status
}

export function statusIcon(status) {
    return STATUS_ICONS[status] ?? '•'
}

export function formatPropertyCard(property) {
    return [
        property.title,
        property.address,
        `Цена: ${formatPrice(property.price)}`,
        `Площадь: ${formatArea(property.area)}`,
        `Комнат: ${property.rooms === 0 ? 'студия' : property.rooms}`,
        `Этаж: ${property.floor} из ${property.floorsTotal}`,
        `Статус: ${formatStatus(property.status)}`,
        `Фото: ${property.images.length}`,
        `Slug: ${property.slug}`,
    ].join('\n')
}
