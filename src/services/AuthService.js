// src/services/AuthService.js
import LoginService from "@/services/LoginService"

export default class AuthService {

    constructor(clientId) {

        this.clientId = clientId
        this.user = null
	this.changeCallback = null

        this.loadUser()

    }


     onChange(callback) {

        this.changeCallback = callback

    }	


    loadUser() {

        const json = localStorage.getItem("user")

        if (!json)
            return

        try {

            this.user = JSON.parse(json)

        }
        catch {

            this.user = null

        }

    }

    saveUser(user) {

        this.user = user

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        )

	this.changeCallback?.(user)    
    }

    logout() {

        this.user = null

        localStorage.removeItem("user")

    }

    isAuthenticated() {

        return this.user !== null

    }

    getUser() {

        return this.user

    }

    getEmail() {

        return this.user?.email ?? ""

    }

    isLocalNetwork() {

        const host = window.location.hostname

        return (

            host === "localhost" ||
            host === "127.0.0.1" ||
            host === "[::1]" ||

            host.startsWith("192.168.") ||
            host.startsWith("10.") ||

            /^172\.(1[6-9]|2\d|3[01])\./.test(host)

        )

    }

    isInternet() {

        return !this.isLocalNetwork()

    }

    async loadGoogleApi() {

        if (window.google?.accounts)
            return

        await new Promise((resolve, reject) => {

            const script = document.createElement("script")

            script.src = "https://accounts.google.com/gsi/client"
            script.async = true
            script.defer = true

            script.onload = resolve
            script.onerror = reject

            document.head.appendChild(script)

        })

    }

    async initializeGoogle(callback) {

        await this.loadGoogleApi()

        let container = document.getElementById("google-login")

        if (!container) {

            container = document.createElement("div")

            container.id = "google-login"
            container.style.display = "none"

            document.body.appendChild(container)

        }

        container.innerHTML = ""

        google.accounts.id.initialize({

            client_id: this.clientId,

            callback: (response) => {

                const payload =
                    this.parseJwt(response.credential)

                const user = {

                    email: payload.email,
                    name: payload.name,
                    picture: payload.picture,
                    auth: "google"

                }

                this.saveUser(user)

                callback?.(user)

            }

        })

        google.accounts.id.renderButton(container, {

            theme: "outline",
            size: "large"

        })

    }

    loginGoogle() {

        const button = document.querySelector(
            "#google-login div[role='button']"
        )

        if (button) {

            button.click()

        }
        else {

            console.error("Google button not initialized")

        }

    }

    loginLocal(email) {

        const user = {

            email,
            auth: "local"

        }

        this.saveUser(user)

        return user

    }

    async login() {

        if (this.isAuthenticated())
            return

        if (this.isLocalNetwork()) {

		console.log('local login')
            LoginService.show()

            return

        }
	
	await this.initializeGoogle()    
        this.loginGoogle()

    }

    parseJwt(token) {

        const base64 = token.split(".")[1]

        const json = atob(

            base64
                .replace(/-/g, "+")
                .replace(/_/g, "/")

        )

        return JSON.parse(json)

    }

}
