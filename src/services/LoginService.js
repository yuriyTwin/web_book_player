class LoginService {

    dialog = null

    init(dialog) {
        this.dialog = dialog
    }

    show() {
        this.dialog?.show()
    }

    hide() {
        this.dialog?.hide()
    }

}

export default new LoginService()
