// services/OffcanvasService.js

import { Offcanvas } from "bootstrap"

class OffcanvasService {

    offcanvas = null

    init(element) {
        this.offcanvas = Offcanvas.getOrCreateInstance(element)
    }

    show() {
        this.offcanvas?.show()
    }

    hide() {
        this.offcanvas?.hide()
    }
}

export default new OffcanvasService()
