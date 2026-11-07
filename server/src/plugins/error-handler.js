import { ZodError } from 'zod'
import { AppError } from '../errors.js'

const MULTIPART_ERRORS = {
    FST_INVALID_MULTIPART_CONTENT_TYPE: {
        status: 415,
        error: 'unsupported_media_type',
        message: 'Ожидается multipart/form-data',
    },
    FST_REQ_FILE_TOO_LARGE: {
        status: 413,
        error: 'file_too_large',
        message: 'Загруженный файл слишком большой',
    },
    FST_FILES_LIMIT: {
        status: 400,
        error: 'too_many_files',
        message: 'Можно загрузить только один файл за раз',
    },
    FST_FIELDS_LIMIT: {
        status: 400,
        error: 'too_many_fields',
        message: 'Слишком много полей формы',
    },
    FST_PARTS_LIMIT: {
        status: 400,
        error: 'too_many_parts',
        message: 'Слишком много частей формы',
    },
}

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

        const multipartError = MULTIPART_ERRORS[error.code]

        if (multipartError) {
            return reply.code(multipartError.status).send({
                error: multipartError.error,
                message: multipartError.message,
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
