import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { AppError } from '../errors.js'

const MIME_EXTENSIONS = new Map([
    ['image/jpeg', '.jpg'],
    ['image/png', '.png'],
    ['image/webp', '.webp'],
    ['image/avif', '.avif'],
    ['image/gif', '.gif'],
])

function normalizePrefix(prefix) {
    const value = (prefix || '/uploads').trim()
    const withSlash = value.startsWith('/') ? value : `/${value}`
    return withSlash.replace(/\/+$/, '')
}

export function createUploadStorage({
    directory,
    publicPrefix = '/uploads',
    maxBytes = 10 * 1024 * 1024,
} = {}) {
    if (!directory) {
        throw new Error('Не задан каталог для загруженных файлов')
    }

    const prefix = normalizePrefix(publicPrefix)

    async function ensureDirectory() {
        await fs.mkdir(directory, { recursive: true })
    }

    async function saveStream(stream, mimetype) {
        const extension = MIME_EXTENSIONS.get(mimetype)

        if (!extension) {
            stream.resume?.()
            throw new AppError(
                415,
                'unsupported_media_type',
                'Поддерживаются изображения JPEG, PNG, WebP, AVIF и GIF'
            )
        }

        await ensureDirectory()

        const filename = `${Date.now()}-${randomUUID()}${extension}`
        const filePath = path.join(directory, filename)
        const handle = await fs.open(filePath, 'w')
        let bytes = 0

        try {
            for await (const chunk of stream) {
                bytes += chunk.length

                if (bytes > maxBytes) {
                    throw new AppError(
                        413,
                        'file_too_large',
                        `Файл больше ${Math.round(maxBytes / 1024 / 1024)} МБ`
                    )
                }

                await handle.write(chunk)
            }
        } catch (error) {
            await handle.close().catch(() => {})
            await fs.rm(filePath, { force: true }).catch(() => {})
            throw error
        }

        await handle.close()

        if (bytes === 0) {
            await fs.rm(filePath, { force: true }).catch(() => {})
            throw new AppError(400, 'empty_file', 'Загруженный файл пуст')
        }

        return {
            filename,
            url: `${prefix}/${filename}`,
            bytes,
        }
    }

    async function remove(url) {
        if (typeof url !== 'string' || !url.startsWith(`${prefix}/`)) {
            return false
        }

        const filename = path.basename(url.slice(prefix.length + 1))

        if (!filename) {
            return false
        }

        await fs.rm(path.join(directory, filename), { force: true })
        return true
    }

    return {
        directory,
        publicPrefix: prefix,
        maxBytes,
        ensureDirectory,
        saveStream,
        remove,
    }
}
