<script>
import { mapGetters } from "vuex";
import { alertService } from "@/services/alertService";
import DealsCard from "./dealscard/DealCard.vue";
import DealsList from "./dealslist/DealsList.vue";
import CreateDealForm from "@/components/forms/CreateDealForm.vue";
import BulkAddDealForm from "@/components/forms/BulkAddDealForm.vue";
import DetailDataDeals from "@/components/forms/CreateDealForm.vue";
import {
  ChevronDown,
  FileDown,
  FolderDown,
  Download,
  Edit,
  LayoutGrid,
  FolderPlus,
  FilePlus,
  List,
  RefreshCw,
} from "lucide-vue-next";

export default {
  name: "Deals",
  components: {
    ChevronDown,
    FileDown,
    FolderDown,
    Download,
    Edit,
    LayoutGrid,
    FolderPlus,
    FilePlus,
    List,
    RefreshCw,
    DealsCard,
    DealsList,
    CreateDealForm,
    BulkAddDealForm,
    DetailDataDeals,
  },
  data() {
    return {
      // UI State: Dropdown toggles
      showDropdown: false,
      showDownloadDropdown: false,

      // Dialog/Modal States
      showCreateDealForm: false,
      showBulkAddDealForm: false,
      showDetailDataDeals: false,

      // Selected Data
      selectedIds: [],
      selectedDeal: null,

      // Form Submission State
      isDetailDataDealsSubmitting: false,

      // Pagination & Filtering
      currentPage: 1,
      itemsPerPage: 10,

      // Search Debounce Timer
      searchDebounceTimeout: null,
    };
  },

  computed: {
    ...mapGetters({
      allDeals: "deals/allDeals",
      isLoading: "deals/isLoading",
      error: "deals/error",
    }),
    tableDeals() {
      return this.allDeals || [];
    },

    totalDeals() {
      return this.allDeals?.length || 0;
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.totalDeals / this.itemsPerPage));
    },

    paginatedDeals() {
      const sorted = [...this.tableDeals].sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
        const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
        return dateB - dateA; // DESC: newest first
      });
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return sorted.slice(start, start + this.itemsPerPage);
    },

    allSelected() {
      const ids = this.allDeals.map((deal) => deal.id);
      if (!ids.length) return false;
      return ids.length > 0 && ids.every((id) => this.selectedIds.includes(id));
    },

    //Current view mode from Vuex store - Synced with route path (dealslist = "list", dealscard = "card")
    activeMode() {
      return this.$store.getters["deals/currentView"] || "card";
    },

    downloadLabel() {
      return this.selectedIds.length
        ? `Download (${this.selectedIds.length})`
        : "Download";
    },

    // Dynamic status text: shows loading, error, or deal count
    dealsStatusText() {
      if (this.isLoading) {
        return "Searching deals...";
      }
      if (this.error) {
        return `Error: ${this.error}`;
      }
      return `${this.totalDeals.toLocaleString()} Total Deals`;
    },

    // Dynamic status color: blue for loading, red for error, gray for normal
    dealsStatusClass() {
      if (this.isLoading) {
        return "text-blue-600";
      }
      if (this.error) {
        return "text-red-600";
      }
      return "text-sub-text";
    },

    // Current search query from Vuex store
    searchQuery: {
      get() {
        return this.$store.getters["deals/searchQuery"];
      },
      set(value) {
        this.$store.dispatch("deals/setSearchQuery", value);
      },
    },
  },

  watch: {
    // Debounced search query watcher: reset to page 1 and fetch with 500ms delay
    searchQuery(newVal, oldVal) {
      if (newVal === oldVal) return;

      if (this.searchDebounceTimeout) clearTimeout(this.searchDebounceTimeout);

      this.searchDebounceTimeout = setTimeout(() => {
        if (this.currentPage !== 1) {
          this.currentPage = 1;
          return;
        }
        this.fetchData();
      }, 500);
    },

    currentPage(newVal, oldVal) {
      if (newVal === oldVal) return;
      this.fetchData();
    },

    itemsPerPage(newVal, oldVal) {
      if (newVal === oldVal) return;
      this.currentPage = 1;
      this.fetchData();
    },

    // Sync view mode based on route path (dealslist = list, else = card)
    "$route.path": {
      handler(path) {
        if (path.includes("dealslist")) {
          this.$store.dispatch("deals/setViewMode", "list");
        } else {
          this.$store.dispatch("deals/setViewMode", "card");
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.fetchData();
  },
  beforeUnmount() {
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
      this.searchDebounceTimeout = null;
    }
  },
  methods: {
    // Fetch deals data with current pagination and search filters
    async fetchData() {
      try {
        await this.$store.dispatch("deals/fetchAllDeals", {
          page: this.currentPage,
          per_page: this.itemsPerPage,
          q: this.searchQuery,
        });
        console.log("Deals fetched successfully");
      } catch (err) {
        console.error("Failed to fetch deals:", err);
      }
    },

    // Toggle the "Add New" dropdown menu visibility
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },

    // Toggle the "Download" dropdown menu visibility
    toggleDownloadDropdown() {
      this.showDownloadDropdown = !this.showDownloadDropdown;
    },

    // Show bulk add deals form and close add dropdown
    handleBulkAdd() {
      this.showBulkAddDealForm = true;
    },

    // Handle "Create Deal" form submission: close form, reset to page 1, refresh deals list
    async handleCreateDealSubmit() {
      // Do not auto-close the create drawer; just refresh list so user can see new item
      this.currentPage = 1;
      await this.fetchData();
    },

    // Close Create/Edit Deal form and clear selected deal
    handleCloseCreateForm() {
      this.showCreateDealForm = false;
      this.selectedDeal = null;
    },

    // Navigate to kanban (card) view via router
    changeToCard() {
      this.$router.push({ name: "DealsCard" });
    },

    // Navigate to table (list) view via router
    changeToList() {
      this.$router.push({ name: "DealsList" });
    },

    // Download all deals data (currently logs to console)
    downloadAll() {
      console.log("Download all data");
      this.showDownloadDropdown = false;
    },

    // Download selected deals data (currently logs to console with selected IDs)
    handleDownload() {
      console.log("Download selected data:", this.selectedIds);
      this.showDownloadDropdown = false;
    },

    // Open deal in CreateDealForm for editing
    // Di dalam methods deals.vue
    async openDealDetail(deal) {
      try {
        //this.$store.commit("deals/setLoading", true);
        // Ambil detail deal by id – asumsikan response sudah berbentuk object dengan properti deals, companiesassoc, contactassoc
        const response = await this.$store.dispatch(
          "deals/fetchDealById",
          deal.id,
        );

        // Simpan response mentah (bukan hasil olahan)
        this.selectedDeal = response;
        this.showDetailDataDeals = true;
      } catch (error) {
        console.error("Gagal mengambil detail deal:", error);
        alertService.error("Gagal memuat detail deal");
      } finally {
        //this.$store.commit("deals/setLoading", false);
      }
    },

    // Close detail drawer and clear selected deal
    closeDetailDataDeals() {
      this.showDetailDataDeals = false;
      this.selectedDeal = null;
    },

    // Handle detail drawer form submission with validation and Vuex update
    /* async handleDetailDataDealsSubmit(payload) {
      const dealId = this.selectedDeal?.id;

      if (!dealId) {
        alertService.error(
          "ID deal tidak ditemukan. Coba buka ulang detail data.",
        );
        return;
      }

      if (!payload?.deal?.deal_name?.trim()) {
        alertService.error("Deal Name wajib diisi.");
        return;
      }

      this.isDetailDataDealsSubmitting = true;

      try {
        const now = new Date().toISOString().slice(0, 19).replace("T", " ");

        // Flatten nested payload structure for backend compatibility
        const formdata = {
          ...payload.deal,
          id: dealId,
          updated_at: now,

          // Notes, Tasks, & Docs flattened for API
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

        await this.$store.dispatch("deals/updateDeal", {
          keyedit: dealId,
          formdata,
        });

        alertService.success("Detail deal berhasil diperbarui.");
        this.closeDetailDataDeals();
      } catch (error) {
        const backendMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Terjadi kesalahan saat memperbarui deal.";

        alertService.error(backendMessage);
      } finally {
        this.isDetailDataDealsSubmitting = false;
      }
    }, */

    parseJSON(val, defaultVal) {
      try {
        if (!val) return defaultVal;
        if (typeof val === "object") return val;
        return JSON.parse(val);
      } catch {
        return defaultVal;
      }
    },

    // Helper untuk mengekstrak array of IDs dari association array of objects
    extractIdsFromAssoc(assocArray) {
      if (!Array.isArray(assocArray)) return [];
      return assocArray.map((item) => item.id).filter(Boolean);
    },

    setFormData(data) {
      // Cek apakah data memiliki properti 'deals' (response dari fetchById)
      let dealData = data;
      let companiesAssoc = [];
      let contactsAssoc = [];

      if (data?.deals && Array.isArray(data.deals) && data.deals.length > 0) {
        dealData = data.deals[0];
        companiesAssoc = data.companiesassoc || [];
        contactsAssoc = data.contactassoc || [];
      } else {
        // Fallback: mungkin data langsung object deal
        companiesAssoc = data.companyassoc || data.companiesassoc || [];
        contactsAssoc = data.contactassoc || [];
      }

      // Isi formData
      this.formData = {
        dealName: dealData.deal_name || dealData.dealName || "",
        pipeline: this.normalizePipelineValue(
          dealData.pipeline || dealData.stage || "",
        ),
        currency: dealData.currency || "IDR",
        amount: dealData.amount_value || dealData.amount || "",
        expectedCloseDate:
          dealData.expected_close_date || dealData.expectedCloseDate || "",
        owner: dealData.owner || "",
        priority: dealData.priority || "",
        source: dealData.source || "",
        description: dealData.description || "",
        documents: null,
        // Ubah array of objects menjadi array of IDs
        companyassoc: this.extractIdsFromAssoc(companiesAssoc),
        contactassoc: this.extractIdsFromAssoc(contactsAssoc),
        task: {
          title: dealData.task_name || "",
          dueDate: dealData.due_date || "",
          status: dealData.statustask || "",
          priority: dealData.prioritytask || "",
        },
        docs: {
          description: dealData.docs || "",
          fileSource: "",
          files: [],
        },
        noteData: {
          body: dealData.notes || "",
          gps_address: null,
          latitude: null,
          longitude: null,
          photos: [],
          audioBlob: null,
        },
      };

      // Reset UI state
      this.showOptional = !!(
        this.formData.description || this.formData.docs.description
      );
      this.selectedDocSource = this.formData.docs.fileSource || "";
      this.customSource = "";
    },
  },
};
</script>

<template>
  <div class="p-0">
    <!-- Header: Title + Status + Action Buttons -->
    <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div class="flex min-w-0 items-baseline gap-3">
        <h1 class="text-2xl font-bold text-dark-base">Deals</h1>
        <span class="text-sm" :class="dealsStatusClass">{{
          dealsStatusText
        }}</span>
      </div>

      <!-- Action Buttons: Refresh, Add, Download, Bulk Edit, View Toggle -->
      <div
        class="ml-auto flex w-full flex-wrap items-center justify-end gap-1 sm:w-auto sm:gap-2"
      >
        <!-- Refresh Button: Fetch latest deals data -->
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

        <!-- Add New Dropdown: Single Deal or Bulk Deals -->
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
          <!-- Dropdown Menu: Single Deal or Bulk -->
          <div
            v-show="showDropdown"
            class="absolute right-0 text-sub-text mt-2 w-44 bg-white border border-outline rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95"
          >
            <button
              @click="
                selectedDeal = null;
                showCreateDealForm = true;
                showDropdown = false;
              "
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <FilePlus :size="18" />
              <span class="font-medium"> Single Deal </span>
            </button>

            <button
              @click="
                handleBulkAdd();
                showDropdown = false;
              "
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <FolderPlus :size="18" />
              <span class="font-medium"> Bulk Deals </span>
            </button>
          </div>
        </div>

        <!-- Download Dropdown: Download All or Selected -->
        <div class="relative inline-block">
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
              <span class="font-medium">Download</span>
            </button>
          </div>
        </div>

        <!-- Bulk Edit Button: Future feature -->
        <button
          class="flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-outline bg-white px-2 py-2 text-sub-text transition hover:bg-sub-text hover:text-white sm:h-10 sm:w-auto sm:px-4"
        >
          <Edit :size="18" />
          <span class="hidden text-sm font-medium md:inline">Bulk Edit</span>
        </button>

        <!-- View Toggle: Kanban Card Mode -->
        <button
          @click="changeToCard"
          :class="[
            'relative group flex items-center justify-center px-4 py-2 h-10 rounded-lg border transition',
            activeMode === 'card'
              ? 'bg-sub-text text-white border-sub-text'
              : 'bg-white text-sub-text border-outline hover:bg-sub-text hover:text-white',
          ]"
          title="Kanban View"
        >
          <LayoutGrid :size="18" :stroke-width="2" />
        </button>

        <!-- View Toggle: Table List Mode -->
        <button
          @click="changeToList"
          :class="[
            'relative group flex items-center justify-center px-4 py-2 h-10 rounded-lg border transition',
            activeMode === 'list'
              ? 'bg-sub-text text-white border-sub-text'
              : 'bg-white text-sub-text border-outline hover:bg-sub-text hover:text-white',
          ]"
          title="List View"
        >
          <List :size="18" :stroke-width="3" />
        </button>
      </div>
    </div>

    <!-- Main Content: Conditional rendering based on view mode -->
    <div class="mt-4 relative">
      <!-- Loading Overlay: Show spinner while fetching deals -->
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white/60 z-20 flex items-center justify-center rounded-lg"
      >
        <div class="flex flex-col items-center gap-3">
          <RefreshCw class="animate-spin text-blue-950" :size="32" />
          <p class="text-sm text-sub-text font-medium">Loading deals...</p>
        </div>
      </div>

      <!-- Kanban Card View: Grid layout for deals by stage -->
      <DealsCard
        v-if="activeMode === 'card'"
        v-model:currentPage="currentPage"
        v-model:itemsPerPage="itemsPerPage"
        @viewDetail="openDealDetail"
      />

      <!-- Table List View: Paginated table with search -->
      <DealsList
        v-else-if="activeMode === 'list'"
        v-model:currentPage="currentPage"
        v-model:itemsPerPage="itemsPerPage"
        @viewDetail="openDealDetail"
      />
    </div>

    <!-- Modal: Create/Edit Single Deal Form -->
    <CreateDealForm
      :isOpen="showCreateDealForm"
      :initialData="selectedDeal"
      :key="selectedDeal?.id || 'create-deal-form'"
      @close="handleCloseCreateForm"
      @saved="handleCreateDealSubmit"
    />

    <!-- Modal: Bulk Add Multiple Deals Form -->
    <BulkAddDealForm
      :isOpen="showBulkAddDealForm"
      @close="showBulkAddDealForm = false"
      @submit="showBulkAddDealForm = false"
    />

    <!-- DetailDataDeals adalah alias untuk CreateDealForm -->
    <DetailDataDeals
      :isOpen="showDetailDataDeals"
      :initialData="selectedDeal"
      :key="
        selectedDeal?.deals?.[0]?.id || selectedDeal?.id || 'detail-deal-form'
      "
      :isSubmitting="isDetailDataDealsSubmitting"
      @close="closeDetailDataDeals"
      @back="closeDetailDataDeals"
      @submit="handleCreateDealSubmit"
    />
  </div>
</template>
