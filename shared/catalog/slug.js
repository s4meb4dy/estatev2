const TRANSLITERATION = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'c',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
    '²': '2',
    '³': '3',
}

export function slugify(value) {
    return String(value ?? '')
        .toLowerCase()
        .trim()
        .split('')
        .map((character) => TRANSLITERATION[character] ?? character)
        .join('')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80)
        .replace(/-+$/g, '')
}

export function uniqueSlug(base, existingSlugs = []) {
    const used = new Set(existingSlugs)
    const normalizedBase = slugify(base) || 'object'
    let candidate = normalizedBase
    let counter = 2

    while (used.has(candidate)) {
        candidate = `${normalizedBase}-${counter}`
        counter += 1
    }

    return candidate
}
