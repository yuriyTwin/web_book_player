<template>

    <AudioPlayer
	:auth="auth"
        :service="bookService"
        :book="selectedBook"
	@refresh="loadLastPlay"
    />

    <BookMenu
	:auth="auth"
        :service="bookService"
        @book-selected="bookSelected"
    />

    <LoginDialog
        :auth="auth"
    />

</template>

<script setup>
	import { ref, reactive, onMounted  } from 'vue'
	import BookService from '@/services/BookService'
	import AuthService from '@/services/AuthService'
	import AudioPlayer from '@/components/AudioPlayer/AudioPlayer.vue'
	import LoginDialog from '@/components/Login/LoginDialog.vue'
	import BookMenu from '@/components/BookMenu/BookMenu.vue'
	import TrackingService from "@/services/TrackingService"

	const apiUrl = window.location.origin
	const app = 'papi'
	const google_client_id = '76355853178-renmsjq14dptnljt8iqp0vqj743rcroh.apps.googleusercontent.com'

	const auth = reactive(new AuthService(google_client_id))
	const bookService = new BookService(apiUrl, app, auth)
	const selectedBook = ref(null)


	onMounted(() => {

    		auth.onChange(async (user) => {

        		if (user) {

            			await loadLastPlay()

        		}

    		})


    		if (auth.isAuthenticated()) {

        		loadLastPlay()

    		}

	})


	async function loadLastPlay(){

    		
		const book =
        		await bookService.getLastPlay()


    		if (!book)
        		return


		selectedBook.value =  {
			id: book.bookid,
                        name: book.name,
                        img: book.img,
                        filenum: book.filenum,
                        time: book.time
		}

	}


	function bookSelected(book) {
		console.log('book selected', book)
    		selectedBook.value = book
	}

</script>
