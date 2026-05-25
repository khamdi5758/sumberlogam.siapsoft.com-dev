<template>
  <div class="mb-4 flex items-center justify-between gap-3">
    <h1 class="text-lg font-bold text-main-text sm:text-2xl">Users</h1>

    <div class="flex items-center gap-2">
      <button
        @click="$emit('open-add-user')"
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-lg border border-outline bg-white text-sub-text transition hover:bg-sub-text hover:text-white sm:h-10 sm:w-auto sm:gap-2 sm:px-4"
      >
        <span class="text-xl leading-none font-semibold">+</span>
        <span class="hidden text-sm font-medium sm:inline">Add User</span>
      </button>

      <button
        @click="$emit('refresh')"
        :disabled="isLoading"
        class="h-9 w-9 rounded-lg border border-outline bg-white p-2 transition-all hover:bg-light-base active:scale-95 disabled:opacity-50 sm:h-10 sm:w-10"
        title="Refresh Data"
      >
        <RefreshCcw
          :size="18"
          :class="{ 'animate-spin': isLoading }"
          class="text-sub-text"
        />
      </button>
    </div>
  </div>
</template>

<script>
import { RefreshCcw } from "lucide-vue-next";

export default {
  name: "UsersHeader",
  components: { RefreshCcw },
  props: {
    isLoading: { type: Boolean, default: false },
    totalUsers: { type: Number, default: 0 },
  },
};
</script>
