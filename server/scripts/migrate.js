import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db, pool } from '../src/db/client.js'

const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url))

try {
    await migrate(db, { migrationsFolder })
    console.log('Миграции применены')
} catch (error) {
    console.error('Ошибка миграции:', error)
    process.exitCode = 1
} finally {
    await pool.end()
}
