import fp from 'fastify-plugin'
import { timingSafeEqual } from 'node:crypto'

function tokenFromRequest(request) {
    const authorization = request.headers.authorization

    if (authorization?.startsWith('Bearer ')) {
        return authorization.slice(7).trim()
    }

    const headerToken = request.headers['x-api-token']

    if (typeof headerToken === 'string' && headerToken.trim()) {
        return headerToken.trim()
    }

    return ''
}

export default fp(
    async (app, { apiToken }) => {
        const expected = Buffer.from(apiToken)

        app.decorateRequest('isAdmin', false)

        function hasValidToken(request) {
            const token = tokenFromRequest(request)

            if (!token) {
                return false
            }

            const provided = Buffer.from(token)

            if (provided.length !== expected.length) {
                return false
            }

            return timingSafeEqual(provided, expected)
        }

        app.decorate('authenticate', async (request, reply) => {
            if (!hasValidToken(request)) {
                return reply.code(401).send({
                    error: 'unauthorized',
                    message: 'Требуется корректный API-токен',
                })
            }

            request.isAdmin = true
        })

        app.decorate('optionalAuthenticate', async (request, reply) => {
            const token = tokenFromRequest(request)

            if (!token) {
                request.isAdmin = false
                return
            }

            if (!hasValidToken(request)) {
                return reply.code(401).send({
                    error: 'unauthorized',
                    message: 'Неверный API-токен',
                })
            }

            request.isAdmin = true
        })
    },
    { name: 'auth' }
)
