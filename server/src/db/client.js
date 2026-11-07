import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema.js'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error('DATABASE_URL обязателен для подключения к PostgreSQL')
}

const poolMax = Number(process.env.DATABASE_POOL_MAX || 10)

export const pool = new pg.Pool({
    connectionString,
    max: Number.isFinite(poolMax) && poolMax > 0 ? poolMax : 10,
})

pool.on('error', (error) => {
    console.error('Ошибка пула PostgreSQL', error)
})

export const db = drizzle(pool, { schema })
