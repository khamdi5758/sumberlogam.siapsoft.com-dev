<script>
import { useStatuses } from "@/composables/useStatuses";
import LocationSelector from "./component/LocationSelector.vue";
import NotesSection from "@/components/widgets/NotesEditor.vue";
import TaskSection from "@/components/widgets/TaskEditor.vue";

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
  name: "DetailDataCompany",
  components: {
    LocationSelector,
    NotesSection,
    TaskSection,
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
    company: {
      type: Object,
      default: null,
    },
    companyData: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      statuses: [],
      companyForm: {
        company_name: "",
        company_owner: "",
        owner: "",
        description: "",
        email: "",
        telephone: "",
        website: "",
        industry: "",
        address: "",
        city: "",
        province: "",
        country: "",
        pos_code: "",
        source: "",
        type: "",
        dealsassoc: [],
        contactassoc: [],
      },
      // Section toggles
      showTasks: true,
      showDocs: true,

      // Notes
      noteContent: "",

      // Tasks
      taskName: "",
      taskContent: "",
      taskStatus: "",
      taskAssignee: "",
      taskDueDate: "",
      taskTime: "",
      taskPriority: "",
      taskAssociatedContact: "",

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

      // Docs
      docDescription: "",
      docFileSource: "",
      docDropdownOpen: false,
      selectedDocFiles: [],

      fileSourceOptions: [
        { value: "", label: "Select File Source" },
        { value: "local", label: "Local File" },
        { value: "google_drive", label: "Google Drive" },
        { value: "dropbox", label: "Dropbox" },
      ],

      industryOptions: [
        { value: "", label: "Select Industry" },
        { value: "technology", label: "Technology" },
        { value: "finance", label: "Finance" },
        { value: "healthcare", label: "Healthcare" },
        { value: "education", label: "Education" },
        { value: "retail", label: "Retail" },
        { value: "manufacturing", label: "Manufacturing" },
        { value: "consulting", label: "Consulting" },
        { value: "other", label: "Other" },
      ],

      sourceOptions: [
        { value: "", label: "Select Source" },
        { value: "website", label: "Website" },
        { value: "referral", label: "Referral" },
        { value: "social_media", label: "Social Media" },
        { value: "email_campaign", label: "Email Campaign" },
        { value: "cold_call", label: "Cold Call" },
        { value: "trade_show", label: "Trade Show" },
        { value: "partner", label: "Partner" },
        { value: "other", label: "Other" },
      ],

      // Dropdown State for Contacts
      isContactDropdownOpen: false,
      contactSearch: "",

      // Dropdown State for Deals
      isDealDropdownOpen: false,
      dealSearch: "",

      isSavingCompany: false,
      contactDropdownRef: null,
      dealDropdownRef: null,
      docDropdownRef: null,
    };
  },

  computed: {
    contactOptions() {
      return this.$store.getters["contacts/allContacts"] || [];
    },

    dealOptions() {
      return this.$store.getters["deals/allDeals"] || [];
    },

    typeDisplayName() {
      if (!this.companyForm.type) return "-";
      const typeStatus = this.statuses.find(
        (s) => s.id == this.companyForm.type,
      );
      return typeStatus ? typeStatus.name : this.companyForm.type;
    },

    assigneeOptions() {
      const users = this.$store.getters["users/allUsers"] || [];
      return [
        { value: "", label: "Select Data" },
        ...users.map((user) => ({
          value: user.name || user.username || user.id,
          label: user.name || user.username || "Unknown",
        })),
      ];
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

    associatedWithOptions() {
      const contacts = this.$store.getters["contacts/allContacts"] || [];
      return [
        { value: "", label: "Select Contact" },
        ...contacts.map((contact) => ({
          value: contact.id,
          label: this.getDisplayNameFromContact(contact),
        })),
      ];
    },

    filteredContacts() {
      if (!this.contactSearch) return this.contactOptions;
      return this.contactOptions.filter(
        (c) =>
          `${c.first_name} ${c.last_name}`
            .toLowerCase()
            .includes(this.contactSearch.toLowerCase()) ||
          c.email?.toLowerCase().includes(this.contactSearch.toLowerCase()),
      );
    },

    filteredDeals() {
      if (!this.dealSearch) return this.dealOptions;
      return this.dealOptions.filter((d) =>
        (d.deal_name || d.name)
          ?.toLowerCase()
          .includes(this.dealSearch.toLowerCase()),
      );
    },

    selectedContacts() {
      return this.contactOptions.filter((c) => {
        const contactId = String(c.id).trim();
        return this.companyForm.contactassoc.some(
          (id) => String(id).trim() === contactId,
        );
      });
    },

    selectedDeals() {
      return this.dealOptions.filter((d) => {
        const dealId = String(d.id).trim();
        return this.companyForm.dealsassoc.some(
          (id) => String(id).trim() === dealId,
        );
      });
    },
  },

  watch: {
    company: {
      handler(newCompany) {
        if (newCompany) {
          this.companyForm = this.getCompanyFormDefaults(newCompany);
          this.syncAssociationValues(newCompany);
          this.syncTaskAssociatedContact(newCompany);
          this.syncAdditionalData(newCompany);
        }
      },
      deep: true,
    },
    isOpen(isOpen) {
      if (isOpen) {
        this.fetchReferenceData();
      }
    },
    currentUserName: {
      handler(name) {
        if (name) {
          if (!this.companyForm.owner) {
            this.companyForm.owner = name;
          }
          if (!this.taskAssignee) {
            this.taskAssignee = this.resolveUserValue(
              name,
              this.assigneeOptions,
            );
          }
        }
      },
      immediate: true,
    },
    dealOptions() {
      this.syncAssociationValues();
      this.syncTaskAssociatedContact();
      this.syncAdditionalData(this.company);
    },
    contactOptions() {
      this.syncAssociationValues();
      this.syncTaskAssociatedContact();
      this.syncAdditionalData(this.company);
    },
    assigneeOptions() {
      this.syncAssociationValues();
      this.syncTaskAssociatedContact();
      this.syncAdditionalData(this.company);
    },
  },

  mounted() {
    document.addEventListener("mousedown", this.handleClickOutside);
    this.companyForm = this.getCompanyFormDefaults();
    this.initializeStatuses();
  },

  beforeDestroy() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  },

  methods: {
    async initializeStatuses() {
      const { statuses, fetchStatuses } = useStatuses();
      this.statuses = Array.isArray(statuses) ? statuses : statuses.value || [];
      await fetchStatuses();
    },

    async fetchReferenceData() {
      const promises = [];

      if (!this.$store.getters["users/usersignin"]) {
        promises.push(this.$store.dispatch("users/getusersignin"));
      }

      if ((this.$store.getters["users/allUsers"] || []).length === 0) {
        promises.push(this.$store.dispatch("users/fetchAllusers"));
      }
      if ((this.$store.getters["contacts/allContacts"] || []).length === 0) {
        promises.push(this.$store.dispatch("contacts/fetchAllContacts"));
      }
      if ((this.$store.getters["deals/allDeals"] || []).length === 0) {
        promises.push(this.$store.dispatch("deals/fetchAllDeals"));
      }

      const { fetchStatuses } = useStatuses();
      promises.push(fetchStatuses());

      if (promises.length > 0) {
        await Promise.allSettled(promises);
      }
    },

    getDisplayNameFromContact(contact) {
      if (!contact) return "Unknown";
      return (
        `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
        contact.name ||
        contact.email ||
        "Unknown"
      );
    },

    getDisplayNameFromDeal(deal) {
      if (!deal) return "Unknown";
      return deal.deal_name || deal.name || "Unknown";
    },

    getAssociationCandidates(value) {
      if (!value) return [];
      if (Array.isArray(value)) {
        return value
          .map((v) => {
            if (typeof v === "object" && v !== null) {
              return (
                v.id ||
                v.deal_id ||
                v.contact_id ||
                v.id_deal ||
                v.id_contact ||
                v.userid ||
                v.id_user
              );
            }
            return v;
          })
          .filter((v) => v !== "" && v !== null && v !== undefined);
      }
      if (typeof value === "string") {
        return value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [value];
    },

    resolveAssociationValues(candidates, options) {
      if (!candidates || !Array.isArray(candidates) || !options) return [];

      return candidates
        .map((candidate) => {
          const normalizedCandidate = String(candidate).trim();
          if (!normalizedCandidate) return null;

          const matchedOption = options.find((option) => {
            const optId = String(
              option.id ||
                option.value ||
                option.deal_id ||
                option.contact_id ||
                "",
            ).trim();
            return optId === normalizedCandidate;
          });
          if (matchedOption) return matchedOption.id || matchedOption.value;

          const matchedByLabel = options.find((option) => {
            const label = String(
              option.name || option.deal_name || option.label || "",
            )
              .trim()
              .toLowerCase();
            return label === normalizedCandidate.toLowerCase();
          });
          return matchedByLabel
            ? matchedByLabel.id || matchedByLabel.value
            : null;
        })
        .filter((v) => v !== null && v !== undefined);
    },

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

    getCompanyFormDefaults(company = null) {
      const data =
        company && company.companies && company.companies.length > 0
          ? company.companies[0]
          : company;

      const deals = this.getAssociationCandidates(
        (data && data.dealsassoc) ||
          (company && company.dealsassoc) ||
          (data && data.dealsAssociation) ||
          (data && data.deals_id) ||
          (data && data.deal_id) ||
          (data && data.deals) ||
          (data && data.deal),
      );

      const contacts = this.getAssociationCandidates(
        (data && data.contactassoc) ||
          (company && company.contactassoc) ||
          (data && data.contactAssociation) ||
          (data && data.contacts_id) ||
          (data && data.contact_id) ||
          (data && data.contact),
      );

      return {
        company_name: (data && data.company_name) || "",
        company_owner: (data && data.company_owner) || "",
        owner: (data && data.owner) || this.currentUserName || "",
        description: (data && data.description) || "",
        email: (data && data.email) || "",
        telephone: (data && data.telephone) || "",
        website: (data && data.website) || "",
        industry: (data && data.industry) || "",
        address: (data && data.address) || "",
        city: (data && data.city) || "",
        province: (data && data.province) || "",
        country: (data && data.country) || "",
        pos_code: (data && data.pos_code) || (data && data.posCode) || "",
        source: (data && data.source) || "",
        type:
          data && data.typeid
            ? Number(data.typeid)
            : data &&
                !isNaN(data.type) &&
                data.type !== "" &&
                data.type !== null
              ? Number(data.type)
              : "",
        dealsassoc: deals,
        contactassoc: contacts,
      };
    },

    syncTaskAssociatedContact(company = null) {
      company = company || this.company;
      const candidates = this.getAssociationCandidates(
        this.taskAssociatedContact ||
          (company && company.contactassoc) ||
          (company && company.contactAssociation) ||
          (company && company.contacts_id) ||
          (company && company.contact_id) ||
          (company && company.contact),
      );

      const resolved = this.resolveAssociationValues(
        candidates,
        this.associatedWithOptions,
      );
      this.taskAssociatedContact = resolved.length > 0 ? resolved[0] : "";
    },

    syncAssociationValues(company = null) {
      company = company || this.company;
      if (!company) {
        return;
      }

      const data =
        company && company.companies && company.companies.length > 0
          ? company.companies[0]
          : company;

      const dealsCandidates = this.getAssociationCandidates(
        this.companyForm.dealsassoc.length > 0
          ? this.companyForm.dealsassoc
          : (company && company.dealsassoc) ||
              (data && data.dealsassoc) ||
              (data && data.dealsAssociation) ||
              (data && data.deals_id) ||
              (data && data.deals) ||
              (data && data.deal_id) ||
              (data && data.deal),
      );

      this.companyForm.dealsassoc = this.resolveAssociationValues(
        dealsCandidates,
        this.dealOptions,
      );

      const contactCandidates = this.getAssociationCandidates(
        this.companyForm.contactassoc.length > 0
          ? this.companyForm.contactassoc
          : (company && company.contactassoc) ||
              (data && data.contactassoc) ||
              (data && data.contactAssociation) ||
              (data && data.contacts_id) ||
              (data && data.contact) ||
              (data && data.contact_id) ||
              (data && data.contact),
      );

      this.companyForm.contactassoc = this.resolveAssociationValues(
        contactCandidates,
        this.contactOptions,
      );
    },

    handleClickOutside(event) {
      if (
        this.contactDropdownRef &&
        !this.contactDropdownRef.contains(event.target)
      ) {
        this.isContactDropdownOpen = false;
      }
      if (
        this.dealDropdownRef &&
        !this.dealDropdownRef.contains(event.target)
      ) {
        this.isDealDropdownOpen = false;
      }
    },

    syncAdditionalData(company) {
      if (!company) return;

      const data =
        company && company.companies && company.companies.length > 0
          ? company.companies[0]
          : company;

      this.noteContent = (data && data.notes) || "";

      this.taskName = (data && data.task_name) || "";
      this.taskContent =
        (data && data.desktask) || (data && data.task_content) || "";
      this.taskStatus =
        (data && data.status) || (data && data.statustask) || "";
      this.taskAssignee = this.resolveUserValue(
        data && data.assignee,
        this.assigneeOptions,
      );
      this.taskDueDate = (data && data.due_date) || "";

      if (data && data.task_time) {
        this.taskTime = data.task_time.split(".")[0].substring(0, 5);
      } else {
        this.taskTime = "";
      }

      this.taskPriority =
        (data && data.priority) || (data && data.prioritytask) || "";

      this.docDescription = (data && data.docs) || "";
    },

    toggleContact(contact) {
      const contactId = String(contact.id).trim();
      const index = this.companyForm.contactassoc.findIndex(
        (id) => String(id).trim() === contactId,
      );
      if (index === -1) {
        this.companyForm.contactassoc.push(contactId);
      } else {
        this.companyForm.contactassoc.splice(index, 1);
      }
    },

    isContactSelected(id) {
      const normalizedId = String(id).trim();
      return this.companyForm.contactassoc.some(
        (assocId) => String(assocId).trim() === normalizedId,
      );
    },

    toggleDeal(deal) {
      const dealId = String(deal.id).trim();
      const index = this.companyForm.dealsassoc.findIndex(
        (id) => String(id).trim() === dealId,
      );
      if (index === -1) {
        this.companyForm.dealsassoc.push(dealId);
      } else {
        this.companyForm.dealsassoc.splice(index, 1);
      }
    },

    isDealSelected(id) {
      const normalizedId = String(id).trim();
      return this.companyForm.dealsassoc.some(
        (assocId) => String(assocId).trim() === normalizedId,
      );
    },

    handleDocFileChange(e) {
      this.selectedDocFiles = Array.from(e.target.files);
    },

    removeDocFile(index) {
      this.selectedDocFiles.splice(index, 1);
    },

    handleClose() {
      this.$emit("close");
    },

    handleBack() {
      this.$emit("back");
    },

    async handleSave() {
      if (Object.keys(this.companyData || {}).length > 0) {
        this.isSavingCompany = true;
        try {
          const companyPayload = {
            ...this.companyData,
            dealsassoc: this.companyData.dealsassoc
              ? [this.companyData.dealsassoc]
              : [],
            contactassoc: this.companyData.contactassoc
              ? [this.companyData.contactassoc]
              : [],
          };

          console.log("Saving company with payload:", companyPayload);

          const response = await this.$store.dispatch(
            "companies/createOrUpdateCompany",
            companyPayload,
          );

          console.log("Company saved successfully:", response);
          success("Company saved successfully!");
        } catch (error) {
          console.error("Failed to save company:", error);
          error(
            "Failed to save company: " +
              (error.response?.data?.message || error.message),
          );
          this.isSavingCompany = false;
          return;
        }
      }

      const submissionData = {
        ...this.companyForm,
        id: this.company?.id,
        dealsassoc: (this.companyForm.dealsassoc || []).join(","),
        contactassoc: (this.companyForm.contactassoc || []).join(","),
      };

      this.$emit("submit", {
        company: submissionData,
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
        //docs: {
        //  description: this.docDescription,
        //  fileSource: this.docFileSource,
        //  files: this.selectedDocFiles,
        //},

        docs: this.docD,
      });
      this.isSavingCompany = false;
    },

    handleReset() {
      this.companyForm = this.getCompanyFormDefaults(this.company);
      this.syncAdditionalData(this.company);
      this.syncTaskAssociatedContact(this.company);
      this.docFileSource = "";
      this.selectedDocFiles = [];
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
          {{ company ? "Company Details" : "Add Contact / Details" }}
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
          <div class="border border-outline rounded-lg p-4 space-y-4">
            <h3 class="text-sm font-semibold text-main-text">Company Info</h3>

            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Company Name</label
                >
                <input
                  v-model="companyForm.company_name"
                  type="text"
                  placeholder="Ex Siap Soft"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-main-text mb-2"
                >Description</label
              >
              <textarea
                v-model="companyForm.description"
                rows="3"
                placeholder="Ex Lorem ipsum dolor sit"
                class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm resize-none"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Email</label
                >
                <input
                  v-model="companyForm.email"
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
                  v-model="companyForm.telephone"
                  type="text"
                  placeholder="Ex +628234567891"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Website</label
                >
                <input
                  v-model="companyForm.website"
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
                  v-model="companyForm.industry"
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

            <LocationSelector v-model="companyForm" />

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Pos Code</label
                >
                <input
                  v-model="companyForm.pos_code"
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
                  v-model="companyForm.source"
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

            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Type</label
                >
                <div class="relative">
                  <select
                    v-model.number="companyForm.type"
                    class="w-full px-3 py-2 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-main-text bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled selected>Select Type</option>
                    <option
                      v-for="status in statuses || []"
                      :key="status.id"
                      :value="Number(status.id) || ''"
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

            <div class="relative" ref="dealDropdownRef">
              <label class="block text-sm font-medium text-main-text mb-2"
                >Deals Association</label
              >
              <div
                @click="isDealDropdownOpen = !isDealDropdownOpen"
                class="w-full px-3 py-2 border border-outline rounded-lg flex flex-wrap gap-2 items-center cursor-pointer min-h-10.5 bg-white transition focus-within:ring-1 focus-within:ring-sub-text"
              >
                <div
                  v-if="companyForm.dealsassoc.length === 0"
                  class="text-gray-400 text-sm"
                >
                  Search and select deals
                </div>
                <div
                  v-for="deal in selectedDeals"
                  :key="deal.id"
                  class="flex items-center gap-1 bg-light-base px-2 py-1 rounded text-xs font-medium text-main-text border border-outline"
                  @click.stop
                >
                  {{ getDisplayNameFromDeal(deal) }}
                  <X
                    :size="12"
                    class="cursor-pointer hover:text-red"
                    @click="toggleDeal(deal)"
                  />
                </div>
                <ChevronDown :size="16" class="ml-auto text-sub-text" />
              </div>

              <!-- Dropdown Menu -->
              <div
                v-if="isDealDropdownOpen"
                class="absolute z-50 w-full mt-1 bg-white border border-outline rounded-lg shadow-xl flex flex-col max-h-64"
              >
                <div class="p-2 border-b border-outline">
                  <div class="relative">
                    <Search
                      :size="14"
                      class="absolute left-3 top-1/2 -translate-y-1/2 text-sub-text"
                    />
                    <input
                      v-model="dealSearch"
                      type="text"
                      placeholder="Search deals"
                      class="w-full pl-9 pr-3 py-2 bg-light-base/50 border border-outline rounded text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
                      @click.stop
                    />
                  </div>
                </div>
                <div class="flex-1 overflow-y-auto py-1">
                  <div
                    v-for="deal in filteredDeals"
                    :key="deal.id"
                    @click="toggleDeal(deal)"
                    class="px-4 py-2 hover:bg-light-base cursor-pointer flex items-center justify-between text-sm transition"
                  >
                    <div class="flex flex-col">
                      <span class="font-medium text-main-text">{{
                        getDisplayNameFromDeal(deal)
                      }}</span>
                      <span class="text-xs text-sub-text">{{
                        deal.description || "No description"
                      }}</span>
                    </div>
                    <div
                      v-if="isDealSelected(deal.id)"
                      class="w-5 h-5 bg-dark-base rounded-full flex items-center justify-center"
                    >
                      <Check :size="12" class="text-white" />
                    </div>
                  </div>
                  <div
                    v-if="filteredDeals.length === 0"
                    class="px-4 py-6 text-center text-sm text-sub-text"
                  >
                    No deals found
                  </div>
                </div>
              </div>
            </div>

            <div class="relative" ref="contactDropdownRef">
              <label class="block text-sm font-medium text-main-text mb-2"
                >Contact Association</label
              >
              <div
                @click="isContactDropdownOpen = !isContactDropdownOpen"
                class="w-full px-3 py-2 border border-outline rounded-lg flex flex-wrap gap-2 items-center cursor-pointer min-h-10.5 bg-white transition focus-within:ring-1 focus-within:ring-sub-text"
              >
                <div
                  v-if="companyForm.contactassoc.length === 0"
                  class="text-gray-400 text-sm"
                >
                  Search and select contacts
                </div>
                <div
                  v-for="contact in selectedContacts"
                  :key="contact.id"
                  class="flex items-center gap-1 bg-light-base px-2 py-1 rounded text-xs font-medium text-main-text border border-outline"
                  @click.stop
                >
                  {{ getDisplayNameFromContact(contact) }}
                  <X
                    :size="12"
                    class="cursor-pointer hover:text-red"
                    @click="toggleContact(contact)"
                  />
                </div>
                <ChevronDown :size="16" class="ml-auto text-sub-text" />
              </div>

              <!-- Dropdown Menu -->
              <div
                v-if="isContactDropdownOpen"
                class="absolute z-50 w-full mt-1 bg-white border border-outline rounded-lg shadow-xl flex flex-col max-h-64"
              >
                <div class="p-2 border-b border-outline">
                  <div class="relative">
                    <Search
                      :size="14"
                      class="absolute left-3 top-1/2 -translate-y-1/2 text-sub-text"
                    />
                    <input
                      v-model="contactSearch"
                      type="text"
                      placeholder="Search by name or email"
                      class="w-full pl-9 pr-3 py-2 bg-light-base/50 border border-outline rounded text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
                      @click.stop
                    />
                  </div>
                </div>
                <div class="flex-1 overflow-y-auto py-1">
                  <div
                    v-for="contact in filteredContacts"
                    :key="contact.id"
                    @click="toggleContact(contact)"
                    class="px-4 py-2 hover:bg-light-base cursor-pointer flex items-center justify-between text-sm transition"
                  >
                    <div class="flex flex-col">
                      <span class="font-medium text-main-text">{{
                        getDisplayNameFromContact(contact)
                      }}</span>
                      <span class="text-xs text-sub-text">{{
                        contact.email
                      }}</span>
                    </div>
                    <div
                      v-if="isContactSelected(contact.id)"
                      class="w-5 h-5 bg-dark-base rounded-full flex items-center justify-center"
                    >
                      <Check :size="12" class="text-white" />
                    </div>
                  </div>
                  <div
                    v-if="filteredContacts.length === 0"
                    class="px-4 py-6 text-center text-sm text-sub-text"
                  >
                    No contacts found
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- NOTES SECTION -->
          <NotesSection
            v-model="noteContent"
            title="Notes"
            placeholder="Tulis catatan..."
            :rows="5"
            :isOpen="true"
          />

          <!-- TASKS SECTION -->
          <TaskSection
            :task-name="taskName"
            :task-content="taskContent"
            :task-status="taskStatus"
            :task-assignee="taskAssignee"
            :task-due-date="taskDueDate"
            :task-time="taskTime"
            :task-priority="taskPriority"
            :status-options="statusOptions"
            :priority-options="priorityOptions"
            :assignee-options="assigneeOptions"
            :is-open="showTasks"
            @update:task-name="taskName = $event"
            @update:task-content="taskContent = $event"
            @update:task-status="taskStatus = $event"
            @update:task-assignee="taskAssignee = $event"
            @update:task-due-date="taskDueDate = $event"
            @update:task-time="taskTime = $event"
            @update:task-priority="taskPriority = $event"
          />

          <!-- DOCS SECTION -->
          <div>
            <button
              type="button"
              @click="showDocs = !showDocs"
              class="flex items-center gap-2 w-full text-left mb-3"
            >
              <component
                :is="showDocs ? ChevronDown : ChevronRight"
                :size="16"
                class="text-sub-text"
              />
              <span
                class="text-sm font-semibold text-main-text flex items-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                  />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Docs
              </span>
            </button>

            <div
              v-if="showDocs"
              class="border border-outline rounded-lg overflow-hidden"
            >
              <!-- Desc of Docs label -->
              <div class="px-4 pt-4 pb-2">
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Desc of Docs</label
                >
              </div>
              <!-- Toolbar -->
              <div
                class="flex items-center gap-1 px-3 py-2 border-t border-b border-outline bg-light-base flex-wrap mx-4"
              >
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-sub-text text-xs"
                >
                  ↩
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-sub-text text-xs"
                >
                  ↪
                </button>
                <span class="text-outline mx-1">|</span>
                <select
                  class="text-xs border-none bg-transparent text-sub-text focus:outline-none"
                >
                  <option>Format</option>
                  <option>Heading 1</option>
                  <option>Paragraph</option>
                </select>
                <span class="text-outline mx-1">|</span>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded font-bold text-xs text-sub-text"
                >
                  B
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded italic text-xs text-sub-text"
                >
                  I
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded underline text-xs text-sub-text"
                >
                  U
                </button>
                <span class="text-outline mx-1">|</span>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  📷
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ⚔
                </button>
                <span class="text-outline mx-1">|</span>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ≡
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ≡
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ≡
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ≡
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ☰
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ☰
                </button>
              </div>
              <textarea
                v-model="docDescription"
                rows="5"
                class="w-full px-4 py-3 text-sm text-sub-text focus:outline-none resize-none"
                placeholder="Deskripsi dokumen..."
              ></textarea>

              <!-- Documents -->
              <div class="px-4 pb-4 border-t border-outline pt-4">
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Documents</label
                >
                <!-- Custom dropup -->
                <div class="relative" ref="docDropdownRef">
                  <button
                    type="button"
                    @click="docDropdownOpen = !docDropdownOpen"
                    class="w-full flex items-center justify-between px-3 py-2 border border-outline rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-sub-text"
                  >
                    <span
                      :class="
                        docFileSource ? 'text-main-text' : 'text-gray-400'
                      "
                    >
                      {{
                        fileSourceOptions.find((o) => o.value === docFileSource)
                          ?.label || "Select File Source"
                      }}
                    </span>
                    <svg
                      class="w-4 h-4 text-sub-text transition-transform"
                      :class="docDropdownOpen ? 'rotate-180' : ''"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <!-- Dropdown list -->
                  <ul
                    v-if="docDropdownOpen"
                    class="absolute bottom-full left-0 right-0 mb-1 bg-white border border-outline rounded-lg shadow-lg z-50 overflow-hidden"
                  >
                    <li
                      v-for="opt in fileSourceOptions"
                      :key="opt.value"
                      @click="
                        docFileSource = opt.value;
                        docDropdownOpen = false;
                      "
                      class="px-3 py-2 text-sm cursor-pointer hover:bg-light-base"
                      :class="
                        docFileSource === opt.value
                          ? 'text-sub-text font-medium bg-light-base'
                          : 'text-main-text'
                      "
                    >
                      {{ opt.label }}
                    </li>
                  </ul>
                </div>

                <!-- Local file picker -->
                <div v-if="docFileSource === 'local'" class="mt-3">
                  <label
                    class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-outline rounded-lg cursor-pointer hover:bg-light-base transition-colors"
                  >
                    <div class="flex flex-col items-center gap-1 text-sub-text">
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
                      @change="handleDocFileChange"
                    />
                  </label>
                  <ul v-if="selectedDocFiles.length" class="mt-2 space-y-1">
                    <li
                      v-for="(file, i) in selectedDocFiles"
                      :key="i"
                      class="flex items-center justify-between text-xs px-3 py-1.5 bg-light-base rounded-lg"
                    >
                      <span class="truncate text-main-text">{{
                        file.name
                      }}</span>
                      <button
                        type="button"
                        @click="removeDocFile(i)"
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
          class="text-sm text-red font-medium hover:underline"
        >
          Reset
        </button>
        <div class="flex gap-3">
          <button
            type="button"
            @click="handleBack"
            :disabled="isSubmitting"
            class="px-6 py-2 border border-outline rounded-lg text-sub-text hover:bg-light-base transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleSave"
            :disabled="isSubmitting"
            class="flex items-center gap-2 px-5 py-2 bg-dark-base text-white rounded-lg hover:bg-dark-hover transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <template v-if="isSubmitting">
              <span
                class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
              ></span>
              <span>Saving...</span>
            </template>
            <template v-else>
              Save Company
              <ChevronDown :size="16" />
            </template>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Overlay */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Custom scrollbar for dropdown */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

/* Slide from right */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
