<script>
import { useStore, mapGetters, mapState, mapActions } from "vuex";
import {
  X,
  Plus,
  ChevronDown,
  Paperclip,
  Search,
  Check,
  PackageIcon,
  User,
  CalendarDays,
  Pencil,
  Trash2,
} from "lucide-vue-next";
import AddCompanyForm from "./AddCompanyForm.vue";
import AddContactQuickForm from "./AddContactQuickForm.vue";
import { alertService } from "@/services/alertService";
import CompaniesAssociationForm from "./assoc/companies.vue";
import DealsAssociationForm from "./assoc/deals.vue";
import CreateProjectForm from "./CreateProjectForm.vue";
import NotesSection from "@/components/widgets/NotesEditor.vue";
import DocsSection from "@/components/widgets/DocsEditor.vue";
import TaskSection from "@/components/widgets/TaskEditor.vue";
import HistoryDetail from "@/components/widgets/historydetail.vue";
import ContactAssociationForm from "./assoc/contacts.vue";

export default {
  components: {
    X,
    Plus,
    ChevronDown,
    Paperclip,
    Search,
    Check,
    PackageIcon,
    AddCompanyForm,
    AddContactQuickForm,
    CompaniesAssociationForm,
    DealsAssociationForm,
    NotesSection,
    DocsSection,
    TaskSection,
    HistoryDetail,
    CreateProjectForm,
    ContactAssociationForm,
    User,
    CalendarDays,
    Pencil,
    Trash2,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    initialData: {
      type: Object,
      default: null,
    },
    companys_id: {
      type: Number,
      default: null,
    },
    contact_id: {
      type: [Number, String],
      default: null,
    },
    fromPage: {
      type: String,
      default: null,
    },
    hideDetailTab: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close", "submit", "back"],
  data() {
    return {
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
      priorityOptions: [
        { value: "", label: "Select Data" },
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
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
      docSourceOptions: [
        { value: "", label: "Select File Source" },
        { value: "local", label: "Local File" },
        { value: "google_drive", label: "Google Drive" },
        { value: "dropbox", label: "Dropbox" },
        { value: "onedrive", label: "OneDrive" },
      ],
      customSource: "",
      dealNameInput: null,
      showOptional: false,
      showAddCompanyForm: false,
      showAddContactQuickForm: false,
      showCreateProjectForm: false,
      selectedProject: null,
      dealProjects: [],
      showProjectModal: false,
      projectModalForm: {
        dealassoc: [],
      },
      isSavingBeforeDetail: false,
      contactSearch: "",
      companySearch: "",
      isContactDropdownOpen: false,
      isCompanyDropdownOpen: false,
      selectedDocSource: "",
      isDocDropdownOpen: false,
      // When true, show Projects/Notes tabs even if not in edit mode
      forceShowDetails: false,
      formData: {
        id: null,
        dealName: "",
        pipeline: "",
        currency: "IDR",
        amount: "",
        expectedCloseDate: "",
        owner: "",
        priority: "",
        source: "",
        description: "",
        documents: null,
        owner_id: null,
        contact_id: null,
        company_id: null,
        contactassoc: [],
        companyassoc: [],
        probability: null,
        status: 1,
        task: {
          name: "",
          content: "",
          dueDate: "",
          time: "",
          status: "",
          priority: "",
        },
        //docs: [],
        docs: {
          description: "",
          fileSource: "",
          files: [],
        },
        noteData: {
          body: "",
          gps_address: null,
          latitude: null,
          longitude: null,
          photos: [], // [{ id, src (base64), file (File object) }]
          audioBlob: null, // Blob audio
        },
      },
      activeTab: "master",
      noteContent: "",
      statusOptions: [
        { value: "", label: "Select Data" },
        { value: "todo", label: "To Do" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
      ],

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
    ...mapGetters("users", ["usersignin"]),
    ...mapGetters("contacts", ["allContacts"]),
    ...mapGetters("company", ["allcompany"]),
    ...mapGetters("project", ["allProjects"]),
    ...mapGetters({
      getsources: "deals/getsources",
      getpipelines: "deals/getpipelines",
      getpriority: "deals/getpriority",
      getusers: "deals/getusers",
      getcompany: "deals/getcompany",
      getcontact: "deals/getcontact",
    }),
    ...mapGetters("history", ["history"]),
    ...mapState("auth", { authUser: "user" }),
    currentUserName() {
      const signedInUser = this.usersignin || this.authUser || null;
      const fullName = [
        signedInUser?.first_name || signedInUser?.firstname,
        signedInUser?.last_name || signedInUser?.lastname,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      return signedInUser?.name || signedInUser?.username || fullName || "";
    },
    currentUserId() {
      const signedInUser = this.usersignin || this.authUser || null;
      return (
        signedInUser?.id || signedInUser?.id_user || signedInUser?.value || null
      );
    },
    isEditMode() {
      return !!(this.initialData && Object.keys(this.initialData).length);
    },

    hascompanycontact() {},

    tempCompanyAssoc: {
      get() {
        return this.formData.companyassoc || [];
      },
      set(val) {
        this.formData.companyassoc = val;
      },
    },

    tempCompanyObjects() {
      // Prioritaskan data asosiasi lengkap jika ada
      const deal = this.initialData?.deals?.[0] || this.initialData || {};
      const rawAssoc = this.initialData?.companyassoc || this.initialData?.companiesassoc || deal.companyassoc || deal.companiesassoc;
      
      if (rawAssoc) {
        return this.normalizeAssocObjects(rawAssoc, 'company');
      }

      // Fallback untuk single company (backward compatibility)
      const id = deal.company_id || deal.id_company || deal.companies_id || deal.company;
      const name = deal.companynm || deal.company_name || deal.associated_company || deal.companies_name;
      if (id && name && !Array.isArray(id)) return [{ id: String(id), company_name: name }];
      
      return [];
    },
    tempContactObjects() {
      // Prioritaskan data asosiasi lengkap jika ada
      const deal = this.initialData?.deals?.[0] || this.initialData || {};
      const rawAssoc = this.initialData?.contactassoc || this.initialData?.contactsassoc || deal.contactassoc || deal.contactsassoc;

      if (rawAssoc) {
        return this.normalizeAssocObjects(rawAssoc, 'contact');
      }

      // Fallback untuk single contact (backward compatibility)
      const id = deal.contact_id || deal.id_contact || deal.contacts_id || deal.contact;
      const name = deal.contactnm || deal.contact_name || deal.associated_contact || deal.contact_name;
      if (id && name && !Array.isArray(id)) return [{ id: String(id), first_name: name, last_name: "" }];

      return [];
    },
    tempContactAssoc: {
      get() {
        return this.formData.contactassoc || [];
      },
      set(val) {
        this.formData.contactassoc = val;
      },
    },
    associatedProjects() {
      return this.dealProjects || [];
    },
    displayHistoryItems() {
      // Prioritaskan history dari store jika ada, gabungkan dengan local historyitems untuk data baru yang belum tersimpan
      const storeHistory = (this.history || []).map((h) => {
        const isNote = h.notes !== undefined || h.idnote !== undefined || h.type === 'note';
        return {
          ...h,
          id: h.idnote || h.id,
          idnote: h.idnote || h.id,
          type: h.type || (isNote ? "note" : "doc"),
          body: h.notes || h.body || h.descdocs || h.description || h.content || "",
          timestamp: h.created_at || h.update_at || h.timestamp,
        };
      });

      if (storeHistory.length > 0) {
        return storeHistory;
      }

      return this.historyitems;
    },
    ownerOptions() {
      const users = this.getusers || [];
      return users.map((u) => ({
        value: u.id || u.user_id || u.id_user || u.value || "",
        label: u.name || u.username || u.label || "Unknown",
      }));
    },
  },
  watch: {
    // isOpen: {
    //   immediate: true,
    //   handler(isOpen) {
    //     if (isOpen) {
    //       if (this.initialData) {
    //         this.setFormData(this.initialData);
    //         this.activeTab = "master";
    //       } else {
    //         this.handleReset();
    //         this.activeTab = "master";
    //       }
    //     }
    //   },
    // },
    isOpen: {
      immediate: true,
      handler(isOpen) {
        if (isOpen) {
          if (this.initialData) {
            this.setFormData(this.initialData);
            this.loadDealProjects();
          } else {
            this.handleReset();
            // Pastikan prop ter-apply setelah reset
            if (this.companys_id) this.formData.company_id = this.companys_id;
            if (this.contact_id) this.formData.contact_id = this.contact_id;
          }
          this.activeTab = "master";
        }
      },
    },
    initialData: {
      deep: true,
      handler(nextData) {
        // Tangani kasus data detail datang belakangan saat drawer sudah terbuka.
        if (!this.isOpen) return;

        if (nextData && Object.keys(nextData).length) {
          this.setFormData(nextData);
          this.loadDealProjects();
          this.activeTab = "master";
        } else {
          this.handleReset();
          this.activeTab = "master";
        }
      },
    },

    companys_id: {
      immediate: true,
      handler(val) {
        // Jangan override kalau sedang edit mode
        if (!this.isEditMode && val !== undefined && val !== null) {
          const sid = String(val).trim();
          this.formData.company_id = sid;
          // Pastikan juga masuk ke list asosiasi agar terkirim ke BE
          this.formData.companyassoc = [sid];
        }
      },
    },
    contact_id: {
      immediate: true,
      handler(val) {
        if (!this.isEditMode && val !== undefined && val !== null) {
          const sid = String(val).trim();
          this.formData.contact_id = sid;
          this.formData.contactassoc = [sid];
        }
      },
    },
  },
  mounted() {
    this.applyDefaultOwner();
    document.addEventListener("click", this.handleClickOutside);

    if (!this.getsources || this.getsources.length === 0) {
      this.fetchsources({});
    }

    if (!this.getpipelines || this.getpipelines.length === 0) {
      this.fetchpipelines({});
    }

    if (!this.getpriority || this.getpriority.length === 0) {
      this.fetchpriority({});
    }

    if (!this.getusers || this.getusers.length === 0) {
      this.fetchusers({});
    }

    if (!this.getcompany || this.getcompany.length === 0) {
      this.fetchcompany({});
    }

    if (!this.getcontact || this.getcontact.length === 0) {
      this.fetchcontact({});
    }

    this.fetchAllProjects();
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  methods: {
    ...mapActions({
      createDeal: "deals/createDeal",
      fetchsources: "deals/fetchsources",
      fetchpipelines: "deals/fetchpipelines",
      fetchpriority: "deals/fetchpriority",
      fetchusers: "deals/fetchusers",
      fetchcompany: "deals/fetchcompany",
      fetchcontact: "deals/fetchcontact",
      fetchProjectsByDeal: "deals/fetchProjectsByDeal",
      saveNote: "history/saveNote",
      acthistory: "history/acthistory",
    }),
    ...mapActions("project", ["fetchAllProjects"]),

    // Parse JSON safely untuk handle associasi dari database
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
      if (!Array.isArray(assocArray)) {
        if (assocArray && (typeof assocArray === "string" || typeof assocArray === "number")) {
           return [String(assocArray).trim()];
        }
        return [];
      }
      return assocArray
        .map((item) => {
          if (item && typeof item === "object") return item.id || item.contact_id || item.company_id || item.id_contact || item.id_company || item.value;
          return item;
        })
        .filter((item) => item !== undefined && item !== null && item !== "")
        .map(id => String(id).trim()); // Selalu pastikan ID adalah string bersih
    },

    // Helper untuk normalisasi objek untuk form asosiasi
    normalizeAssocObjects(value, type) {
      // Jika value adalah string tunggal (bukan array/objek), kita kemas jadi array
      if (value && typeof value !== 'object') {
        const sid = String(value).trim();
        return type === 'company' 
          ? [{ id: sid, company_name: `Company ${sid}` }]
          : [{ id: sid, first_name: `Contact ${sid}`, last_name: "" }];
      }

      const arr = this.normalizeAssocInput(value);
      return arr.filter(item => item !== null && item !== undefined).map(item => {
        if (typeof item !== 'object') {
          return type === 'company' 
            ? { id: String(item), company_name: `Company ${item}` }
            : { id: String(item), first_name: `Contact ${item}`, last_name: "" };
        }
        
        const id = item.id || item.contact_id || item.id_contact || item.company_id || item.id_company || item.company || item.contact || item.value;
        if (type === 'company') {
          return {
            id: String(id),
            company_name: item.company_name || item.companynm || item.name || item.label || `Company ${id}`
          };
        } else {
          const firstName = item.first_name || item.firstname || item.contact_name || item.contactnm || item.label || `Contact ${id}`;
          return {
            id: String(id),
            first_name: firstName,
            last_name: item.last_name || item.lastname || ""
          };
        }
      });
    },

    getDealIdFromResponse(response) {
      if (!response) return null;
      const candidates = [
        response.deal && response.deal.id,
        response.data && response.data.id,
        response.id,
        response.deal_id,
        response.id_deals,
        response.deal_id,
      ];

      for (const c of candidates) {
        if (c !== undefined && c !== null && c !== "") return c;
      }

      return null;
    },

    normalizeAssocInput(value) {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === "number") return [value];
      if (typeof value === "string") {
        const parsed = this.parseJSON(value, null);
        if (Array.isArray(parsed)) return parsed;

        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => {
            const maybeNumber = Number(item);
            return Number.isFinite(maybeNumber) && item !== ""
              ? maybeNumber
              : item;
          });
      }
      return [];
    },

    resolveTaskData(dealData) {
      const parsedTask = this.parseJSON(dealData?.task_json, null);
      const taskObj =
        parsedTask && typeof parsedTask === "object" ? parsedTask : {};

      return {
        name: dealData?.task_name || taskObj.name || taskObj.title || "",
        content: dealData?.desktask || taskObj.content || "",
        dueDate: dealData?.due_date || taskObj.dueDate || "",
        time: dealData?.task_time || taskObj.time || "",
        status: dealData?.statustask || taskObj.status || "",
        priority: dealData?.prioritytask || taskObj.priority || "",
      };
    },

    resolveDocsData(dealData) {
      const parsedDocs = this.parseJSON(dealData?.docs, null);
      const docsObject =
        parsedDocs && typeof parsedDocs === "object" ? parsedDocs : null;

      const rawFiles = Array.isArray(docsObject?.files)
        ? docsObject.files
        : Array.isArray(dealData?.docs?.files)
          ? dealData.docs.files
          : [];

      const normalizedFiles = rawFiles
        .map((file) => {
          if (!file) return null;

          if (typeof file === "string") {
            return file;
          }

          if (typeof File !== "undefined" && file instanceof File) {
            return file;
          }

          if (typeof Blob !== "undefined" && file instanceof Blob) {
            return file;
          }

          if (typeof file === "object") {
            return {
              ...file,
              name:
                file.name || file.filename || file.original_name || "document",
              url: file.url || file.path || file.src || "",
            };
          }

          return null;
        })
        .filter(Boolean);

      const description =
        docsObject?.description ||
        dealData?.docs?.description ||
        dealData?.docs ||
        dealData?.doc ||
        "";

      const fileSource =
        docsObject?.fileSource ||
        dealData?.docs?.fileSource ||
        (normalizedFiles.length > 0 ? "local" : "");

      return {
        description,
        fileSource,
        files: normalizedFiles,
      };
    },

    resolveInitialDealId() {
      const root = this.initialData || {};
      const nestedDeal =
        Array.isArray(root.deals) && root.deals.length > 0
          ? root.deals[0]
          : null;

      return nestedDeal?.id || root?.id || root?.deal_id || null;
    },

    setFormData(data) {
      // Cek apakah data memiliki properti 'deals' (response dari fetchById)
      let dealData = data;
      let companiesAssoc = [];
      let contactsAssoc = [];

      if (data?.deals && Array.isArray(data.deals) && data.deals.length > 0) {
        dealData = data.deals[0];
        companiesAssoc =
          data.companiesassoc ||
          data.companyassoc ||
          dealData.companiesassoc ||
          dealData.companyassoc ||
          dealData.companies_id ||
          dealData.company_id ||
          dealData.id_company ||
          dealData.company ||
          [];

        contactsAssoc =
          data.contactsassoc ||
          data.contactassoc ||
          dealData.contactsassoc ||
          dealData.contactassoc ||
          dealData.contacts_id ||
          dealData.contact_id ||
          dealData.id_contact ||
          dealData.contact ||
          [];
      } else {
        // Fallback: mungkin data langsung object deal
        companiesAssoc =
          data.companyassoc ||
          data.companiesassoc ||
          data.company ||
          data.id_company ||
          data.company_id ||
          [];
        contactsAssoc =
          data.contactassoc ||
          data.contactsassoc ||
          data.contact ||
          data.id_contact ||
          data.contact_id ||
          [];
      }

      const normalizedCompaniesAssoc = this.normalizeAssocInput(companiesAssoc);
      const normalizedContactsAssoc = this.normalizeAssocInput(contactsAssoc);

      // Isi formData
      this.formData = {
        id: dealData.id || dealData.id_deals || data.id || null,
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
        source: this.normalizeSourceValue(dealData.source || ""),
        description: dealData.description || "",
        documents: null,
        // Ubah array of objects menjadi array of IDs
        companyassoc: this.extractIdsFromAssoc(normalizedCompaniesAssoc),
        contactassoc: this.extractIdsFromAssoc(normalizedContactsAssoc),
        probability: dealData.probability ?? null,
        status:
          dealData.status !== undefined
            ? dealData.status == 1 || dealData.status === "active" || dealData.status === true
              ? 1
              : 0
            : dealData.active !== undefined
            ? dealData.active == 1 || dealData.active === true
              ? 1
              : 0
            : 1,
        task: this.resolveTaskData(dealData),
        docs: this.resolveDocsData(dealData),
        owner_id:
          dealData.owner_id ||
          dealData.id_owner ||
          dealData.id_user ||
          dealData.user_id ||
          dealData.owner ||
          null,
        contact_id: dealData.contact_id || dealData.id_contact || null,
        company_id: dealData.company_id || dealData.id_company || null,
        noteData: {
          body: dealData.note || dealData.notes || "",
          gps_address: null,
          latitude: null,
          longitude: null,
          photos: [],
          audioBlob: null,
        },
      };

      // Fetch History if editing
      const dealId = this.formData.id || dealData.id || dealData.id_deals || data.id;
      if (dealId) {
        this.acthistory({
          noteable_type: "DL",
          noteable_id: dealId,
        });
      }

      // ─── MAP HISTORY (Notes & Docs) ──────────────────────────────────
      let historyItems = [];

      const getBody = (item) => {
        return (
          item.notes ||
          item.body ||
          item.descdocs ||
          item.description ||
          item.content ||
          ""
        );
      };

      // Process Notes
      let rawNotes = dealData.notes || data.notes || dealData.note || data.note;
      if (typeof rawNotes === "string" && rawNotes.startsWith("[")) {
        try {
          rawNotes = JSON.parse(rawNotes);
        } catch (e) {}
      }

      if (Array.isArray(rawNotes)) {
        rawNotes.forEach((n) => {
          let location = { address: null, latitude: null, longitude: null };
          try {
            if (n.location) {
              location =
                typeof n.location === "string"
                  ? JSON.parse(n.location)
                  : n.location;
            }
          } catch (e) {}

          let photos = [];
          try {
            if (n.pathphoto) {
              const parsed =
                typeof n.pathphoto === "string"
                  ? JSON.parse(n.pathphoto)
                  : n.pathphoto;
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
        historyItems.push({
          type: "note",
          body: rawNotes,
          timestamp:
            dealData.created_at || dealData.updated_at || data.created_at,
        });
      }

      // Process Docs
      let rawDocs =
        dealData.docs_list ||
        dealData.docs ||
        data.docs ||
        data.docs_list ||
        data.files;
      if (typeof rawDocs === "string" && rawDocs.startsWith("[")) {
        try {
          rawDocs = JSON.parse(rawDocs);
        } catch (e) {}
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
              files: d.pathfile
                ? [{ name: d.pathfile.split("/").pop(), path: d.pathfile }]
                : [],
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

      // Sync latest for backward compatibility
      const latestNote = this.historyitems.find((h) => h.type === "note");
      if (latestNote) {
        this.formData.noteData = {
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
        this.formData.docs = {
          description: latestDoc.body,
          fileSource: latestDoc.fileSource,
          files: latestDoc.files,
        };
      }

      // Reset UI state
      this.showOptional = !!(
        this.formData.description || this.formData.docs.description
      );
      this.selectedDocSource = this.formData.docs.fileSource || "";
      this.customSource = "";
    },
    findPipelineIdByLabel(label) {
      if (!label || !this.getpipelines) return label;
      const search = String(label).toLowerCase().trim();
      const found = this.getpipelines.find(
        (p) => p.pipeline_name.toLowerCase() === search,
      );
      return found ? found.id : label;
    },
    buildFormDatanote(data) {
      const fd = new FormData();
      const existing = [];

      fd.append("noteable_type", data.noteable_type);
      fd.append("noteable_id", data.noteable_id);
      fd.append("body", data.body || "");
      fd.append("gps_address", data.gps_address || "");
      fd.append("latitude", data.latitude || "");
      fd.append("longitude", data.longitude || "");
      fd.append("visibility", data.visibility ?? 0);
      fd.append("choice", data.choice || "I");
      fd.append("idnote", data.idnote ?? null);

      (data.photos || []).forEach((p) => {
        if (p.file) {
          fd.append("photos[]", p.file);
        } else if (typeof p.src === "string") {
          existing.push({
            type: "photo",
            src: p.src,
          });
        }
      });

      (data.documents || []).forEach((d) => {
        if (d.file instanceof File) {
          fd.append("documents[]", d.file);
        } else if (d.url) {
          existing.push({
            type: "document",
            url: d.url,
          });
        }
      });

      if (existing.length > 0) {
        fd.append("existing_attachments", JSON.stringify(existing));
      }

      return fd;
    },
    resolveInitialDealId() {
      const deal = this.initialData?.deals?.[0] || this.initialData || {};
      return (
        this.formData?.id ||
        deal.id ||
        deal.id_deals ||
        deal.deal_id ||
        null
      );
    },
    normalizePipelineValue(value) {
      if (!value) return "";
      // Jika sudah berupa ID (angka), jangan di-normalize jadi string
      if (!isNaN(value) && value !== "" && value !== null) return value;

      const resolvedId = this.findPipelineIdByLabel(value);
      if (!isNaN(resolvedId)) return resolvedId;

      const raw = String(value).toLowerCase().trim();
      if (raw === "prospect" || raw === "new") return 1;
      if (raw.includes("qual")) return 2;
      if (
        raw.includes("offer") ||
        raw.includes("proposal") ||
        raw === "payment" ||
        raw.includes("prop")
      )
        return 3;
      if (
        raw.includes("negot") ||
        raw.includes("adv")
      )
        return 4;
      if (raw.includes("closed_won") || raw.includes("won") || raw.includes("close_won"))
        return 5;
      if (
        raw.includes("closed_lost") ||
        raw.includes("lost") ||
        raw === "closed_los" ||
        raw.includes("close_lost")
      )
        return 6;
      if (raw.includes("closed")) return 5;

      return value;
    },

    findSourceIdByLabel(label) {
      if (!label || !this.getsources) return label;
      const search = String(label).toLowerCase().trim();
      const found = this.getsources.find(
        (s) =>
          String(s.label || "")
            .toLowerCase()
            .trim() === search,
      );
      return found ? found.value : label;
    },
    normalizeSourceValue(value) {
      if (!value) return "";
      // Jika sudah berupa ID (angka), jangan di-normalize jadi string
      if (!isNaN(value) && value !== "" && value !== null) return value;

      const resolvedId = this.findSourceIdByLabel(value);
      if (!isNaN(resolvedId)) return resolvedId;

      const raw = String(value).toLowerCase().trim();
      const compact = raw.replace(/[\s-]+/g, "_");
      const aliases = {
        website: "website",
        referral: "referral",
        social_media: "social_media",
        socialmedia: "social_media",
        "social media": "social_media",
        email_campaign: "email_campaign",
        email_camp: "email_campaign",
        emailcampaign: "email_campaign",
        "email campaign": "email_campaign",
        cold_call: "cold_call",
        coldcall: "cold_call",
        "cold call": "cold_call",
        other: "other",
      };

      return aliases[raw] || aliases[compact] || compact;
    },

    // Prefill form data dari database (untuk edit mode)

    applyDefaultOwner() {
      if (!this.formData.owner && this.currentUserName) {
        this.formData.owner = this.currentUserName;
      }
    },
    isUploadableFile(file) {
      if (!file) return false;

      if (typeof File !== "undefined" && file instanceof File) return true;
      if (typeof Blob !== "undefined" && file instanceof Blob) return true;

      return false;
    },
    isAllowedLocalDocument(file) {
      const name = String(file?.name || "").toLowerCase();
      const type = String(file?.type || "").toLowerCase();

      return (
        name.endsWith(".pdf") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx") ||
        name.endsWith(".xls") ||
        name.endsWith(".xlsx") ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png") ||
        type === "application/pdf" ||
        type === "application/msword" ||
        type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        type === "application/vnd.ms-excel" ||
        type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        type === "image/jpeg" ||
        type === "image/png"
      );
    },
    getLocalUploadFiles() {
      return Array.isArray(this.formData.docs?.files)
        ? this.formData.docs.files.filter((file) => this.isUploadableFile(file))
        : [];
    },
    getLocalUploadLabel(file) {
      return file?.name || "document";
    },
    formatLocalUploadSize(file) {
      const size = Number(file?.size || 0);
      if (!size) return "";

      const units = ["B", "KB", "MB", "GB"];
      let value = size;
      let unitIndex = 0;

      while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
      }

      return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
    },
    mergeUniqueFiles(primaryFiles = [], extraFiles = []) {
      const merged = [...primaryFiles];

      extraFiles.forEach((file) => {
        if (!merged.some((existing) => existing === file)) {
          merged.push(file);
        }
      });

      return merged;
    },
    selectDocSource(value) {
      this.selectedDocSource = value;
      this.isDocDropdownOpen = false;
      if (value !== "local") {
        this.formData.documents = null;
        if (this.formData.docs && Array.isArray(this.formData.docs.files)) {
          this.formData.docs.files = [];
        }
      }
    },
    handleFileChange(e) {
      const selectedFiles = Array.from(e.target.files || []);
      const validFiles = selectedFiles.filter((file) => {
        if (!this.isAllowedLocalDocument(file)) {
          return false;
        }
        return true;
      });

      if (!validFiles.length) {
        this.$nextTick(() => {
          e.target.value = "";
        });
        return;
      }

      if (!this.formData.docs || typeof this.formData.docs !== "object") {
        this.formData.docs = {
          description: "",
          fileSource: "local",
          files: [],
        };
      }

      const existingFiles = this.getLocalUploadFiles();
      const mergedFiles = this.mergeUniqueFiles(existingFiles, validFiles);

      this.formData.docs.fileSource = "local";
      this.formData.docs.files = mergedFiles;
      this.formData.documents = mergedFiles[0] || null;

      this.$nextTick(() => {
        e.target.value = "";
      });
    },
    removeLocalUploadFile(index) {
      const localFiles = this.getLocalUploadFiles();
      const targetFile = localFiles[index];

      if (!targetFile || !Array.isArray(this.formData.docs?.files)) {
        return;
      }

      this.formData.docs.files = this.formData.docs.files.filter(
        (file) => file !== targetFile,
      );

      const remaining = this.getLocalUploadFiles();
      this.formData.documents = remaining[0] || null;
    },
    handleClose() {
      // Reset semua state sebelum close
      this.handleReset();
      this.activeTab = "master";
      this.historyitems = [];
      this.$emit("close");
    },
    async handleCreateProject() {
      // Form Project sudah melakukan simpan sendiri (internal), 
      // di sini kita cukup tutup modal dan refresh list project di tab Deal.
      this.closeProjectModal();
      await this.loadDealProjects();
    },
    getProjectStatusClass(status) {
      const s = String(status || "").toLowerCase();
      if (s.includes("progress")) return "bg-blue-100 text-blue-700";
      if (s.includes("complete") || s.includes("done"))
        return "bg-emerald-100 text-emerald-700 font-semibold";
      if (s.includes("wait")) return "bg-yellow-100 text-yellow-700";
      if (s.includes("defer")) return "bg-red-100 text-red-700";
      return "bg-slate-100 text-slate-700";
    },
    async openProjectDetail(project) {
      const projectId = project.id || project.project_id || project.id_project;
      if (!projectId) {
        this.selectedProject = project;
        this.showCreateProjectForm = true;
        return;
      }

      try {
        // Fetch full detail before opening form to ensure all fields are populated
        const fullDetail = await this.$store.dispatch(
          "project/fetchProjectById",
          projectId,
        );
        this.selectedProject = fullDetail || project;
      } catch (error) {
        console.error("Failed to fetch full project details:", error);
        this.selectedProject = project;
      }
      this.showCreateProjectForm = true;
    },
    openAddProject() {
      this.selectedProject = { 
        deal_id: this.formData.id || this.resolveInitialDealId() 
      };
      this.showCreateProjectForm = true;
    },
    closeProjectModal() {
      this.showCreateProjectForm = false;
      this.selectedProject = null;
    },
    async loadDealProjects() {
      const dealId = this.resolveInitialDealId();
      if (!dealId) {
        this.dealProjects = [];
        return;
      }
      try {
        const projects = await this.fetchProjectsByDeal(dealId);
        const simpleList = Array.isArray(projects) ? projects : [];

        // Perkaya data dengan mencari detail lengkap di allProjects store jika tersedia
        this.dealProjects = simpleList.map((sp) => {
          const spId = String(
            sp.id || sp.value || sp.id_project || sp.project_id || "",
          ).trim();
          const fullData = this.allProjects.find(
            (p) => String(p.id).trim() === spId,
          );
          if (fullData) return fullData;

          // Fallback jika detail lengkap tidak ditemukan di store
          return {
            ...sp,
            id: spId,
            project_name:
              sp.project_name ||
              sp.label ||
              sp.name ||
              sp["Project Name"] ||
              "-",
            status: sp.project_status || sp.status || "not_started",
            status_name: sp.status_name || sp.status || "-",
            due_date: sp.due_date || sp.deadline || null,
            leader_name: sp.leader_name || sp.leader || sp.assignee || "-",
          };
        });
      } catch (e) {
        console.error("Failed to load deal projects", e);
        this.dealProjects = [];
      }
    },
    handleProjectModalSubmit() {
      this.showProjectModal = false;
      this.projectModalForm.dealassoc = [];
      alertService.toastSuccess("Project ditambahkan");
    },
    async handleSubmit() {
      // Validation
      if (!this.formData.dealName?.trim()) {
        await alertService.toastError("Deal Name wajib diisi.");
        return;
      }
      if (!this.formData.pipeline) {
        await alertService.toastError("Pipeline/Stage wajib diisi.");
        return;
      }
      if (!this.formData.amount && this.formData.amount !== 0) {
        await alertService.toastError("Amount wajib diisi.");
        return;
      }

      this.isSavingBeforeDetail = true;

      try {
        // SELALU kirim task values, jangan null - backend SP akan filter kalau kosong
        const normalizedTask = {
          name: this.formData.task?.name || "",
          content: this.formData.task?.content || "",
          status: this.formData.task?.status || "",
          priority: this.formData.task?.priority || "",
          dueDate: this.formData.task?.dueDate || "",
          time: this.formData.task?.time || "",
          task_name: this.formData.task?.name || "",
          desktask: this.formData.task?.content || "",
          statustask: this.formData.task?.status || "",
          prioritytask: this.formData.task?.priority || "",
          due_date: this.formData.task?.dueDate || "",
          task_time: this.formData.task?.time || "",
          owner_id: this.formData.owner_id,
          contact_id: this.formData.contact_id,
          company_id: this.formData.company_id,
        };

        const docsFiles = Array.isArray(this.formData.docs?.files)
          ? this.formData.docs.files
          : [];

        const masterDocsFile = this.isUploadableFile(this.formData.documents)
          ? [this.formData.documents]
          : [];

        const mergedDocsFiles = this.mergeUniqueFiles(
          docsFiles,
          masterDocsFile,
        );

        const primaryDocument =
          this.formData.documents || mergedDocsFiles[0] || null;

        const submissionData = {
          dealName: this.formData.dealName,
          deal_name: this.formData.dealName,
          pipeline: this.formData.pipeline,
          stage: this.formData.pipeline,
          currency: this.formData.currency,
          amount: this.formData.amount,
          expectedCloseDate: this.formData.expectedCloseDate,
          expected_close_date: this.formData.expectedCloseDate,
          owner:
            this.formData.owner_id ||
            this.authUser?.id ||
            this.authUser?.id_user ||
            "",
          priority: this.formData.priority,
          source: this.formData.source,
          description: this.formData.description,
          probability: this.formData.probability,
          status: this.formData.status,
          contactassoc: this.formData.contactassoc || [],
          companyassoc: this.formData.companyassoc || [],
          // SELALU kirim notes dan task (SP akan ignore kalau kosong)
          owner_id: this.formData.owner_id || this.currentUserId || null,
          contact_id: this.formData.contact_id || null,
          company_id: this.formData.company_id || null,
          note: this.formData.noteData?.body || "",
          notes: this.formData.noteData?.body || "",
          noteData: { ...this.formData.noteData },
          task: normalizedTask, // Always send task object now
          task_name: normalizedTask.name || "",
          desktask: normalizedTask.content || "",
          due_date: normalizedTask.dueDate || "",
          task_time: normalizedTask.time || "",
          statustask: normalizedTask.status || "",
          prioritytask: normalizedTask.priority || "",
          documents: primaryDocument,
          // Docs conditional - only send if has content
          docs:
            (this.formData.docs?.description || "").trim() !== "" ||
            mergedDocsFiles.length > 0 ||
            masterDocsFile.length > 0
              ? {
                  description: this.formData.docs?.description || "",
                  fileSource: this.formData.docs?.fileSource || "",
                  files: mergedDocsFiles,
                }
              : null,
          doc: this.formData.docs?.description || "",
        };

        if (this.isEditMode) {
          const dealId = this.resolveInitialDealId();
          if (!dealId) {
            await alertService.toastError(
              "ID deal tidak ditemukan. Silakan tutup lalu buka lagi detail deal.",
            );
            return;
          }

          submissionData.choice = "u";
          submissionData.id = dealId;
          submissionData.id_deals = dealId;
        } else {
          submissionData.choice = "i";
        }

        const response = await this.createDeal(submissionData);

        if (response?.msg === "gagal") {
          await alertService.error(
            "Server returned 'gagal'. Please check the payload or choice parameter.",
          );
          return;
        }

        if (response?.success === false) {
          await alertService.error(response?.message || "Gagal menyimpan deal");
          return;
        }

        // VERIFY: Cek apakah data benar-benar tersimpan dengan fetch detail
        let dealId = null;
        if (this.isEditMode) {
          dealId = this.resolveInitialDealId();
        }

        if (dealId) {
          try {
            const verifyResponse = await this.$store.dispatch(
              "deals/fetchDealById",
              dealId,
            );
            if (!verifyResponse?.deals?.length) {
              throw new Error("Data tidak tersimpan");
            }
          } catch (verifyError) {
            console.error("Verification error:", verifyError);
            await alertService.error(
              "Peringatan: Ada error saat verifikasi. Mohon refresh dan cek.",
            );
            return;
          }
        }

        await alertService.toastSuccess(
          response?.msg || "Deal berhasil disimpan",
        );
        this.$emit("saved", response);

        if (this.fromPage === "company") {
          this.handleClose();
          return;
        }

        // Keep the drawer open and switch to Projects tab
        this.forceShowDetails = true;
        this.activeTab = "projects";
        // Try to fetch full detail for the created deal and populate form
        try {
          const dealId = this.getDealIdFromResponse(response);
          if (dealId) {
            const detail = await this.$store.dispatch(
              "deals/fetchDealById",
              dealId,
            );
            if (detail) this.setFormData(detail);
          } else if (
            response &&
            (response.deals || response.deal || response.data)
          ) {
            this.setFormData(response);
          }
        } catch (e) {
          // ignore fetch/set errors
        }
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Gagal menyimpan deal";
        await alertService.toastError(message);
      } finally {
        this.isSavingBeforeDetail = false;
      }
    },
    toggleContactDropdown() {
      this.isContactDropdownOpen = !this.isContactDropdownOpen;
    },
    toggleCompanyDropdown() {
      this.isCompanyDropdownOpen = !this.isCompanyDropdownOpen;
    },
    filterContacts() {
      this.isContactDropdownOpen = true;
    },
    filterCompanies() {
      this.isCompanyDropdownOpen = true;
    },
    toggleContact(contact) {
      const index = this.formData.contactassoc.indexOf(contact.id);
      if (index === -1) {
        this.formData.contactassoc.push(contact.id);
      } else {
        this.formData.contactassoc.splice(index, 1);
      }
    },
    isContactSelected(id) {
      return this.formData.contactassoc.includes(id);
    },
    toggleCompany(company) {
      const index = this.formData.companyassoc.indexOf(company.id);
      if (index === -1) {
        this.formData.companyassoc.push(company.id);
      } else {
        this.formData.companyassoc.splice(index, 1);
      }
    },
    isCompanySelected(id) {
      return this.formData.companyassoc.includes(id);
    },
    handleClickOutside(e) {
      if (!e.target.closest("[data-contacts-dropdown]")) {
        this.isContactDropdownOpen = false;
      }
      if (!e.target.closest("[data-deals-dropdown]")) {
        this.showDealsDropdown = false;
      }
    },

    // ─── HISTORY & DRAWER METHODS ──────────────────────────────────────────
    openNoteDrawer(editData = null, index = null) {
      if (editData) {
        this.tempNoteData = { 
          ...editData,
          idnote: editData.idnote || editData.id 
        };
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
      if (!this.tempNoteData.body && (this.tempNoteData.photos || []).length === 0) {
        alertService.toastWarn("Note masih kosong");
        return;
      }

      const dealId = this.formData.id || (this.initialData?.id || this.initialData?.id_deals);
      
      if (!dealId) {
        // Fallback for new deal (keep in local state until save)
        const item = {
          type: "note",
          timestamp: new Date().toISOString(),
          ...this.tempNoteData,
        };

        if (this.editingItemIndex !== null) {
          this.historyitems[this.editingItemIndex] = item;
        } else {
          this.historyitems.unshift(item);
        }
        
        this.isNoteDrawerOpen = false;
        alertService.toastSuccess("Catatan ditambahkan ke histori lokal");
        return;
      }

      const isUpdate = !!this.tempNoteData.idnote;
      const item = {
        noteable_type: "DL",
        noteable_id: dealId,
        ...this.tempNoteData,
        choice: isUpdate ? "U" : "I",
      };

      const formData = this.buildFormDatanote(item);

      this.saveNote(formData)
        .then(() => {
          alertService.toastSuccess("Catatan berhasil disimpan");
          this.isNoteDrawerOpen = false;
          this.editingItemIndex = null;
          this.acthistory({
            noteable_type: "DL",
            noteable_id: dealId,
          });
        })
        .catch((err) => {
          alertService.toastError(
            err.response?.data?.message || err.message || "Gagal menyimpan catatan"
          );
        });
    },
    saveDocFromDrawer() {
      if (this.tempDocs.files.length === 0 && !this.tempDocs.description) {
        alertService.toastWarn("Dokumen masih kosong");
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
        this.formData.docs = { ...latestDoc };
      }

      this.isDocDrawerOpen = false;
      alertService.toastSuccess("Dokumen ditambahkan ke histori");
    },
    handleHistoryEdit({ item, index }) {
      if (item.type === "note") {
        this.openNoteDrawer(item, index);
      } else {
        this.openDocDrawer(item, index);
      }
    },
    async handleHistoryDelete(itemOrIndex) {
      const item = typeof itemOrIndex === "object" ? itemOrIndex.item : this.displayHistoryItems[itemOrIndex];
      const index = typeof itemOrIndex === "object" ? itemOrIndex.index : itemOrIndex;

      if (!item) return;

      const dealId = this.formData.id || (this.initialData?.id || this.initialData?.id_deals);

      // Jika note sudah ada di DB (punya ID) dan deal ada ID nya
      if (dealId && item.type === "note" && (item.id || item.idnote)) {
        const isConfirmed = await alertService.confirm(
          "Apakah yakin untuk menghapus catatan ini secara permanen?",
          "Konfirmasi Hapus"
        );

        if (isConfirmed) {
          try {
            const payload = new FormData();
            payload.append("noteable_type", "DL");
            payload.append("noteable_id", dealId);
            payload.append("idnote", item.idnote || item.id);
            payload.append("choice", "D");

            await this.saveNote(payload);
            alertService.toastSuccess("Catatan berhasil dihapus");
            this.acthistory({
              noteable_type: "DL",
              noteable_id: dealId,
            });
          } catch (error) {
            console.error("Failed to delete note", error);
            alertService.toastError("Gagal menghapus catatan");
          }
        }
        return;
      }

      // Fallback: hapus lokal saja
      this.historyitems.splice(index, 1);
      alertService.toastInfo("Item dihapus dari histori lokal");
    },

    async handleDetailSubmit(detailPayload) {
      if (this.isSavingBeforeDetail) {
        return;
      }

      this.isSavingBeforeDetail = true;

      try {
        const hasTaskContent =
          !!this.formData.task &&
          [
            this.formData.task.name,
            this.formData.task.content,
            this.formData.task.dueDate,
            this.formData.task.time,
            this.formData.task.status,
            this.formData.task.priority,
          ].some((value) => String(value || "").trim() !== "");

        const hasDocsContent =
          (this.formData.docs.description &&
            this.formData.docs.description.trim() !== "") ||
          (Array.isArray(this.formData.docs.files) &&
            this.formData.docs.files.length > 0);

        const detailDocsFiles = Array.isArray(this.formData.docs?.files)
          ? this.formData.docs.files
          : [];

        const primaryDocument =
          this.formData.documents || detailDocsFiles[0] || null;

        const submissionData = {
          ...this.formData,
          owner:
            this.formData.owner_id ||
            this.currentUserId ||
            this.formData.owner ||
            "",
          owner_id: this.formData.owner_id || this.currentUserId || null,
          contactassoc: (this.formData.contactassoc || []).join(","),
          companyassoc: (this.formData.companyassoc || []).join(","),
          // Include Notes, Tasks, and Docs
          notes: this.formData.noteData?.body || "",
          task: hasTaskContent ? this.formData.task : null,
          documents: primaryDocument,
          docs: hasDocsContent ? this.formData.docs : null,
        };

        const response = await this.$store.dispatch(
          "deals/createDeal",
          submissionData,
        );

        if (response?.msg === "gagal") {
          await alertService.error(
            "Server returned 'gagal'. Please check the payload or choice parameter.",
          );
          return;
        }

        if (response?.success === false) {
          await alertService.error(response?.message || "Failed to save deal");
          return;
        }

        await alertService.toastSuccess(
          response?.msg || "Deal saved successfully",
        );
        this.$emit("saved", response);

        if (this.fromPage === "company") {
          this.handleClose();
          return;
        }

        this.forceShowDetails = true;
        this.activeTab = "projects";
        try {
          const dealId = this.getDealIdFromResponse(response);
          if (dealId) {
            const detail = await this.$store.dispatch(
              "deals/fetchDealById",
              dealId,
            );
            if (detail) this.setFormData(detail);
          } else if (
            response &&
            (response.deals || response.deal || response.data)
          ) {
            this.setFormData(response);
          }
        } catch (e) {
          // ignore
        }
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Gagal menyimpan deal";
        await alertService.toastError(message);
      } finally {
        this.isSavingBeforeDetail = false;
      }
    },

    handleReset() {
      this.formData = {
        id: null,
        dealName: "",
        pipeline: "",
        currency: "IDR",
        amount: "",
        expectedCloseDate: "",
        owner: this.currentUserName || "",
        priority: "",
        source: "",
        description: "",
        documents: null,
        owner_id: null,
        contact_id: null,
        company_id: null,
        contactassoc: [],
        companyassoc: [],
        probability: null,
        active: 1,
        task: {
          name: "",
          content: "",
          dueDate: "",
          time: "",
          status: "",
          priority: "",
        },
        docs: {
          description: "",
          fileSource: "",
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
      };

      // Reset UI state
      this.contactSearch = "";
      this.companySearch = "";
      this.showOptional = false;
      this.selectedDocSource = "";
      this.customSource = "";
      this.isContactDropdownOpen = false;
      this.isCompanyDropdownOpen = false;
      this.isDocDropdownOpen = false;
      this.activeTab = "master";
      this.forceShowDetails = false;
    },
    async handleDeleteProject(project) {
      const isConfirmed = await alertService.confirm(
        "Apakah yakin untuk melepas project ini dari deal?",
        "Konfirmasi Lepas Project",
        {
          confirmButtonText: "Ya, Lepas",
          cancelButtonText: "Kembali",
        },
      );

      if (isConfirmed) {
        try {
          await this.$store.dispatch("project/updateProject", {
            id: project.id,
            formData: { deal_id: "" }, // Dissociate from deal
          });
          await this.loadDealProjects();
          alertService.toastSuccess("Project berhasil dilepas dari deal");
        } catch (error) {
          console.error("Failed to dissociate project:", error);
          alertService.toastError("Gagal melepas project");
        }
      }
    },
  },
};
</script>

<template>
  <!-- Overlay Background -->
  <transition name="overlay">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-sub-text/80 z-40 transition-all duration-300"
      @click="handleClose"
    ></div>
  </transition>

  <!-- Form Slide Panel -->
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
        <h2 class="text-xl font-bold text-dark-base">
          {{ isEditMode ? "Edit Deal" : "Create Deal" }}
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
          v-if="(isEditMode || forceShowDetails) && !hideDetailTab"
          type="button"
          @click="activeTab = 'projects'; loadDealProjects()"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            activeTab === 'projects'
              ? 'border-dark-base text-dark-base'
              : 'border-transparent text-sub-text hover:text-dark-base',
          ]"
        >
          Projects
        </button>

        <button
          v-if="(isEditMode || forceShowDetails) && !hideDetailTab"
          type="button"
          @click="activeTab = 'detail'"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            activeTab === 'detail'
              ? 'border-dark-base text-dark-base'
              : 'border-transparent text-sub-text hover:text-dark-base',
          ]"
        >
          Notes
        </button>
      </div>

      <!-- Form Content (Scrollable) -->
      <div class="flex-1 overflow-y-auto min-h-0 form-content-mobile">
        <form
          v-if="activeTab === 'master'"
          @submit.prevent="handleSubmit"
          class="p-6 space-y-6"
        >
          <!-- Deal Name & Pipeline -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-dark-base mb-2"
                >Deal Name <span class="text-red-600">*</span>
              </label>
              <input
                ref="dealNameInput"
                v-model="formData.dealName"
                type="text"
                placeholder="Deal's Name"
                class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-dark-base mb-2">
                Pipeline/Stage <span class="text-red-600">*</span>
              </label>
              <div class="relative">
                <select
                  v-model="formData.pipeline"
                  class="w-full px-3 py-2 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-dark-base bg-white appearance-none cursor-pointer"
                >
                  <option value="" disabled selected>Select Pipeline</option>
                  <option
                    v-for="opt in getpipelines"
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

          <!-- Company & Contact -->
          <div v-if="fromPage !== 'company'" class="grid grid-cols-2 gap-4">
            <CompaniesAssociationForm
              ref="companiesAssociationForm"
              v-model="tempCompanyAssoc"
              :initial-data="tempCompanyObjects"
              mode="single"
            />

            <ContactAssociationForm
              ref="contactAssociationForm"
              v-model="tempContactAssoc"
              :contacts="tempContactObjects"
              :company-id="tempCompanyAssoc"
              :filter-by-company="true"
              limit="1"
              mode="single"
            />
          </div>

          <!-- Currency & Amount/Value -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-dark-base mb-2"
                >Currency</label
              >
              <div class="relative">
                <select
                  v-model="formData.currency"
                  class="w-full px-3 py-2 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-dark-base bg-white appearance-none cursor-pointer"
                >
                  <option
                    v-for="opt in currencyOptions"
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
            <div>
              <label class="block text-sm font-medium text-dark-base mb-2">
                Amount / Value <span class="text-red-600">*</span>
              </label>
              <input
                v-model="formData.amount"
                type="number"
                placeholder="Amount/Value"
                class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
              />
            </div>
          </div>

          <!-- Expected Close Date & owner -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-dark-base mb-2"
                >Expected Close Date</label
              >
              <input
                v-model="formData.expectedCloseDate"
                type="date"
                placeholder="Close Date"
                class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-dark-base"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-dark-base mb-2"
                >owner</label
              >
              <div class="relative">
                <v-select
                  v-model="formData.owner_id"
                  :options="ownerOptions"
                  label="label"
                  :reduce="(opt) => opt.value"
                  placeholder="Select Owner(PJ)"
                />
              </div>
            </div>
          </div>

          <!-- Priority & Source -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-dark-base mb-2"
                >Priority</label
              >
              <div class="relative">
                <select
                  v-model="formData.priority"
                  class="w-full px-3 py-2 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-dark-base bg-white appearance-none cursor-pointer"
                >
                  <option value="" disabled selected>Select Priority</option>
                  <option
                    v-for="opt in getpriority"
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
            <div>
              <label class="block text-sm font-medium text-dark-base mb-2"
                >Source</label
              >
              <div class="space-y-2">
                <div class="relative">
                  <select
                    v-model="formData.source"
                    class="w-full px-3 py-2 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-dark-base bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled selected>Select Source</option>
                    <option
                      v-for="opt in getsources"
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
                <!-- Custom Source Input -->
                <transition name="expand">
                  <div v-if="formData.source === 'other'" class="mt-2">
                    <input
                      v-model="customSource"
                      type="text"
                      placeholder="Specify source..."
                      class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                      @input="formData.source_other = customSource"
                    />
                  </div>
                </transition>
              </div>
            </div>
          </div>

          <!-- Probability & Active -->
          <!-- Probability & Active -->
          <div class="grid grid-cols-2 gap-4 items-center">
            <div>
              <label class="block text-sm font-medium text-dark-base mb-2">
                Probability (%)
              </label>
              <input
                v-model="formData.probability"
                type="number"
                min="0"
                max="100"
                placeholder="Probability"
                class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-dark-base mb-2">
                Status
              </label>
              <div class="relative">
                <select
                  v-model="formData.status"
                  class="w-full px-3 py-2 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-dark-base bg-white appearance-none cursor-pointer"
                >
                  <option :value="1">Active</option>
                  <option :value="0">Inactive</option>
                </select>
                <ChevronDown
                  :size="16"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none"
                />
              </div>
            </div>
          </div>
        </form>

        <!-- Projects Tab -->
        <div v-if="activeTab === 'projects'" class="p-6 h-full flex flex-col">
          <div class="flex items-center gap-3 mb-4">
            <button
              @click="openAddProject"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-outline rounded-xl text-sm font-semibold text-dark-base hover:bg-light-base hover:border-dark-base/20 transition-all duration-200 shadow-sm"
            >
              <Plus :size="18" />
              Buat Project Baru
            </button>
          </div>
          <div
            class="border border-outline rounded-lg p-4 flex flex-col flex-1"
          >
            <div class="flex items-center gap-2 mb-3">
              <PackageIcon :size="20" class="text-sub-text" />
              <h3 class="text-sm font-semibold">
                Projects yang terkait dengan deal ini
              </h3>
            </div>
            <div class="flex-1 overflow-y-auto pr-1">
              <div
                v-if="associatedProjects.length === 0"
                class="text-sm text-sub-text"
              >
                Daftar Project belum tersedia.
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="project in associatedProjects"
                  :key="project.id"
                  class="p-3 border border-outline rounded-lg hover:bg-light-base transition-colors group"
                >
                  <div class="flex justify-between items-start mb-1.5">
                    <h4
                      class="text-sm font-semibold text-dark-base line-clamp-1 group-hover:text-sub-text transition-colors"
                    >
                      {{ project.project_name }}
                    </h4>
                    <div class="flex items-center gap-2">
                      <span
                        :class="[
                          'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider',
                          getProjectStatusClass(project.status),
                        ]"
                      >
                        {{ project.status_name || project.status }}
                      </span>
                      <div class="flex items-center gap-1">
                        <button
                          @click.stop="openProjectDetail(project)"
                          class="p-1 hover:bg-white rounded transition-colors text-sub-text hover:text-dark-base"
                          title="Edit Project"
                        >
                          <Pencil :size="14" />
                        </button>
                        <button
                          @click.stop="handleDeleteProject(project)"
                          class="p-1 hover:bg-white rounded transition-colors text-sub-text hover:text-red"
                          title="Hapus Project"
                        >
                          <Trash2 :size="14" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-4 text-[11px] text-sub-text">
                    <div class="flex items-center gap-1.5">
                      <CalendarDays :size="12" class="opacity-70" />
                      {{
                        project.due_date
                          ? new Date(project.due_date).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "No deadline"
                      }}
                    </div>
                    <div class="flex items-center gap-1.5">
                      <User :size="12" class="opacity-70" />
                      {{
                        project.leader_name || project.assignee || "No leader"
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes/Detail Tab -->
        <div v-if="activeTab === 'detail'" class="p-6 h-full flex flex-col">
          <HistoryDetail
            :items="displayHistoryItems"
            @add-note="openNoteDrawer()"
            @add-doc="openDocDrawer()"
            @edit="handleHistoryEdit"
            @delete="handleHistoryDelete"
          />
        </div>
      </div>

      <!-- Footer Actions (Sticky) -->
      <div
        class="bg-white flex items-center justify-between px-6 py-4 border-t border-outline shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] footer-mobile"
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
            @click="handleSubmit"
            :disabled="isSavingBeforeDetail"
            class="px-6 py-2 bg-dark-base text-white rounded-lg hover:bg-dark-hover transition-colors text-sm font-medium"
            :class="{ 'opacity-60 cursor-not-allowed': isSavingBeforeDetail }"
          >
            {{ isSavingBeforeDetail ? "Saving..." : "Save" }}
          </button>
        </div>
      </div>
    </div>
  </transition>
  <ContactDetailForm
    :isOpen="showDetailForm"
    title="Create Company / Details"
    saveButtonText="Save Company"
    entityType="company"
    :isSaving="isSubmitting"
    @close="showDetailForm = false"
    @back="showDetailForm = false"
    @submit="handleDetailSubmit"
  />

  <CreateProjectForm
    :isOpen="showCreateProjectForm"
    fromPage="deals"
    :initialData="selectedProject"
    @close="closeProjectModal"
    @submit="handleCreateProject"
  />

  <!-- Note Drawer POPUP -->
  <!-- ======================= NOTES DRAWER DENGAN OVERLAY KHUSUS ======================= -->
  <transition name="overlay">
    <div
      v-if="isNoteDrawerOpen"
      class="fixed inset-0 bg-black/50 z-55"
      @click="isNoteDrawerOpen = false"
    ></div>
  </transition>

  <transition name="slide">
    <div
      v-if="isNoteDrawerOpen"
      class="fixed top-0 right-0 h-screen w-full max-w-2xl bg-white shadow-2xl z-60 flex flex-col"
      @click.stop
    >
      <div
        class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10"
      >
        <h2 class="text-xl font-bold text-dark-base">
          {{ editingItemIndex !== null ? "Edit Note" : "Tambah Note" }}
        </h2>
        <button
          @click="isNoteDrawerOpen = false"
          class="p-2 hover:bg-light-base rounded-lg transition-colors"
        >
          <X :size="20" class="text-sub-text" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <NotesSection v-model:note-data="tempNoteData" />
      </div>

      <div
        class="bg-white px-6 py-4 border-t border-outline flex justify-end gap-3"
      >
        <button
          @click="isNoteDrawerOpen = false"
          class="px-6 py-2 border border-outline rounded-lg text-sm font-medium hover:bg-light-base"
        >
          Cancel
        </button>
        <button
          @click="saveNoteFromDrawer"
          class="px-6 py-2 bg-dark-base text-white rounded-lg text-sm font-medium hover:bg-dark-hover"
        >
          Simpan Ke Histori
        </button>
      </div>
    </div>
  </transition>

  <!-- Docs Drawer POPUP -->
  <Transition name="slide">
    <div
      v-if="isDocDrawerOpen"
      class="fixed top-0 right-0 h-screen w-full max-w-2xl bg-white shadow-2xl z-60 flex flex-col"
    >
      <div
        class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10"
      >
        <h2 class="text-xl font-bold text-dark-base">
          {{ editingItemIndex !== null ? "Edit Document" : "Tambah Document" }}
        </h2>
        <button
          @click="isDocDrawerOpen = false"
          class="p-2 hover:bg-light-base rounded-lg transition-colors"
        >
          <X :size="20" class="text-sub-text" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <DocsSection v-model="tempDocs" />
      </div>

      <div
        class="bg-white px-6 py-4 border-t border-outline flex justify-end gap-3"
      >
        <button
          @click="isDocDrawerOpen = false"
          class="px-6 py-2 border border-outline rounded-lg text-sm font-medium hover:bg-light-base"
        >
          Cancel
        </button>
        <button
          @click="saveDocFromDrawer"
          class="px-6 py-2 bg-dark-base text-white rounded-lg text-sm font-medium hover:bg-dark-hover"
        >
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

/* Expand Animation for optional section */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 400px;
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

input:-webkit-autofill:focus,
select:-webkit-autofill:focus {
  -webkit-box-shadow:
    0 0 0 30px white inset,
    0 0 0 1px #64728b !important;
  -webkit-text-fill-color: #1c2434 !important;
}

/* Hide number input spin buttons */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
}

/* Mobile specific adjustments */
@media (max-width: 640px) {
  .form-content-mobile {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .footer-mobile {
    padding-left: 1rem;
    padding-right: 1rem;
    box-shadow: 0 -6px 12px rgba(0, 0, 0, 0.06);
  }
}
</style>
