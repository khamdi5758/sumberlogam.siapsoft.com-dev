<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { ArrowRight, X, Plus, ChevronDown } from "lucide-vue-next";
import { useStatuses } from "@/composables/useStatuses";
import AddContactQuickForm from "./AddContactQuickForm.vue";
import DetailDataCompany from "./DetailDataCompany.vue";
import LocationSelector from "./component/LocationSelector.vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "submit"]);

const store = useStore();
const { statuses, fetchStatuses } = useStatuses();

const contactOptions = computed(() => {
  const contacts = store.getters["contacts/allContacts"] || [];
  return [
    { value: "", label: "Select Contact" },
    ...contacts.map((c) => ({
      value: c.id,
      label: `${c.first_name} ${c.last_name}`.trim() || c.name || "Unknown",
    })),
  ];
});

const dealOptions = computed(() => {
  const deals = store.getters["deals/allDeals"] || [];
  return [
    { value: "", label: "Select Deal" },
    ...deals.map((d) => ({
      value: d.id,
      label: d.deal_name || d.name || "Unknown",
    })),
  ];
});

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

const applyDefaultOwner = () => {
  if (!formData.value.owner && currentUserName.value) {
    formData.value.owner = currentUserName.value;
  }
};

onMounted(() => {
  store.dispatch("users/getusersignin");
  store.dispatch("users/fetchAllusers");
  store.dispatch("contacts/fetchAllContacts");
  store.dispatch("deals/fetchAllDeals");
  fetchStatuses();
  applyDefaultOwner();
});

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      Promise.allSettled([
        store.dispatch("users/getusersignin"),
        store.dispatch("users/fetchAllusers"),
      ]).finally(applyDefaultOwner);
    }
  },
);

const industryOptions = [
  { value: "", label: "Select Industry" },
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
];

const sourceOptions = [
  { value: "", label: "Select Source" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "social_media", label: "Social Media" },
  { value: "cold_call", label: "Cold Call" },
  { value: "other", label: "Other" },
];

const showAddContactQuickForm = ref(false);
const showDetailForm = ref(false);

const formData = ref({
  companyName: "",
  companyOwner: "",
  owner: "",
  description: "",
  email: "",
  telephone: "",
  website: "",
  industry: "",
  address: "",
  country: "",
  province: "",
  city: "",
  posCode: "",
  source: "",
  type: "",
  dealsassoc: "",
  contactassoc: "",
});

const handleClose = () => emit("close");

const handleContactQuickSubmit = async () => {
  showAddContactQuickForm.value = false;
  await store.dispatch("contacts/fetchAllContacts");
  await store.dispatch("deals/fetchAllDeals");
};

const handleSubmit = () => {
  // Just move to detail form without saving
  // Data will be saved when user clicks "Save" in DetailDataCompany
  showDetailForm.value = true;
};

const handleReset = () => {
  formData.value = {
    companyName: "",
    companyOwner: "",
    owner: "",
    description: "",
    email: "",
    telephone: "",
    website: "",
    industry: "",
    address: "",
    country: "",
    province: "",
    city: "",
    posCode: "",
    source: "",
    type: "",
    dealsassoc: "",
    contactassoc: "",
  };
};
</script>

<template>
  <!-- Satu Transition membungkus strip + form → animasi identik dengan AddContactForm -->
  <Transition name="slide-company">
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
      <div class="w-full max-w-xl bg-white shadow-2xl flex flex-col h-full">
        <!-- Header -->
        <div
          class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
        >
          <div class="flex items-center gap-2">
            <ArrowRight :size="18" class="text-sub-text" />
            <h2 class="text-xl font-bold text-main-text">Create Company</h2>
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
            <!-- Company Name -->
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Company Name <span class="text-red-600">*</span></label
                >
                <input
                  v-model="formData.companyName"
                  type="text"
                  placeholder="Ex Siap Soft"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                  required
                />
              </div>
            </div>

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

            <!-- Email & Telephone -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Email <span class="text-red-600">*</span></label
                >
                <input
                  v-model="formData.email"
                  type="email"
                  placeholder="Ex siapsoft@gmail.com"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Telephone</label
                >
                <input
                  v-model="formData.telephone"
                  type="text"
                  placeholder="Ex +628234567891"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
            </div>

            <!-- Website & Industry -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Website</label
                >
                <input
                  v-model="formData.website"
                  type="text"
                  placeholder="Ex siapsoft.com"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Industry</label
                >
                <select
                  v-model="formData.industry"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm bg-white"
                >
                  <option
                    v-for="opt in industryOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </div>

            <LocationSelector v-model="formData" />

            <!-- Pos Code & Source -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Pos Code</label
                >
                <input
                  v-model="formData.posCode"
                  type="text"
                  placeholder="Pos Code"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
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

            <!-- Type -->
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Type</label
                >
                <select
                  v-model.number="formData.type"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm bg-white"
                >
                  <option value="" disabled selected>Select Type</option>
                  <option
                    v-for="status in statuses"
                    :key="status.id"
                    :value="status.id"
                  >
                    {{ status.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Deals Association 
            <div>
              <label class="block text-sm font-medium text-main-text mb-2"
                >Deals Association</label
              >
              <div class="relative">
                <select
                  v-model="formData.dealsassoc"
                  class="w-full px-3 py-2 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-main-text bg-white appearance-none cursor-pointer"
                >
                  <option
                    v-for="opt in dealOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
                <ChevronDown
                  :size="16"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none"
                />
              </div>
            </div> -->

            <!-- Contact Association -->
            <div>
              <label class="block text-sm font-medium text-main-text mb-2"
                >Contact Association</label
              >
              <div class="relative">
                <select
                  v-model="formData.contactassoc"
                  class="w-full px-3 py-2 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-main-text bg-white appearance-none cursor-pointer"
                >
                  <option
                    v-for="opt in contactOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
                <ChevronDown
                  :size="16"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none"
                />
              </div>
              <button
                type="button"
                @click="showAddContactQuickForm = true"
                class="mt-2 text-sm text-sub-text hover:text-main-text font-medium flex items-center gap-1"
              >
                <Plus :size="14" />
                Create Contact
              </button>
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
              class="px-6 py-2 bg-dark-base text-white rounded-lg hover:bg-dark-hover transition-colors text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Add Contact Quick Form -->
  <AddContactQuickForm
    :isOpen="showAddContactQuickForm"
    @close="showAddContactQuickForm = false"
    @submit="handleContactQuickSubmit"
  />

  <!-- Detail Data Company Form -->
  <DetailDataCompany
    :isOpen="showDetailForm"
    :companyData="formData"
    @close="showDetailForm = false"
    @back="showDetailForm = false"
    @submit="
      showDetailForm = false;
      handleClose();
      formData = {
        companyName: '',
        companyOwner: '',
        owner: '',
        description: '',
        email: '',
        telephone: '',
        website: '',
        industry: '',
        address: '',
        country: '',
        province: '',
        city: '',
        posCode: '',
        source: '',
        type: '',
        dealsassoc: '',
        contactassoc: '',
      };
    "
  />
</template>

<style scoped>
/* Animasi identik dengan AddContactForm */
.slide-company-enter-active,
.slide-company-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-company-enter-from,
.slide-company-leave-to {
  transform: translateX(100%);
}
</style>
