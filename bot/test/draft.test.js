import assert from 'node:assert/strict'
import test from 'node:test'
import {
    DRAFT_STEPS,
    createDraftPayload,
    getDraftStep,
    getNextDraftStep,
    validateDraftValue,
} from '../src/draft.js'
import {
    formatArea,
    formatPrice,
    formatPropertyCard,
    formatStatus,
    statusIcon,
} from '../src/format.js'

function validate(key, value, draft = {}) {
    return validateDraftValue(getDraftStep(key), value, draft)
}

test('шаги черновика идут в нужном порядке', () => {
    assert.deepEqual(
        DRAFT_STEPS.map((step) => step.key),
        [
            'title',
            'address',
            'price',
            'area',
            'rooms',
            'floor',
            'floorsTotal',
            'description',
        ]
    )
    assert.equal(getNextDraftStep('title').key, 'address')
    assert.equal(getNextDraftStep('description'), null)
})

test('текстовые поля не могут быть пустыми', () => {
    assert.equal(validate('title', '  ').ok, false)
    assert.equal(validate('address', '').ok, false)
    assert.deepEqual(validate('title', ' Квартира '), {
        ok: true,
        value: 'Квартира',
    })
})

test('цена, площадь и комнаты валидируются', () => {
    assert.equal(validate('price', '12 000 000').value, 12000000)
    assert.equal(validate('price', 'abc').ok, false)
    assert.equal(validate('price', '0').ok, false)
    assert.equal(validate('area', '60,5').value, 60.5)
    assert.equal(validate('area', '-1').ok, false)
    assert.equal(validate('rooms', '0').value, 0)
    assert.equal(validate('rooms', '101').ok, false)
})

test('этаж не может быть выше дома', () => {
    assert.equal(validate('floorsTotal', '9', { floor: 10 }).ok, false)
    assert.equal(validate('floorsTotal', '10', { floor: 10 }).ok, true)
})

test('описание можно пропустить', () => {
    assert.deepEqual(validate('description', '/skip'), {
        ok: true,
        value: '',
    })
})

test('payload черновика содержит обязательные поля', () => {
    const payload = createDraftPayload({
        title: 'Квартира',
        address: 'Москва',
        price: 10000000,
        area: 50,
        rooms: 1,
        floor: 5,
        floorsTotal: 10,
        description: '',
    })

    assert.equal(payload.status, 'draft')
    assert.equal(payload.title, 'Квартира')
    assert.equal(payload.description, '')
})

test('форматирование цены, площади и карточки', () => {
    assert.match(formatPrice(10000000), /10\s?000\s?000\s?₽/)
    assert.match(formatArea(50.5), /50,5\s?м²/)
    assert.equal(formatStatus('published'), 'опубликован')
    assert.equal(statusIcon('draft'), '📝')

    const card = formatPropertyCard({
        title: 'Квартира',
        address: 'Москва',
        price: 10000000,
        area: 50,
        rooms: 0,
        floor: 5,
        floorsTotal: 10,
        status: 'draft',
        images: [{ id: '1' }],
        slug: 'kvartira',
    })

    assert.match(card, /Квартира/)
    assert.match(card, /студия/)
    assert.match(card, /Статус: черновик/)
    assert.match(card, /Фото: 1/)
})
