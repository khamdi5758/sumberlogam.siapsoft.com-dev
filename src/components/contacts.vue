<template>
  <div class="flex flex-col h-full">
    <!-- Action Bar -->
    <div
      class="bg-white rounded-lg shadow-sm p-4 border border-outline flex flex-col min-h-0 flex-1"
    >
      <!-- Header with Title and Total -->
      <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div class="flex min-w-0 items-baseline gap-3">
          <h1 class="text-2xl font-bold text-main-text">Contacts</h1>
          <span class="text-sm" :class="contactsStatusClass">{{
            contactsStatusText
          }}</span>
        </div>

        <!-- Right Section: Action Buttons -->
        <div
          class="flex w-full flex-wrap items-center justify-end gap-1 sm:w-auto sm:gap-2"
        >
          <button
            class="flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-fecbuk bg-white px-2 py-2 text-fecbuk shadow-sm transition hover:bg-fecbuk hover:text-white sm:h-10 sm:w-auto sm:px-4"
          >
            <Facebook :size="18" />
            <span class="hidden text-sm font-medium md:inline"
              >Connect Facebook</span
            >
            <ChevronDown :size="16" class="hidden md:inline" />
          </button>

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
                  showAddContactForm = true;
                  showDropdown = false;
                "
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <FilePlus :size="18" />
                <span class="font-medium"> Single Contact </span>
              </button>

              <button
                @click="
                  handleBulkAdd();
                  showDropdown = false;
                "
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <FolderPlus :size="18" />
                <span class="font-medium"> Bulk Contact </span>
              </button>
            </div>
          </div>

          <!-- Download -->
          <div class="relative inline-block printable-dropdown">
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

            <!-- Dropdown -->
            <div
              v-show="showDownloadDropdown"
              class="absolute text-sub-text right-0 mt-2 w-48 bg-white border border-outline rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95"
            >
              <button
                @click="downloadAll"
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <FolderDown :size="16" />
                <span class="font-medium">Download All</span>
              </button>

              <button
                @click="handleDownload"
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <FileDown :size="16" />
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
            @click="handleDeleteContacts"
            class="h-9 w-9 rounded-lg border border-red bg-white p-2 text-red transition hover:bg-red hover:text-white sm:h-10 sm:w-10"
          >
            <Trash2 :size="18" />
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Left Section: Filter + Search + Show -->
        <div class="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <button
            class="p-2 border border-outline rounded-lg hover:bg-outline/30 transition"
          >
            <Filter :size="20" class="text-main-text" />
          </button>

          <div class="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by Name"
              class="w-full rounded-lg border border-outline bg-white py-2 pl-3 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text sm:w-64"
            />
          </div>

          <button
            class="p-2 bg-outline hover:bg-outline/30 rounded-lg transition"
          >
            <Search :size="20" class="text-main-text" />
          </button>

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

        <!-- Pagination Controls -->
        <div
          class="flex w-full items-center justify-end gap-3 text-sm text-sub-text sm:w-auto sm:ml-auto"
        >
          <button
            @click="currentPage > 1 && currentPage--"
            class="p-2 rounded hover:bg-gray-100 transition disabled:opacity-40"
            :disabled="currentPage === 1"
          >
            <ChevronLeft :size="18" />
          </button>

          <span>Page</span>

          <input
            type="number"
            v-model="currentPage"
            min="1"
            :max="totalPages"
            class="w-12 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none"
          />

          <span>of {{ totalPages }}</span>

          <button
            @click="currentPage < totalPages && currentPage++"
            class="p-2 rounded hover:bg-gray-100 transition disabled:opacity-40"
            :disabled="currentPage === totalPages"
          >
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>

      <!-- Table Content -->
      <div class="mt-4 flex-1 min-h-0 overflow-auto relative">
        <!-- Loading Overlay -->
        <div
          v-if="isLoading"
          class="absolute inset-0 bg-white/60 z-20 flex items-center justify-center"
        >
          <div class="flex flex-col items-center gap-3">
            <RefreshCw class="animate-spin text-blue-950" :size="32" />
            <p class="text-sm text-sub-text font-medium">Loading contacts...</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="sticky top-0 bg-white z-10">
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
                    Contact Name
                    <ChevronDown :size="16" class="text-gray-400" />
                  </div>
                </th>
                <th
                  class="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                >
                  <div class="flex items-center gap-2">
                    Contact Info
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
                    Status
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
              <tr v-if="paginatedContacts.length === 0 && !isLoading">
                <td colspan="7" class="px-6 py-20 text-center text-sub-text">
                  <div class="flex flex-col items-center gap-3">
                    <div
                      class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"
                    >
                      <Search :size="32" class="text-gray-400" />
                    </div>
                    <p class="text-lg font-medium">No contacts found</p>
                    <p class="text-sm text-gray-400">
                      We couldn't find any contacts matching your criteria.
                    </p>
                    <button
                      @click="showAddContactForm = true"
                      class="mt-2 text-blue-600 font-medium hover:underline text-sm"
                    >
                      + Add Your First Contact
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Data Rows -->
              <tr
                v-for="contact in paginatedContacts"
                :key="contact.id"
                class="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                @click="openContactDetail(contact)"
              >
                <td class="px-6 py-4" @click.stop>
                  <input
                    type="checkbox"
                    v-model="selectedIds"
                    :value="contact.id"
                    class="w-4 h-4 text-blue-600 rounded focus:ring-sub-text border-gray-300"
                  />
                </td>
                <td class="px-6 py-4 text-sm text-gray-800 font-medium">
                  {{ contact.first_name }} {{ contact.last_name }}
                </td>
                <td class="px-6 py-4 text-sm text-main-text">
                  <div>{{ contact.email || "-" }}</div>
                  <div class="text-xs text-sub-text">
                    {{ contact.telephone_1 || "-" }}
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-main-text leading-5">
                  <div>
                    <span class="font-medium"></span>
                    {{ getAssociatedCompanyLabels(contact).join(", ") }}
                  </div>
                  <div>
                    <span class="font-medium"></span>
                    {{ getAssociatedDealLabels(contact).join(", ") }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    :class="getStatusClass(contact.status)"
                  >
                    {{ getStatusName(contact.status) || "Inactive" }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-main-text">
                  {{ formatDate(contact.updated_at || contact.created_at) }}
                </td>
                <td class="px-6 py-4 text-sm text-main-text">
                  {{ contact.owner || "-" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Contact Form -->
    <AddContactForm
      :isOpen="showAddContactForm"
      @close="showAddContactForm = false"
      @submit="handleAddContact"
    />

    <!-- Contact Detail Form -->
    <DetailForm
      :isOpen="showDetailForm"
      title="Add Contact / Details"
      saveButtonText="Save Contact"
      entityType="contact"
      :contact="selectedContact"
      @close="showDetailForm = false"
      @submit="
        (data) => {
          console.log('Contact detail updated:', data);
          showDetailForm = false;
        }
      "
    />

    <!-- Contact Data Detail Form (for row click) -->
    <DetailDataContact
      :isOpen="showDetailDataContact"
      :contact="selectedContact"
      :isSubmitting="isDetailDataSubmitting"
      @close="closeDetailDataContact"
      @back="closeDetailDataContact"
      @submit="handleDetailDataContactSubmit"
    />

    <!-- Bulk Add Contact Form -->
    <BulkAddContactForm
      :isOpen="showBulkAddForm"
      @close="showBulkAddForm = false"
      @submit="
        (file) => {
          console.log('File uploaded:', file);
          showBulkAddForm = false;
        }
      "
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import AddContactForm from "./forms/AddContactForm.vue";
import BulkAddContactForm from "./forms/BulkAddContactForm.vue";
import DetailForm from "./forms/DetailFormDuplicate.vue";
import DetailDataContact from "./forms/DetailDataContact.vue";
import { alertService } from "@/services/alertService";

import {
  Search,
  ChevronDown,
  Download,
  Edit,
  Trash2,
  Facebook,
  Filter,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  FilePlus,
  FileDown,
  FolderDown,
  RefreshCw,
} from "lucide-vue-next";

export default {
  name: "Contacts",

  components: {
    AddContactForm,
    BulkAddContactForm,
    DetailForm,
    DetailDataContact,
    Search,
    ChevronDown,
    Download,
    Edit,
    Trash2,
    Facebook,
    Filter,
    ChevronLeft,
    ChevronRight,
    FolderPlus,
    FilePlus,
    FileDown,
    FolderDown,
    RefreshCw,
  },

  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      showAddContactForm: false,
      showBulkAddForm: false,
      showDropdown: false,
      showDownloadDropdown: false,
      selectedIds: [],
      selectedContact: null,
      showDetailForm: false,
      showDetailDataContact: false,
      isDetailDataSubmitting: false,
      statuses: [],
    };
  },

  computed: {
    ...mapGetters({
      contacts: "contacts/allContacts",
      pagination: "contacts/pagination",
      isLoading: "contacts/isLoading",
      error: "contacts/error",
      allCompanies: "company/allcompany",
      allDeals: "deals/allDeals",
    }),

    totalContacts() {
      return this.pagination?.total || 0;
    },

    contactsStatusText() {
      if (this.isLoading) {
        return "Searching contacts...";
      }
      if (this.error) {
        return `Error: ${this.error}`;
      }
      return `${this.totalContacts.toLocaleString()} Total Contacts`;
    },

    contactsStatusClass() {
      if (this.isLoading) {
        return "text-blue-600";
      }
      if (this.error) {
        return "text-red-600";
      }
      return "text-sub-text";
    },

    downloadLabel() {
      return this.selectedIds.length
        ? `Download (${this.selectedIds.length})`
        : "Download";
    },

    paginatedContacts() {
      // With server-side pagination, we just show whatever the API returned
      return this.contacts;
    },

    totalPages() {
      return this.pagination?.last_page || 1;
    },
  },

  watch: {
    currentPage() {
      this.fetchData();
    },
    itemsPerPage() {
      this.currentPage = 1;
      this.fetchData();
    },
  },

  methods: {
    getStatusClass(status) {
      if (!status) return "bg-gray-100 text-gray-700";
      const s = status.toLowerCase();
      if (s === "active" || s === "aktif") return "bg-green-100 text-green-700";
      if (s === "pending") return "bg-yellow-100 text-yellow-700";
      if (s === "inactive" || s === "non-active")
        return "bg-gray-100 text-gray-700";
      return "bg-gray-100 text-gray-700";
    },
    ...mapActions({
      fetchAllContacts: "contacts/fetchAllContacts",
      fetchAllcompany: "company/fetchAllcompany",
      fetchAllDeals: "deals/fetchAllDeals",
      updateContact: "contacts/updateContact",
      deleteContact: "contacts/deleteContact",
    }),

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
          candidates.push(value);
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

    getAssociatedCompanyLabels(contact) {
      const companyCandidates = this.getAssociationCandidates(
        contact?.companyassoc,
        contact?.companiesAssociation,
        contact?.company_id,
        contact?.companies_id,
        contact?.company,
        contact?.company_name,
      );

      const companyOptions = (this.allCompanies || []).map((company) => ({
        value: company.id,
        label: company.company_name || company.name || "Unknown",
      }));

      const labels = this.resolveAssociationLabels(
        companyCandidates,
        companyOptions,
      );
      return labels.length ? labels : ["-"];
    },

    getAssociatedDealLabels(contact) {
      const dealCandidates = this.getAssociationCandidates(
        contact?.dealsassoc,
        contact?.dealsAssociation,
        contact?.deal_id,
        contact?.deals_id,
        contact?.deal,
        contact?.deal_name,
      );

      const dealOptions = (this.allDeals || []).map((deal) => ({
        value: deal.id,
        label: deal.deal_name || deal.name || "Unknown",
      }));

      const labels = this.resolveAssociationLabels(dealCandidates, dealOptions);
      return labels.length ? labels : ["-"];
    },

    fetchData() {
      this.fetchAllContacts({
        page: this.currentPage,
        per_page: this.itemsPerPage,
      })
        .then(() => {
          console.log("Contacts fetched successfully");
        })
        .catch((err) => {
          console.error("Failed to fetch contacts:", err);
        });
    },

    handleAddContact(contactData) {
      console.log("New contact:", contactData);
      // TODO: Implement API call via Vuex
    },

    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },

    toggleDownloadDropdown() {
      this.showDownloadDropdown = !this.showDownloadDropdown;
    },

    openContactDetail(contact) {
      this.selectedContact = { ...contact };
      this.showDetailDataContact = true;
    },

    closeDetailDataContact() {
      this.showDetailDataContact = false;
      this.selectedContact = null;
    },

    handleDetailDataContactSubmit(payload) {
      const contactId = this.selectedContact?.id;
      const firstName = payload?.contact?.first_name?.trim();

      if (!contactId) {
        return alertService.error("ID contact tidak ditemukan.");
      }

      if (!firstName) {
        return alertService.error("First Name wajib diisi.");
      }

      this.isDetailDataSubmitting = true;

      // Format updated_at: YYYY-MM-DD HH:mm:ss (match AddContactForm pattern)
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Flatten payload to match backend expectation for choice: 'u'
      // This follows the "DetailDataCompany-style" emission but ensures contact logic works
      const formdata = {
        ...payload.contact,
        id: contactId,
        updated_at: now,

        // Notes, Tasks, & Docs (Flattened for backend)
        notes: payload.note,
        task_name: payload.task?.name,
        desktask: payload.task?.content,
        statustask: payload.task?.status,
        assignee: payload.task?.assignee,
        due_date: payload.task?.dueDate,
        task_time: payload.task?.time,
        prioritytask: payload.task?.priority,
        associated_contact: payload.task?.associatedContact,
        docs: payload.docs?.description,
      };

      this.updateContact(formdata)
        .then(() => {
          alertService.success("Detail contact berhasil diperbarui.");
          this.closeDetailDataContact();
        })
        .catch((error) => {
          const message =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Gagal update contact.";

          alertService.error(message);
        })
        .finally(() => {
          this.isDetailDataSubmitting = false;
        });
    },

    handleBulkAdd() {
      this.showBulkAddForm = true;
    },

    downloadAll() {
      console.log("Download all data");
      this.showDownloadDropdown = false;
    },

    handleDownload() {
      if (this.selectedIds.length) {
        console.log("Download selected:", this.selectedIds);
      } else {
        console.log("Download all data");
      }
      this.showDownloadDropdown = false;
    },

    handleClickOutside(e) {
      if (
        !e.target.closest(".printable-dropdown") &&
        !e.target.closest(".add-dropdown")
      ) {
        this.showDropdown = false;
        this.showDownloadDropdown = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    },

    handleDeleteContacts() {
      if (!this.selectedIds.length) {
        return alertService.warning("Pilih minimal satu contact untuk dihapus");
      }

      alertService
        .confirm(
          "Hapus Contact?",
          `${this.selectedIds.length} contact akan dihapus secara permanen.`,
        )
        .then((confirmDelete) => {
          if (!confirmDelete) return;

          const promises = this.selectedIds.map((id) => this.deleteContact(id));

          return Promise.all(promises);
        })
        .then(() => {
          this.selectedIds = [];
          alertService.success("Contact berhasil dihapus");
        })
        .catch((error) => {
          const status = error?.response?.status;
          const message =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message;

          alertService.error(
            `Gagal menghapus contact ${status ? `(Status ${status})` : ""}. ${
              message || ""
            }`,
          );
        });
    },

    getStatusName(id) {
      if (!id) return "-";
      // If already a string (name), return as-is
      if (typeof id === "string") return id;
      // If numeric ID, map to name
      const status = this.statuses.find((s) => s.id == id);
      return status ? status.name : "-";
    },

    async fetchStatuses() {
      try {
        const token = this.$cookies?.get("token");
        if (!token) {
          console.warn("No token available for fetching statuses");
          this.setFallbackStatuses();
          return;
        }

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
          this.setFallbackStatuses();
        }
      } catch (error) {
        console.error("Failed to fetch statuses:", error);
        this.setFallbackStatuses();
      }
    },

    setFallbackStatuses() {
      this.statuses = [
        { id: 1, name: "Competitor" },
        { id: 2, name: "Customer" },
        { id: 3, name: "Ex Customer" },
        { id: 4, name: "Lead" },
        { id: 5, name: "Opportunity" },
        { id: 6, name: "Partner" },
        { id: 7, name: "Qualified" },
      ];
    },
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside);
    this.fetchStatuses();
    this.fetchData();
    // this.fetchAllcompany();
    // this.fetchAllDeals();
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>

<style scoped>
/* Custom Scrollbar for the table */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}
.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

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

/* Slide and Fade transitions from userscrm */
.animate-in {
  animation: animate-in 0.2s ease-out;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
