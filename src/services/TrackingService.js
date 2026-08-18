// src/services/TrackingService.js

class TrackingService {

    constructor() {

        this.auth = null
        this.bookService = null
        this.getState = null
        this.timer = null

    }

    init({ auth, bookService, getState }) {

        this.auth = auth
        this.bookService = bookService
        this.getState = getState

    }


    start() {

        this.stop()

        this.timer = setInterval(() => {

            this.save()

        }, 30000)

    }

    stop() {

        if (this.timer) {

            clearInterval(this.timer)

            this.timer = null

        }

    }

    async save() {

        if (!this.auth || typeof this.auth.isAuthenticated !== 'function')
            return

        if (!this.auth.isAuthenticated())
            return

        if (!this.getState)
            return

        const state = this.getState()

        if (!state.book)
            return

        // If caller provides a `playing` flag, only save when playing === true.
        // If `playing` is undefined, keep backward compatibility and allow save.
        if (typeof state.playing !== 'undefined' && !state.playing)
            return

        await this.bookService.setPlayTime(

            state.book.id,
            state.fileNum,
            Math.floor(state.time)

        )

    }
}

export default new TrackingService()
