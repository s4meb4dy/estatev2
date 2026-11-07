const numberFormatter = new Intl.NumberFormat('ru-RU')

export function formatPrice(value) {
    if (value === undefined || value === null || value === '') {
        return ''
    }

    const number = Number(value)
    return Number.isFinite(number) ? numberFormatter.format(number) : String(value)
}

export function formatPricePerM2(value) {
    const formatted = formatPrice(value)
    return formatted ? `${formatted} ₽/м²` : ''
}

export function formatArea(value) {
    const formatted = formatPrice(value)
    return formatted ? `${formatted} м²` : ''
}

export function formatFloor(property) {
    if (!property?.floor || !property?.floorsTotal) {
        return ''
    }

    return `${property.floor} / ${property.floorsTotal}`
}
