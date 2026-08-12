<style scoped>
	@import '@/assets/css/book-menu.css';
</style>
<template>

<div 
    ref="offcanvasRef"   
    class="offcanvas offcanvas-end"
    tabindex="-1"
    id="offcanvasBooks"
>

    <div class="offcanvas-header">

        <h5 class="offcanvas-title">
            Меню
        </h5>

        <button
            type="button"
            class="btn-close"
            data-bs-dismiss="offcanvas">
        </button>

    </div>


    <div class="offcanvas-body">


        <div class="app-menu">

            <div class="input-group mb-3">

                <input
                    v-model="searchText"
                    class="form-control"
                    placeholder="Искать книгу"
                >

                <button
                    class="btn btn-outline-secondary"
                    @click="search"
                >
                    Искать
                </button>

            </div>


            <ul class="navbar-nav">

                <li class="nav-item">
                    <a
                        class="nav-link"
                        :class="{'selected-item': selected==='getAllBooks'}"
                        @click="getAllBooks"
                    >
                        Все книги
                    </a>
                </li>


                <li 
		    v-if="auth.user"	
		    class="nav-item">

                    <a
                        class="nav-link"
			:class="{'selected-item': selected==='getLastTenLoaded'}"
                        @click="getLastTenLoaded"
                    >
                        Последние 10 загруженных книг
                    </a>

                </li>

		<li
                    v-if="auth.user"
                    class="nav-item"
                >

                    <a
                        class="nav-link"
			:class="{'selected-item': selected==='getLastTenNotOppenedBooks'}"
                        @click="getLastTenNotOppenedBooks"
                    >
                        Последние 10 неоткрытых книг
                    </a>

                </li>



                <li
                    v-if="auth.user"
                    class="nav-item"
                >

                    <a
                        class="nav-link"
			:class="{'selected-item': selected==='getLastTenOpened'}"
                        @click="getLastTenOpened"
                    >
                        Последние 10 открытых книг
                    </a>

                </li>

	
		<li
                    v-if="auth.user"
                    class="nav-item"
                >

                    <a
                        class="nav-link"
			:class="{'selected-item': selected==='getCurrentCycleBooks'}"
                        @click="getCurrentCycleBooks"
                    >
                        Книги текущей серии
                    </a>

                </li>	


            </ul>

        </div>


        <BookCard
            v-for="book in books"
            :key="book.id"
            :book="book"
	    :path="`${service.url}/${service.app}`"
            :selected="book.id===currentBook"
            @select="openBook"
        />


    </div>

</div>

</template>
<script setup>

	import { ref,onMounted } from 'vue'
	import { Offcanvas } from 'bootstrap'
	import BookCard from './BookCard.vue'

	import OffcanvasService from "@/services/OffcanvasService"

	const offcanvasRef = ref(null)

	onMounted(() => {
    		OffcanvasService.init(offcanvasRef.value)
	})


	const props = defineProps({
    		auth: Object,
    		service: Object
	})

	const emit = defineEmits([
    		'book-selected'
	])

	const books = ref([])
	const searchText = ref('')
	const selected = ref('')
	const currentBook = ref(0)

	async function search() {

    	books.value =
        	await props.service.serarchBooks(searchText.value)

	}

	async function getAllBooks() {

    		selected.value = 'getAllBooks'

    		books.value =
        		await props.service.getBookList()

	}

	async function getLastTenLoaded() {

    		selected.value = 'getLastTenLoaded'

    		books.value =
        		await props.service.getLastTenBooks()

	}

	async function getLastTenOpened() {

    		selected.value = 'getLastTenOpened'

    		books.value =
        		await props.service.getlastTenOpened()

	}

	async function getLastTenNotOppenedBooks() {

    		selected.value = 'getLastTenNotOppenedBooks'

    		books.value =
        		await props.service.getLastTenNotOppenedBooks()

	}

	async function getCurrentCycleBooks() {

    		selected.value = 'getCurrentCycleBooks'

    		books.value =
        		await props.service.getCurrentCycleBooks()

	}

	function openBook(book) {

		OffcanvasService.hide()

    		emit("book-selected", book)

	}

</script>
