<script>
import { mapActions, mapGetters } from "vuex";
import { X, Plus, ChevronDown, Loader2 } from "lucide-vue-next";
import { toast } from "vue3-toastify";
import { useStatuses } from "@/composables/useStatuses";
import AddCompanyForm from "./AddCompanyForm.vue";
import AddDealForm from "./AddDealForm.vue";
import ContactDetailForm from "./DetailForm.vue";
import NotesSection from "@/components/widgets/NotesEditor.vue";
import DocsSection from "@/components/widgets/DocsEditor.vue";
import TaskSection from "@/components/widgets/TaskEditor.vue";
import LocationSelector from "@/components/forms/component/LocationSelector.vue";
import DealAssociationForm from "./assoc/deals.vue";
import CompaniesAssociationForm from "./assoc/companies.vue";
import HistoryDetail from "@/components/widgets/historydetail.vue";

import api from "@/api"; // Pastikan path ini benar sesuai struktur proyek Anda

export default {
  name: "AddContactForm",

  components: {
    X,
    Plus,
    ChevronDown,
    Loader2,
    AddCompanyForm,
    AddDealForm,
    ContactDetailForm,
    LocationSelector,
    NotesSection,
    DocsSection,
    TaskSection,
    DealAssociationForm,
    CompaniesAssociationForm,
    HistoryDetail,
  },

  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    saveButtonText: {
      type: String,
      default: "Save",
    },
    isSaving: {
      type: Boolean,
      default: false,
    },
    contactData: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ["close", "submit"],

  setup() {
    const { statuses: statusList, fetchStatuses } = useStatuses();
    return { statusList, fetchStatuses };
  },

  mounted() {
    this.fetchStatuses();
    this.$store.dispatch("users/getusersignin");
    this.$store.dispatch("users/fetchAllusers");
    this.$store.dispatch("company/fetchAllcompany");
    this.$store.dispatch("deals/fetchAllDeals");
    this.applyDefaultOwner();

    // Add click outside handler
    document.addEventListener("click", this.handleClickOutside);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  watch: {
    isOpen(newVal) {
      if (newVal) {
        Promise.allSettled([
          this.$store.dispatch("users/getusersignin"),
          this.$store.dispatch("users/fetchAllusers"),
          this.$store.dispatch("company/fetchAllcompany"),
          this.$store.dispatch("deals/fetchAllDeals"),
        ]).finally(() => this.applyDefaultOwner());
      }
    },
    contactData: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.populateForm(newVal);
        } else {
          this.handleReset();
        }
      },
      immediate: true,
      deep: true,
    },
  },

  data() {
    return {
      sourceOptions: [
        { value: "", label: "Select Source" },
        { value: "website", label: "Website" },
        { value: "referral", label: "Referral" },
        { value: "social_media", label: "Social Media" },
        { value: "email_campaign", label: "Email Campaign" },
        { value: "cold_call", label: "Cold Call" },
        { value: "trade_show", label: "Trade Show" },
        { value: "partner", label: "Partner" },
        { value: "advertisement", label: "Advertisement" },
        { value: "other", label: "Other" },
      ],
      formData: {
        first_name: "",
        last_name: "",
        job_title: "",
        id_owner: "",
        email: "",
        telephone_1: "",
        telephone_2: "",
        status: "",
        address: "",
        country: "",
        province: "",
        city: "",
        pos_code: "",
        source: "",
        companiesAssociation: "",
        dealsAssociation: "",
        created_at: "",
        updated_at: "",
        companiesSearch: "",
        dealsSearch: "",
        selectedCompanies: [],
        selectedDeals: [],
      },

      task: {
        name: "",
        content: "",
        status: "",
        dueDate: "",
        time: "",
        priority: "",
      },

      statusOptions: [
        { value: "not_started", label: "Not Started" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
      ],

      priorityOptions: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
      ],

      docs: {
        description: "",
        fileSource: "",
        fileUrl: "",
        files: [],
      },

      noteData: {
        body: "",
        gps_address: null,
        latitude: null,
        longitude: null,
        photos: [],
        audioBlob: null,
      },

      isSubmitting: false,
      companySearch: "",
      activeTab: "master",
      isCompanyDropdownOpen: false,
      isDealDropdownOpen: false,

      showAddCompanyForm: false,
      showAddDealForm: false,
      showDetailForm: false,
      showCompaniesDropdown: false,
      showDealsDropdown: false,

      // History & Drawer States
      historyitems: [],
      isNoteDrawerOpen: false,
      isDocDrawerOpen: false,
      editingItemIndex: null,
      tempNoteData: {
        body: "",
        gps_address: null,
        latitude: null,
        longitude: null,
        photos: [],
        audioBlob: null,
      },
      tempDocs: {
        description: "",
        fileSource: "",
        files: [],
      },
    };
  },

  computed: {
    ...mapGetters({
      isLoading: "contacts/isLoading",
      allCompaniesData: "company/allcompany", // Ambil dari store
      allDealsData: "deals/allDeals", // Ambil dari store
    }),
    allCompanies() {
      return this.allCompaniesData || [];
    },
    allDeals() {
      return this.allDealsData || [];
    },
    ownerOptions() {
      const users = this.$store.getters["users/allUsers"] || [];
      return [
        { value: "", label: "Select Owner" },
        ...users.map((user) => ({
          value: user.id ?? "",
          label: user.name || user.username || "Unknown",
        })),
      ];
    },
    currentUserId() {
      const signedInUser =
        this.$store.getters["users/usersignin"] ||
        this.$store.state.auth?.user ||
        null;

      return (
        signedInUser?.id || this.$store.getters["users/useridsignin"] || ""
      );
    },
    currentUserName() {
      const signedInUser =
        this.$store.getters["users/usersignin"] ||
        this.$store.state.auth?.user ||
        null;
      const fullName = [
        signedInUser?.first_name || signedInUser?.firstname,
        signedInUser?.last_name || signedInUser?.lastname,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      return signedInUser?.name || signedInUser?.username || fullName || "";
    },
    filteredCompanies() {
      if (!this.formData.companiesSearch) return this.allCompanies || [];
      return (this.allCompanies || []).filter((company) => {
        const companyName = company.company_name || company.name || "";
        return companyName
          .toLowerCase()
          .includes(this.formData.companiesSearch.toLowerCase());
      });
    },
    filteredDeals() {
      if (!this.formData.dealsSearch) return this.allDeals || [];
      return (this.allDeals || []).filter((deal) => {
        const dealName = deal.deal_name || deal.name || "";
        return dealName
          .toLowerCase()
          .includes(this.formData.dealsSearch.toLowerCase());
      });
    },
  },

  methods: {
    ...mapActions({
      saveContact: "contacts/createContact",
    }),
    applyDefaultOwner() {
      if (!this.formData.id_owner && this.currentUserId) {
        this.formData.id_owner = this.currentUserId;
      }
    },
    populateForm(data) {
      if (!data) return;

      // Extract raw data from possible nested contacts array (backward compatibility)
      const rawData =
        data && data.contacts && data.contacts.length > 0
          ? data.contacts[0]
          : data;

      // Association Candidates Logic (similar to DetailDataContact)
      const getCandidates = (value) => {
        if (!value) return [];
        if (Array.isArray(value))
          return value
            .map((v) =>
              typeof v === "object" && v !== null
                ? (v.id ??
                  v.deal_id ??
                  v.company_id ??
                  v.id_deal ??
                  v.id_company ??
                  v.value)
                : v,
            )
            .filter(Boolean);
        if (typeof value === "string")
          return value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        return [value];
      };

      const companyIds = getCandidates(
        rawData.companyassoc ||
          rawData.companiesAssociation ||
          rawData.company_id ||
          rawData.id_company,
      );
      const dealIds = getCandidates(
        rawData.dealsassoc ||
          rawData.dealsAssociation ||
          rawData.deal_id ||
          rawData.id_deal,
      );

      const selectedCompanies = companyIds.map((id) => {
        const found = this.allCompanies.find(
          (c) => String(c.id) === String(id),
        );
        return found || { id };
      });
      const selectedDeals = dealIds.map((id) => {
        const found = this.allDeals.find((d) => String(d.id) === String(id));
        return found || { id };
      });

      this.formData = {
        id: rawData.id,
        first_name: rawData.first_name || rawData.firstname || "",
        last_name: rawData.last_name || rawData.lastname || "",
        job_title: rawData.job_title || rawData.jobTitle || "",
        id_owner: "", // set below
        email: rawData.email || "",
        telephone_1:
          rawData.telephone_1 || rawData.phone || rawData.telephone1 || "",
        telephone_2: rawData.telephone_2 || rawData.telephone2 || "",
        status: "", // set below
        address: rawData.address || rawData.address_1 || "",
        country: rawData.country || "",
        province: rawData.province || rawData.state || "",
        city: rawData.city || "",
        pos_code: rawData.pos_code || rawData.zip || rawData.posCode || "",
        source: rawData.source || "",
        selectedCompanies: selectedCompanies,
        selectedDeals: selectedDeals,
      };

      // Robust Owner Resolution
      const rawOwner = rawData.id_owner || rawData.owner_id || rawData.owner;
      if (rawOwner) {
        const matchingOwner = this.ownerOptions.find(
          (o) =>
            String(o.value) === String(rawOwner) ||
            o.label.toLowerCase() === String(rawOwner).toLowerCase(),
        );
        this.formData.id_owner = matchingOwner ? matchingOwner.value : rawOwner;
      }

      // Robust Status Resolution
      if (rawData.status) {
        // If it looks like a number, keep as ID
        if (!isNaN(rawData.status) && rawData.status !== "") {
          this.formData.status = Number(rawData.status);
        } else {
          // If it's a name, we might need a statusList search
          const matchingStatus = (this.statusList || []).find(
            (s) =>
              s.name.toLowerCase() === String(rawData.status).toLowerCase(),
          );
          if (matchingStatus) this.formData.status = matchingStatus.id;
        }
      }

      // ─── MAP HISTORY (Notes & Docs) ──────────────────────────────────
      let historyItems = [];

      // Helper to extract body from various fields
      const getBody = (item) => {
        return item.notes || item.body || item.descdocs || item.description || item.content || "";
      };

      // Process Notes
      let rawNotes = rawData.notes || rawData.note;
      if (typeof rawNotes === "string" && rawNotes.startsWith("[")) {
        try { rawNotes = JSON.parse(rawNotes); } catch (e) {}
      }

      if (Array.isArray(rawNotes)) {
        rawNotes.forEach((n) => {
          let location = { address: null, latitude: null, longitude: null };
          try {
            if (n.location) {
              location = typeof n.location === "string" ? JSON.parse(n.location) : n.location;
            }
          } catch (e) {}

          let photos = [];
          try {
            if (n.pathphoto) {
              const parsed = typeof n.pathphoto === "string" ? JSON.parse(n.pathphoto) : n.pathphoto;
              if (Array.isArray(parsed)) {
                photos = parsed.map((p) => p.path || p);
              }
            }
          } catch (e) {}

          historyItems.push({
            type: "note",
            id: n.id,
            timestamp: n.created_at || n.update_at,
            body: getBody(n),
            gps_address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            photos: photos,
          });
        });
      } else if (rawNotes && typeof rawNotes === "string") {
        // Handle single note as string if applicable
        historyItems.push({
          type: "note",
          body: rawNotes,
          timestamp: rawData.created_at || rawData.updated_at,
        });
      }

      // Process Docs
      let rawDocs = rawData.docs || rawData.docs_list || rawData.files;
      if (typeof rawDocs === "string" && rawDocs.startsWith("[")) {
        try { rawDocs = JSON.parse(rawDocs); } catch (e) {}
      }

      if (Array.isArray(rawDocs)) {
        rawDocs.forEach((d) => {
          if (d.pathfile || d.descdocs || d.body || d.description) {
            historyItems.push({
              type: "doc",
              id: d.id,
              timestamp: d.created_at || d.update_at,
              body: getBody(d),
              fileSource: d.file_source || "local",
              files: d.pathfile ? [{ name: d.pathfile.split("/").pop(), path: d.pathfile }] : [],
            });
          }
        });
      }

      // Sort by timestamp descending
      this.historyitems = historyItems.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0);
        const dateB = new Date(b.timestamp || 0);
        return dateB - dateA;
      });

      // Sync latest for backward compatibility / master view
      const latestNote = this.historyitems.find((h) => h.type === "note");
      if (latestNote) {
        this.noteData = {
          body: latestNote.body,
          gps_address: latestNote.gps_address,
          latitude: latestNote.latitude,
          longitude: latestNote.longitude,
          photos: latestNote.photos,
          audioBlob: null,
        };
      }

      const latestDoc = this.historyitems.find((h) => h.type === "doc");
      if (latestDoc) {
        this.docs = {
          description: latestDoc.body,
          fileSource: latestDoc.fileSource,
          files: latestDoc.files,
        };
      }
    },
    handleClose() {
      this.$emit("close");
    },
    validateForm() {
      // Validasi required fields
      if (!this.formData.first_name?.trim()) {
        toast.error("First Name is required");
        this.activeTab = "master";
        return false;
      }
      if (!this.formData.last_name?.trim()) {
        toast.error("Last Name is required");
        this.activeTab = "master";
        return false;
      }
      if (!this.formData.email?.trim()) {
        toast.error("Email is required");
        this.activeTab = "master";
        return false;
      }
      if (!this.formData.status) {
        toast.error("Status is required");
        this.activeTab = "master";
        return false;
      }
      return true;
    },
    handleSaveAll() {
      if (!this.validateForm()) {
        return;
      }

      this.isSubmitting = true;
      try {
        // Gabungkan data master (formData) dan detail (noteContent, task, docs)
        const now = new Date().toISOString();
        const dataToSubmit = {
          ...this.formData,
          note: this.noteData?.body || "",
          notes: this.noteData?.body || "",
          noteData: this.noteData,
          task: this.task,
          docs: this.docs,
          id_owner: this.formData.id_owner || this.currentUserId || "",
          companyassoc: (this.formData.selectedCompanies || [])
            .map((c) => c.id)
            .join(","),
          dealsassoc: (this.formData.selectedDeals || [])
            .map((d) => d.id)
            .join(","),
          created_at: now,
          updated_at: now,
        };
        this.saveContact(dataToSubmit)
          .then(() => {
            const msg = dataToSubmit.id
              ? "Contact berhasil diperbarui!"
              : "Contact berhasil ditambahkan!";
            toast.success(msg);
            this.handleReset();
            this.activeTab = "master";
            this.handleClose();
          })
          .catch((error) => {
            toast.error(error?.message || "Gagal menambah contact.");
          })
          .finally(() => {
            this.isSubmitting = false;
          });
      } catch (error) {
        toast.error(error?.message || "Gagal menambah contact.");
        this.isSubmitting = false;
      }
    },
    handleReset() {
      this.formData = {
        first_name: "",
        last_name: "",
        job_title: "",
        id_owner: "",
        email: "",
        telephone_1: "",
        telephone_2: "",
        status: "",
        address: "",
        country: "",
        province: "",
        city: "",
        pos_code: "",
        source: "",
        companiesAssociation: "",
        dealsAssociation: "",
        created_at: "",
        updated_at: "",
        companiesSearch: "",
        dealsSearch: "",
        selectedCompanies: [],
        selectedDeals: [],
      };

      this.task = {
        name: "",
        content: "",
        status: "",
        dueDate: "",
        time: "",
        priority: "",
      };

      this.docs = {
        description: "",
        fileSource: "",
        files: [],
      };

      this.noteData = {
        body: "",
        gps_address: null,
        latitude: null,
        longitude: null,
        photos: [],
        audioBlob: null,
      };

      this.historyitems = [];
    },
    toggleCompaniesDropdown() {
      this.showCompaniesDropdown = !this.showCompaniesDropdown;
    },
    toggleDealsDropdown() {
      this.showDealsDropdown = !this.showDealsDropdown;
    },
    selectCompany(company) {
      if (!this.formData.selectedCompanies.find((c) => c.id === company.id)) {
        this.formData.selectedCompanies.push(company);
      }
      this.formData.companiesSearch = "";
      this.showCompaniesDropdown = false;
    },
    removeCompany(companyId) {
      this.formData.selectedCompanies = this.formData.selectedCompanies.filter(
        (c) => c.id !== companyId,
      );
    },
    selectDeal(deal) {
      if (!this.formData.selectedDeals.find((d) => d.id === deal.id)) {
        this.formData.selectedDeals.push(deal);
      }
      this.formData.dealsSearch = "";
      this.showDealsDropdown = false;
    },
    removeDeal(dealId) {
      this.formData.selectedDeals = this.formData.selectedDeals.filter(
        (d) => d.id !== dealId,
      );
    },
    filterCompanies() {
      this.showCompaniesDropdown = true;
    },
    filterDeals() {
      this.showDealsDropdown = true;
    },
    handleClickOutside(e) {
      // Close dropdowns saat klik di luar
      if (!e.target.closest("[data-companies-dropdown]")) {
        this.showCompaniesDropdown = false;
      }
      if (!e.target.closest("[data-deals-dropdown]")) {
        this.showDealsDropdown = false;
      }
    },

    // ─── HISTORY & DRAWER METHODS ──────────────────────────────────────────
    openNoteDrawer(editData = null, index = null) {
      if (editData) {
        this.tempNoteData = { ...editData };
        this.editingItemIndex = index;
      } else {
        this.tempNoteData = {
          body: "",
          gps_address: null,
          latitude: null,
          longitude: null,
          photos: [],
          audioBlob: null,
        };
        this.editingItemIndex = null;
      }
      this.isNoteDrawerOpen = true;
    },
    openDocDrawer(editData = null, index = null) {
      if (editData) {
        this.tempDocs = { ...editData };
        this.editingItemIndex = index;
      } else {
        this.tempDocs = {
          description: "",
          fileSource: "local",
          files: [],
        };
        this.editingItemIndex = null;
      }
      this.isDocDrawerOpen = true;
    },
    saveNoteFromDrawer() {
      // Validasi sederhana
      if (!this.tempNoteData.body && this.tempNoteData.photos.length === 0) {
        toast.warn("Note masih kosong");
        return;
      }

      const item = {
        type: "note",
        timestamp: new Date().toISOString(),
        ...this.tempNoteData,
      };

      if (this.editingItemIndex !== null) {
        this.historyitems[this.editingItemIndex] = item;
      } else {
        this.historyitems.unshift(item); // Terbaru di atas
      }

      // Sync with main form state for persistence
      const latestNote = this.historyitems.find((h) => h.type === "note");
      if (latestNote) {
        this.noteData = { ...latestNote };
      }

      this.isNoteDrawerOpen = false;
      toast.success("Catatan ditambahkan ke histori");
    },
    saveDocFromDrawer() {
      if (this.tempDocs.files.length === 0 && !this.tempDocs.description) {
        toast.warn("Dokumen masih kosong");
        return;
      }

      const item = {
        type: "doc",
        timestamp: new Date().toISOString(),
        ...this.tempDocs,
      };

      if (this.editingItemIndex !== null) {
        this.historyitems[this.editingItemIndex] = item;
      } else {
        this.historyitems.unshift(item);
      }

      // Sync with main form state for persistence
      const latestDoc = this.historyitems.find((h) => h.type === "doc");
      if (latestDoc) {
        this.docs = { ...latestDoc };
      }

      this.isDocDrawerOpen = false;
      toast.success("Dokumen ditambahkan ke histori");
    },
    handleHistoryEdit({ item, index }) {
      if (item.type === "note") {
        this.openNoteDrawer(item, index);
      } else {
        this.openDocDrawer(item, index);
      }
    },
    handleHistoryDelete(index) {
      this.historyitems.splice(index, 1);
      toast.info("Item dihapus dari histori");
    },
  },
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
      class="fixed top-0 right-0 h-screen w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        <h2 class="text-xl font-bold text-dark-base">
          {{ formData.id ? "Edit Contact" : "Add Contact" }}
        </h2>
        <button
          @click="handleClose"
          class="p-2 hover:bg-light-base rounded-lg transition-colors"
        >
          <X :size="20" class="text-sub-text" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-outline px-6 bg-white">
        <button
          type="button"
          @click="activeTab = 'master'"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            activeTab === 'master'
              ? 'border-dark-base text-dark-base'
              : 'border-transparent text-sub-text hover:text-dark-base',
          ]"
        >
          Master
        </button>

        <button
          type="button"
          @click="activeTab = 'detail'"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            activeTab === 'detail'
              ? 'border-dark-base text-dark-base'
              : 'border-transparent text-sub-text hover:text-dark-base',
          ]"
        >
          Detail
        </button>
      </div>

      <!-- Form Content (Scrollable) -->
      <div class="flex-1 overflow-y-auto">
        <!-- Master Tab -->
        <form v-if="activeTab === 'master'" @submit.prevent id="addContactForm">
          <div class="p-6 space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-dark-base mb-2">
                  First Name <span class="text-red-600">*</span>
                </label>
                <input
                  v-model="formData.first_name"
                  type="text"
                  placeholder="First Name"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-dark-base mb-2">
                  Last Name <span class="text-red-600">*</span>
                </label>
                <input
                  v-model="formData.last_name"
                  type="text"
                  placeholder="Last Name"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                  required
                />
              </div>
            </div>

            <!-- Job Title -->
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-dark-base mb-2">
                  Job Title
                </label>
                <input
                  v-model="formData.job_title"
                  type="text"
                  placeholder="Job Title"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
            </div>

            <!-- Email & Status -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-dark-base mb-2">
                  Email <span class="text-red-600">*</span>
                </label>
                <input
                  v-model="formData.email"
                  type="email"
                  placeholder="youremail@gmail.com"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-dark-base mb-2">
                  Status <span class="text-red-600">*</span>
                </label>
                <div class="relative">
                  <select
                    v-model.number="formData.status"
                    class="w-full px-3 py-2 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-dark-base bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled selected>Select Status</option>
                    <option
                      v-for="status in statusList"
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

            <!--Telephone 1 & 2-->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-dark-base mb-2">
                  Telephone 1
                </label>
                <input
                  v-model="formData.telephone_1"
                  type="text"
                  placeholder="Telephone 1"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-dark-base mb-2">
                  Telephone 2
                </label>
                <input
                  v-model="formData.telephone_2"
                  type="text"
                  placeholder="Telephone 2"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
            </div>

            <!-- Address & City | Province & Country -->
            <LocationSelector v-model="formData" />

            <!-- Pos Code & Source -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-dark-base mb-2">
                  Source
                </label>
                <div class="relative">
                  <select
                    v-model="formData.source"
                    class="w-full px-3 py-2 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-dark-base bg-white appearance-none cursor-pointer"
                  >
                    <option
                      v-for="option in sourceOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                  <ChevronDown
                    :size="16"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <!-- Companies Association 
          <CompaniesAssociationForm :allCompanies="allCompanies" v-model="formData.selectedCompanies" /> -->

            <!-- Deals Association 
          <div data-deals-dropdown>
            <label class="block text-sm font-medium text-dark-base mb-2">
              Deals Association
            </label>
            <div class="relative">
              <input
                v-model="formData.dealsSearch"
                type="text"
                placeholder="Search deals..."
                @click="toggleDealsDropdown"
                @input="filterDeals"
                class="w-full px-3 py-2 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
              />
              <ChevronDown
                :size="16"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none transition-transform duration-200"
                :class="{ 'rotate-180': showDealsDropdown }"
              />

              <!-- Dropdown 
              <div
                v-if="showDealsDropdown && filteredDeals.length > 0"
                class="absolute top-full left-0 right-0 mt-1 bg-white border border-outline rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
              >
                <div
                  v-for="deal in filteredDeals"
                  :key="deal.id"
                  @click="selectDeal(deal)"
                  class="px-3 py-2 hover:bg-light-base cursor-pointer text-sm text-dark-base"
                >
                  {{ deal.deal_name || deal.name || "Unnamed Deal" }}
                </div>
              </div>

              <!-- Empty State 
              <div
                v-if="
                  showDealsDropdown &&
                  filteredDeals.length === 0 &&
                  allDeals.length > 0
                "
                class="absolute top-full left-0 right-0 mt-1 bg-white border border-outline rounded-lg shadow-lg z-50 px-3 py-4 text-center"
              >
                <p class="text-sm text-sub-text">No deals found</p>
              </div>

              <!-- Loading/No Data State 
              <div
                v-if="showDealsDropdown && allDeals.length === 0"
                class="absolute top-full left-0 right-0 mt-1 bg-white border border-outline rounded-lg shadow-lg z-50 px-3 py-4 text-center"
              >
                <p class="text-sm text-sub-text">Loading deals...</p>
              </div>
            </div>

            <!-- Selected Deals 
            <div
              v-if="formData.selectedDeals.length > 0"
              class="mt-2 flex flex-wrap gap-2"
            >
              <span
                v-for="deal in formData.selectedDeals"
                :key="deal.id"
                class="bg-light-base px-2 py-1 rounded text-xs text-dark-base flex items-center gap-1"
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

            <button
              type="button"
              @click="showAddDealForm = true"
              class="mt-2 text-sm text-sub-text hover:text-dark-base font-medium flex items-center gap-1"
            >
              <Plus :size="16" />
              Add Another Deal
            </button>
          </div> -->
          </div>
        </form>
        <!-- Detail Tab -->
        <div v-if="activeTab === 'detail'" class="p-6 h-full flex flex-col">
          <HistoryDetail
            :items="historyitems"
            @add-note="openNoteDrawer()"
            @add-doc="openDocDrawer()"
            @edit="handleHistoryEdit"
            @delete="handleHistoryDelete"
          />
        </div>
      </div>

      <!-- Footer Actions (Sticky) -->
      <div
        class="bg-white flex items-center justify-between px-6 py-4 border-t border-outline shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        <button
          type="button"
          @click="handleReset"
          class="text-sm text-red font-medium hover:underline"
        >
          Reset
        </button>
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
            @click="handleSaveAll"
            :disabled="isSubmitting"
            class="px-6 py-2 bg-dark-base text-white rounded-lg hover:bg-dark-hover transition-colors text-sm font-medium flex items-center gap-2 min-w-25 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isSubmitting" :size="16" class="animate-spin" />
            <span>{{ isSubmitting ? "Saving..." : "Save" }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Add Company Form (stacked on top) -->
  <AddCompanyForm
    :isOpen="showAddCompanyForm"
    @close="showAddCompanyForm = false"
    @submit="showAddCompanyForm = false"
  />

  <!-- Add Deal Form (stacked on top)
  <AddDealForm
    :isOpen="showAddDealForm"
    @close="showAddDealForm = false"
    @submit="showAddDealForm = false"
  /> -->

  <!-- Contact Detail Form (Next step) -->
  <ContactDetailForm
    :isOpen="showDetailForm"
    :contactData="formData"
    @close="showDetailForm = false"
    @back="showDetailForm = false"
    @submit="
      showDetailForm = false;
      handleClose();
      handleReset();
    "
  />

  <!-- Note Drawer POPUP -->
  <Transition name="slide">
    <div
      v-if="isNoteDrawerOpen"
      class="fixed top-0 right-0 h-screen w-full max-w-2xl bg-white shadow-2xl z-[60] flex flex-col"
    >
      <div class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10">
        <h2 class="text-xl font-bold text-dark-base">
          {{ editingItemIndex !== null ? "Edit Note" : "Tambah Note" }}
        </h2>
        <button @click="isNoteDrawerOpen = false" class="p-2 hover:bg-light-base rounded-lg transition-colors">
          <X :size="20" class="text-sub-text" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <NotesSection v-model:note-data="tempNoteData" />
      </div>

      <div class="bg-white px-6 py-4 border-t border-outline flex justify-end gap-3">
        <button @click="isNoteDrawerOpen = false" class="px-6 py-2 border border-outline rounded-lg text-sm font-medium hover:bg-light-base">
          Cancel
        </button>
        <button @click="saveNoteFromDrawer" class="px-6 py-2 bg-dark-base text-white rounded-lg text-sm font-medium hover:bg-dark-hover">
          Simpan Ke Histori
        </button>
      </div>
    </div>
  </Transition>

  <!-- Docs Drawer POPUP -->
  <Transition name="slide">
    <div
      v-if="isDocDrawerOpen"
      class="fixed top-0 right-0 h-screen w-full max-w-2xl bg-white shadow-2xl z-[60] flex flex-col"
    >
      <div class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10">
        <h2 class="text-xl font-bold text-dark-base">
          {{ editingItemIndex !== null ? "Edit Document" : "Tambah Document" }}
        </h2>
        <button @click="isDocDrawerOpen = false" class="p-2 hover:bg-light-base rounded-lg transition-colors">
          <X :size="20" class="text-sub-text" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <DocsSection v-model="tempDocs" />
      </div>

      <div class="bg-white px-6 py-4 border-t border-outline flex justify-end gap-3">
        <button @click="isDocDrawerOpen = false" class="px-6 py-2 border border-outline rounded-lg text-sm font-medium hover:bg-light-base">
          Cancel
        </button>
        <button @click="saveDocFromDrawer" class="px-6 py-2 bg-dark-base text-white rounded-lg text-sm font-medium hover:bg-dark-hover">
          Simpan Ke Histori
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

/* Remove Browser Autofill Blue Background */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:active,
select:-webkit-autofill,
select:-webkit-autofill:hover,
select:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
  -webkit-text-fill-color: #1c2434 !important;
  transition: background-color 5000s ease-in-out 0s;
}

/* Preserve focus ring on autofilled inputs */
input:-webkit-autofill:focus,
select:-webkit-autofill:focus {
  -webkit-box-shadow:
    0 0 0 30px white inset,
    0 0 0 1px #64728b !important;
  -webkit-text-fill-color: #1c2434 !important;
}
</style>
