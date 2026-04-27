<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { ArrowRight, ChevronDown, X } from "lucide-vue-next";
import { alertService } from "@/services/alertService";
import { useStatuses } from "@/composables/useStatuses";
import LocationSelector from "./component/LocationSelector.vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  initialData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "submit"]);

const store = useStore();
const isSubmitting = ref(false);
const { statuses, fetchStatuses } = useStatuses();

const locationData = ref({
  address: "",
  country: "",
  province: "",
  city: "",
  kecamatan: "",
  kelurahan: "",
  pos_code: "",
});

const formData = ref({
  id: null,
  project_name: "",
  deal_id: "",
  leader_id: "",
  description: "",
  location: "",
  kd_kelurahan: "",
  project_status: "",
  created_at: "",
  created_by: "",
});

const isEditMode = computed(() => !!props.initialData);

const currentUser = computed(
  () => store.getters["users/usersignin"] || store.state.auth?.user || null,
);

const currentUserLabel = computed(() => {
  const user = currentUser.value;
  if (!user) return "";

  const fullName = [
    user.first_name || user.firstname,
    user.last_name || user.lastname,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return user.name || user.username || fullName || String(user.id || "");
});

const currentUserId = computed(() => {
  const user = currentUser.value;
  return user?.id || user?.user_id || user?.userid || "";
});

const dealOptions = computed(() => {
  const deals = store.getters["deals/allDeals"] || [];

  return [
    { value: "", label: "Select Deal" },
    ...deals.map((deal) => ({
      value: deal.id ?? deal.deal_id ?? deal.id_deal ?? "",
      label: deal.deal_name || deal.name || deal.title || "Unknown",
    })),
  ];
});

const leaderOptions = computed(() => {
  const users = store.getters["users/allUsers"] || [];

  return [
    { value: "", label: "Select Leader" },
    ...users.map((user) => ({
      value: user.id ?? user.user_id ?? user.userid ?? "",
      label:
        user.name ||
        [user.first_name || user.firstname, user.last_name || user.lastname]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        user.username ||
        "Unknown",
    })),
  ];
});

const projectStatusOptions = computed(() => {
  const projectStatuses = (statuses.value || []).filter((status) => {
    const tableCode = String(
      status?.table_code || status?.tableCode || status?.table || "",
    ).toUpperCase();
    return tableCode === "PR";
  });

  const source = projectStatuses.length
    ? projectStatuses
    : statuses.value || [];

  return [
    { value: "", label: "Select Project Status" },
    ...source.map((status) => ({
      value: status.id ?? status.value ?? status.code ?? "",
      label:
        status.name ||
        status.status_name ||
        status.label ||
        status.status ||
        "Unknown",
    })),
  ];
});

const applyDefaultCreator = () => {
  if (!formData.value.created_by && currentUserId.value) {
    formData.value.created_by = currentUserId.value;
  }

  if (!formData.value.created_by && currentUserLabel.value) {
    formData.value.created_by = currentUserLabel.value;
  }
};

const setFormData = (data) => {
  if (!data) return;

  formData.value = {
    id: data.id ?? data.project_id ?? data.id_project ?? null,
    project_name:
      data.project_name ||
      data["Project Name"] ||
      data.title ||
      data.name ||
      "",
    deal_id: data.deal_id ?? data.deal ?? "",
    leader_id: data.leader_id ?? data.assignee_id ?? "",
    description: data.description || data.project_content || "",
    location: data.location || "",
    kd_kelurahan: data.kd_kelurahan || data.kelurahan || "",
    project_status: data.project_status || data.status || data.stage || "",
    created_at: data.created_at || new Date().toISOString(),
    created_by:
      data.created_by || currentUserId.value || currentUserLabel.value || "",
  };

  locationData.value = {
    address: data.address || "",
    country: data.country || "",
    province: data.province || "",
    city: data.city || "",
    kecamatan: data.kecamatan || "",
    kelurahan: data.kd_kelurahan || data.kelurahan || "",
    pos_code: data.pos_code || "",
  };
};

const resetForm = () => {
  const now = new Date().toISOString();

  formData.value = {
    id: null,
    project_name: "",
    deal_id: "",
    leader_id: currentUserId.value || "",
    description: "",
    location: "",
    kd_kelurahan: "",
    project_status: "",
    created_at: now,
    created_by: currentUserId.value || currentUserLabel.value || "",
  };

  locationData.value = {
    address: "",
    country: "",
    province: "",
    city: "",
    kecamatan: "",
    kelurahan: "",
    pos_code: "",
  };
};

const handleClose = () => {
  if (!isSubmitting.value) {
    emit("close");
  }
};

const handleSubmit = async () => {
  if (!formData.value.project_name.trim()) {
    await alertService.error("Project name wajib diisi.");
    return;
  }

  if (!formData.value.deal_id) {
    await alertService.error("Deal wajib dipilih.");
    return;
  }

  if (!formData.value.leader_id) {
    await alertService.error("Leader wajib dipilih.");
    return;
  }

  if (!formData.value.project_status) {
    await alertService.error("Project status wajib dipilih.");
    return;
  }

  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    const payload = {
      ...(formData.value.id ? { id: formData.value.id } : {}),
      project_name: formData.value.project_name.trim(),
      deal_id: formData.value.deal_id,
      leader_id: formData.value.leader_id,
      description: formData.value.description.trim(),
      address: locationData.value.address?.trim() || "",
      kd_kelurahan:
        locationData.value.kelurahan || formData.value.kd_kelurahan || "",
      location:
        formData.value.location.trim() || JSON.stringify(locationData.value),
      project_status: formData.value.project_status,
      created_at: formData.value.created_at || new Date().toISOString(),
      created_by:
        formData.value.created_by ||
        currentUserId.value ||
        currentUserLabel.value ||
        "",
    };

    emit("submit", payload);
    resetForm();
    emit("close");
  } finally {
    isSubmitting.value = false;
  }
};

watch(
  locationData,
  () => {
    formData.value.kd_kelurahan = locationData.value.kelurahan || "";
  },
  { deep: true },
);

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      Promise.allSettled([
        store.dispatch("users/getusersignin"),
        store.dispatch("users/fetchAllusers"),
        store.dispatch("deals/fetchAllDeals"),
        fetchStatuses(),
      ]).finally(() => {
        if (props.initialData) {
          setFormData(props.initialData);
        } else {
          resetForm();
        }
        applyDefaultCreator();
      });
    }
  },
);

watch(
  () => props.initialData,
  (nextValue) => {
    if (!props.isOpen) return;
    if (nextValue) {
      setFormData(nextValue);
      applyDefaultCreator();
    } else {
      resetForm();
      applyDefaultCreator();
    }
  },
);

onMounted(() => {
  Promise.allSettled([
    store.dispatch("users/getusersignin"),
    store.dispatch("users/fetchAllusers"),
    store.dispatch("deals/fetchAllDeals"),
    fetchStatuses(),
  ]).finally(applyDefaultCreator);
});
</script>

<template>
  <Transition name="overlay">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-sub-text/80 transition-all duration-300"
      @click="handleClose"
    ></div>
  </Transition>

  <Transition name="slide-project">
    <div
      v-if="isOpen"
      class="fixed right-0 top-0 z-50 flex h-screen w-full flex-col bg-white shadow-2xl sm:max-w-2xl"
      @click.stop
    >
      <div
        class="sticky top-0 z-10 flex items-center justify-between border-b border-outline bg-white px-6 py-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        <div class="flex items-center gap-2">
          <ArrowRight :size="20" class="text-dark-base" />
          <h2 class="text-xl font-bold text-dark-base">
            {{ isEditMode ? "Edit Project" : "Create Project" }}
          </h2>
        </div>
        <button
          type="button"
          @click="handleClose"
          class="rounded-lg p-2 transition-colors hover:bg-light-base"
        >
          <X :size="20" class="text-sub-text" />
        </button>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto">
        <form @submit.prevent="handleSubmit" class="space-y-5 p-6">
          <div>
            <label class="mb-2 block text-sm font-medium text-dark-base">
              Project Name <span class="text-red-600">*</span>
            </label>
            <input
              v-model="formData.project_name"
              type="text"
              placeholder="Ex. Project Alpha"
              class="w-full rounded-lg border border-outline px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
              required
            />
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm font-medium text-dark-base">
                Deal <span class="text-red-600">*</span>
              </label>
              <div class="relative">
                <select
                  v-model="formData.deal_id"
                  class="w-full appearance-none rounded-lg border border-outline bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
                  required
                >
                  <option
                    v-for="option in dealOptions"
                    :key="option.value || option.label"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <ChevronDown
                  :size="16"
                  class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sub-text"
                />
              </div>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-dark-base">
                Project Manager <span class="text-red-600">*</span>
              </label>
              <div class="relative">
                <select
                  v-model="formData.leader_id"
                  class="w-full appearance-none rounded-lg border border-outline bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
                  required
                >
                  <option
                    v-for="option in leaderOptions"
                    :key="option.value || option.label"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <ChevronDown
                  :size="16"
                  class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sub-text"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-dark-base"
              >Description</label
            >
            <textarea
              v-model="formData.description"
              rows="4"
              placeholder="Project description"
              class="w-full resize-none rounded-lg border border-outline px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
            ></textarea>
          </div>

          <div>
            <LocationSelector v-model="locationData" />
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm font-medium text-dark-base">
                Location <span class="text-red-600">*</span>
              </label>
              <input
                v-model="formData.location"
                type="text"
                placeholder="Ex. -6.200000, 106.816666"
                class="w-full rounded-lg border border-outline px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
                required
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-dark-base">
                Project Status <span class="text-red-600">*</span>
              </label>
              <div class="relative">
                <select
                  v-model="formData.project_status"
                  class="w-full appearance-none rounded-lg border border-outline bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
                  required
                >
                  <option
                    v-for="option in projectStatusOptions"
                    :key="option.value || option.label"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <ChevronDown
                  :size="16"
                  class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sub-text"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 border-t border-outline pt-5">
            <button
              type="button"
              @click="handleClose"
              class="rounded-lg border border-outline px-6 py-2 text-sm font-medium text-sub-text transition-colors hover:bg-light-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="rounded-lg bg-dark-base px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-dark-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ isEditMode ? "Update Project" : "Save Project" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-project-enter-active,
.slide-project-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-project-enter-from,
.slide-project-leave-to {
  transform: translateX(100%);
}
</style>
