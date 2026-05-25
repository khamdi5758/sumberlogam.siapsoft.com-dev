<script setup>
import { ref } from "vue";
import { X, Upload } from "lucide-vue-next";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "submit"]);

const fileInput = ref(null);
const dragging = ref(false);
const selectedFile = ref(null);

const handleClose = () => {
  emit("close");
  selectedFile.value = null;
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
  }
};

const handleDrop = (event) => {
  dragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file) {
    selectedFile.value = file;
  }
};

const handleSubmit = () => {
  if (selectedFile.value) {
    emit("submit", selectedFile.value);
    handleClose();
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};
</script>

<template>
  <!-- Overlay Background -->
  <Transition name="overlay">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-sub-text/80 z-40 transition-all duration-300"
      @click="handleClose"
    ></div>
  </Transition>

  <!-- Form Slide Panel -->
  <Transition name="slide">
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-screen w-full sm:max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        <h2 class="text-xl font-bold text-main-text">Add Multiple Deals</h2>
        <button
          @click="handleClose"
          class="p-2 hover:bg-light-base rounded-lg transition-colors"
        >
          <X :size="20" class="text-sub-text" />
        </button>
      </div>

      <!-- Form Content (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="space-y-6 text-sm">
          <p class="text-sub-text">Save time on adding more deals</p>

          <!-- Step 1 -->
          <div class="flex gap-4">
            <div
              class="shrink-0 w-8 h-8 rounded-full bg-dark-base text-white flex items-center justify-center font-bold"
            >
              1
            </div>
            <p class="text-main-text leading-relaxed">
              The maximum row for uploading multiple deals is 1000 rows. Prepare
              a file of your deals using our template in '.csv', '.xls', or
              '.xlsx'.
              <a href="#" class="text-main-text font-semibold hover:underline"
                >csv template</a
              >,
              <a href="#" class="text-main-text font-semibold hover:underline"
                >xls template</a
              >,
              <a href="#" class="text-main-text font-semibold hover:underline"
                >xlsx template</a
              >.
            </p>
          </div>

          <!-- Step 2 -->
          <div class="flex gap-4">
            <div
              class="shrink-0 w-8 h-8 rounded-full bg-dark-base text-white flex items-center justify-center font-bold"
            >
              2
            </div>
            <p class="text-main-text leading-relaxed">
              Ensure the pipeline and stage in your file match the existing
              system. Any slug ID added to your deals will be ignored.
            </p>
          </div>

          <!-- Step 3 -->
          <div class="flex gap-4">
            <div
              class="shrink-0 w-8 h-8 rounded-full bg-dark-base text-white flex items-center justify-center font-bold"
            >
              3
            </div>
            <p class="text-main-text leading-relaxed">
              The number of uploads affects the upload duration.
            </p>
          </div>

          <!-- File Upload Zone -->
          <div
            class="border-2 border-dashed border-outline rounded-lg h-32 flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:bg-light-base hover:border-sub-text group bg-white"
            :class="{ 'border-sub-text bg-light-base': dragging }"
            @dragover.prevent="dragging = true"
            @dragleave.prevent="dragging = false"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input
              type="file"
              ref="fileInput"
              class="hidden"
              accept=".csv,.xls,.xlsx"
              @change="handleFileSelect"
            />

            <div v-if="!selectedFile" class="flex flex-col items-center">
              <Upload
                :size="24"
                class="text-sub-text mb-2"
                stroke-width="2.5"
              />
              <p class="font-medium text-main-text mb-0.5">
                Klik untuk pilih file
              </p>
              <p class="text-xs text-sub-text/70 font-medium">CSV, XLS, XLSX</p>
            </div>
            <div v-else class="flex items-center gap-2 text-main-text">
              <span class="font-medium truncate max-w-xs">{{
                selectedFile.name
              }}</span>
              <button
                @click.stop="selectedFile = null"
                class="text-red hover:underline text-xs ml-2"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions (Sticky) -->
      <div
        class="bg-white flex items-center justify-end gap-3 px-6 py-4 border-t border-outline shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        <button
          type="button"
          @click="handleClose"
          class="px-6 py-2 border border-outline rounded-lg text-sub-text hover:bg-light-base transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleSubmit"
          :disabled="!selectedFile"
          class="px-6 py-2 bg-dark-base text-white rounded-lg hover:bg-dark-hover transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Import
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Overlay Animation */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Slide Animation */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}
</style>
