export async function healthRoutes(app, { repository }) {
    app.get('/health', async (request, reply) => {
        try {
            await repository.ping()

            return {
                status: 'ok',
                db: 'ok',
                uptime: Math.round(process.uptime()),
            }
        } catch (error) {
            request.log.error({ err: error }, 'Проверка здоровья не прошла')
            reply.code(503)

            return {
                status: 'error',
                db: 'down',
            }
        }
    })
}
