import { ZodError } from 'zod'
import { AppError } from '../errors.js'

export function registerErrorHandler(app) {
    app.setErrorHandler((error, request, reply) => {
        if (error instanceof ZodError) {
            return reply.code(400).send({
                error: 'validation_error',
                message: 'Некорректные данные запроса',
                details: error.issues.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                })),
            })
        }

        if (error instanceof AppError) {
            return reply.code(error.statusCode).send({
                error: error.code,
                message: error.message,
                ...(error.details ? { details: error.details } : {}),
            })
        }

        if (error.code === '23505') {
            return reply.code(409).send({
                error: 'conflict',
                message: 'Запись с такими данными уже существует',
            })
        }

        if (error.code === '23503') {
            return reply.code(409).send({
                error: 'conflict',
                message: 'Связанная запись не существует',
            })
        }

        if (error.code === 'FST_ERR_CTP_INVALID_JSON_BODY') {
            return reply.code(400).send({
                error: 'invalid_json',
                message: 'Некорректный JSON',
            })
        }

        request.log.error({ err: error }, 'Необработанная ошибка')

        return reply.code(500).send({
            error: 'internal_error',
            message: 'Внутренняя ошибка сервера',
        })
    })

    app.setNotFoundHandler((request, reply) => {
        reply.code(404).send({
            error: 'not_found',
            message: 'Маршрут не найден',
        })
    })
}
