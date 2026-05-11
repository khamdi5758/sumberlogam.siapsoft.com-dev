<template>
  <div class="flex items-center justify-between border-b border-outline pb-3">
    <div>
      <div class="text-sm font-medium text-sub-text">{{ label }}</div>
      <div class="text-xs text-gray-400">{{ description }}</div>
    </div>

    <label class="inline-flex items-center cursor-pointer">
      <input type="checkbox" v-model="model" class="sr-only peer" />
      <div
        class="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-primary relative transition"
      >
        <div
          class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"
        ></div>
      </div>
    </label>
  </div>
</template>

<script setup>
defineProps(["label", "description"]);
const model = defineModel();
</script>
