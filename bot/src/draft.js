const parseIntValue = (value) => Number(String(value).replace(/\s/g, ''))
const parseNumberValue = (value) =>
    Number(String(value).replace(/\s/g, '').replace(',', '.'))

export const DRAFT_STEPS = [
    {
        key: 'title',
        prompt: 'Название объекта (например, «Квартира 2 комнаты, 60 м²»):',
        parse: (value) => value.trim(),
        validate: (raw) =>
            raw.trim() ? null : 'Название не может быть пустым.',
    },
    {
        key: 'address',
        prompt: 'Адрес:',
        parse: (value) => value.trim(),
        validate: (raw) => (raw.trim() ? null : 'Адрес не может быть пустым.'),
    },
    {
        key: 'price',
        prompt: 'Цена, ₽ (только цифры):',
        parse: parseIntValue,
        validate: (raw, value) =>
            Number.isInteger(value) && value > 0
                ? null
                : 'Введите целое число больше нуля.',
    },
    {
        key: 'area',
        prompt: 'Площадь, м²:',
        parse: parseNumberValue,
        validate: (raw, value) =>
            Number.isFinite(value) && value > 0
                ? null
                : 'Введите число больше нуля.',
    },
    {
        key: 'rooms',
        prompt: 'Количество комнат (0 — студия):',
        parse: parseIntValue,
        validate: (raw, value) =>
            Number.isInteger(value) && value >= 0 && value <= 100
                ? null
                : 'Введите целое число от 0 до 100.',
    },
    {
        key: 'floor',
        prompt: 'Этаж:',
        parse: parseIntValue,
        validate: (raw, value) =>
            Number.isInteger(value) && value > 0
                ? null
                : 'Введите целое число больше нуля.',
    },
    {
        key: 'floorsTotal',
        prompt: 'Этажей в доме:',
        parse: parseIntValue,
        validate: (raw, value, draft) => {
            if (!Number.isInteger(value) || value <= 0) {
                return 'Введите целое число больше нуля.'
            }
            if (draft.floor && value < draft.floor) {
                return 'Этажей не может быть меньше этажа.'
            }
            return null
        },
    },
    {
        key: 'description',
        prompt: 'Описание (или /skip):',
        parse: (value) => (value.trim() === '/skip' ? '' : value.trim()),
        validate: () => null,
    },
]

export function getDraftStep(key) {
    return DRAFT_STEPS.find((step) => step.key === key) ?? null
}

export function getNextDraftStep(key) {
    const index = DRAFT_STEPS.findIndex((step) => step.key === key)

    return index >= 0 ? DRAFT_STEPS[index + 1] ?? null : null
}

export function validateDraftValue(step, rawValue, draft) {
    const value = step.parse(rawValue)
    const error = step.validate(rawValue, value, draft)

    return error ? { ok: false, error } : { ok: true, value }
}

export function createDraftPayload(draft) {
    return {
        title: draft.title,
        address: draft.address,
        price: draft.price,
        area: draft.area,
        rooms: draft.rooms,
        floor: draft.floor,
        floorsTotal: draft.floorsTotal,
        description: draft.description ?? '',
        status: 'draft',
    }
}
