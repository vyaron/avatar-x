
export const storageService = {
    query,
    get,
    post,
    put,
    remove
}

function query(entityType) {
    try {
        const entities = JSON.parse(localStorage.getItem(entityType)) || []
        return Promise.resolve(entities)
    } catch (err) {
        console.error(`Unreadable data for "${entityType}", starting empty`, err)
        return Promise.resolve([])
    }
}

function get(entityType, entityId) {
    return query(entityType)
        .then(entities => entities.find(entity => entity.id === entityId))
}

function post(entityType, newEntity) {
    newEntity.id = _makeId()
    return query(entityType)
        .then(entities => {
            entities.push(newEntity)
            _save(entityType, entities)
            return newEntity
        })
}

function put(entityType, updatedEntity) {
    return query(entityType)
        .then(entities => {
            const idx = entities.findIndex(entity => entity.id === updatedEntity.id)
            if (idx === -1) throw new Error(`Cannot update, ${entityType} ${updatedEntity.id} not found`)
            entities[idx] = { ...entities[idx], ...updatedEntity }
            _save(entityType, entities)
            return updatedEntity
        })
}

function remove(entityType, entityId) {
    return query(entityType)
        .then(entities => {
            const idx = entities.findIndex(entity => entity.id === entityId)
            // splice(-1) would drop the last entity, so bail out when there is no match
            if (idx === -1) throw new Error(`Cannot remove, ${entityType} ${entityId} not found`)
            entities.splice(idx, 1)
            _save(entityType, entities)
        })
}

function _save(entityType, entities) {
    localStorage.setItem(entityType, JSON.stringify(entities))
}

function _makeId(length = 5) {
    var text = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}
