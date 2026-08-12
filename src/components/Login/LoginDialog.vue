<template>
    <div
        class="modal fade"
        tabindex="-1"
        ref="modalRef">

        <div class="modal-dialog">

            <div class="modal-content">

                <div class="modal-header">

                    <h5 class="modal-title">
                        Local Login
                    </h5>

                    <button
                        type="button"
                        class="btn-close"
                        @click="hide">
                    </button>

                </div>

                <div class="modal-body">

                    <input
                        v-model="email"
                        class="form-control"
                        type="email"
                        placeholder="Enter email">

                </div>

                <div class="modal-footer">

                    <button
                        class="btn btn-secondary"
                        @click="hide">

                        Cancel

                    </button>

                    <button
                        class="btn btn-primary"
                        @click="login">

                        Login

                    </button>

                </div>

            </div>

        </div>

    </div>
</template>

<script setup>
	import { ref, onMounted } from "vue"
	import { Modal } from "bootstrap"

	import LoginService from "@/services/LoginService"

	const props = defineProps({
    		auth: Object
	})

	const modalRef = ref(null)

	const email = ref("")

	let modal = null

	onMounted(() => {

    		modal = Modal.getOrCreateInstance(
        		modalRef.value
    		)

    		LoginService.init({

        		show,
        		hide

    		})

	})

	function show() {

    		email.value = props.auth.getEmail()

    		modal.show()

	}

	function hide() {

    		modal.hide()

	}

	function login() {

    		if (!email.value.trim())
        		return

    		props.auth.loginLocal(email.value)

    		hide()

	}

</script>

<style scoped>
	.modal-body {
    		padding: 20px;
	}
</style>
