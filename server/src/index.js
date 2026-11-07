import 'dotenv/config'
import { loadConfig } from './config.js'
import { buildApp } from './app.js'
import { createDbRepository } from './repositories/properties.repository.js'
import { pool } from './db/client.js'

const config = loadConfig()
const repository = createDbRepository()
const app = await buildApp({ repository, config })

let closing = false

async function shutdown(signal) {
    if (closing) {
        return
    }

    closing = true
    app.log.info({ signal }, 'Остановка API')

    try {
        await app.close()
        await pool.end()
        process.exit(0)
    } catch (error) {
        app.log.error({ err: error }, 'Не удалось корректно остановить API')
        process.exit(1)
    }
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

try {
    await app.listen({ host: config.host, port: config.port })
} catch (error) {
    app.log.error({ err: error }, 'Не удалось запустить API')
    await pool.end()
    process.exit(1)
}
