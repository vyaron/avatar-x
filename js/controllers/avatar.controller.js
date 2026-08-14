import { avatarService } from "../services/avatar.service.js"
import { utilService } from "../services/util.service.js"

const emptyImg = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

// The avatar currently open in the editor. Carries an id only while editing a saved one
var gAvatar = avatarService.getEmptyAvatar()
var gIntervals = []

export const avatarController = {
    createAvatar,
    renderEditorPage,
    changeAvatarPart,
    selectAvatarPartSection,
    toggleGender,
    saveAvatar,
    renderAvatars,
    removeAvatar,
    editAvatar,
    randomAvatar,
    shareAvatar
}

// Start a brand new avatar - without this the editor keeps the last edited one (and its id)
function createAvatar() {
    gAvatar = avatarService.getEmptyAvatar()
    window.game.gotoAvatarEditorPage()
}

function renderEditorPage() {
    renderAvatarParts()
    renderEditor()
}

function renderAvatarParts() {
    const avatarPartImgsMap = avatarService.getAvatarImgsMap(gAvatar.gender)

    const strHTMLs = Object.keys(avatarPartImgsMap).map(part => {
        const partHe = avatarService.getAvatarPartHe(part)
        const strHTMLsItems = avatarPartImgsMap[part].map(url =>
            `
                <img data-type="${part}" src="${url}" alt="${partHe}" onclick="game.changeAvatarPart(this)">
                `)

        return `<details class="item" onclick="game.selectAvatarPartSection(this.open)">
        <summary>
        <h3>
            ${partHe}
            <span data-type="${part}" title="בלי ${partHe}" onclick="game.changeAvatarPart(this); event.preventDefault()">
                ✕
                <img src="${emptyImg}" alt="" width="0" height="0"/>
            </span>
        </h3>
        </summary>
        <ul>
            ${strHTMLsItems.join('')}
        </ul>
        </details>`

    })
    const el = document.querySelector('.avatar-parts-container')
    el.innerHTML = strHTMLs.join('')
}


function selectAvatarPartSection(isOpen) {
    const elAllDetails = Array.from(document.querySelectorAll('.avatar-parts-container details'))
    const elActiveDetails = elAllDetails.find(d => d.open)
    // isOpen is the state *before* the click, so !isOpen means one is about to open
    if (!isOpen && elActiveDetails) {
        elActiveDetails.open = false
    }
}

function changeAvatarPart(el) {
    const itemType = el.dataset.type
    const targetEl = document.querySelector(`.avatar-editor [data-type="${itemType}"]`)

    if (el.localName === 'span') el = el.querySelector('img')
    targetEl.src = el.src
    const fileName = (el.src.includes('base64')) ? '' : el.src.substring(el.src.lastIndexOf('/') + 1)
    gAvatar.parts[itemType] = fileName
}

function toggleGender(isMale) {
    gAvatar = avatarService.switchGender(gAvatar, (isMale) ? 'm' : 'f')
    // The preview holds the previous gender's parts - both halves need a re-render
    renderEditorPage()
}

async function saveAvatar() {
    const avatar = { ...gAvatar, parts: { ...gAvatar.parts } }
    if (!avatar.name) {
        avatar.name = prompt('שם?') || 'בבוש' + (Date.now() % 100)
    }

    avatar.img = await composeAvatarImg()

    try {
        await avatarService.save(avatar)
    } catch (err) {
        // Avatars are full size pngs - localStorage runs out of room after a few dozen
        console.error('Could not save avatar:', err)
        window.game.showUserMsg('לא הצלחתי לשמור')
        return
    }

    window.game.showUserMsg('שמרתי!')
    window.game.gotoAvatarsPage()
}

async function renderAvatars() {
    _clearAvatarIntervals()
    const avatars = await avatarService.query()

    const strHTMLs = avatars.map(avatar => {
        const name = utilService.escapeHtml(avatar.name)

        return `<li class="avatar-preview">
        <h3>
            ${name}
            <button title="מחקי" onclick="game.removeAvatar('${avatar.id}')">
                ✕
            </button>
            <button title="ערכי" onclick="game.editAvatar('${avatar.id}')">
                ✎
            </button>
            <button title="שתפי" onclick="game.shareAvatar('${avatar.id}')">
                Share
            </button>
        </h3>
        <img src="${avatar.img}" alt="${name}" />
    </li>`
    })

    document.querySelector('.avatar-list').innerHTML = strHTMLs.join('')
}


async function editAvatar(id) {
    const avatar = await avatarService.getById(id)
    if (!avatar) {
        window.game.showUserMsg('לא מצאתי את האווטר')
        return
    }
    gAvatar = avatar
    const name = prompt('שם', gAvatar.name)
    if (name) {
        gAvatar.name = name
    }
    window.game.gotoAvatarEditorPage()
}

async function shareAvatar(id) {
    const avatar = await avatarService.getById(id)
    if (!avatar) {
        window.game.showUserMsg('לא מצאתי את האווטר')
        return
    }

    const blob = await (await fetch(avatar.img)).blob()
    const file = new File([blob], `${avatar.name || 'avatar'}.png`, { type: blob.type })

    // Web Share with files is mobile only - desktop has no navigator.share at all
    if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
        window.game.showUserMsg('הדפדפן הזה לא יודע לשתף')
        return
    }
    try {
        await navigator.share({ files: [file] })
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Could not share avatar:', err)
            window.game.showUserMsg('השיתוף נכשל')
        }
    }
}


async function removeAvatar(id) {
    try {
        await avatarService.remove(id)
    } catch (err) {
        console.error('Could not remove avatar:', err)
        window.game.showUserMsg('לא הצלחתי למחוק')
        return
    }
    window.game.showUserMsg('מחקתי!')
    renderAvatars()
}

function randomAvatar() {
    const { id, name } = gAvatar
    gAvatar = { ...avatarService.getRandomAvatar(), name }
    if (id) gAvatar.id = id
    window.game.showUserMsg('יצרתי!')
    // The random avatar may have flipped gender, so the parts menu needs a re-render too
    renderEditorPage()
}

function _getPartUrl(avatarParts, partName) {
    return (avatarParts[partName]) ? `img/avatar/${avatarParts[partName]}` : emptyImg
}

function renderEditor() {
    const el = document.querySelector('.avatar-editor')
    document.querySelector('.avatar-editor-page [name="is-male"]').checked = (gAvatar.gender === 'm')
    Object.keys(gAvatar.parts).forEach(part => {
        el.querySelector(`[data-type="${part}"]`).src = _getPartUrl(gAvatar.parts, part)
    })

    _animateAvatar()
}

function _clearAvatarIntervals() {
    gIntervals.forEach(i => clearInterval(i))
    gIntervals = []
}

function _animateAvatar() {
    // Every re-render would otherwise stack another set of intervals on top of the live ones
    _clearAvatarIntervals()

    const el = document.querySelector('.avatar-editor')
    const animations = [
        { part: 'glasses', animation: 'jello', every: 1500 },
        { part: 'eye', animation: 'jello', every: 2500 },
        { part: 'hair', animation: 'pulse', every: 2000 },
        { part: 'mouth', animation: 'pulse', every: 1750 }
    ]

    animations.forEach(({ part, animation, every }) => {
        const elPart = el.querySelector(`[data-type="${part}"]`)
        gIntervals.push(setInterval(() => utilService.animateCSS(elPart, animation), every))
    })
}

async function composeAvatarImg() {
    const canvas = document.querySelector('.avatar-editor-page canvas')
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const parts = avatarService.getPartsRenderOrder()
        .filter(part => gAvatar.parts[part])

    // Load first, draw after: drawing as each img lands would layer them in load order
    const imgs = await Promise.all(parts.map(part => _loadImg(_getPartUrl(gAvatar.parts, part))))
    imgs.filter(img => img)
        .forEach(img => ctx.drawImage(img, 0, 0, canvas.width, canvas.height))

    return canvas.toDataURL()
}

// Resolves with null instead of rejecting, so one missing part cannot stall the save
function _loadImg(src) {
    return new Promise(resolve => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => {
            console.error(`Could not load avatar part: ${src}`)
            resolve(null)
        }
        img.src = src
    })
}
