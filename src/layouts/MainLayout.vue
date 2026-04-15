<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-2">
    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
// Layout logic can be added here if you add a Navigation Drawer later
</script>

<style>
/* Global background to ensure no white flashes during transitions */
body {
  background-color: #f5f5f5;
}
</style>
