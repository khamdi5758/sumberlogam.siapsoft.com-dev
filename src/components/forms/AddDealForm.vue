<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { ArrowRight, X } from "lucide-vue-next";
import { alertService } from "@/services/alertService";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "submit"]);
const store = useStore();
const isSubmitting = ref(false);

const pipelineOptions = [
  { value: "", label: "Select Data" },
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
];

const currencyOptions = [
  { value: "IDR", label: "IDR" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "SGD", label: "SGD" },
];

const currentUserName = computed(() => {
  const signedInUser =
    store.getters["users/usersignin"] || store.state.auth?.user || null;
  const fullName = [
    signedInUser?.first_name || signedInUser?.firstname,
    signedInUser?.last_name || signedInUser?.lastname,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return signedInUser?.name || signedInUser?.username || fullName || "";
});

const priorityOptions = [
  { value: "", label: "Select Data" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const sourceOptions = [
  { value: "", label: "Select Data" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "social_media", label: "Social Media" },
  { value: "cold_call", label: "Cold Call" },
  { value: "other", label: "Other" },
];

const fileSourceOptions = [
  { value: "", label: "Select File Source" },
  { value: "local", label: "Local File" },
  { value: "google_drive", label: "Google Drive" },
  { value: "dropbox", label: "Dropbox" },
];

const getDefaultFormData = () => ({
  dealName: "",
  pipeline: "",
  currency: "IDR",
  amount: "",
  expectedCloseDate: "",
  owner: "",
  priority: "",
  source: "",
  showOptional: false,
  description: "",
  documents: "",
});

const formData = ref(getDefaultFormData());

const selectedFiles = ref([]);

const fetchReferenceData = async () => {
  await Promise.allSettled([
    store.dispatch("users/getusersignin"),
    store.dispatch("users/fetchAllusers"),
  ]);
};

const applyDefaultOwner = () => {
  if (!formData.value.owner && currentUserName.value) {
    formData.value.owner = currentUserName.value;
  }
};

onMounted(() => {
  fetchReferenceData().finally(applyDefaultOwner);
});

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      fetchReferenceData().finally(applyDefaultOwner);
    }
  },
);

const handleFileChange = (e) => {
  selectedFiles.value = Array.from(e.target.files);
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const handleClose = () => emit("close");

const handleSubmit = async () => {
  if (!formData.value.dealName?.trim()) {
    await alertService.toastError("Deal Name wajib diisi.");
    return;
  }

  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    const payload = {
      dealName: formData.value.dealName.trim(),
      pipeline: formData.value.pipeline || "new",
      currency: formData.value.currency || "IDR",
      amount: formData.value.amount,
      expectedCloseDate: formData.value.expectedCloseDate || "",
      owner: formData.value.owner || currentUserName.value || "",
      priority: formData.value.priority || "",
      source: formData.value.source || "",
      description: formData.value.description || "",
    };

    const response = await store.dispatch("deals/createDeal", payload);
    await store.dispatch("deals/fetchAllDeals");
    await alertService.toastSuccess(
      response?.msg || "Deal berhasil ditambahkan",
    );

    emit("submit", response);
    handleReset();
    handleClose();
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Gagal menambah deal";
    await alertService.toastError(message);
  } finally {
    isSubmitting.value = false;
  }
};

const handleReset = () => {
  formData.value = getDefaultFormData();
  selectedFiles.value = [];
};
</script>

<template>
  <!-- Satu Transition membungkus strip + form → animasi identik dengan AddContactForm -->
  <Transition name="slide-deal">
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-screen flex z-59"
      @click.stop
    >
      <!-- Strip warna di kiri (efek tumpuk, ujung kiri pudar) -->
      <div
        class="w-200 h-full shrink-0"
        style="
          background: linear-gradient(
            to right,
            transparent,
            rgba(100, 114, 139, 0.6)
          );
        "
      ></div>

      <!-- Form panel -->
      <div
        class="w-full max-w-xl bg-white shadow-2xl flex flex-col h-full overflow-hidden"
      >
        <!-- Header -->
        <div
          class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
        >
          <div class="flex items-center gap-2">
            <ArrowRight :size="18" class="text-sub-text" />
            <h2 class="text-xl font-bold text-main-text">Create Deal</h2>
          </div>
          <button
            @click="handleClose"
            class="p-2 hover:bg-light-base rounded-lg transition-colors"
          >
            <X :size="20" class="text-sub-text" />
          </button>
        </div>

        <!-- Form Content (Scrollable) -->
        <div class="flex-1 overflow-y-auto min-h-0">
          <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
            <!-- Deal Name & Pipeline -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Deal Name</label
                >
                <input
                  v-model="formData.dealName"
                  type="text"
                  placeholder="Deal's Name"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Pipeline</label
                >
                <select
                  v-model="formData.pipeline"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm bg-white"
                >
                  <option
                    v-for="opt in pipelineOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Currency & Amount/Value -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Currency</label
                >
                <select
                  v-model="formData.currency"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm bg-white"
                >
                  <option
                    v-for="opt in currencyOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Amount/Value</label
                >
                <input
                  v-model="formData.amount"
                  type="number"
                  placeholder="Amount/Value"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
            </div>

            <!-- Expected Close Date -->
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Expected Close Date</label
                >
                <input
                  v-model="formData.expectedCloseDate"
                  type="date"
                  placeholder="Close Date"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
            </div>

            <!-- Priority & Source -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Priority</label
                >
                <select
                  v-model="formData.priority"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm bg-white"
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
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Source</label
                >
                <select
                  v-model="formData.source"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm bg-white"
                >
                  <option
                    v-for="opt in sourceOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Description & Document (Optional) toggle -->
            <div class="border border-outline rounded-lg overflow-hidden">
              <button
                type="button"
                @click="formData.showOptional = !formData.showOptional"
                class="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-light-base transition-colors"
              >
                <div
                  class="w-4 h-4 border-2 rounded flex items-center justify-center shrink-0 transition-colors"
                  :class="
                    formData.showOptional
                      ? 'border-sub-text bg-sub-text'
                      : 'border-outline'
                  "
                >
                  <svg
                    v-if="formData.showOptional"
                    class="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 10 8"
                  >
                    <path
                      d="M1 4l3 3 5-6"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <span class="text-sub-text font-medium"
                  >Description & Document (Opsional)</span
                >
              </button>

              <div
                v-if="formData.showOptional"
                class="px-4 pb-4 space-y-4 border-t border-outline pt-4"
              >
                <!-- Description -->
                <div>
                  <label class="block text-sm font-medium text-main-text mb-2"
                    >Description</label
                  >
                  <textarea
                    v-model="formData.description"
                    placeholder="Ex Lorem ipsum dolor sit"
                    rows="3"
                    class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm resize-none"
                  ></textarea>
                </div>
                <!-- Documents -->
                <div>
                  <label class="block text-sm font-medium text-main-text mb-2"
                    >Documents</label
                  >
                  <select
                    v-model="formData.documents"
                    class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm bg-white"
                  >
                    <option
                      v-for="opt in fileSourceOptions"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </option>
                  </select>

                  <!-- File picker: muncul hanya saat pilih Local File -->
                  <div v-if="formData.documents === 'local'" class="mt-3">
                    <label
                      class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-outline rounded-lg cursor-pointer hover:bg-light-base transition-colors"
                    >
                      <div
                        class="flex flex-col items-center gap-1 text-sub-text"
                      >
                        <svg
                          class="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                        <span class="text-xs font-medium"
                          >Klik untuk pilih file</span
                        >
                        <span class="text-xs text-gray-400"
                          >PDF, DOC, XLS, JPG, PNG</span
                        >
                      </div>
                      <input
                        type="file"
                        multiple
                        class="hidden"
                        @change="handleFileChange"
                      />
                    </label>

                    <!-- List file yang dipilih -->
                    <ul v-if="selectedFiles.length" class="mt-2 space-y-1">
                      <li
                        v-for="(file, i) in selectedFiles"
                        :key="i"
                        class="flex items-center justify-between text-xs px-3 py-1.5 bg-light-base rounded-lg"
                      >
                        <span class="truncate text-main-text">{{
                          file.name
                        }}</span>
                        <button
                          type="button"
                          @click="removeFile(i)"
                          class="ml-2 text-sub-text hover:text-red-500 shrink-0"
                        >
                          ✕
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div
          class="bg-white flex items-center justify-between px-6 py-4 border-t border-outline shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
        >
          <div></div>
          <div class="flex gap-3">
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
              :disabled="isSubmitting"
              class="px-6 py-2 bg-dark-base text-white rounded-lg hover:bg-dark-hover transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? "Saving..." : "Save" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Animasi identik dengan AddContactForm & AddCompanyForm */
.slide-deal-enter-active,
.slide-deal-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-deal-enter-from,
.slide-deal-leave-to {
  transform: translateX(100%);
}
</style>
