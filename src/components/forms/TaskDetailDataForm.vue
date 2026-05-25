<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { X } from "lucide-vue-next";

const store = useStore();

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  task: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "back", "submit"]);

const statusOptions = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "waiting", label: "Waiting" },
  { value: "completed", label: "Completed" },
  { value: "deferred", label: "Deferred" },
];

const priorityOptions = [
  { value: "", label: "No Priority" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const assigneeOptions = computed(() => {
  const users = store.getters["users/allUsers"] || [];
  return [
    { value: "", label: "Select Data" },
    ...users.map((user) => ({
      value: user.name || user.username || user.id,
      label: user.name || user.username || "Unknown",
    })),
  ];
});

const getFormDefaults = (task = null) => ({
  id: task?.id ?? task?.task_id ?? null,
  task_name: task?.title || task?.name || task?.task_name || "",
  description: task?.description || task?.task_content || "",
  status: (task?.status || task?.stage || "not_started")
    .toString()
    .toLowerCase(),
  priority: task?.priority || "",
  assignee: task?.owner || task?.assignee || task?.user_name || "",
  due_date: task?.dueDate || task?.due_date || task?.date || "",
  task_time: task?.time || task?.task_time || task?.due_time || "",
});

const form = ref(getFormDefaults());

watch(
  () => props.task,
  (task) => {
    form.value = getFormDefaults(task);
  },
  { immediate: true },
);

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      form.value = getFormDefaults(props.task);
    }
  },
);

const closePanel = () => emit("close");

const handleSave = () => {
  emit("submit", {
    id: form.value.id,
    task_name: form.value.task_name.trim(),
    description: form.value.description.trim(),
    status: form.value.status,
    priority: form.value.priority,
    assignee: form.value.assignee.trim(),
    due_date: form.value.due_date,
    task_time: form.value.task_time,
  });
};

onMounted(() => {
  store.dispatch("users/fetchAllusers");
});
</script>

<template>
  <Transition name="overlay">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-sub-text/80 z-40"
      @click="closePanel"
    ></div>
  </Transition>

  <Transition name="slide">
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-screen w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
      @click.stop
    >
      <div
        class="border-b border-outline px-6 py-4 flex items-center justify-between"
      >
        <h2 class="text-xl font-bold text-main-text">Task Detail</h2>
        <button
          @click="closePanel"
          :disabled="props.isSubmitting"
          class="p-2 hover:bg-light-base rounded-lg transition-colors"
        >
          <X :size="20" class="text-sub-text" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <div class="space-y-2">
          <label class="text-sm font-medium text-main-text">Task Name</label>
          <input
            v-model="form.task_name"
            type="text"
            class="w-full px-3 py-2 border border-outline rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
            placeholder="Input task name"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-main-text">Description</label>
          <textarea
            v-model="form.description"
            rows="4"
            class="w-full px-3 py-2 border border-outline rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-sub-text"
            placeholder="Input task description"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-2">
            <label class="text-sm font-medium text-main-text">Status</label>
            <select
              v-model="form.status"
              class="w-full px-3 py-2 border border-outline rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-sub-text"
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

          <div class="space-y-2">
            <label class="text-sm font-medium text-main-text">Priority</label>
            <select
              v-model="form.priority"
              class="w-full px-3 py-2 border border-outline rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-sub-text"
            >
              <option
                v-for="opt in priorityOptions"
                :key="opt.value || 'none'"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-main-text">Due Date</label>
            <input
              v-model="form.due_date"
              type="date"
              class="w-full px-3 py-2 border border-outline rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
            />
          </div>

          <div class="space-y-2 sm:col-span-2">
            <label class="text-sm font-medium text-main-text">Time</label>
            <input
              v-model="form.task_time"
              type="time"
              class="w-full px-3 py-2 border border-outline rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
            />
          </div>
        </div>
      </div>

      <div
        class="border-t border-outline px-6 py-4 flex items-center justify-end gap-3"
      >
        <button
          @click="closePanel"
          :disabled="props.isSubmitting"
          class="px-4 py-2 border border-outline rounded-lg text-sm text-sub-text hover:bg-light-base transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          :disabled="props.isSubmitting || !form.task_name.trim()"
          class="px-4 py-2 rounded-lg text-sm font-medium bg-dark-base text-white hover:bg-dark-hover transition disabled:opacity-50"
        >
          {{ props.isSubmitting ? "Saving..." : "Save" }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
