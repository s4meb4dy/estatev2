import { spawn } from 'node:child_process'
import { timingSafeEqual } from 'node:crypto'
import fs from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'

const PORT = Number(process.env.REBUILD_PORT || 3001)
const TOKEN = process.env.REBUILD_TOKEN || ''
const DEBOUNCE_MS = Number(process.env.REBUILD_DEBOUNCE_MS || 5000)
const APP_DIR = path.resolve(process.env.REBUILD_APP_DIR || process.cwd())
const SITE_DIR = path.resolve(process.env.REBUILD_SITE_DIR || '/srv/site')
const DIST_DIR = path.resolve(process.env.REBUILD_DIST_DIR || 'dist')
const BUILD_COMMAND = process.env.REBUILD_BUILD_COMMAND || 'npm run build'
const API_URL = process.env.REBUILD_API_URL || 'http://api:3000'
const KEEP_ENTRIES = new Set(
    (process.env.REBUILD_KEEP || 'uploads')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
)

let timer = null
let building = false
let pending = false
let lastResult = { at: null, ok: null, error: null }

function log(...args) {
    console.log(new Date().toISOString(), ...args)
}

function tokenMatches(provided) {
    if (!TOKEN) {
        return true
    }
    if (typeof provided !== 'string') {
        return false
    }

    const first = Buffer.from(provided)
    const second = Buffer.from(TOKEN)

    return first.length === second.length && timingSafeEqual(first, second)
}

function schedule(delay = DEBOUNCE_MS) {
    pending = true

    if (timer) {
        clearTimeout(timer)
    }

    timer = setTimeout(() => {
        timer = null
        void runBuild()
    }, delay)
}

async function clearSiteDir() {
    await fs.mkdir(SITE_DIR, { recursive: true })

    const entries = await fs.readdir(SITE_DIR)

    await Promise.all(
        entries
            .filter((entry) => !KEEP_ENTRIES.has(entry))
            .map((entry) =>
                fs.rm(path.join(SITE_DIR, entry), {
                    recursive: true,
                    force: true,
                })
            )
    )
}

function runCommand(command) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, {
            cwd: APP_DIR,
            shell: true,
            stdio: 'inherit',
            env: {
                ...process.env,
                CATALOG_SOURCE: 'api',
                CATALOG_API_URL: API_URL,
            },
        })

        child.on('error', reject)
        child.on('exit', (code, signal) => {
            if (code === 0) {
                resolve()
                return
            }

            reject(
                new Error(
                    `Сборка завершилась с кодом ${code ?? signal ?? 'unknown'}`
                )
            )
        })
    })
}

async function runBuild() {
    if (building) {
        pending = true
        return
    }

    building = true
    pending = false
    const startedAt = Date.now()

    log('Начинаю пересборку сайта')

    try {
        await runCommand(BUILD_COMMAND)
        await clearSiteDir()
        await fs.cp(DIST_DIR, SITE_DIR, { recursive: true })

        lastResult = { at: new Date().toISOString(), ok: true, error: null }
        log(
            `Пересборка завершена за ${Math.round(
                (Date.now() - startedAt) / 1000
            )} с`
        )
    } catch (error) {
        lastResult = {
            at: new Date().toISOString(),
            ok: false,
            error: error.message,
        }
        log('Ошибка пересборки:', error.message)
    } finally {
        building = false

        if (pending) {
            schedule(0)
        }
    }
}

function send(response, status, payload) {
    response.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
    })
    response.end(JSON.stringify(payload))
}

const server = http.createServer((request, response) => {
    if (request.method === 'GET' && request.url === '/health') {
        send(response, 200, {
            status: 'ok',
            building,
            pending,
            lastResult,
        })
        return
    }

    if (request.method === 'POST' && request.url === '/rebuild') {
        if (!tokenMatches(request.headers['x-rebuild-token'])) {
            send(response, 401, {
                error: 'unauthorized',
                message: 'Неверный токен пересборки',
            })
            return
        }

        request.resume()
        schedule()

        send(response, 202, {
            queued: true,
            debounceMs: DEBOUNCE_MS,
        })
        return
    }

    send(response, 404, {
        error: 'not_found',
        message: 'Маршрут не найден',
    })
})

server.listen(PORT, () => {
    log(`Сервис пересборки слушает порт ${PORT}`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
        log('Остановка сервиса пересборки')
        server.close(() => process.exit(0))
        setTimeout(() => process.exit(0), 5000).unref()
    })
}
