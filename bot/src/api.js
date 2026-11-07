export class ApiError extends Error {
    constructor(status, code, message, details) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.code = code
        this.details = details
    }
}

export function createApiClient({ baseUrl, token, fetchImpl = fetch }) {
    async function request(path, { method = 'GET', body, form } = {}) {
        const headers = {
            authorization: `Bearer ${token}`,
            accept: 'application/json',
        }
        let payload

        if (form) {
            payload = form
        } else if (body !== undefined) {
            headers['content-type'] = 'application/json'
            payload = JSON.stringify(body)
        }

        const response = await fetchImpl(`${baseUrl}${path}`, {
            method,
            headers,
            body: payload,
        })

        if (response.status === 204) {
            return null
        }

        const text = await response.text()
        let data = null

        if (text) {
            try {
                data = JSON.parse(text)
            } catch {
                data = null
            }
        }

        if (!response.ok) {
            throw new ApiError(
                response.status,
                data?.error ?? 'api_error',
                data?.message ?? `API вернул ${response.status}`,
                data?.details
            )
        }

        return data
    }

    return {
        list({ status = 'all', limit = 200, offset = 0 } = {}) {
            return request(
                `/api/properties?status=${status}&limit=${limit}&offset=${offset}`
            )
        },

        getBySlug(slug) {
            return request(`/api/properties/${encodeURIComponent(slug)}`)
        },

        getById(id) {
            return request(`/api/properties/by-id/${id}`)
        },

        create(input) {
            return request('/api/properties', { method: 'POST', body: input })
        },

        update(id, input) {
            return request(`/api/properties/${id}`, {
                method: 'PATCH',
                body: input,
            })
        },

        remove(id, { hard = false } = {}) {
            return request(`/api/properties/${id}${hard ? '?hard=true' : ''}`, {
                method: 'DELETE',
            })
        },

        uploadImage(
            id,
            {
                buffer,
                filename = 'photo.jpg',
                contentType = 'image/jpeg',
                alt = '',
                isCover = false,
            }
        ) {
            const form = new FormData()

            form.append('file', new Blob([buffer], { type: contentType }), filename)

            if (alt) {
                form.append('alt', alt)
            }
            if (isCover) {
                form.append('isCover', 'true')
            }

            return request(`/api/properties/${id}/images/upload`, {
                method: 'POST',
                form,
            })
        },
    }
}
