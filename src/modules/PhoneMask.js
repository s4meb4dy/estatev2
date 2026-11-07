const PLACEHOLDER = '+7 (___) ___-__-__'
const INCOMPLETE_MESSAGE = 'Введите номер телефона полностью'

const digitsOnly = (value) => value.replace(/\D/g, '')

const normalizeDigits = (digits) => {
    // The field always keeps the +7 country code at the beginning.
    let rest = digits.startsWith('7') ? digits.slice(1) : digits

    // A pasted number may still contain its own 7/8 country code.
    if (rest.length > 10 && (rest.startsWith('7') || rest.startsWith('8'))) {
        rest = rest.slice(1)
    }

    return rest.slice(0, 10)
}

const formatPhone = (digits) => {
    const rest = normalizeDigits(digits)

    if (!rest) {
        return ''
    }

    let value = '+7'

    if (rest.length) {
        value += ` (${rest.slice(0, 3)}`
    }

    if (rest.length >= 3) {
        value += ')'
    }

    if (rest.length > 3) {
        value += ` ${rest.slice(3, 6)}`
    }

    if (rest.length > 6) {
        value += `-${rest.slice(6, 8)}`
    }

    if (rest.length > 8) {
        value += `-${rest.slice(8, 10)}`
    }

    return value
}

const countDigits = (value) => digitsOnly(value).length

const setCaretAfterDigits = (input, target) => {
    const value = input.value

    if (target <= 0) {
        input.setSelectionRange(0, 0)
        return
    }

    let seen = 0

    for (let index = 0; index < value.length; index += 1) {
        if (/\d/.test(value[index])) {
            seen += 1

            if (seen === target) {
                input.setSelectionRange(index + 1, index + 1)
                return
            }
        }
    }

    input.setSelectionRange(value.length, value.length)
}

export default class PhoneMask {
    constructor() {
        document.querySelectorAll('input[type="tel"]').forEach((input) => this.setup(input))
    }

    setup(input) {
        input.setAttribute('placeholder', PLACEHOLDER)
        input.setAttribute('inputmode', 'tel')

        const validate = () => {
            const digits = normalizeDigits(digitsOnly(input.value))

            input.setCustomValidity(
                digits.length > 0 && digits.length < 10 ? INCOMPLETE_MESSAGE : ''
            )
        }

        input.addEventListener('focus', () => {
            const digits = normalizeDigits(digitsOnly(input.value))

            if (!digits) {
                input.value = '+7 ('
                input.setSelectionRange(input.value.length, input.value.length)
                return
            }

            const formatted = formatPhone(digits)

            input.dataset.phoneMaskDigits = digits
            input.dataset.phoneMaskLength = String(formatted.length)

            if (input.value !== formatted) {
                input.value = formatted
                input.setSelectionRange(input.value.length, input.value.length)
            }
        })

        input.addEventListener('input', (event) => {
            const caret = input.selectionStart ?? input.value.length
            const digitsBeforeCaret = countDigits(input.value.slice(0, caret))
            const previousDigits = input.dataset.phoneMaskDigits || ''
            const previousLength = Number(input.dataset.phoneMaskLength || 0)

            let digits = normalizeDigits(digitsOnly(input.value))

            // Backspace on a formatting character should remove the previous digit.
            if (
                event.inputType === 'deleteContentBackward' &&
                digits === previousDigits &&
                input.value.length < previousLength
            ) {
                digits = previousDigits.slice(0, -1)
            }

            input.value = formatPhone(digits)
            input.dataset.phoneMaskDigits = digits
            input.dataset.phoneMaskLength = String(input.value.length)

            setCaretAfterDigits(input, digitsBeforeCaret)
            validate()
        })

        input.addEventListener('blur', () => {
            if (!normalizeDigits(digitsOnly(input.value))) {
                input.value = ''
                input.dataset.phoneMaskDigits = ''
                input.dataset.phoneMaskLength = '0'
            }

            validate()
        })

        input.addEventListener('invalid', validate)
    }
}
