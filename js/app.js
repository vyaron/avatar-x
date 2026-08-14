
import { avatarController } from './controllers/avatar.controller.js'

const pages = ['avatar-editor-page', 'avatar-list-page']

window.game = {
    init,
    gotoPage,
    gotoAvatarsPage,
    gotoAvatarEditorPage,
    showUserMsg,

    changeAvatarPart: avatarController.changeAvatarPart,
    selectAvatarPartSection: avatarController.selectAvatarPartSection,
    toggleGender: avatarController.toggleGender,
    saveAvatar: avatarController.saveAvatar,
    removeAvatar: avatarController.removeAvatar,
    editAvatar: avatarController.editAvatar,
    randomAvatar: avatarController.randomAvatar,
    shareAvatar: avatarController.shareAvatar
}

function init() {
    gotoAvatarsPage()
}

function gotoPage(pageName) {
    pages.forEach(page => {
        const elPage = document.querySelector(`.${page}`)
        elPage.hidden = page !== pageName
    })
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function gotoAvatarsPage() {
    avatarController.renderAvatars()
    gotoPage('avatar-list-page')
}

function gotoAvatarEditorPage() {
    avatarController.renderEditorPage()
    gotoPage('avatar-editor-page')
}

function showUserMsg(txt) {
    const el = document.querySelector('.user-msg')
    el.innerText = txt;
    el.classList.add('user-msg-open')
    setTimeout(() => {
        el.classList.remove('user-msg-open')
    }, 3000)
}
