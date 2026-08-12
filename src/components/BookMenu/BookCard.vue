<template>

<div
    class="card"
    :class="{
        selected:selected,
        'not-opened':book.opened===0
    }"
    @click="selectBook"
>


<img
    :src="`${path}/${book.img}`"
    class="card-img-top"
>


<div class="card-body">

<p class="card-text">
    {{book.name}}
</p>


<ul>

<li>
Автор:
{{book.author}}
</li>

<li>
Жанр:
{{book.ganre}}
</li>

<li>
Время:
{{book.duration}}
</li>

<li>
Читает:
{{book.reader}}
</li>

</ul>


</div>


</div>

</template>

<script setup>

	const props = defineProps({
    		book: Object,
    		selected: Boolean,
    		path: String
	})


	const emit = defineEmits([
    		'select'
	])


	function selectBook(){

    		emit('select', props.book)
	}

</script>
