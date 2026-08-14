import { utilService } from "./util.service.js";
import { storageService } from "./async-storage.service.js";

const avatarParts = ['head', 'hair', 'eye', 'mouth', 'glasses', 'accessory', 'necklace', 'boa']
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
    query,
    save,
    remove,
    getById
}


function getRandomAvatar() {
    const gender = (Math.random() > 0.5)? 'f' : 'm'
    const avatar = _createAvatar(gender)

    avatar.parts = Object.keys(avatar.parts).reduce((acc, part) => {
        const imgCount = avatarPartsCount[part]
        const gender = avatarPartHasGender(part)? avatar.gender : ''
        if (!gender && Math.random() > 0.6) {
            acc[part] = ''
        }
        else {
            acc[part] = `${part}_${gender}${utilService.getRandomInt(1, imgCount-1)}.png`
        }
        return acc;
    }, {})
    return avatar;
}

function getEmptyAvatar(gender = 'f') {
    return _createAvatar(gender)
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
    return ['head', 'hair', 'eye', 'mouth'].includes(itemType)
}

function getAvatarImgsMap(gender) {
    const avatarPartImgsMap = avatarParts.reduce((acc, itemType) => {
        if (!acc[itemType]) acc[itemType] = []
        if (!avatarPartHasGender(itemType)) gender = ''
        const imgCount = avatarPartsCount[itemType]
        const imgs = Array(imgCount).fill().map((_, i) => `img/avatar/${itemType}_${gender}${i + 1}.png`)
        acc[itemType].push(...imgs)
        return acc
    }, {})
    return avatarPartImgsMap
}

function getAvatarPartHe(partName) {
    return avatarPartsHe[partName]
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

