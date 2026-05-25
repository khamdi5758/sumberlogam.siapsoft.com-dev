<script>
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  Camera,
  Mic,
} from "lucide-vue-next";

export default {
  name: "NotesEditor",

  components: {
    ChevronDown,
    ChevronRight,
    MapPin,
    Camera,
    Mic,
  },

  props: {
    modelValue: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "Notes",
    },
    defaultOpen: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      showNotes: this.defaultOpen,
      localValue: this.modelValue,
    };
  },

  watch: {
    modelValue(val) {
      console.log("modelValue noteseditor changed:", val);
      this.localValue = val;
    },
    localValue(val) {
      this.$emit("update:modelValue", val);
    },
  },

  computed: {
    currentIcon() {
      return this.showNotes ? ChevronDown : ChevronRight;
    },
  },
};
</script>

<template>
  <div class="mb-5">
    <!-- HEADER -->
    <button
      type="button"
      @click="showNotes = !showNotes"
      class="flex items-center gap-2 w-full text-left mb-3"
    >
      <component :is="currentIcon" :size="16" class="text-sub-text" />

      <span
        class="text-sm font-semibold text-main-text flex items-center gap-2"
      >
        <!-- ICON -->
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>

        {{ title }}
      </span>
    </button>

    <!-- CONTENT -->
    <div
      v-if="showNotes"
      class="border border-outline rounded-lg overflow-hidden"
    >
      <!-- TOOLBAR -->
      <div
        class="flex items-center gap-1 px-3 py-2 border-b border-outline bg-light-base flex-wrap"
      >
        <button type="button" class="btn-toolbar">↩</button>
        <button type="button" class="btn-toolbar">↪</button>

        <span class="divider">|</span>

        <select class="select-toolbar">
          <option>Format</option>
          <option>Heading 1</option>
          <option>Heading 2</option>
          <option>Paragraph</option>
        </select>

        <span class="divider">|</span>

        <button class="btn-toolbar font-bold">B</button>
        <button class="btn-toolbar italic">I</button>
        <button class="btn-toolbar underline">U</button>

        <span class="divider">|</span>

        <button class="btn-toolbar">🔗</button>
        <button class="btn-toolbar">⚓</button>

        <span class="divider">|</span>

        <button class="btn-toolbar">≡</button>
        <button class="btn-toolbar">≡</button>
        <button class="btn-toolbar">≡</button>
        <button class="btn-toolbar">≡</button>

        <button class="btn-toolbar">☰</button>
        <button class="btn-toolbar">☰</button>
      </div>

      <!-- TEXTAREA -->
      <textarea
        v-model="localValue"
        rows="5"
        class="w-full px-4 py-3 text-sm text-sub-text focus:outline-none resize-none"
        placeholder="Tulis catatan..."
      ></textarea>

      <!-- FOOTER ACTION -->
      <div class="flex items-center gap-4 px-4 py-2 border-t border-outline">
        <button type="button" class="action-btn">
          <MapPin :size="14" /> Add GPS Location
        </button>

        <button type="button" class="action-btn">
          <Camera :size="14" /> Add Photo
        </button>

        <button type="button" class="action-btn">
          <Mic :size="14" /> Start Recording
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Overlay */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Slide from right — identik dengan AddContactForm */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
