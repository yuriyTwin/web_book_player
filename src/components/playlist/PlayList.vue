<template>

<ul class="play-list">

    <li
        v-for="(track,index) in playlist"
        :key="index"
        class="track"
        :class="{
            selected: index === currentTrack
        }"
        @click="selectTrack(index)"
    >

        {{ track.title }}

    </li>

</ul>

</template>
<style scoped>
	@import '@/assets/css/play-list.css';
</style>

<script setup>

	const props = defineProps({

   		 playlist:{
        		type:Array,
        		default:()=>[]
    		},

    		currentTrack:{
        		type:Number,
        		default:0
    		}

	})


	const emit = defineEmits([
    		'select'
	])


	function selectTrack(index){

    		emit('select', index, 0)
	}

</script>
