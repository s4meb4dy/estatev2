import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeProperties } from '../shared/catalog/schema.js'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(currentDir, '..')
const dataPath = path.join(rootDir, 'src/data/properties.seed.json')
const publicDir = path.join(rootDir, 'public')

const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
const properties = normalizeProperties(raw)
const published = properties.filter((property) => property.status === 'published')

if (published.length === 0) {
    throw new Error('В каталоге нет ни одного опубликованного объекта')
}

for (const property of properties) {
    for (const image of property.images) {
        if (/^https?:\/\//.test(image.url)) {
            continue
        }

        const imagePath = path.join(publicDir, image.url.replace(/^\//, ''))
        if (!fs.existsSync(imagePath)) {
            throw new Error(`Не найден файл изображения: ${image.url} (объект ${property.slug})`)
        }
    }
}

console.log(
    `Каталог OK: ${properties.length} объектов, ${published.length} опубликовано, ${properties.reduce(
        (total, property) => total + property.images.length,
        0
    )} изображений`
)
