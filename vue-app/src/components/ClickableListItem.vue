<template>
  <router-link :to="to" custom v-slot="{ navigate }">
    <li
      class="student-list-item"
      style="cursor: pointer;"
      tabindex="0"
      role="link"
      @click="navigate"
      @keydown.enter="navigate"
    >
      <slot />
    </li>
  </router-link>
</template>

<script setup>
defineProps({
  to: { type: [String, Object], required: true }
})
</script>
