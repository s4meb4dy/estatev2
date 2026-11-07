const NOTIFY_TIMEOUT_MS = 5000

export function createRebuildNotifier({ url, token, logger } = {}) {
    if (!url) {
        return {
            enabled: false,
            async notify() {
                return false
            },
        }
    }

    return {
        enabled: true,
        async notify(reason) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        ...(token ? { 'x-rebuild-token': token } : {}),
                    },
                    body: JSON.stringify({
                        reason,
                        at: new Date().toISOString(),
                    }),
                    signal: AbortSignal.timeout(NOTIFY_TIMEOUT_MS),
                })

                if (!response.ok) {
                    logger?.warn(
                        { status: response.status, reason },
                        'Сервис пересборки отклонил запрос'
                    )
                    return false
                }

                return true
            } catch (error) {
                logger?.warn(
                    { err: error, reason },
                    'Не удалось отправить запрос на пересборку сайта'
                )
                return false
            }
        },
    }
}
