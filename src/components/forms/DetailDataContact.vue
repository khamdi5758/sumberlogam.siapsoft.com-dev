<script>
import { mapGetters } from "vuex";
import NotesSection from "@/components/widgets/NotesEditor.vue";
import DocsSection from "@/components/widgets/DocsEditor.vue";
import TaskSection from "@/components/widgets/TaskEditor.vue";
import LocationSelector from "./component/LocationSelector.vue";
import { X, ChevronDown, Plus, Search, Check, Loader2 } from "lucide-vue-next";

export default {
  name: "DetailDataContact",
  components: {
    DocsSection,
    NotesSection,
    TaskSection,
    LocationSelector,
    X,
    ChevronDown,
    Plus,
    Search,
    Check,
    Loader2,
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
    contact: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      isFetching: false,
      showNotes: true,
      showTasks: true,
      showDocs: true,
      noteContent: "",
      taskData: {
        name: "",
        content: "",
        status: "",
        assignee: "",
        dueDate: "",
        time: "",
        priority: "",
        associatedContact: "",
      },
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
      docsData: {
        description: "",
        fileSource: "",
        files: [],
      },
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
      contactForm: {
        first_name: "",
        last_name: "",
        job_title: "",
        id_owner: "",
        owner: "",
        email: "",
        status: "",
        type: "",
        telephone_1: "",
        telephone_2: "",
        address: "",
        city: "",
        province: "",
        country: "",
        pos_code: "",
        source: "",
        companyassoc: [],
        dealsassoc: [],
      },
      isCompanyDropdownOpen: false,
      companySearch: "",
      isDealDropdownOpen: false,
      dealSearch: "",
      statuses: [],
    };
  },
  computed: {
    ...mapGetters({
      allCompanies: "company/allcompany",
      allDeals: "deals/allDeals",
      allUsers: "users/allUsers",
      signedInUser: "users/usersignin",
    }),
    companyOptions() {
      return [
        { value: "", label: "Select Company" },
        ...(this.allCompanies || []).map((company) => ({
          value: company.id,
          label: company.company_name || company.name || "Unknown",
        })),
      ];
    },
    dealOptions() {
      return [
        { value: "", label: "Select Deal" },
        ...(this.allDeals || []).map((deal) => ({
          value: deal.id,
          label: deal.deal_name || deal.name || "Unknown",
        })),
      ];
    },
    assigneeOptions() {
      return [
        { value: "", label: "Select Data" },
        ...(this.allUsers || []).map((user) => ({
          value: user.id ?? "",
          label: user.name || user.username || "Unknown",
        })),
      ];
    },
    associatedWithOptions() {
      return [
        { value: "", label: "Select User" },
        ...(this.allUsers || []).map((user) => ({
          value: user.id ?? "",
          label: user.name || user.username || "Unknown",
        })),
      ];
    },
    currentUserName() {
      const user = this.signedInUser || this.$store.state.auth?.user || null;
      const fullName = [
        user?.first_name || user?.firstname,
        user?.last_name || user?.lastname,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      return user?.name || user?.username || fullName || "";
    },
    filteredCompanies() {
      if (!this.companySearch) {
        return this.companyOptions.filter((opt) => opt.value !== "");
      }
      return this.companyOptions
        .filter((opt) => opt.value !== "")
        .filter((c) =>
          c.label.toLowerCase().includes(this.companySearch.toLowerCase()),
        );
    },
    filteredDeals() {
      if (!this.dealSearch) {
        return this.dealOptions.filter((opt) => opt.value !== "");
      }
      return this.dealOptions
        .filter((opt) => opt.value !== "")
        .filter((d) =>
          d.label.toLowerCase().includes(this.dealSearch.toLowerCase()),
        );
    },
    selectedCompaniesList() {
      return this.companyOptions.filter((c) => {
        const companyId = String(c.value || c.id).trim();
        if (!companyId) return false;
        return this.contactForm.companyassoc.some(
          (id) => String(id).trim() === companyId,
        );
      });
    },
    selectedDealsList() {
      return this.dealOptions.filter((d) => {
        const dealId = String(d.value || d.id).trim();
        if (!dealId) return false;
        return this.contactForm.dealsassoc.some(
          (id) => String(id).trim() === dealId,
        );
      });
    },
  },
  watch: {
    contact: {
      handler(contact) {
        if (contact && contact.id) {
          this.contactForm = this.getContactFormDefaults(contact);
          this.syncAssociationValues(contact);
          this.syncAdditionalData(contact);
          this.fetchFullContactDetails(contact.id);
        }
      },
      immediate: true,
    },
    isOpen(val) {
      if (val) {
        this.fetchAssociationOptions();
        if (this.contact?.id) {
          this.fetchFullContactDetails(this.contact.id);
        }
      }
    },
    companyOptions() {
      this.syncAssociationValues();
      this.syncAdditionalData(this.contact);
    },
    dealOptions() {
      this.syncAssociationValues();
      this.syncAdditionalData(this.contact);
    },
    associatedWithOptions() {
      this.syncAssociationValues();
      this.syncAdditionalData(this.contact);
    },
    assigneeOptions() {
      this.syncAssociationValues();
      this.syncAdditionalData(this.contact);
    },
    currentUserName(name) {
      if (name) {
        if (!this.contactForm.owner) {
          this.contactForm.owner = name;
        }
        if (!this.contactForm.id_owner) {
          this.contactForm.id_owner = this.resolveUserValue(
            name,
            this.associatedWithOptions,
          );
        }
        if (!this.taskData.assignee) {
          this.taskData.assignee = this.resolveUserValue(
            name,
            this.assigneeOptions,
          );
        }
      }
    },
  },
  mounted() {
    this.fetchAssociationOptions();
    document.addEventListener("mousedown", this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  },
  methods: {
    getAssociationCandidates(value) {
      if (!value) return [];
      if (Array.isArray(value)) {
        return value
          .map((v) => {
            if (typeof v === "object" && v !== null) {
              return (
                v.id ??
                v.deal_id ??
                v.contact_id ??
                v.id_deal ??
                v.id_contact ??
                v.userid ??
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
              option.id ??
                option.value ??
                option.deal_id ??
                option.contact_id ??
                "",
            ).trim();
            return optId === normalizedCandidate;
          });
          if (matchedOption) return matchedOption.id || matchedOption.value;

          const matchedByLabel = options.find((option) => {
            const label = String(
              option.name ??
                option.deal_name ??
                option.company_name ??
                option.label ??
                "",
            )
              .trim()
              .toLowerCase();
            return label === normalizedCandidate.toLowerCase();
          });
          return matchedByLabel
            ? matchedByLabel.id || matchedByLabel.label || matchedByLabel.value
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
    resolveStatusId(candidate) {
      if (candidate === null || candidate === undefined || candidate === "") {
        return "";
      }

      const normalizedCandidate = String(candidate).trim().toLowerCase();
      if (!normalizedCandidate) return "";

      const numericCandidate = Number(normalizedCandidate);
      if (!Number.isNaN(numericCandidate)) {
        return numericCandidate;
      }

      const match = (this.statuses || []).find((statusItem) => {
        const statusName = String(statusItem?.name ?? "")
          .trim()
          .toLowerCase();
        return statusName === normalizedCandidate;
      });

      return match?.id ?? "";
    },
    getContactFormDefaults(contact = null) {
      const data =
        contact && contact.contacts && contact.contacts.length > 0
          ? contact.contacts[0]
          : contact;

      const companyCandidates = this.getAssociationCandidates(
        data?.companyassoc ||
          contact?.companyassoc ||
          data?.companiesAssociation ||
          data?.company_id ||
          data?.companies_id ||
          data?.company ||
          data?.company_name,
      );

      const dealsCandidates = this.getAssociationCandidates(
        data?.dealsassoc ||
          contact?.dealsassoc ||
          data?.dealsAssociation ||
          data?.deal_id ||
          data?.deals_id ||
          data?.deal ||
          data?.deal_name,
      );

      return {
        first_name: data?.first_name || "",
        last_name: data?.last_name || "",
        job_title: data?.job_title || "",
        id_owner:
          data?.id_owner ||
          data?.owner_id ||
          this.resolveUserValue(data?.owner, this.associatedWithOptions) ||
          "",
        owner: data?.owner || this.currentUserName || "",
        email: data?.email || "",
        status: this.resolveStatusId(data?.status),
        type: this.resolveStatusId(data?.type),
        telephone_1: data?.telephone_1 || "",
        telephone_2: data?.telephone_2 || "",
        address: data?.address || "",
        city: data?.city || "",
        province: data?.province || "",
        country: data?.country || "",
        pos_code: data?.pos_code || data?.posCode || "",
        source: data?.source || "",
        companyassoc: companyCandidates,
        dealsassoc: dealsCandidates,
      };
    },
    syncAssociationValues(contactData = this.contact) {
      if (!contactData) return;

      const data =
        contactData && contactData.contacts && contactData.contacts.length > 0
          ? contactData.contacts[0]
          : contactData;

      const dealsCandidates = this.getAssociationCandidates(
        this.contactForm.dealsassoc.length > 0
          ? this.contactForm.dealsassoc
          : contactData?.dealsassoc ||
              data?.dealsassoc ||
              data?.dealsAssociation ||
              data?.deal_id ||
              data?.deals_id ||
              data?.deal ||
              data?.deal_name,
      );

      const resolvedDeals = this.resolveAssociationValues(
        dealsCandidates,
        this.dealOptions,
      );
      if (resolvedDeals.length > 0) {
        this.contactForm.dealsassoc = resolvedDeals;
      } else if (dealsCandidates.length > 0) {
        this.contactForm.dealsassoc = dealsCandidates;
      }

      const companyCandidates = this.getAssociationCandidates(
        this.contactForm.companyassoc.length > 0
          ? this.contactForm.companyassoc
          : contactData?.companyassoc ||
              data?.companyassoc ||
              data?.companiesAssociation ||
              data?.company_id ||
              data?.companies_id ||
              data?.company ||
              data?.company_name,
      );

      const resolvedCompanies = this.resolveAssociationValues(
        companyCandidates,
        this.companyOptions,
      );
      if (resolvedCompanies.length > 0) {
        this.contactForm.companyassoc = resolvedCompanies;
      } else if (companyCandidates.length > 0) {
        this.contactForm.companyassoc = companyCandidates;
      }
    },
    syncAdditionalData(contactData) {
      if (!contactData) return;

      const data =
        contactData && contactData.contacts && contactData.contacts.length > 0
          ? contactData.contacts[0]
          : contactData;

      this.noteContent = data.notes || "";

      this.taskData = {
        name: data.task_name || "",
        content: data.desktask || data.task_content || "",
        status: data.status || data.statustask || "",
        assignee: this.resolveUserValue(data.assignee, this.assigneeOptions),
        dueDate: data.due_date || "",
        time: data.task_time
          ? data.task_time.split(".")[0].substring(0, 5)
          : "",
        priority: data.priority || data.prioritytask || "",
        associatedContact: this.resolveUserValue(
          data.associated_contact || data.associatedContact,
          this.associatedWithOptions,
        ),
      };

      this.docsData = {
        description: data.docs || "",
        fileSource: data.doc_file_source || "",
        files: [],
      };
    },
    async fetchFullContactDetails(id) {
      if (!id) return;
      this.isFetching = true;
      try {
        const data = await this.$store.dispatch(
          "contacts/fetchContactById",
          id,
        );
        if (data) {
          this.contactForm = this.getContactFormDefaults(data);
          this.syncAssociationValues(data);
          this.syncAdditionalData(data);
        }
      } catch (error) {
        console.error("Failed to fetch contact details:", error);
      } finally {
        this.isFetching = false;
      }
    },
    async fetchAssociationOptions() {
      await Promise.allSettled([
        this.$store.dispatch("users/getusersignin"),
        this.$store.dispatch("users/fetchAllusers"),
        this.$store.dispatch("company/fetchAllcompany"),
        this.$store.dispatch("deals/fetchAllDeals"),
        this.fetchStatuses(),
      ]);
    },
    async fetchStatuses() {
      try {
        // Fetch statuses from store or API
        this.statuses = (await this.$store.dispatch("getStatuses")) || [];
      } catch (error) {
        console.error("Failed to fetch statuses:", error);
      }
    },
    toggleCompany(company) {
      const companyId = String(company.value || company.id).trim();
      const index = this.contactForm.companyassoc.findIndex(
        (id) => String(id).trim() === companyId,
      );
      if (index === -1) {
        this.contactForm.companyassoc.push(companyId);
      } else {
        this.contactForm.companyassoc.splice(index, 1);
      }
    },
    isCompanySelected(id) {
      const normalizedId = String(id).trim();
      return this.contactForm.companyassoc.some(
        (assocId) => String(assocId).trim() === normalizedId,
      );
    },
    toggleDeal(deal) {
      const dealId = String(deal.value || deal.id).trim();
      const index = this.contactForm.dealsassoc.findIndex(
        (id) => String(id).trim() === dealId,
      );
      if (index === -1) {
        this.contactForm.dealsassoc.push(dealId);
      } else {
        this.contactForm.dealsassoc.splice(index, 1);
      }
    },
    isDealSelected(id) {
      const normalizedId = String(id).trim();
      return this.contactForm.dealsassoc.some(
        (assocId) => String(assocId).trim() === normalizedId,
      );
    },
    handleClickOutside(event) {
      const companyDropdownRef = this.$refs.companyDropdownRef;
      const dealDropdownRef = this.$refs.dealDropdownRef;

      if (companyDropdownRef && !companyDropdownRef.contains(event.target)) {
        this.isCompanyDropdownOpen = false;
      }
      if (dealDropdownRef && !dealDropdownRef.contains(event.target)) {
        this.isDealDropdownOpen = false;
      }
    },
    handleClose() {
      this.$emit("close");
    },
    handleBack() {
      this.$emit("back");
    },
    handleSave() {
      const submissionData = {
        ...this.contactForm,
        id: this.contact?.id,
        id_owner: this.contactForm.id_owner || "",
        type: this.contactForm.type || "",
        status: this.contactForm.status || "",
        companyassoc: (this.contactForm.companyassoc || []).join(","),
        dealsassoc: (this.contactForm.dealsassoc || []).join(","),
      };

      this.$emit("submit", {
        contact: submissionData,
        note: this.noteContent,
        task: this.taskData,
        docs: {
          description: this.docsData.description,
          fileSource: this.docsData.fileSource,
          files: this.docsData.files,
        },
      });
    },
    handleReset() {
      this.contactForm = this.getContactFormDefaults(this.contact);
      this.syncAssociationValues(this.contact);
      this.syncAdditionalData(this.contact);
      this.noteContent = "";
    },
  },
};
</script>

<template>
  <div>
    <!-- Overlay -->
    <transition name="overlay">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-sub-text/80 z-40 transition-all duration-300"
        @click="handleClose"
      ></div>
    </transition>

    <!-- Slide Panel -->
    <transition name="slide">
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
            {{ contact ? "Contact Details" : "Add Contact / Details" }}
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
        <div class="flex-1 overflow-y-auto min-h-0 relative">
          <!-- Loading Overlay -->
          <div
            v-if="isFetching"
            class="absolute inset-0 bg-white/60 z-20 flex items-center justify-center pointer-events-none"
          >
            <div class="flex flex-col items-center gap-2">
              <Loader2 class="w-8 h-8 animate-spin text-sub-text" />
              <span class="text-sm font-medium text-sub-text"
                >Loading details...</span
              >
            </div>
          </div>

          <div class="p-6 pb-10 space-y-6">
            <div class="space-y-4">
              <h3 class="text-sm font-semibold text-main-text">Contact Info</h3>

              <!-- First Name & Last Name -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-main-text mb-2">
                    First Name
                  </label>
                  <input
                    v-model="contactForm.first_name"
                    type="text"
                    placeholder="First Name"
                    class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-main-text mb-2">
                    Last Name
                  </label>
                  <input
                    v-model="contactForm.last_name"
                    type="text"
                    placeholder="Last Name"
                    class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                  />
                </div>
              </div>

              <!-- Job Title -->
              <div class="grid grid-cols-1 gap-4">
                <div>
                  <label class="block text-sm font-medium text-main-text mb-2">
                    Job Title
                  </label>
                  <input
                    v-model="contactForm.job_title"
                    type="text"
                    placeholder="Job Title"
                    class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                  />
                </div>
              </div>

              <!-- Email & Status -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-main-text mb-2">
                    Email
                  </label>
                  <input
                    v-model="contactForm.email"
                    type="email"
                    placeholder="youremail@gmail.com"
                    class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-main-text mb-2">
                    Status
                  </label>
                  <div class="relative">
                    <select
                      v-model.number="contactForm.status"
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

              <!-- Telephone -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-main-text mb-2">
                    Telephone 1
                  </label>
                  <input
                    v-model="contactForm.telephone_1"
                    type="text"
                    placeholder="Telephone 1"
                    class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-main-text mb-2">
                    Telephone 2
                  </label>
                  <input
                    v-model="contactForm.telephone_2"
                    type="text"
                    placeholder="Telephone 2"
                    class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                  />
                </div>
              </div>

              <LocationSelector v-model="contactForm" />

              <!-- Pos Code & Source -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-main-text mb-2">
                    Pos Code
                  </label>
                  <input
                    v-model="contactForm.pos_code"
                    type="text"
                    placeholder="Pos Code"
                    class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-main-text mb-2">
                    Source
                  </label>
                  <div class="relative">
                    <select
                      v-model="contactForm.source"
                      class="w-full px-3 py-2 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-main-text bg-white appearance-none cursor-pointer"
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

              <!-- Companies Association -->
              <div class="relative" ref="companyDropdownRef">
                <label class="block text-sm font-medium text-main-text mb-2">
                  Companies Association
                </label>
                <div
                  @click="isCompanyDropdownOpen = !isCompanyDropdownOpen"
                  class="w-full px-3 py-2 border border-outline rounded-lg flex flex-wrap gap-2 items-center cursor-pointer min-h-10.5 bg-white transition focus-within:ring-1 focus-within:ring-sub-text"
                >
                  <div
                    v-if="contactForm.companyassoc.length === 0"
                    class="text-gray-400 text-sm"
                  >
                    Search and select companies
                  </div>
                  <div
                    v-for="company in selectedCompaniesList"
                    :key="company.value"
                    class="flex items-center gap-1 bg-light-base px-2 py-1 rounded text-xs font-medium text-main-text border border-outline"
                    @click.stop
                  >
                    {{ company.label }}
                    <X
                      :size="12"
                      class="cursor-pointer hover:text-red"
                      @click="toggleCompany(company)"
                    />
                  </div>
                  <ChevronDown :size="16" class="ml-auto text-sub-text" />
                </div>

                <!-- Dropdown Menu -->
                <div
                  v-if="isCompanyDropdownOpen"
                  class="absolute z-50 w-full mt-1 bg-white border border-outline rounded-lg shadow-xl flex flex-col max-h-64"
                >
                  <div class="p-2 border-b border-outline">
                    <div class="relative">
                      <Search
                        :size="14"
                        class="absolute left-3 top-1/2 -translate-y-1/2 text-sub-text"
                      />
                      <input
                        v-model="companySearch"
                        type="text"
                        placeholder="Search by company name"
                        class="w-full pl-9 pr-3 py-2 bg-light-base/50 border border-outline rounded text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
                        @click.stop
                      />
                    </div>
                  </div>
                  <div class="flex-1 overflow-y-auto py-1">
                    <div
                      v-for="company in filteredCompanies"
                      :key="company.value"
                      @click="toggleCompany(company)"
                      class="px-4 py-2 hover:bg-light-base cursor-pointer flex items-center justify-between text-sm transition"
                    >
                      <span class="font-medium text-main-text">{{
                        company.label
                      }}</span>
                      <div
                        v-if="isCompanySelected(company.value)"
                        class="w-5 h-5 bg-dark-base rounded-full flex items-center justify-center"
                      >
                        <Check :size="12" class="text-white" />
                      </div>
                    </div>
                    <div
                      v-if="filteredCompanies.length === 0"
                      class="px-4 py-3 text-center text-sm text-sub-text italic"
                    >
                      No companies found
                    </div>
                  </div>
                </div>
              </div>

              <!-- Deals Association -->
              <div class="relative" ref="dealDropdownRef">
                <label class="block text-sm font-medium text-main-text mb-2">
                  Deals Association
                </label>
                <div
                  @click="isDealDropdownOpen = !isDealDropdownOpen"
                  class="w-full px-3 py-2 border border-outline rounded-lg flex flex-wrap gap-2 items-center cursor-pointer min-h-10.5 bg-white transition focus-within:ring-1 focus-within:ring-sub-text"
                >
                  <div
                    v-if="contactForm.dealsassoc.length === 0"
                    class="text-gray-400 text-sm"
                  >
                    Search and select deals
                  </div>
                  <div
                    v-for="deal in selectedDealsList"
                    :key="deal.value"
                    class="flex items-center gap-1 bg-light-base px-2 py-1 rounded text-xs font-medium text-main-text border border-outline"
                    @click.stop
                  >
                    {{ deal.label }}
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
                        placeholder="Search by deal name"
                        class="w-full pl-9 pr-3 py-2 bg-light-base/50 border border-outline rounded text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
                        @click.stop
                      />
                    </div>
                  </div>
                  <div class="flex-1 overflow-y-auto py-1">
                    <div
                      v-for="deal in filteredDeals"
                      :key="deal.value"
                      @click="toggleDeal(deal)"
                      class="px-4 py-2 hover:bg-light-base cursor-pointer flex items-center justify-between text-sm transition"
                    >
                      <span class="font-medium text-main-text">{{
                        deal.label
                      }}</span>
                      <div
                        v-if="isDealSelected(deal.value)"
                        class="w-5 h-5 bg-dark-base rounded-full flex items-center justify-center"
                      >
                        <Check :size="12" class="text-white" />
                      </div>
                    </div>
                    <div
                      v-if="filteredDeals.length === 0"
                      class="px-4 py-3 text-center text-sm text-sub-text italic"
                    >
                      No deals found
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
              v-model="taskData"
              :status-options="statusOptions"
              :priority-options="priorityOptions"
              :assignee-options="assigneeOptions"
              :is-open="showTasks"
            />

            <!-- DOCS SECTION -->
            <DocsSection v-model="docsData" :is-open="showDocs" />
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
                Save Contact
                <ChevronDown :size="16" />
              </template>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
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

/* Slide */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
