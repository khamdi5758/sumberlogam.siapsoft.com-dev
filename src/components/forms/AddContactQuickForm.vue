<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { ArrowRight, X, ChevronDown } from "lucide-vue-next";
import { alertService } from "@/services/alertService";
import { useStatuses } from "@/composables/useStatuses";
import LocationSelector from "./component/LocationSelector.vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "submit"]);

const store = useStore();
const isSubmitting = ref(false);
const { statuses, fetchStatuses } = useStatuses();

const companyOptions = computed(() => {
  const companies = store.getters["company/allcompany"] || [];
  return [
    { value: "", label: "Select Company" },
    ...companies.map((c) => ({
      value: c.id,
      label: c.company_name || c.name || "Unknown",
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

const fetchAssociationOptions = async () => {
  await Promise.allSettled([
    store.dispatch("users/getusersignin"),
    store.dispatch("company/fetchAllcompany"),
    store.dispatch("deals/fetchAllDeals"),
    store.dispatch("users/fetchAllusers"),
    fetchStatuses(),
  ]);
};

const applyDefaultOwner = () => {
  if (!formData.value.owner && currentUserName.value) {
    formData.value.owner = currentUserName.value;
  }
};

/* onMounted(() => {
  fetchAssociationOptions().finally(applyDefaultOwner);
}); */

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      fetchAssociationOptions().finally(applyDefaultOwner);
    }
  },
);

const sourceOptions = [
  { value: "", label: "Select Data" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "social_media", label: "Social Media" },
  { value: "email_campaign", label: "Email Campaign" },
  { value: "cold_call", label: "Cold Call" },
  { value: "other", label: "Other" },
];

const formData = ref({
  firstName: "",
  lastName: "",
  jobTitle: "",
  owner: "",
  email: "",
  status: "",
  telephone: "",
  mobile: "",
  address: "",
  country: "",
  province: "",
  city: "",
  posCode: "",
  source: "",
  companiesSearch: "",
  dealsSearch: "",
  selectedCompanies: [],
  selectedDeals: [],
});

const handleClose = () => emit("close");

const handleReset = () => {
  formData.value = {
    firstName: "",
    lastName: "",
    jobTitle: "",
    owner: "",
    email: "",
    status: "",
    telephone: "",
    mobile: "",
    address: "",
    country: "",
    province: "",
    city: "",
    posCode: "",
    source: "",
    companiesSearch: "",
    dealsSearch: "",
    selectedCompanies: [],
    selectedDeals: [],
  };
};

const handleSubmit = async () => {
  if (!formData.value.firstName.trim()) {
    alertService.error("First Name wajib diisi.");
    return;
  }

  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const payload = {
      first_name: formData.value.firstName.trim(),
      last_name: formData.value.lastName?.trim() || "",
      job_title: formData.value.jobTitle?.trim() || "",
      owner: formData.value.owner || currentUserName.value || "",
      email: formData.value.email?.trim() || "",
      status: formData.value.status?.trim() || "",
      telephone_1: formData.value.telephone?.trim() || "",
      telephone_2: formData.value.mobile?.trim() || "",
      address: formData.value.address?.trim() || "",
      country: formData.value.country?.trim() || "",
      province: formData.value.province?.trim() || "",
      city: formData.value.city?.trim() || "",
      pos_code: formData.value.posCode?.trim() || "",
      source: formData.value.source || "",
      companyassoc: formData.value.companyassoc
        ? [formData.value.companyassoc]
        : [],
      dealsassoc: formData.value.dealsassoc ? [formData.value.dealsassoc] : [],
      created_at: now,
      updated_at: now,
    };

    console.log("Submitting Contact Payload:", payload);

    const response = await store.dispatch("contacts/createContact", payload);
    await alertService.toastSuccess(
      response?.msg || "Contact berhasil ditambahkan",
    );

    handleReset();
    emit("submit", response);
    handleClose();
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Gagal menambah contact";
    await alertService.toastError(message);
  } finally {
    isSubmitting.value = false;
  }
};

const showCompaniesDropdown = ref(false);
const showDealsDropdown = ref(false);

const filteredCompanies = computed(() => {
  if (!formData.value.companiesSearch) {
    return store.getters["company/allcompany"] || [];
  }
  const companies = store.getters["company/allcompany"] || [];
  return companies.filter((c) =>
    (c.company_name || c.name || "")
      .toLowerCase()
      .includes(formData.value.companiesSearch.toLowerCase()),
  );
});

const filteredDeals = computed(() => {
  if (!formData.value.dealsSearch) {
    return store.getters["deals/allDeals"] || [];
  }
  const deals = store.getters["deals/allDeals"] || [];
  return deals.filter((d) =>
    (d.deal_name || d.name || "")
      .toLowerCase()
      .includes(formData.value.dealsSearch.toLowerCase()),
  );
});

const selectCompany = (company) => {
  if (!formData.value.selectedCompanies.find((c) => c.id === company.id)) {
    formData.value.selectedCompanies.push(company);
  }
  formData.value.companiesSearch = "";
  showCompaniesDropdown.value = false;
};

const removeCompany = (companyId) => {
  formData.value.selectedCompanies = formData.value.selectedCompanies.filter(
    (c) => c.id !== companyId,
  );
};

const selectDeal = (deal) => {
  if (!formData.value.selectedDeals.find((d) => d.id === deal.id)) {
    formData.value.selectedDeals.push(deal);
  }
  formData.value.dealsSearch = "";
  showDealsDropdown.value = false;
};

const removeDeal = (dealId) => {
  formData.value.selectedDeals = formData.value.selectedDeals.filter(
    (d) => d.id !== dealId,
  );
};

const handleClickOutside = (e) => {
  if (!e.target.closest("[data-companies-dropdown]")) {
    showCompaniesDropdown.value = false;
  }
  if (!e.target.closest("[data-deals-dropdown]")) {
    showDealsDropdown.value = false;
  }
};

/* onMounted(() => {
  fetchAssociationOptions().finally(applyDefaultOwner);
  document.addEventListener("click", handleClickOutside);
}); */

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      fetchAssociationOptions().finally(applyDefaultOwner);
    }
  },
);

// onBeforeUnmount(() => {
//   document.removeEventListener('click', handleClickOutside);
// });
</script>

<template>
  <!-- Slide panel (slide dari kanan, tumpuk di atas CreateDealForm) -->
  <Transition name="slide-contact-quick">
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-screen flex z-69"
      @click.stop
    >
      <!-- Strip warna di kiri (efek tumpuk) -->
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
            <h2 class="text-xl font-bold text-main-text">Add Contact</h2>
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
            <!-- First Name & Last Name -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >First Name <span class="text-red-600">*</span></label
                >
                <input
                  v-model="formData.firstName"
                  type="text"
                  placeholder="First Name"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Last Name</label
                >
                <input
                  v-model="formData.lastName"
                  type="text"
                  placeholder="Last Name"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
            </div>

            <!-- Job Title -->
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Job Title</label
                >
                <input
                  v-model="formData.jobTitle"
                  type="text"
                  placeholder="Job Title"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
            </div>

            <!-- Email & Status -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Email</label
                >
                <input
                  v-model="formData.email"
                  type="email"
                  placeholder="youremail@gmail.com"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Status</label
                >
                <div class="relative">
                  <select
                    v-model.number="formData.status"
                    class="w-full px-3 py-2 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-main-text bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled selected>Select Status</option>
                    <option
                      v-for="status in statuses"
                      :key="status.id"
                      :value="status.id"
                    >
                      {{ status.name }}
                    </option>
                  </select>
                  <ChevronDown
                    :size="16"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <!-- Telephone & Mobile -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Telephone</label
                >
                <input
                  v-model="formData.telephone"
                  type="text"
                  placeholder="+62123456789"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Telephone</label
                >
                <input
                  v-model="formData.mobile"
                  type="text"
                  placeholder="+62123456789"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
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
                <div class="relative">
                  <select
                    v-model="formData.source"
                    class="w-full px-3 py-2 pr-8 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm bg-white appearance-none cursor-pointer text-main-text"
                  >
                    <option value="" disabled selected>Select Data</option>
                    <option
                      v-for="opt in sourceOptions.filter((o) => o.value !== '')"
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
              </div>
            </div>

            <!-- Companies Association (Searchable Dropdown) -->
            <div data-companies-dropdown>
              <label class="block text-sm font-medium text-main-text mb-2">
                Companies Association
              </label>
              <div class="relative">
                <input
                  v-model="formData.companiesSearch"
                  type="text"
                  placeholder="Search companies..."
                  @focus="showCompaniesDropdown = true"
                  @input="showCompaniesDropdown = true"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />

                <!-- Dropdown -->
                <div
                  v-if="showCompaniesDropdown && filteredCompanies.length > 0"
                  class="absolute top-full left-0 right-0 mt-1 bg-white border border-outline rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
                >
                  <div
                    v-for="company in filteredCompanies"
                    :key="company.id"
                    @click="selectCompany(company)"
                    class="px-3 py-2 hover:bg-light-base cursor-pointer text-sm text-main-text"
                  >
                    {{ company.company_name || company.name }}
                  </div>
                </div>
              </div>

              <!-- Selected Companies Tags -->
              <div
                v-if="formData.selectedCompanies.length > 0"
                class="mt-2 flex flex-wrap gap-2"
              >
                <span
                  v-for="company in formData.selectedCompanies"
                  :key="company.id"
                  class="bg-light-base px-2 py-1 rounded text-xs text-main-text flex items-center gap-1"
                >
                  {{ company.company_name || company.name }}
                  <button
                    type="button"
                    @click="removeCompany(company.id)"
                    class="hover:text-red"
                  >
                    <X :size="14" />
                  </button>
                </span>
              </div>
            </div>

            <!-- Deals Association (Searchable Dropdown) -->
            <div data-deals-dropdown>
              <label class="block text-sm font-medium text-main-text mb-2">
                Deals Association
              </label>
              <div class="relative">
                <input
                  v-model="formData.dealsSearch"
                  type="text"
                  placeholder="Search deals..."
                  @focus="showDealsDropdown = true"
                  @input="showDealsDropdown = true"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />

                <!-- Dropdown -->
                <div
                  v-if="showDealsDropdown && filteredDeals.length > 0"
                  class="absolute top-full left-0 right-0 mt-1 bg-white border border-outline rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
                >
                  <div
                    v-for="deal in filteredDeals"
                    :key="deal.id"
                    @click="selectDeal(deal)"
                    class="px-3 py-2 hover:bg-light-base cursor-pointer text-sm text-main-text"
                  >
                    {{ deal.deal_name || deal.name }}
                  </div>
                </div>
              </div>

              <!-- Selected Deals Tags -->
              <div
                v-if="formData.selectedDeals.length > 0"
                class="mt-2 flex flex-wrap gap-2"
              >
                <span
                  v-for="deal in formData.selectedDeals"
                  :key="deal.id"
                  class="bg-light-base px-2 py-1 rounded text-xs text-main-text flex items-center gap-1"
                >
                  {{ deal.deal_name || deal.name }}
                  <button
                    type="button"
                    @click="removeDeal(deal.id)"
                    class="hover:text-red"
                  >
                    <X :size="14" />
                  </button>
                </span>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div
          class="bg-white flex items-center gap-3 px-6 py-4 border-t border-outline shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
        >
          <button
            type="button"
            @click="handleSubmit"
            :disabled="isSubmitting"
            class="px-6 py-2 bg-dark-base text-white rounded-lg hover:bg-dark-hover transition-colors text-sm font-medium"
          >
            {{ isSubmitting ? "Saving..." : "Add Contact" }}
          </button>
          <button
            type="button"
            @click="handleClose"
            class="px-6 py-2 border border-outline rounded-lg text-sub-text hover:bg-light-base transition-colors text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-contact-quick-enter-active,
.slide-contact-quick-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-contact-quick-enter-from,
.slide-contact-quick-leave-to {
  transform: translateX(100%);
}

/* Remove Browser Autofill Blue Background */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
  -webkit-text-fill-color: #1c2434 !important;
  transition: background-color 5000s ease-in-out 0s;
}
</style>
