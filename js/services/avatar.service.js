import { utilService } from "./util.service.js";
import { storageService } from "./async-storage.service.js";

// The order the part sections show up in the editor menu
const avatarParts = ['head', 'hair', 'eye', 'mouth', 'glasses', 'accessory', 'necklace', 'boa']
// Bottom layer first - must stay in sync with the img order inside .avatar-editor,
// otherwise the saved png comes out layered differently than the preview
const avatarPartsRenderOrder = ['head', 'eye', 'hair', 'mouth', 'glasses', 'accessory', 'necklace', 'boa']
const genderedParts = ['head', 'hair', 'eye', 'mouth']

const avatarPartsHe = {
    head: 'ראש',
    hair: 'שיער',
    eye: 'עיניים',
    mouth: 'פה',
    glasses: 'משקפיים',
    accessory: 'תוספת',
    necklace: 'שרשרת',
    boa: 'חימומון'
}
const avatarPartsCount = {
    head: 15,
    hair: 26,
    eye: 8,
    mouth: 8,
    glasses: 4,
    accessory: 21,
    necklace: 11,
    boa: 4
}


export const avatarService = {
    getEmptyAvatar,
    getRandomAvatar,
    getAvatarImgsMap,
    getAvatarPartHe,
    getPartsRenderOrder,
    switchGender,
    query,
    save,
    remove,
    getById
}


function getEmptyAvatar(gender = 'f') {
    return _createAvatar(gender)
}

function getRandomAvatar() {
    const avatar = _createAvatar((Math.random() > 0.5) ? 'f' : 'm')

    avatar.parts = Object.keys(avatar.parts).reduce((acc, part) => {
        const partGender = avatarPartHasGender(part) ? avatar.gender : ''
        if (!partGender && Math.random() > 0.6) {
            acc[part] = ''
        } else {
            // getRandomInt is max exclusive, so +1 to keep the last img of each part reachable
            acc[part] = `${part}_${partGender}${utilService.getRandomInt(1, avatarPartsCount[part] + 1)}.png`
        }
        return acc;
    }, {})
    return avatar;
}

// Gendered parts have to be reset, the rest of the accessories carry over
function switchGender(avatar, gender) {
    const parts = _createAvatar(gender).parts
    Object.keys(parts)
        .filter(part => !avatarPartHasGender(part))
        .forEach(part => parts[part] = avatar.parts[part])
    return { ...avatar, gender, parts }
}

function _createAvatar(gender = 'f') {
    return {
        name: '',
        gender,
        parts: {
            head: `head_${gender}1.png`,
            hair: '',
            eye: `eye_${gender}1.png`,
            mouth: `mouth_${gender}1.png`,
            glasses: '',
            accessory: '',
            necklace: '',
            boa: '',
        }
    }
}

function avatarPartHasGender(itemType) {
    return genderedParts.includes(itemType)
}

function getAvatarImgsMap(gender) {
    return avatarParts.reduce((acc, itemType) => {
        const partGender = avatarPartHasGender(itemType) ? gender : ''
        const imgCount = avatarPartsCount[itemType]
        acc[itemType] = Array(imgCount).fill().map((_, i) => `img/avatar/${itemType}_${partGender}${i + 1}.png`)
        return acc
    }, {})
}

function getAvatarPartHe(partName) {
    return avatarPartsHe[partName]
}

function getPartsRenderOrder() {
    return [...avatarPartsRenderOrder]
}

function save(avatar) {
    if (avatar.id) {
        return storageService.put('avatar', avatar)
    } else {
        return storageService.post('avatar', avatar)
    }
}

function query() {
    return storageService.query('avatar')
}

function remove(id) {
    return storageService.remove('avatar', id)
}

function getById(id) {
    return storageService.get('avatar', id)
}
