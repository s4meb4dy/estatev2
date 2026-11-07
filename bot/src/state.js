export function createStateStore() {
    const states = new Map()

    return {
        get(chatId) {
            return states.get(chatId) ?? null
        },
        set(chatId, state) {
            states.set(chatId, state)
        },
        clear(chatId) {
            states.delete(chatId)
        },
    }
}
