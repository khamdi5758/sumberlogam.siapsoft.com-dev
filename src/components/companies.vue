<!-- <script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useStore } from "vuex";

import CreateCompanyForm from "./forms/CreateCompanyForm.vue";
import BulkAddCompanyForm from "./forms/BulkAddCompanyForm.vue";
import DetailForm from "./forms/DetailForm.vue";
import DetailDataCompany from "./forms/DetailDataCompany.vue";
import { alertService } from "@/services/alertService";

import {
  Search,
  ChevronDown,
  Download,
  Edit,
  Trash2,
  Filter,
  ChevronLeft,
  FilePlus,
  ChevronRight,
  RefreshCw,
  FolderPlus,
  FileDown,
  FolderDown,
} from "lucide-vue-next";

// Hubungkan ke Vuex Store
const store = useStore();

// Pakai 'company' karena tadi kita daftarkan dengan nama itu di store/index.js
const companies = computed(() => store.getters["company/filteredCompanies"]);
const searchQuery = computed({
  get: () => store.state.company.searchQuery,
  set: (value) => store.dispatch("company/setSearchQuery", value),
});
const isLoading = computed(() => store.getters["company/isLoading"]);
const error = computed(() => store.getters["company/error"]);

// Sample data - replace with actual data from API
const currentPage = ref(1);
const totalCompanies = computed(() => companies.value.length); // Dynamically compute from actual data
const itemsPerPage = ref(10);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalCompanies.value / itemsPerPage.value)),
);
const paginatedCompanies = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return companies.value.slice(start, start + itemsPerPage.value);
});
const showCreateCompanyForm = ref(false);
const showBulkAddForm = ref(false);
const showDetailForm = ref(false);
const showDetailDataCompany = ref(false);
const showDropdown = ref(false);
const showDownloadDropdown = ref(false);
const selectedIds = ref([]);
const selectedCompany = ref(null);
const isDetailDataSubmitting = ref(false);

const toggleDownloadDropdown = () => {
  showDownloadDropdown.value = !showDownloadDropdown.value;
};

const downloadAll = () => {
  console.log("Download all data");
  showDownloadDropdown.value = false;
};

const handleDownload = () => {
  if (selectedIds.value.length) {
    console.log("Download selected:", selectedIds.value);
  } else {
    console.log("Download all data");
  }
  showDownloadDropdown.value = false;
};

const downloadLabel = computed(() => {
  return selectedIds.value.length
    ? `Download (${selectedIds.value.length})`
    : "Download";
});

const companiesStatusText = computed(() => {
  if (isLoading.value) {
    return "Searching company...";
  }
  if (error.value) {
    return `Error: ${error.value}`;
  }
  return `${totalCompanies.value.toLocaleString()} Total Companies`;
});

const companiesStatusClass = computed(() => {
  if (isLoading.value) {
    return "text-blue-600";
  }
  if (error.value) {
    return "text-red-600";
  }
  return "text-sub-text";
});

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

// auto close saat klik luar
const handleClickOutside = (e) => {
  if (
    !e.target.closest(".add-dropdown") &&
    !e.target.closest(".download-dropdown")
  ) {
    showDropdown.value = false;
    showDownloadDropdown.value = false;
  }
};

// Load data saat component mount
onMounted(() => {
  // Fetch data dari API
  store.dispatch("company/fetchAllcompany");
  // Add event listener untuk close dropdown saat klik luar
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() =>
  document.removeEventListener("click", handleClickOutside),
);

const handleBulkAdd = () => {
  console.log("Bulk add clicked");
  showBulkAddForm.value = true;
};

watch([itemsPerPage, totalCompanies], () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const openCompanyDetail = (company) => {
  selectedCompany.value = { ...company };
  showDetailDataCompany.value = true;
};

const closeDetailDataCompany = () => {
  showDetailDataCompany.value = false;
  selectedCompany.value = null;
};

const handleDetailDataCompanySubmit = async (payload) => {
  const companyId = selectedCompany.value?.id;

  if (!companyId) {
    alertService.error(
      "ID company tidak ditemukan. Coba buka ulang detail data.",
    );
    return;
  }

  if (!payload?.company?.company_name?.trim()) {
    alertService.error("Company Name wajib diisi.");
    return;
  }

  isDetailDataSubmitting.value = true;

  try {
    const formdata = {
      ...payload.company,
      updated_at: new Date().toISOString(),
    };

    await store.dispatch("company/updatecompany", {
      keyedit: companyId,
      formdata,
    });

    alertService.success("Detail company berhasil diperbarui.");
    closeDetailDataCompany();
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Gagal update company. Silakan coba lagi.";
    alertService.error(backendMessage);
  } finally {
    isDetailDataSubmitting.value = false;
  }
};

// Fetch data function untuk refresh
const fetchData = () => {
  store
    .dispatch("company/fetchAllcompany")
    .then(() => {
      console.log("Companies fetched successfully");
    })
    .catch((err) => {
      console.error("Failed to fetch companies:", err);
    });
};

// Delete selected companies
const handleDeleteCompanies = async () => {
  if (selectedIds.value.length === 0) {
    alertService.warning("Pilih minimal satu company untuk dihapus");
    return;
  }

  const confirmDelete = await alertService.confirm(
    "Hapus Company?",
    `${selectedIds.value.length} company akan dihapus secara permanen. Lanjutkan?`,
  );

  if (!confirmDelete) return;

  try {
    // Delete each selected company
    for (const id of selectedIds.value) {
      await store.dispatch("company/deletecompany", id);
    }
    // Clear selected IDs
    selectedIds.value = [];
    alertService.success("Company berhasil dihapus");
  } catch (error) {
    console.error("Error deleting companies:", error);
    const status = error?.response?.status;
    const backendMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message;
    alertService.error(
      `Gagal menghapus company. ${status ? `Status: ${status}. ` : ""}${backendMessage || "Silakan coba lagi."}`,
    );
  }
};
</script> -->

<script>
import { mapState, mapGetters, mapActions } from "vuex";

import CreateCompanyForm from "./forms/CreateCompanyForm.vue";
import BulkAddCompanyForm from "./forms/BulkAddCompanyForm.vue";
import DetailForm from "./forms/DetailForm.vue";
import DetailDataCompany from "./forms/DetailDataCompany.vue";
import { alertService, alertServicenew } from "@/services/alertService";
import {
  Search,
  ChevronDown,
  Download,
  Edit,
  Trash2,
  Filter,
  ChevronLeft,
  FilePlus,
  ChevronRight,
  RefreshCw,
  FolderPlus,
  FileDown,
  FolderDown,
} from "lucide-vue-next";

export default {
  components: {
    CreateCompanyForm,
    BulkAddCompanyForm,
    DetailForm,
    DetailDataCompany,
    Search,
    ChevronDown,
    Download,
    Edit,
    Trash2,
    Filter,
    ChevronLeft,
    FilePlus,
    ChevronRight,
    RefreshCw,
    FolderPlus,
    FileDown,
    FolderDown,
  },

  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      showCreateCompanyForm: false,
      showBulkAddForm: false,
      showDetailForm: false,
      showDetailDataCompany: false,
      showDropdown: false,
      showDownloadDropdown: false,
      selectedIds: [],
      selectedCompany: null,
      isDetailDataSubmitting: false,
      statuses: [],
    };
  },

  computed: {
    ...mapState({
      searchQuery: (state) => state.company.searchQuery,
    }),

    ...mapGetters({
      companies: "company/filteredCompanies",
      isLoading: "company/isLoading",
      error: "company/error",
      allContacts: "contacts/allContacts",
      allDeals: "deals/allDeals",
    }),

    totalCompanies() {
      return this.companies.length;
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.totalCompanies / this.itemsPerPage));
    },

    paginatedCompanies() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.companies.slice(start, start + this.itemsPerPage);
    },

    downloadLabel() {
      return this.selectedIds.length
        ? `Download (${this.selectedIds.length})`
        : "Download";
    },

    companiesStatusText() {
      if (this.isLoading) return "Searching company...";
      if (this.error) return `Error: ${this.error}`;
      return `${this.totalCompanies.toLocaleString()} Total Companies`;
    },

    companiesStatusClass() {
      if (this.isLoading) return "text-blue-600";
      if (this.error) return "text-red-600";
      return "text-sub-text";
    },
  },

  watch: {
    totalCompanies() {
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
    },
  },

  mounted() {
    this.fetchStatuses();
    if (!this.companies.length) {
      this.fetchAllcompany({});
    }

    document.addEventListener("click", this.handleClickOutside);
  },

  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  methods: {
    ...mapActions("company", [
      "fetchAllcompany",
      "fetchcompanybyid",
      "updatecompany",
      "deletecompany",
    ]),
    ...mapActions("contacts", ["fetchAllContacts"]),
    ...mapActions("deals", ["fetchAllDeals"]),

    getDisplayNameFromContact(contact) {
      return (
        `${contact?.first_name || ""} ${contact?.last_name || ""}`.trim() ||
        contact?.name ||
        contact?.email ||
        "Unknown"
      );
    },

    getAssociationCandidates(...values) {
      const candidates = [];

      values.forEach((value) => {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item !== "" && item !== null && item !== undefined) {
              candidates.push(item);
            }
          });
          return;
        }

        if (value !== "" && value !== null && value !== undefined) {
          if (typeof value === "string" && value.includes(",")) {
            value
              .split(",")
              .map((s) => s.trim())
              .forEach((s) => {
                if (s) candidates.push(s);
              });
          } else {
            candidates.push(value);
          }
        }
      });

      return [...new Set(candidates.map((item) => String(item).trim()))].filter(
        Boolean,
      );
    },

    resolveAssociationLabels(candidates, options) {
      const normalizedOptions = options.map((option) => ({
        value: String(option.value),
        label: String(option.label),
        labelLower: String(option.label).toLowerCase(),
      }));

      const labels = candidates.map((candidate) => {
        const normalizedCandidate = String(candidate).trim();
        const candidateLower = normalizedCandidate.toLowerCase();

        const byValue = normalizedOptions.find(
          (option) => option.value === normalizedCandidate,
        );
        if (byValue) return byValue.label;

        const byLabel = normalizedOptions.find(
          (option) => option.labelLower === candidateLower,
        );
        if (byLabel) return byLabel.label;

        return normalizedCandidate;
      });

      return [...new Set(labels)].filter(Boolean);
    },

    getAssociatedContactLabels(company) {
      const contactCandidates = this.getAssociationCandidates(
        company?.contactassoc,
        company?.contactAssociation,
        company?.contacts_id,
        company?.contact_id,
        company?.contact,
        company?.contact_name,
      );

      const contactOptions = (this.allContacts || []).map((contact) => ({
        value: contact.id,
        label: this.getDisplayNameFromContact(contact),
      }));

      const labels = this.resolveAssociationLabels(
        contactCandidates,
        contactOptions,
      );
      return labels.length ? labels : ["-"];
    },

    getAssociatedDealLabels(company) {
      const dealCandidates = this.getAssociationCandidates(
        company?.dealsassoc,
        company?.dealsAssociation,
        company?.deals_id,
        company?.deal_id,
        company?.deal,
        company?.deal_name,
      );

      const dealOptions = (this.allDeals || []).map((deal) => ({
        value: deal.id,
        label: deal.deal_name || deal.name || "Unknown",
      }));

      const labels = this.resolveAssociationLabels(dealCandidates, dealOptions);
      return labels.length ? labels : ["-"];
    },

    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },

    toggleDownloadDropdown() {
      this.showDownloadDropdown = !this.showDownloadDropdown;
    },

    handleClickOutside(e) {
      if (
        !e.target.closest(".add-dropdown") &&
        !e.target.closest(".download-dropdown")
      ) {
        this.showDropdown = false;
        this.showDownloadDropdown = false;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },

    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },

    async openCompanyDetail(company) {
      const companyId = company?.id;

      if (!companyId) {
        alertService.error("ID company tidak ditemukan.");
        return;
      }

      this.isDetailDataSubmitting = true;

      try {
        const response = await this.fetchcompanybyid(companyId);
        const companyDetail =
          response?.data?.company ||
          response?.data?.data ||
          response?.data ||
          response?.company ||
          response?.companies ||
          company;

        this.selectedCompany = { ...company, ...companyDetail };
        this.showDetailDataCompany = true;
      } catch (error) {
        this.selectedCompany = { ...company };
        this.showDetailDataCompany = true;

        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Gagal mengambil detail terbaru dari server. Menampilkan data yang tersedia.";
        alertService.warning(message);
      } finally {
        this.isDetailDataSubmitting = false;
      }
    },

    closeDetailDataCompany() {
      this.selectedCompany = null;
      this.showDetailDataCompany = false;
    },

    handleDetailDataCompanySubmit(payload) {
      const companyId = this.selectedCompany?.id;
      const companyName = payload?.company?.company_name?.trim();

      if (!companyId) {
        return alertService.error("ID company tidak ditemukan.");
      }

      if (!companyName) {
        return alertService.error("Company Name wajib diisi.");
      }

      this.isDetailDataSubmitting = true;

      // Gabungkan note, docs, dan task ke formdata
      const formdata = {
        ...payload.company,
        updated_at: new Date().toISOString(),
        note: payload.note,
        docs: payload.docs,
        // Jika ada payload.task, masukkan field task ke formdata
        ...(payload.task && {
          task_name: payload.task.name,
          desktask: payload.task.content,
          statustask: payload.task.status,
          assignee: payload.task.assignee,
          due_date: payload.task.dueDate,
          task_time: payload.task.time,
          prioritytask: payload.task.priority,
          associated_contact: payload.task.associatedContact,
        }),
      };

      this.updatecompany({
        keyedit: companyId,
        formdata,
      })
        .then(() => {
          alertService.success("Detail company berhasil diperbarui.");
          this.closeDetailDataCompany();
        })
        .catch((error) => {
          const message =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Gagal update company";

          alertService.error(message);
        })
        .finally(() => {
          this.isDetailDataSubmitting = false;
        });
    },

    handleDeleteCompanies() {
      if (!this.selectedIds.length) {
        return alertService.warning("Pilih minimal satu company untuk dihapus");
      }

      alertService
        .confirm(
          "Hapus Company?",
          `${this.selectedIds.length} company akan dihapus secara permanen.`,
        )
        .then((confirmDelete) => {
          if (!confirmDelete) return;

          const promises = this.selectedIds.map((id) => this.deletecompany(id));

          return Promise.all(promises);
        })
        .then(() => {
          this.selectedIds = [];
          alertService.success("Company berhasil dihapus");
        })
        .catch((error) => {
          const status = error?.response?.status;
          const message =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message;

          alertService.error(
            `Gagal menghapus company ${status ? `(Status ${status})` : ""}. ${
              message || ""
            }`,
          );
        });
    },

    handleDownload() {
      const target = this.selectedIds.length
        ? `selected: ${this.selectedIds}`
        : "all data";

      console.log("Download", target);
      this.showDownloadDropdown = false;
    },

    downloadAll() {
      console.log("Download all data");
      this.showDownloadDropdown = false;
    },

    handleBulkAdd() {
      this.showBulkAddForm = true;
    },

    fetchData() {
      this.showDropdown = false;
      this.showDownloadDropdown = false;

      return this.fetchAllcompany().catch((error) => {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Gagal refresh data company";

        alertService.error(message);
      });
    },

    getTypeName(id) {
      if (!id) return "-";
      // If already a string (name), return as-is
      if (typeof id === "string") return id;
      // If numeric ID, map to name
      const status = this.statuses.find((s) => s.id == id);
      return status ? status.name : "-";
    },

    async fetchStatuses() {
      try {
        const token = this.$cookies.get("token");
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}/statuses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          this.statuses = Array.isArray(data?.data) ? data.data : data;
        } else {
          this.statuses = [
            { id: 1, name: "Competitor" },
            { id: 2, name: "Customer" },
            { id: 3, name: "Ex Customer" },
            { id: 4, name: "Lead" },
            { id: 5, name: "Opportunity" },
            { id: 6, name: "Partner" },
            { id: 7, name: "Qualified" },
          ];
        }
      } catch (error) {
        this.statuses = [
          { id: 1, name: "Competitor" },
          { id: 2, name: "Customer" },
          { id: 3, name: "Ex Customer" },
          { id: 4, name: "Lead" },
          { id: 5, name: "Opportunity" },
          { id: 6, name: "Partner" },
          { id: 7, name: "Qualified" },
        ];
      }
    },
  },
};
</script>

<template>
  <!-- Action Bar -->
  <div
    class="bg-white rounded-lg shadow-sm h-147 p-4 border border-outline flex flex-col overflow-hidden"
  >
    <!-- Header with Title and Total -->
    <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div class="flex min-w-0 items-baseline gap-3">
        <h1 class="text-2xl font-bold text-main-text">Companies</h1>
        <span class="text-sm" :class="companiesStatusClass">
          {{ companiesStatusText }}
        </span>
      </div>

      <!-- Right Section: Action Buttons -->
      <div
        class="flex w-full flex-wrap items-center justify-end gap-1 sm:w-auto sm:gap-2"
      >
        <!-- Refresh Button -->
        <button
          @click="fetchData"
          :disabled="isLoading"
          class="h-9 w-9 rounded-lg border border-outline bg-white p-2 transition-all hover:bg-light-base active:scale-95 disabled:opacity-50 sm:h-10 sm:w-10"
          title="Refresh Data"
        >
          <RefreshCw
            :size="18"
            :class="{ 'animate-spin': isLoading }"
            class="text-sub-text"
          />
        </button>
        <!-- Add New -->
        <div class="relative inline-block add-dropdown">
          <button
            type="button"
            @click="toggleDropdown"
            class="flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-outline bg-white px-2 py-2 text-sub-text transition hover:bg-sub-text hover:text-white sm:h-10 sm:w-auto sm:px-4"
          >
            <span class="text-lg font-semibold">+</span>
            <span class="hidden text-sm font-medium md:inline">Add New</span>
            <ChevronDown
              :size="16"
              class="hidden transition-transform duration-200 md:inline"
              :class="{ 'rotate-180': showDropdown }"
            />
          </button>
          <!-- Dropdown Menu -->
          <div
            v-show="showDropdown"
            class="absolute right-0 text-sub-text mt-2 w-44 bg-white border border-outline rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95"
          >
            <button
              @click="
                showCreateCompanyForm = true;
                showDropdown = false;
              "
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <FilePlus :size="18" />
              <span class="font-medium"> Single Company </span>
            </button>

            <button
              @click="
                handleBulkAdd();
                showDropdown = false;
              "
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <FolderPlus :size="18" />
              <span class="font-medium"> Bulk Company </span>
            </button>
          </div>
        </div>

        <!-- Download -->
        <div class="relative inline-block download-dropdown">
          <!-- Button -->
          <button
            type="button"
            @click="toggleDownloadDropdown"
            class="flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-outline bg-white px-2 py-2 text-sub-text transition hover:bg-sub-text hover:text-white sm:h-10 sm:w-auto sm:px-4"
          >
            <Download :size="18" />
            <span class="hidden text-sm font-medium md:inline">Download</span>
            <ChevronDown
              :size="16"
              class="hidden transition-transform duration-200 md:inline"
              :class="{ 'rotate-180': showDownloadDropdown }"
            />
          </button>

          <!-- DropdownMenu -->
          <div
            v-show="showDownloadDropdown"
            class="absolute text-sub-text right-0 mt-2 w-48 bg-white border border-outline rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95"
          >
            <button
              @click="downloadAll"
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <FolderDown :size="18" class="text-sub-text" />
              <span class="font-medium">Download All</span>
            </button>

            <button
              @click="handleDownload"
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 border-t border-gray-50"
            >
              <FileDown :size="18" class="text-sub-text" />
              <span class="font-medium">{{ downloadLabel }}</span>
            </button>
          </div>
        </div>

        <!-- Bulk Edit -->
        <button
          class="flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-outline bg-white px-2 py-2 text-sub-text transition hover:bg-sub-text hover:text-white sm:h-10 sm:w-auto sm:px-4"
        >
          <Edit :size="18" />
          <span class="hidden text-sm font-medium md:inline">Bulk Edit</span>
        </button>

        <!-- Delete -->
        <button
          @click="handleDeleteCompanies"
          class="h-9 w-9 rounded-lg border border-red bg-white p-2 text-red transition hover:bg-red hover:text-white sm:h-10 sm:w-10"
        >
          <Trash2 :size="18" />
        </button>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <!-- Left Section: Filter + Search + Show -->
      <div class="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
        <!-- Filter Icon -->
        <button
          class="p-2 border border-outline rounded-lg hover:bg-outline/30 transition"
        >
          <Filter :size="20" class="text-main-text" />
        </button>

        <!-- Search Input -->
        <div class="relative w-full sm:w-auto">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by Name"
            class="w-full rounded-lg border border-outline bg-white py-2 pl-3 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text sm:w-64"
          />
        </div>

        <!-- Search Icon Button -->
        <button
          class="p-2 bg-outline hover:bg-outline/30 rounded-lg transition"
        >
          <Search :size="20" class="text-main-text" />
        </button>

        <!-- Show Dropdown -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-main-text">Show</span>
          <select
            v-model="itemsPerPage"
            class="px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
          >
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>
      <!-- PUSH KANAN -->
      <div
        class="flex w-full items-center justify-end gap-3 text-sm text-sub-text sm:w-auto sm:ml-auto"
      >
        <button
          @click="prevPage"
          class="p-2 rounded hover:bg-gray-100 transition disabled:opacity-40"
          :disabled="currentPage === 1"
        >
          <ChevronLeft :size="18" class="text-sub-text" />
        </button>

        <span>Page</span>

        <input
          type="number"
          v-model.number="currentPage"
          min="1"
          :max="totalPages"
          class="w-12 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-sub-text"
        />

        <span>of {{ totalPages }}</span>

        <button
          @click="nextPage"
          class="p-2 rounded hover:bg-gray-100 transition disabled:opacity-40"
          :disabled="currentPage === totalPages"
        >
          <ChevronRight :size="18" class="text-sub-text" />
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="mt-4 flex-1 min-h-0 overflow-auto relative">
      <!-- Loading Overlay -->
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white/60 z-20 flex items-center justify-center"
      >
        <div class="flex flex-col items-center gap-3">
          <RefreshCw class="animate-spin text-blue-950" :size="32" />
          <p class="text-sm text-sub-text font-medium">Loading companies...</p>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 rounded focus:ring-sub-text border-gray-300"
                />
              </th>
              <th
                class="px-6 py-4 text-left text-sm font-semibold text-gray-700"
              >
                <div class="flex items-center gap-2">
                  Company Name
                  <ChevronDown :size="16" class="text-gray-400" />
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-sm font-semibold text-gray-700"
              >
                <div class="flex items-center gap-2">
                  Info Company
                  <ChevronDown :size="16" class="text-gray-400" />
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-sm font-semibold text-gray-700"
              >
                <div class="flex items-center gap-2">
                  Associated with
                  <ChevronDown :size="16" class="text-gray-400" />
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-sm font-semibold text-gray-700"
              >
                <div class="flex items-center gap-2">
                  Type
                  <ChevronDown :size="16" class="text-gray-400" />
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-sm font-semibold text-gray-700"
              >
                <div class="flex items-center gap-2">
                  Created/Update
                  <ChevronDown :size="16" class="text-gray-400" />
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-sm font-semibold text-gray-700"
              >
                <div class="flex items-center gap-2">
                  Owner
                  <ChevronDown :size="16" class="text-gray-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Empty State -->
            <tr v-if="companies.length === 0 && !isLoading">
              <td colspan="7" class="px-6 py-20 text-center text-sub-text">
                <div class="flex flex-col items-center gap-3">
                  <div
                    class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"
                  >
                    <Search :size="32" class="text-gray-400" />
                  </div>
                  <p class="text-lg font-medium">No companies found</p>
                  <p class="text-sm text-gray-400">
                    Start adding companies to see them here
                  </p>
                </div>
              </td>
            </tr>

            <!-- Sample rows - will be populated with actual data -->
            <tr
              v-for="company in paginatedCompanies"
              :key="company.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
              @click="openCompanyDetail(company)"
            >
              <td class="px-6 py-4">
                <input
                  type="checkbox"
                  :value="company.id"
                  v-model="selectedIds"
                  @click.stop
                  class="w-4 h-4 text-blue-600 rounded focus:ring-sub-text border-gray-300"
                />
              </td>
              <td class="px-6 py-4 text-sm text-gray-800 font-medium">
                {{ company.company_name }}
              </td>
              <td class="px-6 py-4 text-sm text-main-text">
                {{ company.website }}
              </td>
              <td class="px-6 py-4 text-sm text-main-text leading-5">
                <div>
                  <span class="font-medium"></span>
                  {{ getAssociatedContactLabels(company).join(", ") }}
                </div>
                <div>
                  <span class="font-medium"></span>
                  {{ getAssociatedDealLabels(company).join(", ") }}
                </div>
              </td>
              <td class="px-6 py-4">
                {{ getTypeName(company.type) }}
              </td>
              <td class="px-6 py-4 text-sm text-main-text">
                {{ company.updated_at }}
              </td>
              <td class="px-6 py-4 text-sm text-main-text">
                {{ company.company_owner }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Add Company Form -->
  <CreateCompanyForm
    :isOpen="showCreateCompanyForm"
    @close="showCreateCompanyForm = false"
    @submit="
      (data) => {
        console.log('Company added:', data);
        showCreateCompanyForm = false;
        showDetailForm = false;
      }
    "
  />

  <!-- Bulk Add Company Form -->
  <BulkAddCompanyForm
    :isOpen="showBulkAddForm"
    @close="showBulkAddForm = false"
    @submit="
      (file) => {
        console.log('File uploaded:', file);
        showBulkAddForm = false;
      }
    "
  />

  <!-- Detail Form -->
  <DetailForm
    :isOpen="showDetailForm"
    @close="showDetailForm = false"
    @back="
      showDetailForm = false;
      showCreateCompanyForm = true;
    "
    @submit="
      (data) => {
        console.log('Detail submitted:', data);
        showDetailForm = false;
      }
    "
  />

  <DetailDataCompany
    :isOpen="showDetailDataCompany"
    :company="selectedCompany"
    :isSubmitting="isDetailDataSubmitting"
    @close="closeDetailDataCompany"
    @back="closeDetailDataCompany"
    @submit="handleDetailDataCompanySubmit"
  />
</template>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
