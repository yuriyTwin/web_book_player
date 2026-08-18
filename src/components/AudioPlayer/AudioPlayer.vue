<template>
    <div class="audio-player container">

        <audio
            ref="audioElement"
            :src="currentFile"
            @timeupdate="updateSeekBar"
            @loadedmetadata="updateDuration"
            @ended="nextTrack">
        </audio>

        <div ref="playerBox" class="player-box">

            <div class="row">
                <div class="col-12">
                    <h6>{{ title }}</h6>
                </div>
            </div>

            <div class="row">

                <div class="col-3 text-start">

                    <ul class="play-button-box">

                        <li>
                            <button
                                class="btn"
                                :class="playing ? 'btn-pause' : 'btn-play'"
                                @click="togglePlayPause">
                            </button>
                        </li>

                        <li>
                            <button
                                class="btn btn-next"
                                @click="nextTrack">
                            </button>
                        </li>

                        <li>
                            <button
                                class="btn btn-prev"
                                @click="previousTrack">
                            </button>
                        </li>

                    </ul>

                </div>

                <div
                    class="col-6 text-center"
                    :class="{ play: !playing }">

                    <img
                        class="book-image"
                        :src="bookImage"
                        @click="togglePlayPause">

                    </img>

                </div>

                <div class="col-3 text-end">

                    <ul class="play-button-box">

                        <li>

                            <button
                                class="btn btn-menu"
                @click="openMenu"
                            ></button>

                        </li>

                        <li>

                            <button v-if="auth.user"
                                class="btn btn-refresh"
                                @click="refresh">
                            </button>

                        </li>
            <li>
                <button v-if="!auth.user" class="btn btn-login" @click="login"></button>
                <div id="google-login" style="display:none">
                        <div role="button">...</div>
                </div>
            </li>

                    </ul>

                </div>

            </div>

            <div class="row">

                <div class="col-12 duration text-end">

                    {{ currentTimeText }}
                    /
                    {{ durationText }}

                </div>

            </div>

            <div class="row">

                <div class="col-12">

                    <input
                        class="slider"
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        v-model="seek"
                        @input="seekAudio">

                    </input>

                </div>

            </div>

        </div>

        <div  ref="playlistBox" class="row play-list-box">

            <div class="col-12">

                <PlayList
                    :playlist="playlist"
                    :current-track="currentFileIndex"
                    @select="selectTrack"
                />

            </div>

        </div>

    </div>
</template>
<script setup>
	import { watch, ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
	import PlayList from '../playlist/PlayList.vue'
	import OffcanvasService from "@/services/OffcanvasService"
	import TrackingService from "@/services/TrackingService"

	const audioElement = ref(null)
	const playerBox = ref(null)
	const playlistBox = ref(null)

	const title = ref('')
	const bookImage = ref('')
	const playlist = ref([])

	const currentFileIndex = ref(0)
	const currentFile = ref('')

	const playing = ref(false)

	const currentTimeText = ref('0:00')
	const durationText = ref('0:00')

	const seek = ref(0)

	const props = defineProps({
    	auth: Object,
    	service: Object,
    	book: Object
	})


	const emit = defineEmits([
    	'refresh'
	])

/* --- Auto-save configuration --- */
const SAVE_INTERVAL_MS = 30 * 1000 // 30 секунд
const saveIntervalId = ref(null)
const isSaving = ref(false)
const lastSaveAt = ref(0) // timestamp ms последнего успешного save

function startAutoSave() {
    if (saveIntervalId.value) return // уже запущен
    // не вызываем save сразу, первый запуск через SAVE_INTERVAL_MS
    saveIntervalId.value = setInterval(async () => {
        if (!playing.value) return // строго только при воспроизведении
        if (isSaving.value) return
        isSaving.value = true
        try {
            await TrackingService.save()
            lastSaveAt.value = Date.now()
        } catch (e) {
            console.error('Auto save failed', e)
        } finally {
            isSaving.value = false
        }
    }, SAVE_INTERVAL_MS)
}

function stopAutoSave() {
    if (!saveIntervalId.value) return
    clearInterval(saveIntervalId.value)
    saveIntervalId.value = null
}

/* pagehide handler: выполняем save ТОЛЬКО если идёт воспроизведение и прошло >= 30s с последнего save */
async function pagehideHandler() {
    try {
        if (!playing.value) return
        const now = Date.now()
        if (now - (lastSaveAt.value || 0) >= SAVE_INTERVAL_MS && !isSaving.value) {
            isSaving.value = true
            try {
                await TrackingService.save()
                lastSaveAt.value = now
            } catch (e) {
                console.error('pagehide save failed', e)
            } finally {
                isSaving.value = false
            }
        }
    } catch (e) {
        console.error('pagehide handler error', e)
    }
}

/* --- lifecycle --- */
onMounted(async () => {
    TrackingService.init({
        auth: props.auth,
        bookService: props.service,
        getState: () => ({
            book: props.book,
            fileNum: currentFileIndex.value,
            time: audioElement.value?.currentTime ?? 0,
            playing: playing.value
        })
    })

    // слушатель pagehide теперь вызывает сохранение только при воспроизведении
    window.addEventListener("pagehide", pagehideHandler)

    await nextTick() // дождаться рендера перед замерами
    resizePlayer()

    window.addEventListener("resize", resizePlayer)
})

onBeforeUnmount(async () => {
    window.removeEventListener("pagehide", pagehideHandler)
    window.removeEventListener("resize", resizePlayer)

    // Остановить автосохранение
    stopAutoSave()
    TrackingService.stop()

    // При размонтировании — если воспроизведение всё ещё идёт и с последнего save прошло >= 30s — попытаться сох[...]
    try {
        if (playing.value) {
            const now = Date.now()
            if (now - (lastSaveAt.value || 0) >= SAVE_INTERVAL_MS && !isSaving.value) {
                isSaving.value = true
                try {
                    await TrackingService.save()
                } catch (e) {
                    console.error('final save on unmount failed', e)
                } finally {
                    isSaving.value = false
                }
            }
        }
    } catch (e) {
        console.error('onBeforeUnmount save error', e)
    }
})

watch(
	() => [
       	props.book?.id,
        	props.book?.time
    ],

    async ([bookId, time], [oldBookId, oldTime]) => {

        if (!bookId)
            return

        console.log("book:", bookId, "time:", time)

        const playlistData =
            await props.service.getPlayList(bookId)

        setPlaylist(playlistData, props.book)

    },
    {
        immediate: true
    }
)


function resizePlayer() {

    if (!playerBox.value || !playlistBox.value)
        return

    const playerHeight =
        playerBox.value.offsetHeight

    playlistBox.value.style.height =
        `${window.innerHeight - playerHeight - 10}px`

}


function openMenu() {

    OffcanvasService.show()
}


function setFile(file) {

    currentFile.value = file

    if (audioElement.value) {
        audioElement.value.load()
        audioElement.value.currentTime = 0
    }
}


async function selectTrack(index, time = null, shouldPlay = true) {

    if (index < 0 || index >= playlist.value.length)
        return


    // Убраны явные saves здесь — автосохранение будет происходить через интервал при воспроизведении

    currentFileIndex.value = index

    currentFile.value =
        playlist.value[index].file


    await nextTick()


	const audio = audioElement.value

	if (!audio)
		return

	const startTime =
		time !== null && time !== undefined
		? time
		: (props.book?.time ?? 0)

	// Регистрируем обработчик до load(), чтобы избежать гонки
	const onMeta = async () => {
		try {
			audio.currentTime = startTime
		} catch (e) {
			console.warn('Failed to set currentTime', e)
		}

		if (shouldPlay) {
			try {
				await audio.play()
				playing.value = true
				TrackingService.start()
				// стартуем автосохранение при успешном запуске воспроизведения
				startAutoSave()
				// фиксируем время, чтобы не сразу пере-сохранить при pagehide
				lastSaveAt.value = Date.now()
			} catch (e) {
				console.error(e)
			}
		} else {
			// не запускать воспроизведение автоматически
			playing.value = false
		}
	}

	audio.addEventListener('loadedmetadata', onMeta, { once: true })

	audio.load()

}


function togglePlayPause() {

    if (!audioElement.value)
        return

    if (audioElement.value.paused) {

        audioElement.value.play()
        playing.value = true
        TrackingService.start()
        startAutoSave()
        lastSaveAt.value = Date.now()

    } else {

        audioElement.value.pause()
        playing.value = false
        TrackingService.stop()
        // при паузе автосохранение останавливаем и НЕ вызываем TrackingService.save сразу
        stopAutoSave()
        // (по требованию: НЕ сохраняем прямо при паузе — save только через 30с при воспроизведении)

    }

}


function nextTrack() {
    // Убраны прямые вызовы TrackingService.save
    if (currentFileIndex.value < playlist.value.length - 1) {

        selectTrack(currentFileIndex.value + 1, 0, true)

    } else {
        // если трек последний — выключаем воспроизведение и автосохранение
        playing.value = false
        stopAutoSave()
        TrackingService.stop()
    }

}


function previousTrack() {

    if (currentFileIndex.value > 0) {

        selectTrack(currentFileIndex.value - 1, 0, true)

    }

}


function seekAudio() {

    if (!audioElement.value)
        return

    const duration = audioElement.value.duration

    if (!isFinite(duration) || duration === 0)
        return

    audioElement.value.currentTime =
        duration * seek.value / 100

}


function updateSeekBar() {

    if (!audioElement.value)
        return

    const currentTime = audioElement.value.currentTime
    const duration = audioElement.value.duration || 0

    if (duration > 0) {

        seek.value = currentTime / duration * 100

    }

    currentTimeText.value = formatTime(currentTime)
}


function updateDuration() {

    if (!audioElement.value)
        return

    durationText.value =
        formatTime(audioElement.value.duration)

}


function formatTime(seconds) {

    if (!isFinite(seconds) || seconds <= 0)
        return '0:00'

    const minutes = Math.floor(seconds / 60)
    const sec = Math.floor(seconds % 60)

    return `${minutes}:${sec.toString().padStart(2, '0')}`
}


function refresh() {

	 emit("refresh")
}



function setPlaylist(playlistData, book) {


    playlist.value =
        playlistData.list.map((item,index)=>({

            id:index,

            title:item.title,

            file:
            `${props.service.url}/${props.service.app}/${item.mp3}`

    }))


    title.value = book.name


    bookImage.value =
        `${props.service.url}/${props.service.app}/${book.img}`


    currentFileIndex.value =
        book.filenum ?? 0


    // Не воспроизводить автоматически при установке плейлиста/инициализации
    selectTrack(
        currentFileIndex.value,
        null,
        false
    )


}


async function login(){

	await props.auth.login()

}

</script>
<style scoped>
	@import '@/assets/css/audio-player.css';
</style>
