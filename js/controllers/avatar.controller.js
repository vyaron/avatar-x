import { avatarService } from "../services/avatar.service.js"
import { utilService } from "../services/util.service.js"

const emptyImg = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
var gAvatar = avatarService.getEmptyAvatar()
window.gAvatar = gAvatar
var gIntervals = []

export const avatarController = {
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

function renderEditorPage() {
    renderAvatarParts()
    renderEditor()
}

function renderAvatarParts() {
    const avatarPartImgsMap = avatarService.getAvatarImgsMap(gAvatar.gender)

    const strHTMLs = Object.keys(avatarPartImgsMap).map(part => {
        const strHTMLsItems = avatarPartImgsMap[part].map((url, idx) =>
            `
                <img data-type="${part}" src="${url}" onclick="game.changeAvatarPart(this)">
                `)

        return `<details class="item" onclick="game.selectAvatarPartSection(this.open)">
        <summary>
        <h3>
            ${avatarService.getAvatarPartHe(part)}
            <span data-type="${part}" onclick="game.changeAvatarPart(this); event.preventDefault()">
                ✕
                <img src="${emptyImg}" width="0" height="0"/>
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
      if (!isOpen && elActiveDetails) {
        elActiveDetails.open = false
      }
}

function changeAvatarPart(el) {
    const itemType = el.dataset.type
    const targetEl = document.querySelector(`.avatar-editor [data-type=${itemType}]`)

    if (el.localName === 'span') el = el.querySelector('img')
    // const src = (unset)? emptyImg : el.src
    targetEl.src = el.src
    const fileName = (el.src.includes('base64')) ? '' : el.src.substring(el.src.lastIndexOf('/') + 1)
    gAvatar.parts[itemType] = fileName
}

function toggleGender(isMale) {
    const gender = (isMale) ? 'm' : 'f'
    gAvatar = avatarService.getEmptyAvatar(gender)
    renderAvatarParts()
}

async function saveAvatar() {
    const avatar = { ...gAvatar }
    if (!avatar.name) {
        const name = prompt('שם?') || 'בבוש' + (Date.now() % 100)
        avatar.name = name
    }
    
    avatar.img = await composeAvatarImg()
    await avatarService.save(avatar)

    window.game.showUserMsg('שמרתי!')
    _clearAvatarIntervals()
    window.game.gotoAvatarsPage()
}

async function renderAvatars() {
    _clearAvatarIntervals()
    const avatars = await avatarService.query()

    const strHTMLs = avatars.map(avatar => {

        return `<li class="avatar-preview">
        <h3>
            ${avatar.name}
            <button onclick="game.removeAvatar('${avatar.id}')">
                ✕
            </button>
            <button onclick="game.editAvatar('${avatar.id}')">
                ✎
            </button>
            <button onclick="game.shareAvatar('${avatar.id}')">
                Share
            </button>
        </h3>
        <img src="${avatar.img}"  />
    </li>`
    })

    document.querySelector('.avatar-list').innerHTML = strHTMLs.join('')
}


async function editAvatar(id) {
    gAvatar = await avatarService.getById(id)
    const name = prompt('שם', gAvatar.name)
    if (name) {
        gAvatar.name = name
    }
    window.game.gotoAvatarEditorPage()
}

async function shareAvatar(id) {
    gAvatar = await avatarService.getById(id)
    // const base64url = "data:image/octet-stream;base64,/9j/4AAQSkZ...."
    const base64url = gAvatar.img
    const blob = await (await fetch(base64url)).blob()
    const file = new File([blob], 'fileName.png', { type: blob.type })
    navigator.share({
    //   title: 'Hello',
    //   text: 'Check out this image!',
      files: [file]
    })

}


async function removeAvatar(id) {
    await avatarService.remove(id)
    window.game.showUserMsg('מחקתי!')
    renderAvatars()
}

function randomAvatar() {
    gAvatar = avatarService.getRandomAvatar()
    window.game.showUserMsg('יצרתי!')
    renderEditor()
}

function _getPartUrl(avatarParts, partName) {
    return (avatarParts[partName]) ? `img/avatar/${avatarParts[partName]}` : emptyImg
}

function renderEditor() {
    const el = document.querySelector('.avatar-editor')
    document.querySelector('.avatar-editor-page [name=is-male]').checked = (gAvatar.gender === 'm')
    Object.keys(gAvatar.parts).forEach(part => {
        el.querySelector(`[data-type=${part}]`).src = _getPartUrl(gAvatar.parts, part)
    })

    _animateAvatar()
}

function _clearAvatarIntervals() {
    gIntervals.forEach(i => clearInterval(i))
    gIntervals = []
}

function _animateAvatar() {
    const el = document.querySelector('.avatar-editor')
    var interval = setInterval(()=>{
        utilService.animateCSS(el.querySelector(`[data-type=glasses]`), 'jello')
    }, 1500)
    gIntervals.push(interval)
    interval = setInterval(()=>{
        utilService.animateCSS(el.querySelector(`[data-type=eye]`), 'jello')
    }, 2500)
    gIntervals.push(interval)
    interval = setInterval(()=>{
        utilService.animateCSS(el.querySelector(`[data-type=hair]`), 'pulse')
    }, 2000)
    gIntervals.push(interval)
    interval = setInterval(()=>{
        utilService.animateCSS(el.querySelector(`[data-type=mouth]`), 'pulse')
    }, 1750)
    gIntervals.push(interval)
}

function composeAvatarImg() {
    return new Promise((resolve) => {
        const canvas = document.querySelector('.avatar-editor-page canvas')
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const partsCount = Object.keys(gAvatar.parts).length
        var count = 0
        Object.keys(gAvatar.parts)
        .filter(part => part)
        .forEach(part => {
            const img = new Image()
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                count++
                if (count === partsCount) {
                    resolve(canvas.toDataURL())
                }
            }
            img.src = _getPartUrl(gAvatar.parts, part)
        })


    })

}