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

    		if (!this.auth.isAuthenticated())
        		return

    		if (!this.getState)
        		return

    		const state = this.getState()

    		if (!state.book)
        		return

    		await this.bookService.setPlayTime(

        		state.book.id,
        		state.fileNum,
        		Math.floor(state.time)

    		)

	}
}

export default new TrackingService()
