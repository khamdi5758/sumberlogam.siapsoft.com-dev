<script>
import { toast } from "vue3-toastify";
import {
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  MapPin,
  Camera,
  Mic,
  Search,
  Check,
} from "lucide-vue-next";

export default {
  name: "DetailDataDeals",
  components: {
    X,
    ChevronDown,
    ChevronRight,
    Plus,
    MapPin,
    Camera,
    Mic,
    Search,
    Check,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    isSubmitting: {
      type: Boolean,
      default: false,
    },
    deal: {
      type: Object,
      default: null,
    },
    dealData: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["close", "submit", "back"],
  data() {
    return {
      // Section toggles
      showNotes: true,
      showTasks: true,
      showDocs: true,

      // Notes
      noteContent: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",

      // Tasks
      taskName: "",
      taskContent: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      taskStatus: "",
      taskAssignee: "",
      taskDueDate: "",
      taskTime: "",
      taskPriority: "",
      taskAssociatedContact: "",

      // Docs
      docDescription: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      docFileSource: "",
      docDropdownOpen: false,
      selectedDocFiles: [],

      // Dropdowns
      isContactDropdownOpen: false,
      contactSearch: "",
      isCompanyDropdownOpen: false,
      companySearch: "",

      // Other state
      isFetching: false,
      isSavingDeal: false,
      localDealData: null,

      // Deal form data
      dealForm: {
        deal_name: "",
        pipeline: "",
        currency: "IDR",
        amount: "",
        expected_close_date: "",
        owner: "",
        priority: "",
        source: "",
        description: "",
        contact_association: [],
        companies_association: [],
      },

      // Options
      statusOptions: [
        { value: "", label: "Select Data" },
        { value: "todo", label: "To Do" },
        { value: "in_progress", label: "In Progress" },
        { value: "done", label: "Done" },
      ],

      priorityOptions: [
        { value: "", label: "Select Data" },
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
      ],

      fileSourceOptions: [
        { value: "", label: "Select File Source" },
        { value: "local", label: "Local File" },
        { value: "google_drive", label: "Google Drive" },
        { value: "dropbox", label: "Dropbox" },
      ],

      pipelineOptions: [
        { value: "", label: "Select Data" },
        { value: "prospect", label: "Prospect" },
        { value: "qualified", label: "Qualified" },
        { value: "offer", label: "Offer" },
        { value: "negotiation", label: "Negotiation" },
        { value: "closed_won", label: "Closed Won" },
        { value: "closed_lost", label: "Closed Lost" },
        { value: "closed_cancel", label: "Closed Cancel" },
      ],

      currencyOptions: [
        { value: "IDR", label: "IDR" },
        { value: "USD", label: "USD" },
        { value: "SGD", label: "SGD" },
        { value: "EUR", label: "EUR" },
      ],

      sourceOptions: [
        { value: "", label: "Select Data" },
        { value: "website", label: "Website" },
        { value: "referral", label: "Referral" },
        { value: "social_media", label: "Social Media" },
        { value: "email_campaign", label: "Email Campaign" },
        { value: "cold_call", label: "Cold Call" },
        { value: "other", label: "Other" },
      ],
    };
  },
  computed: {
    // Current signed in user

    // Contact options from store

    // Company options from store

    // Filtered contacts based on search
    filteredContacts() {
      if (!this.contactSearch)
        return this.contactOptions.filter((opt) => opt.value !== "");
      return this.contactOptions.filter(
        (c) =>
          c.label?.toLowerCase().includes(this.contactSearch.toLowerCase()) &&
          c.value !== "",
      );
    },

    // Filtered companies based on search
    filteredCompanies() {
      if (!this.companySearch)
        return this.companyOptions.filter((opt) => opt.value !== "");
      return this.companyOptions.filter(
        (c) =>
          c.label?.toLowerCase().includes(this.companySearch.toLowerCase()) &&
          c.value !== "",
      );
    },

    // Selected contacts for display
    selectedContacts() {
      if (!this.dealForm?.contact_association) return [];
      return this.contactOptions.filter((c) => {
        const contactId = String(c.value).trim();
        if (!contactId) return false;
        return this.dealForm.contact_association.some(
          (id) => String(id).trim() === contactId,
        );
      });
    },

    // Selected companies for display
    selectedCompanies() {
      if (!this.dealForm?.companies_association) return [];
      return this.companyOptions.filter((c) => {
        const companyId = String(c.value).trim();
        if (!companyId) return false;
        return this.dealForm.companies_association.some(
          (id) => String(id).trim() === companyId,
        );
      });
    },
  },
  watch: {
    // Watch deal ID to reset form
    "deal.id": {
      handler(newDealId, oldDealId) {
        if (newDealId && newDealId !== oldDealId) {
          this.resetForm();
          if (newDealId) {
            this.fetchFullDealDetails(newDealId);
          }
        }
      },
      immediate: true,
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
    this.loadReferenceData();
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    // Get deal payload from response
    getDealPayloadData(deal = null) {
      if (!deal) return null;
      if (Array.isArray(deal.deals) && deal.deals.length > 0) {
        return deal.deals[0];
      }
      return deal;
    },

    // Get display name from contact
    getDisplayNameFromContact(contact) {
      if (!contact) return "Unknown";
      return (
        `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
        contact.name ||
        contact.email ||
        "Unknown"
      );
    },

    // Check if value is non-empty association
    isNonEmptyAssociationValue(value) {
      return value !== "" && value !== null && value !== undefined;
    },

    // Build association candidates from multiple sources
    getAssociationCandidates(...values) {
      return values
        .flatMap((value) => {
          if (!this.isNonEmptyAssociationValue(value)) {
            return [];
          }

          if (Array.isArray(value)) {
            return this.getAssociationCandidates(...value);
          }

          if (typeof value === "object") {
            return [
              value.id,
              value.id_contact,
              value.id_contacts,
              value.id_company,
              value.id_companies,
              value.id_deal,
              value.id_deals,
              value.contact_id,
              value.contacts_id,
              value.company_id,
              value.companies_id,
              value.userid,
              value.id_user,
              value.value,
              value.contact,
              value.contact_name,
              value.company,
              value.company_name,
              value.name,
              value.label,
              ...(Array.isArray(value.contacts)
                ? this.getAssociationCandidates(value.contacts)
                : []),
              ...(Array.isArray(value.companies)
                ? this.getAssociationCandidates(value.companies)
                : []),
            ];
          }

          if (typeof value === "string") {
            return value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);
          }

          return [value];
        })
        .filter((candidate) => this.isNonEmptyAssociationValue(candidate));
    },

    // Resolve single association value
    resolveAssociationValue(candidates, options) {
      if (!Array.isArray(candidates) || !Array.isArray(options)) {
        return "";
      }

      for (const candidate of candidates) {
        const normalizedCandidate = String(candidate).trim().toLowerCase();
        if (!normalizedCandidate) continue;

        const matchedById = options.find((option) => {
          const optionValue = String(option.value ?? option.id ?? "")
            .trim()
            .toLowerCase();
          return optionValue === normalizedCandidate;
        });

        if (matchedById) {
          return matchedById.value ?? matchedById.id;
        }

        const matchedByLabel = options.find((option) => {
          return (
            String(option.label ?? option.name ?? "")
              .trim()
              .toLowerCase() === normalizedCandidate
          );
        });

        if (matchedByLabel) {
          return matchedByLabel.value ?? matchedByLabel.id;
        }
      }

      return "";
    },

    // Resolve multiple association values
    resolveAssociationValues(candidates, options) {
      if (!candidates || !Array.isArray(candidates) || !options) return [];

      return candidates
        .map((candidate) => {
          const normalizedCandidate = String(candidate).trim();
          if (!normalizedCandidate) return null;

          const matchedOption = options.find((option) => {
            const optId = String(option.value || "").trim();
            return optId === normalizedCandidate;
          });
          if (matchedOption) return String(matchedOption.value);

          const matchedByLabel = options.find((option) => {
            const label = String(option.label || "")
              .trim()
              .toLowerCase();
            return label === normalizedCandidate.toLowerCase();
          });
          return matchedByLabel ? String(matchedByLabel.value) : null;
        })
        .filter((v) => v !== null && v !== undefined);
    },

    // Resolve contact associations
    resolveContactAssociationValues(deal = null) {
      if (!deal) return [];
      const data = this.getDealPayloadData(deal);
      const candidates = this.getAssociationCandidates(
        this.dealForm.contact_association?.length > 0
          ? this.dealForm.contact_association
          : null,
        deal?.contactassoc,
        data?.contactassoc,
        deal?.contacts_id,
        data?.contacts_id,
        deal?.contact_id,
        data?.contact_id,
        deal?.id_contact,
        data?.id_contact,
        deal?.id_contacts,
        data?.id_contacts,
        deal?.contact_association,
        data?.contact_association,
        deal?.dealsassoc,
        data?.dealsassoc,
        deal?.userid,
        data?.userid,
        deal?.id_user,
        data?.id_user,
        deal?.contact,
        data?.contact,
        deal?.contacts,
        data?.contacts,
        deal?.contact_name,
        data?.contact_name,
      );

      return this.resolveAssociationValues(candidates, this.contactOptions);
    },

    // Resolve company associations
    resolveCompanyAssociationValues(deal = null) {
      if (!deal) return [];
      const data = this.getDealPayloadData(deal);
      const candidates = this.getAssociationCandidates(
        this.dealForm.companies_association?.length > 0
          ? this.dealForm.companies_association
          : null,
        deal?.companyassoc,
        data?.companyassoc,
        deal?.companies_id,
        data?.companies_id,
        deal?.company_id,
        data?.company_id,
        deal?.id_company,
        data?.id_company,
        deal?.id_companies,
        data?.id_companies,
        deal?.companies_association,
        data?.companies_association,
        deal?.company,
        data?.company,
        deal?.companies,
        data?.companies,
        deal?.company_name,
        data?.company_name,
        deal?.companies_name,
        data?.companies_name,
      );

      return this.resolveAssociationValues(candidates, this.companyOptions);
    },

    // Resolve user value
    resolveUserValue(candidate, options) {
      if (!candidate || !options) return "";
      const normalizedCandidate = String(candidate).trim().toLowerCase();

      const match = options.find(
        (opt) =>
          String(opt.value).trim().toLowerCase() === normalizedCandidate ||
          String(opt.label).trim().toLowerCase() === normalizedCandidate,
      );

      return match ? match.value : candidate;
    },

    // Sync additional data (notes, tasks, docs)
    syncAdditionalData(dealData) {
      if (!dealData) return;

      const data = this.getDealPayloadData(dealData);

      this.noteContent = data.notes || "";
      this.taskName = data.task_name || "";
      this.taskContent = data.desktask || data.task_content || "";
      this.taskStatus = data.status || data.statustask || "";
      this.taskAssignee = this.resolveUserValue(
        data.assignee,
        this.assigneeOptions,
      );
      this.taskDueDate = data.due_date || "";

      if (data.task_time) {
        this.taskTime = data.task_time.split(".")[0].substring(0, 5);
      } else {
        this.taskTime = "";
      }

      this.taskPriority = data.priority || data.prioritytask || "";
      this.taskAssociatedContact = this.resolveUserValue(
        data.associated_contact || data.associatedContact,
        this.contactOptions,
      );

      this.docDescription = data.docs || "";
    },

    // Normalize pipeline/stage value
    normalizePipelineValue(rawValue) {
      if (!rawValue) return "";
      const val = String(rawValue).toLowerCase();

      const dbToBoard = {
        new: "prospect",
        proposal: "offer",
        payment: "offer",
        negotiation: "negotiation",
        advanced: "negotiation",
        closed_won: "closed_won",
        closed_lost: "closed_lost",
        closed_cancel: "closed_cancel",
        won: "closed_won",
        lost: "closed_lost",
      };

      return dbToBoard[val] || val;
    },

    // Convert board stage to database pipeline
    boardStageToDbPipeline(boardStage) {
      if (!boardStage) return "";
      const val = String(boardStage).toLowerCase();

      const boardToDb = {
        prospect: "prospect",
        offer: "offer",
        negotiation: "negotiation",
        closed_won: "closed_won",
        closed_lost: "closed_lost",
        closed_cancel: "closed_cancel",
        won: "closed_won",
        lost: "closed_lost",
        advanced: "negotiation",
        payment: "offer",
      };

      return boardToDb[val] || boardStage;
    },

    // Normalize date format to yyyy-mm-dd
    normalizeDateValue(rawDate) {
      if (!rawDate || rawDate === "-") return "";

      const isoMatch = String(rawDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

      try {
        const date = new Date(rawDate);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        }
      } catch (e) {
        // ignore
      }

      return "";
    },

    // Normalize amount value
    normalizeAmountValue(rawAmount) {
      if (!rawAmount || rawAmount === "-") return "";

      const cleaned = String(rawAmount).replace(/[^\d.-]/g, "");
      const parsed = parseFloat(cleaned);

      return !isNaN(parsed) ? parsed : "";
    },

    // Get deal form defaults
    getDealFormDefaults(deal = null) {
      const data = this.getDealPayloadData(deal);

      return {
        deal_name: data?.deal_name || data?.dealName || data?.name || "",
        pipeline: this.normalizePipelineValue(
          data?.pipeline || data?.stage || "",
        ),
        currency: data?.currency || "IDR",
        amount: this.normalizeAmountValue(
          data?.amount || data?.amount_value || data?.jumlah || "",
        ),
        expected_close_date: this.normalizeDateValue(
          data?.expected_close_date ||
            data?.expectedCloseDate ||
            data?.tertanggal ||
            "",
        ),
        owner: data?.owner || data?.owner_name || "",
        priority: data?.priority || "",
        source: data?.source || "",
        description: data?.description || "",
        contact_association: this.resolveContactAssociationValues(deal),
        companies_association: this.resolveCompanyAssociationValues(deal),
      };
    },

    // Fetch full deal details
    async fetchFullDealDetails(id) {
      if (!id) return;
      this.isFetching = true;
      try {
        const data = await this.$store.dispatch("deals/fetchDealById", id);
        if (data) {
          const fullData = this.getDealPayloadData(data);
          this.localDealData = { ...this.localDealData, ...fullData };
          this.syncAdditionalData(fullData);
        }
      } catch (error) {
        console.error("Failed to fetch deal details:", error);
      } finally {
        this.isFetching = false;
      }
    },

    // Load reference data from store
    async loadReferenceData() {
      const requests = [];

      if (requests.length > 0) {
        await Promise.allSettled(requests);
      }
    },

    // Toggle contact selection
    toggleContact(contact) {
      const contactId = String(contact.value || contact.id).trim();
      const index = this.dealForm.contact_association.findIndex(
        (id) => String(id).trim() === contactId,
      );
      if (index === -1) {
        this.dealForm.contact_association.push(contactId);
      } else {
        this.dealForm.contact_association.splice(index, 1);
      }
    },

    // Check if contact is selected
    isContactSelected(id) {
      if (!this.dealForm?.contact_association) return false;
      const normalizedId = String(id).trim();
      return this.dealForm.contact_association.some(
        (assocId) => String(assocId).trim() === normalizedId,
      );
    },

    // Toggle company selection
    toggleCompany(company) {
      const companyId = String(company.value || company.id).trim();
      const index = this.dealForm.companies_association.findIndex(
        (id) => String(id).trim() === companyId,
      );
      if (index === -1) {
        this.dealForm.companies_association.push(companyId);
      } else {
        this.dealForm.companies_association.splice(index, 1);
      }
    },

    // Check if company is selected
    isCompanySelected(id) {
      if (!this.dealForm?.companies_association) return false;
      const normalizedId = String(id).trim();
      return this.dealForm.companies_association.some(
        (assocId) => String(assocId).trim() === normalizedId,
      );
    },

    // Handle click outside dropdown
    handleClickOutside(event) {
      if (
        this.$refs.contactDropdownRef &&
        !this.$refs.contactDropdownRef.contains(event.target)
      ) {
        this.isContactDropdownOpen = false;
      }
      if (
        this.$refs.companyDropdownRef &&
        !this.$refs.companyDropdownRef.contains(event.target)
      ) {
        this.isCompanyDropdownOpen = false;
      }
    },

    // Handle doc file change
    handleDocFileChange(e) {
      this.selectedDocFiles = Array.from(e.target.files);
    },

    // Remove doc file
    removeDocFile(index) {
      this.selectedDocFiles.splice(index, 1);
    },

    // Handle save
    async handleSave() {
      if (Object.keys(this.dealData || {}).length > 0) {
        this.isSavingDeal = true;
        try {
          const dealPayload = { ...this.dealData };
          console.log("Saving deal with payload:", dealPayload);

          await this.$store.dispatch("deals/createDeal", dealPayload);
          console.log("Deal saved successfully");
          toast.success("Deal saved successfully!");
        } catch (error) {
          console.error("Failed to save deal:", error);
          toast.error(
            "Failed to save deal: " +
              (error.response?.data?.message || error.message),
          );
          this.isSavingDeal = false;
          return;
        }
      }

      const dealDataForSubmit = {
        ...this.dealForm,
        pipeline: this.boardStageToDbPipeline(this.dealForm.pipeline),
        stage: this.boardStageToDbPipeline(this.dealForm.pipeline),
        contactassoc: (this.dealForm.contact_association || []).join(","),
        companyassoc: (this.dealForm.companies_association || []).join(","),
        contacts_id: (this.dealForm.contact_association || [])[0] || "",
        companies_id: (this.dealForm.companies_association || [])[0] || "",
      };

      this.$emit("submit", {
        deal: dealDataForSubmit,
        note: this.noteContent,
        task: {
          name: this.taskName,
          content: this.taskContent,
          status: this.taskStatus,
          assignee: this.taskAssignee,
          dueDate: this.taskDueDate,
          time: this.taskTime,
          priority: this.taskPriority,
          associatedContact: this.taskAssociatedContact,
        },
        docs: {
          description: this.docDescription,
          fileSource: this.docFileSource,
          files: this.selectedDocFiles,
        },
      });
      this.isSavingDeal = false;
    },

    // Reset form to defaults
    resetForm() {
      this.dealForm = this.getDealFormDefaults(this.deal);
      this.noteContent = "";
      this.taskName = "";
      this.taskContent = "";
      this.taskStatus = "";
      this.taskAssignee = "";
      this.taskDueDate = "";
      this.taskTime = "";
      this.taskPriority = "";
      this.taskAssociatedContact = "";
      this.docDescription = "";
      this.docFileSource = "";
      this.selectedDocFiles = [];
    },

    // Emit close event
    handleClose() {
      this.$emit("close");
    },

    // Emit back event
    handleBack() {
      this.$emit("back");
    },

    // Handle reset button
    handleReset() {
      this.resetForm();
    },
  },
};
</script>

<template>
  <!-- Overlay -->
  <Transition name="overlay">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-sub-text/80 z-40 transition-all duration-300"
      @click="handleClose"
    ></div>
  </Transition>

  <!-- Slide Panel -->
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
        <h2 class="text-xl font-bold text-main-text">
          {{ deal ? "Deal Details" : "Add Deal / Details" }}
        </h2>
        <button
          @click="handleClose"
          :disabled="isSubmitting"
          class="p-2 hover:bg-light-base rounded-lg transition-colors"
        >
          <X :size="20" class="text-sub-text" />
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto min-h-0">
        <div class="p-6 pb-10 space-y-6">
          <!-- Deal Info Section -->
          <div class="border border-outline rounded-lg p-4 space-y-4">
            <h3 class="text-sm font-semibold text-main-text">Deal Info</h3>

            <!-- Deal Name -->
            <div>
              <label class="block text-sm font-medium text-main-text mb-2">
                Deal Name
              </label>
              <input
                v-model="dealForm.deal_name"
                type="text"
                class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
              />
            </div>

            <!-- Pipeline & Currency -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2">
                  Pipeline
                </label>
                <select
                  v-model="dealForm.pipeline"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
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
              <div>
                <label class="block text-sm font-medium text-main-text mb-2">
                  Currency
                </label>
                <select
                  v-model="dealForm.currency"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
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
            </div>

            <!-- Amount & Close Date -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2">
                  Amount
                </label>
                <input
                  v-model="dealForm.amount"
                  type="number"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-main-text mb-2">
                  Expected Close Date
                </label>
                <input
                  v-model="dealForm.expected_close_date"
                  type="date"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
            </div>

            <!-- Owner & Priority -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2">
                  Owner
                </label>
                <input
                  v-model="dealForm.owner"
                  type="text"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-main-text mb-2">
                  Priority
                </label>
                <select
                  v-model="dealForm.priority"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
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
            </div>

            <!-- Source & Description -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2">
                  Source
                </label>
                <select
                  v-model="dealForm.source"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
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

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-main-text mb-2">
                Description
              </label>
              <textarea
                v-model="dealForm.description"
                rows="3"
                class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm resize-none"
              ></textarea>
            </div>

            <!-- Contact Association -->
            <div class="relative" ref="contactDropdownRef">
              <label class="block text-sm font-medium text-main-text mb-2">
                Contact Association
              </label>
              <div
                @click="isContactDropdownOpen = !isContactDropdownOpen"
                class="w-full px-3 py-2 border border-outline rounded-lg flex flex-wrap gap-2 items-center cursor-pointer min-h-10.5 bg-white transition focus-within:ring-1 focus-within:ring-sub-text"
              >
                <span
                  v-for="contact in selectedContacts"
                  :key="contact.value"
                  class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1"
                >
                  {{ contact.label }}
                  <button
                    @click.stop="toggleContact(contact)"
                    class="hover:text-blue-900"
                  >
                    ✕
                  </button>
                </span>
                <input
                  v-model="contactSearch"
                  type="text"
                  placeholder="Search contacts..."
                  class="border-none outline-none mt-1 flex-1 min-w-32 text-sm"
                />
              </div>

              <!-- Contact Dropdown Menu -->
              <div
                v-if="isContactDropdownOpen"
                class="absolute z-50 w-full mt-1 bg-white border border-outline rounded-lg shadow-xl flex flex-col max-h-64 overflow-auto"
              >
                <button
                  v-for="contact in filteredContacts"
                  :key="contact.value"
                  @click="toggleContact(contact)"
                  class="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left text-sm"
                >
                  <input
                    type="checkbox"
                    :checked="isContactSelected(contact.value)"
                    class="w-4 h-4"
                  />
                  {{ contact.label }}
                </button>
              </div>
            </div>

            <!-- Company Association -->
            <div class="relative" ref="companyDropdownRef">
              <label class="block text-sm font-medium text-main-text mb-2">
                Companies Association
              </label>
              <div
                @click="isCompanyDropdownOpen = !isCompanyDropdownOpen"
                class="w-full px-3 py-2 border border-outline rounded-lg flex flex-wrap gap-2 items-center cursor-pointer min-h-10.5 bg-white transition focus-within:ring-1 focus-within:ring-sub-text"
              >
                <span
                  v-for="company in selectedCompanies"
                  :key="company.value"
                  class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1"
                >
                  {{ company.label }}
                  <button
                    @click.stop="toggleCompany(company)"
                    class="hover:text-green-900"
                  >
                    ✕
                  </button>
                </span>
                <input
                  v-model="companySearch"
                  type="text"
                  placeholder="Search companies..."
                  class="border-none outline-none mt-1 flex-1 min-w-32 text-sm"
                />
              </div>

              <!-- Company Dropdown Menu -->
              <div
                v-if="isCompanyDropdownOpen"
                class="absolute z-50 w-full mt-1 bg-white border border-outline rounded-lg shadow-xl flex flex-col max-h-64 overflow-auto"
              >
                <button
                  v-for="company in filteredCompanies"
                  :key="company.value"
                  @click="toggleCompany(company)"
                  class="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left text-sm"
                >
                  <input
                    type="checkbox"
                    :checked="isCompanySelected(company.value)"
                    class="w-4 h-4"
                  />
                  {{ company.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- NOTES SECTION -->
          <div>
            <button
              type="button"
              @click="showNotes = !showNotes"
              class="flex items-center gap-2 w-full text-left mb-3"
            >
              <ChevronRight
                :size="16"
                :class="{ 'rotate-90': showNotes }"
                class="text-sub-text transition"
              />
              <span class="text-sm font-semibold text-main-text">Notes</span>
            </button>

            <div
              v-if="showNotes"
              class="border border-outline rounded-lg overflow-hidden"
            >
              <textarea
                v-model="noteContent"
                placeholder="Tulis catatan..."
                rows="4"
                class="w-full px-4 py-3 border-none outline-none text-sm resize-none"
              ></textarea>
            </div>
          </div>

          <!-- TASKS SECTION -->
          <div>
            <button
              type="button"
              @click="showTasks = !showTasks"
              class="flex items-center gap-2 w-full text-left mb-3"
            >
              <ChevronRight
                :size="16"
                :class="{ 'rotate-90': showTasks }"
                class="text-sub-text transition"
              />
              <span class="text-sm font-semibold text-main-text">Tasks</span>
            </button>

            <div
              v-if="showTasks"
              class="border border-outline rounded-lg overflow-hidden space-y-0"
            >
              <!-- Task Name -->
              <div class="px-4 pt-4 pb-2">
                <label class="block text-sm font-medium text-main-text mb-2">
                  Task Name
                </label>
                <input
                  v-model="taskName"
                  type="text"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>

              <!-- Task Content -->
              <div class="px-4 pb-4">
                <label class="block text-sm font-medium text-main-text mb-2">
                  Description
                </label>
                <textarea
                  v-model="taskContent"
                  rows="3"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm resize-none"
                ></textarea>
              </div>

              <!-- Task Status -->
              <div class="px-4 pb-4">
                <label class="block text-sm font-medium text-main-text mb-2">
                  Status
                </label>
                <select
                  v-model="taskStatus"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
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

              <!-- Task Due Date & Time -->
              <div class="grid grid-cols-2 gap-4 px-4 pb-4">
                <div>
                  <label class="block text-sm font-medium text-main-text mb-2">
                    Due Date
                  </label>
                  <input
                    v-model="taskDueDate"
                    type="date"
                    class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-main-text mb-2">
                    Time
                  </label>
                  <input
                    v-model="taskTime"
                    type="time"
                    class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                  />
                </div>
              </div>

              <!-- Task Priority -->
              <div class="px-4 pb-4">
                <label class="block text-sm font-medium text-main-text mb-2">
                  Priority
                </label>
                <select
                  v-model="taskPriority"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
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
            </div>
          </div>

          <!-- DOCS SECTION -->
          <div>
            <button
              type="button"
              @click="showDocs = !showDocs"
              class="flex items-center gap-2 w-full text-left mb-3"
            >
              <ChevronRight
                :size="16"
                :class="{ 'rotate-90': showDocs }"
                class="text-sub-text transition"
              />
              <span class="text-sm font-semibold text-main-text"
                >Documents</span
              >
            </button>

            <div
              v-if="showDocs"
              class="border border-outline rounded-lg overflow-hidden"
            >
              <!-- Document Description -->
              <div class="px-4 pt-4 pb-2">
                <label class="block text-sm font-medium text-main-text mb-2">
                  Description
                </label>
              </div>
              <textarea
                v-model="docDescription"
                rows="3"
                placeholder="Deskripsi dokumen..."
                class="w-full px-4 pb-4 pt-0 border-none outline-none text-sm resize-none"
              ></textarea>

              <!-- File Source -->
              <div class="px-4 pb-4 border-t border-outline">
                <label class="block text-sm font-medium text-main-text mb-2">
                  File Source
                </label>
                <select
                  v-model="docFileSource"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                >
                  <option
                    v-for="opt in fileSourceOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <!-- File Upload -->
              <div class="px-4 pb-4">
                <label class="block text-sm font-medium text-main-text mb-2">
                  Upload Files
                </label>
                <input
                  type="file"
                  multiple
                  @change="handleDocFileChange"
                  class="w-full px-3 py-2 border border-outline rounded-lg text-sm"
                />
                <div v-if="selectedDocFiles.length > 0" class="mt-3 space-y-2">
                  <div
                    v-for="(file, index) in selectedDocFiles"
                    :key="index"
                    class="flex items-center justify-between bg-light-base p-2 rounded text-sm"
                  >
                    <span>{{ file.name }}</span>
                    <button
                      @click="removeDocFile(index)"
                      class="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="bg-white flex items-center justify-between px-6 py-4 border-t border-outline shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        <button
          type="button"
          @click="handleReset"
          :disabled="isSubmitting"
          class="text-sm text-red-600 font-medium hover:underline"
        >
          Reset
        </button>
        <div class="flex gap-3">
          <button
            type="button"
            @click="handleBack"
            :disabled="isSubmitting"
            class="px-4 py-2 text-sm font-medium text-sub-text hover:text-main-text transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            @click="handleSave"
            :disabled="isSubmitting"
            class="px-6 py-2 bg-dark-base hover:bg-dark-base/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? "Saving..." : "Save" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
