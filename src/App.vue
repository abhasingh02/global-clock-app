<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useClockStore } from 'src/stores/clock'

const clockStore = useClockStore()

onMounted(() => {
  setInterval(() => {
    clockStore.updateTime()
  }, 1000)
})
</script>
