// src/services/BookService.js

export default class BookService {

    constructor(url, app, auth) {

        this.url = url;
	this.app = app;
        this.auth = auth;
    }


    async serarchBooks(searchText){
	const response = await fetch(
            `${this.url}/${this.app}/serarchBooks?search=${searchText}&email=${this.auth.user.email}&=${Date.now()}`
        );

        return await response.json();
    }


    async getBookList() {

        const response = await fetch(
            `${this.url}/${this.app}/getBookList?email=${this.auth.user.email}&=${Date.now()}`
        );

        return await response.json();
    }


    async getLastPlay() {

        const response = await fetch(
            `${this.url}/${this.app}/getLastTime?email=${this.auth.user.email}&=${Date.now()}`
        );

        return await response.json();
    }	


    async getLastTenBooks() {

        const response = await fetch(
            `${this.url}/${this.app}/getLastTenBooks?email=${this.auth.user.email}&=${Date.now()}`
        );

        return await response.json();
    }


    async getLastTenNotOppenedBooks() {

        const response = await fetch(
            `${this.url}/${this.app}/getLastTenNotOppenedBooks?email=${this.auth.user.email}&=${Date.now()}`
        );

        return await response.json();
    }	


    async getlastTenOpened() {

        const response = await fetch(
            `${this.url}/${this.app}/getlastTenOpened?email=${this.auth.user.email}&=${Date.now()}`
        );

        return await response.json();
    }


    async getCurrentCycleBooks() {

        const response = await fetch(
            `${this.url}/${this.app}/getCurrentCycleBooks?email=${this.auth.user.email}&=${Date.now()}`
        );

        return await response.json();
    }


    async getPlayList(bookId) {

        const response = await fetch(
            `${this.url}/${this.app}/getPlayList?id=${bookId}&email=${this.auth.user.email}&=${Date.now()}`
        );

        return await response.json();
    }


    async setPlayTime(bookid, filenum, time) {

	const response = await fetch(
            `${this.url}/${this.app}/setPlayTime?email=${this.auth.user.email}&bookId=${bookid}&fileNum=${filenum}&time=${time}`);

        return await response.json();
    }

}
