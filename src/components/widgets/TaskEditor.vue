<script>
import { ChevronDown, ChevronRight } from "lucide-vue-next";

export default {
  name: "TaskEditor",

  components: {
    ChevronDown,
    ChevronRight,
  },

  props: {
    modelValue: {
      type: Object,
      default: () => ({
        name: "",
        content: "",
        status: "",
        dueDate: "",
        time: "",
        priority: "",
      }),
    },

    // statusOptions: [
    //     { value: "not_started", label: "Not Started" },
    //     { value: "in_progress", label: "In Progress" },
    //     { value: "completed", label: "Completed" },
    //   ],

    //   priorityOptions: [
    //     { value: "low", label: "Low" },
    //     { value: "medium", label: "Medium" },
    //     { value: "high", label: "High" },
    //   ],

    statusOptions: {
      type: Array,
      default: () => [
        { value: "not_started", label: "Not Started" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
      ],
    },

    priorityOptions: {
      type: Array,
      default: () => [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
      ],
    },

    defaultOpen: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    currentIcon() {
      return this.showTasks ? ChevronDown : ChevronRight;
    },
    isAnyFieldFilled() {
      return (
        this.localTask.content ||
        this.localTask.status ||
        this.localTask.dueDate ||
        this.localTask.time ||
        this.localTask.priority
      );
    },
    isNameInvalid() {
      return this.isAnyFieldFilled && !this.localTask.name;
    },
  },

  data() {
    return {
      showTasks: this.defaultOpen,
      localTask: { ...this.modelValue },
    };
  },

  watch: {
    modelValue: {
      deep: true,
      handler(val) {
        this.localTask = { ...val };
      },
    },
    localTask: {
      deep: true,
      handler(val) {
        this.$emit("update:modelValue", val);
      },
    },
  },
};
</script>

<template>
  <div class="mb-5">
    <!-- HEADER -->
    <button
      type="button"
      @click="showTasks = !showTasks"
      class="flex items-center gap-2 w-full text-left mb-3"
    >
      <component :is="currentIcon" :size="16" class="text-sub-text" />

      <span
        class="text-sm font-semibold text-main-text flex items-center gap-2"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
        Tasks
      </span>
    </button>

    <!-- CONTENT -->
    <div
      v-if="showTasks"
      class="border border-outline rounded-lg overflow-hidden"
    >
      <!-- Task Name -->
      <div class="px-4 pt-4 pb-2">
        <label class="block text-sm font-medium text-main-text mb-2">
          Name of Task
        </label>
        <input
          v-model="localTask.name"
          type="text"
          placeholder="Task name..."
          :class="[
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm',
            isNameInvalid ? 'border-red-500' : 'border-outline',
          ]"
        />
        <p v-if="isNameInvalid" class="text-red-500 text-xs mt-1">
          Nama task wajib diisi jika field lain diisi
        </p>
      </div>

      <!-- Rich Text -->
      <div class="px-4 pb-4">
        <!-- Toolbar -->
        <div
          class="flex items-center gap-1 px-3 py-2 border border-outline rounded-t-lg bg-light-base flex-wrap"
        >
          <button class="p-1 hover:bg-white rounded text-xs">↩</button>
          <button class="p-1 hover:bg-white rounded text-xs">↪</button>

          <span class="text-outline mx-1">|</span>

          <select class="text-xs bg-transparent focus:outline-none">
            <option>Format</option>
            <option>Heading 1</option>
            <option>Paragraph</option>
          </select>

          <span class="text-outline mx-1">|</span>

          <button class="p-1 font-bold text-xs">B</button>
          <button class="p-1 italic text-xs">I</button>
          <button class="p-1 underline text-xs">U</button>

          <span class="text-outline mx-1">|</span>

          <button class="p-1 text-xs">🔗</button>
          <button class="p-1 text-xs">⚓</button>
        </div>

        <textarea
          v-model="localTask.content"
          rows="4"
          class="w-full px-3 py-3 text-sm text-sub-text border border-outline border-t-0 rounded-b-lg focus:outline-none resize-none"
          placeholder="Deskripsi task..."
        ></textarea>
      </div>

      <!-- Status -->
      <div class="px-4 pb-4">
        <label class="block text-sm font-medium text-main-text mb-2">
          Status
        </label>
        <select
          v-model="localTask.status"
          class="w-full px-3 py-2 border border-outline rounded-lg text-sm bg-white"
        >
          <option
            v-for="opt in statusOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Date & Time -->
      <div class="grid grid-cols-2 gap-4 px-4 pb-4">
        <input
          v-model="localTask.dueDate"
          type="date"
          class="w-full px-3 py-2 border border-outline rounded-lg text-sm"
        />
        <input
          v-model="localTask.time"
          type="time"
          class="w-full px-3 py-2 border border-outline rounded-lg text-sm"
        />
      </div>

      <!-- Priority -->
      <div class="px-4 pb-4">
        <label class="block text-sm font-medium text-main-text mb-2">
          Priority
        </label>
        <select
          v-model="localTask.priority"
          class="w-full px-3 py-2 border border-outline rounded-lg text-sm bg-white"
        >
          <option
            v-for="opt in priorityOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
