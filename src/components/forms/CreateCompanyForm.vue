<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import { X, Plus, ChevronDown } from "lucide-vue-next";
import AddDealForm from "./AddDealForm.vue";
import AddContactQuickForm from "./AddContactQuickForm.vue";
import LocationSelector from "./component/LocationSelector.vue";
import ContactDetailForm from "./DetailFormDuplicate.vue";
import ContactAssociationForm from "./assoc/contacts.vue";
import DealAssociationForm from "./assoc/companies.vue";
import { alertService } from "@/services/alertService";
import NotesEditor from "@/components/widgets/NotesEditor.vue";
import TaskEditor from "@/components/widgets/TaskEditor.vue";
import DocsEditor from "@/components/widgets/DocsEditor.vue";
import HistoryDetail from "@/components/widgets/historydetail2.vue";
import { buildFormData } from "@/utils/buildFormData";
import ContactSection from "./component/ContactSection.vue";
import DealsSection from "./component/DealsSection.vue";
import AddContactForm from "./AddContactForm.vue";
import CreateDealForm from "./CreateDealForm.vue";
import { toast } from "vue3-toastify";

export default {
  name: "CreateCompanyForm",
  emits: ["close", "submit"],

  components: {
    X,
    Plus,
    ChevronDown,
    AddDealForm,
    AddContactQuickForm,
    LocationSelector,
    ContactDetailForm,
    ContactAssociationForm,
    DealAssociationForm,
    NotesEditor,
    TaskEditor,
    DocsEditor,
    HistoryDetail,
    ContactSection,
    DealsSection,
    AddContactForm,
    CreateDealForm,
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
  },

  data() {
    return {
      contactSearch: "",
      statuses: [],
      activeTab: "master",
      formData: {
        company_name: "",
        company_owner: "",
        owner: "",
        description: "",
        email: "",
        telephone: "",
        website: "",
        industry: "",
        source: "",
        address: "",
        country: "",
        province: "",
        city: "",
        pos_code: "",
        kecamaran: "",  
        kelurahan: "",
        type: "",
        // notes: "",
        dealsassoc: [],
        contactassoc: [],
        task: {
          name: "",
          content: "",
          status: "",
          dueDate: "",
          time: "",
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
          photos: [], // [{ id, src (base64), file (File object) }]
          audioBlob: null, // Blob audio
        },
      },

      showAddContactForm: false,
      showCreateDealForm: false,
      showAddDealForm: false,
      showAddContactQuickForm: false,
      showDetailForm: false,
      isSubmitting: false,
      savedCompany: null,

      // History & Drawer States
      historyitems: [],
      isNoteDrawerOpen: false,
      isDocDrawerOpen: false,
      editingItemIndex: null,
      tempNoteData: {
        idnote: null,
        body: "",
        gps_address: null,
        latitude: null,
        longitude: null,
        photos: [],
        documents: [],
        audioBlob: null,
        visibility: 0,
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
      contactOptions: "contacts/allContacts",
      dealOptions: "deals/allDeals",
      allUsers: "users/allUsers",
      userSignin: "users/usersignin",
      industries: "company/industries",
      sources: "company/sources",
      types: "company/type",
      companybyidcontactassociated: "company/companybyidcontactassociated",
      companybyiddealsassociated: "company/companybyiddealsassociated",
      getprovinsi: "lokasi/getprovinsi",
      getkotakabupaten: "lokasi/getkotakabupaten",
      getkecamatan: "lokasi/getkecamatan",
      getkelurahan: "lokasi/getkelurahan",
      getkodepos: "lokasi/getkodepos",
    }),

    isEditMode() {
      return !!this.initialData;
    },
    hasCompanyId() {
      return !!(this.initialData?.id || this.savedCompany?.id);
    },

    companyid() {
      return this.initialData?.id || this.savedCompany?.id || null;
    },
  },

  watch: {
    async isOpen(isOpen) {
      if (isOpen) {
        // if (!this.industries) {
        //   this.getinduestries();
        // }

        // if (!this.sources) {
        //   this.getsources();
        // }
        // if (!this.types) {
        //   this.gettype();
        // }
        if (!this.industries?.length) await this.getinduestries();
        if (!this.sources?.length) await this.getsources();
        if (!this.types?.length) await this.gettype();
        if (!this.getprovinsi?.length) await this.actprovinsi();
        
        // this.getinduestries();
        // this.getsources();
        // this.gettype();
       

        if (this.initialData) {
        await this.actkotakabupaten({id: this.initialData.province});
        await this.actkecamatan({id: this.initialData.city});
        await this.actkelurahan({id: this.initialData.kecamatan});

          this.setFormData(this.initialData);
        } else {
          this.resetForm();
        }
      }
    },

    formData(a) {
      // console.log("FormData changed:", a);
    },
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },

  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  methods: {
    ...mapActions({
      getUserSignin: "users/getusersignin",
      fetchAllUsers: "users/fetchAllusers",
      fetchAllContacts: "contacts/fetchAllContacts",
      fetchAllDeals: "deals/fetchAllDeals",
      insertCompany: "company/insertcompany",
      getinduestries: "company/getinduestries",
      getsources: "company/getsources",
      gettype: "company/gettype",
      saveContactAssociationCompany: "company/saveContactAssociationCompany",
      saveDealAssociationCompany: "company/saveDealAssociationCompany",
      fetchcompanybyid: "company/fetchcompanybyid",
      saveNote: "history/saveNote",
      acthistory: "history/acthistory",
      actprovinsi: "lokasi/actprovinsi",
      actkotakabupaten: "lokasi/actkotakabupaten",
      actkecamatan: "lokasi/actkecamatan",
      actkelurahan: "lokasi/actkelurahan",
      actkodepos: "lokasi/actkodepos",
    }),

    ...mapMutations({setclearcompanybyid : "company/setclearcompanybyid"}),

    onContactassocSave(action, data) {
      let formdata = new FormData();

      formdata.append("action", action);
      formdata.append("company_id", this.companyid);
      formdata.append("contact_ids", data.contactassoc);
      console.log(data);
      this.saveContactAssociationCompany(formdata)
        .then((res) => {
          alertService.success(
            res.message || "Hubungan contact berhasil disimpan",
          );
          this.fetchcompanybyid(this.companyid);
        })
        .catch((err) => {
          alertService.error(
            err.response?.data?.message ||
              err.message ||
              "Gagal menyimpan hubungan contact",
          );
        });

      // this.formData.contactassoc = data.contactassoc;
      // console.log(action,data,'=>',this.companyid);
    },

    ondealsassocSave(action, data) {
      let formdata = new FormData();
      formdata.append("action", action);
      formdata.append("company_id", this.companyid);
      formdata.append("deal_ids", data.dealassoc);
      console.log(data);
      this.saveDealAssociationCompany(formdata)
        .then((res) => {
          alertService.success(
            res.message || "Hubungan contact berhasil disimpan",
          );
          this.fetchcompanybyid(this.companyid);
        })
        .catch((err) => {
          alertService.error(
            err.response?.data?.message ||
              err.message ||
              "Gagal menyimpan hubungan contact",
          );
        });
    },

    setFormData(data) {
      console.log("Setting form data with:", data);
      this.formData = {
        company_name: data.company_name || "",
        company_owner: data.company_owner || "",
        owner: data.owner || "",
        description: data.description || "",
        email: data.email || "",
        telephone: data.telephone || "",
        website: data.website || "",
        industry: data.industry || "",
        source: data.source || "",
        address: data.address || "",
        country: data.country || "",
        province: data.province || "",
        city: data.city || "",
        pos_code: data.pos_code || "",
        kecamatan: data.kecamatan || "",
        kelurahan: data.kelurahan || "",
        type: data.type || "",
        notes: data.notes || "",

        // 🔥 penting (handle JSON/string)
        dealsassoc: this.parseJSON(data.dealsassoc, []),
        contactassoc: this.parseJSON(data.contactassoc, []),

        // task: {
        //   name: data.task_name || "",
        //   content: data.desktask || "",
        //   status: data.statustask || "",
        //   dueDate: data.due_date || "",
        //   time: data.task_time || "",
        //   priority: data.prioritytask || "",
        // },

        noteData: {
          body: data.notes || "",
          gps_address: data.gps_address || null,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          photos: [], // For simplicity, not parsing existing photos here
          audioBlob: null,
        },

        docs: {
          description: data.docs,
          fileSource: "",
          files: [],
        },
      };

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
      let rawNotes = data.notes || data.note;
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
          timestamp: data.created_at || data.updated_at,
        });
      }

      // Process Docs
      let rawDocs = data.docs || data.docs_list || data.files;
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
    },

    parseJSON(val, defaultVal) {
      try {
        if (!val) return defaultVal;
        if (typeof val === "object") return val;
        return JSON.parse(val);
      } catch {
        return defaultVal;
      }
    },

    handleClickOutside(e) {
      // Close dropdowns saat klik di luar
      if (!e.target.closest("[data-contacts-dropdown]")) {
        this.isContactDropdownOpen = false;
      }
    },

    handleClose() {
      ((this.formData = {
        company_name: "",
        company_owner: "",
        owner: "",
        description: "",
        email: "",
        telephone: "",
        website: "",
        industry: "",
        source: "",
        address: "",
        country: "",
        province: "",
        kecamatan: "",
        kelurahan: "",
        city: "",
        pos_code: "",
        type: "",
        // notes: "",
        dealsassoc: [],
        contactassoc: [],
        task: {
          name: "",
          content: "",
          status: "",
          dueDate: "",
          time: "",
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
          photos: [], // [{ id, src (base64), file (File object) }]
          audioBlob: null, // Blob audio
        },
      }),
        (this.tempNoteData = {
          idnote: null,
          body: "",
          gps_address: null,
          latitude: null,
          longitude: null,
          photos: [],
          documents: [],
          audioBlob: null,
          visibility: 0,
        }),
        
        this.$emit("close"));
        this.setclearcompanybyid();
    },

    handleSave() {
      this.isSubmitting = true;

      // 🚀 Gunakan buildFormData untuk menghandle file upload (docs[], noteData[photos][], dll)



      const fd = buildFormData(
        this.formData,
        this.hasCompanyId,
        this.companyid,
      );

      this.insertCompany(fd)
        .then((data) => {
          const message = this.isEditMode
            ? "Company berhasil diperbarui!"
            : "Company berhasil ditambahkan!";
          // alertService.success(message);
           toast.success(message);
          console.log(data.param);
          if (this.hasCompanyId) {
            this.$emit("submit", data);
            this.setclearcompanybyid();
          }
          this.savedCompany = data.param;
          this.showDetailForm = false;
          this.activeTab = "Contacts";
          // this.resetForm();
          // this.handleClose();
        })
        .catch((error) => {
          // alertService.error(
          //   error.response?.data?.message ||
          //     error.message ||
          //     "Gagal menyimpan company.",
          // );
           toast.error(
            error.response?.data?.message ||
              error.message ||
              "Gagal menyimpan company.");
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    },

    resetForm() {
      // this.formData = {
      //   company_name: "",
      //   company_owner: "",
      //   owner: this.currentUserName || "",
      //   description: "",
      //   email: "",
      //   telephone: "",
      //   website: "",
      //   industry: "",
      //   address: "",
      //   country: "",
      //   province: "",
      //   city: "",
      //   pos_code: "",
      //   source: "",
      //   type: "",
      //   dealsassoc: [],
      //   contactassoc: [],
      // };
      // this.contactSearch = "";

      this.formData = {
        company_name: "",
        company_owner: "",
        owner: "",
        description: "",
        email: "",
        telephone: "",
        website: "",
        industry: "",
        source: "",
        address: "",
        country: "",
        province: "",
        city: "",
        kecamatan: "",
        kelurahan: "",
        pos_code: "",
        type: "",
        notes: "",
        dealsassoc: [],
        contactassoc: [],
        task: {
          name: "",
          content: "",
          status: "",
          dueDate: "",
          time: "",
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
      this.historyitems = [];
    },

    handleContactSubmit(response) {
      console.log("Contact add success:", response);
      if (this.companyid) {
        this.fetchcompanybyid(this.companyid);
      }

      this.showAddContactForm = false
    },

    handleCreateDealSubmit(response) {
      console.log("Deal create success:", response);
      if (this.companyid) {
        this.fetchcompanybyid(this.companyid);
      }
    },

    handleDetailSubmit() {},

    closeNoteDrawer() {
      this.isNoteDrawerOpen = false;
    },

    // ─── HISTORY & DRAWER METHODS ──────────────────────────────────────────
    openNoteDrawer(editData = null, index = null) {
      console.log("Opening note drawer with data:", editData);
      if (editData) {
        this.tempNoteData = { ...editData };
        this.editingItemIndex = index;
      } else {
        this.tempNoteData = {
          idnote: null,
          body: "",
          gps_address: null,
          latitude: null,
          longitude: null,
          photos: [],
          documents: [],
          audioBlob: null,
        };
        this.editingItemIndex = null;
      }
      this.isNoteDrawerOpen = true;
    },

    buildFormDatanote(data) {
      const fd = new FormData();
      const existing = [];

      // ─── BASIC FIELD ─────────────────────
      fd.append("noteable_type", data.noteable_type);
      fd.append("noteable_id", data.noteable_id);
      fd.append("body", data.body || "");
      fd.append("gps_address", data.gps_address || "");
      fd.append("latitude", data.latitude || "");
      fd.append("longitude", data.longitude || "");
      fd.append("visibility", data.visibility ?? 0);
      fd.append("choice", data.choice || "I");
      fd.append("idnote", data.idnote ?? null);

      // ─── PHOTOS ─────────────────────────
      (data.photos || []).forEach((p) => {
        if (p.file) {
          fd.append("photos[]", p.file);
        } else if (typeof p.src === "string") {
          // Existing photo
          existing.push({
            name: p.src
              .split("/")
              .pop()
              .replace(/^\d+_[^_]+_/, ""),
            path: p.src,
            type: "photo",
          });
        }
      });

      // ─── DOCUMENTS ──────────────────────
      (data.documents || []).forEach((d) => {
        if (d.file instanceof File) {
          fd.append("documents[]", d.file);
        } else if (d.url) {
          // Existing document
          existing.push({
            name: d.name,
            path: d.url,
            type: "document",
          });
        }
      });

      if (existing.length > 0) {
        fd.append("existing_attachments", JSON.stringify(existing));
      }

      return fd;
    },

    saveNoteFromDrawer() {
      // if (!this.tempNoteData.body && this.tempNoteData.photos.length === 0) {
      //   alertService.toastWarn("Note masih kosong");
      //   return;
      // }
      const isUpdate = !!this.tempNoteData.idnote;

      const item = {
        noteable_type: "CM",
        noteable_id: this.companyid,
        // id:
        ...this.tempNoteData,
        choice: isUpdate ? "U" : "I",
      };
      const formData = this.buildFormDatanote(item);
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      this.saveNote(formData)
        .then(() => {
          alertService.success("Catatan berhasil disimpan");
          this.isNoteDrawerOpen = false;
          // Refresh history list
          this.acthistory({
            noteable_type: "CM",
            noteable_id: this.companyid,
          });
        })
        .catch((err) => {
          alertService.error(
            err.response?.data?.message ||
              err.message ||
              "Gagal menyimpan catatan",
          );
        });

      // let formdata = new FormData();
      // formdata.append("noteable_type", "CM");
      // formdata.append("noteable_id", this.companyid);
      // formdata.append("body", this.tempNoteData.body);
      // formdata.append("latitude", this.tempNoteData.latitude);
      // formdata.append("longitude", this.tempNoteData.longitude);
      // // fd.append("noteData[body]", data.body || "");
      // // fd.append("noteData[latitude]", data.latitude || "");
      // // fd.append("noteData[longitude]", data.longitude || "");
      // (this.tempNoteData.photos || []).forEach(
      //   (p) => p.file && formdata.append("photos", p.file),
      // );
      // (this.tempNoteData.documents || []).forEach(
      //   (d) => d.file && formdata.append("documents", d.file),
      // );
      // formdata.append(this.tempNoteData);

      // this.saveNote(this.tempNoteData);
    },

    handleHistoryEdit({ item, index }) {
      if (item.type === "note") {
        let attachments = [];
        try {
          if (typeof item.attachment === "string" && item.attachment !== "") {
            attachments = JSON.parse(item.attachment);
          } else if (Array.isArray(item.attachment)) {
            attachments = item.attachment;
          }
        } catch (e) {
          console.error("Failed to parse attachments for edit", e);
        }

        const editData = {
          idnote: item.id,
          body: item.notes || item.body || "",
          latitude: item.lat,
          longitude: item.lang,
          gps_address:
            item.lat && item.lang ? `${item.lat}, ${item.lang}` : null,
          photos: attachments
            .filter((a) => a.type === "photo" || a.typefile === "photo")
            .map((a) => a.path || a.fileurl),
          documents: attachments
            .filter((a) => a.type === "document" || a.typefile === "document")
            .map((a) => ({
              id: Math.random(),
              name: a.name || (a.path || a.fileurl).split("/").pop(),
              url: a.path || a.fileurl,
              file: null,
            })),
          visibility: item.visibility || "0",
        };

        console.log("Editing note with data:", editData);

        this.openNoteDrawer(editData, index);
      } else {
        this.openDocDrawer(item, index);
      }
    },

    async handleHistoryDelete(index) {
      // Get the item from the display list
      const item = this.$refs.historyDetail?.displayItems[index];
      if (!item) return;

      const result = await alertService.confirm(
        "Apakah Anda yakin ingin menghapus catatan ini?",
        "Hapus Histori",
        {
          confirmButtonText: "Ya, hapus",
          cancelButtonText: "Kembali",
        },
      );

      if (result) {
        const formData = new FormData();
        formData.append("choice", "D");
        formData.append("idnote", item.id);
        formData.append("noteable_type", "CM");
        formData.append("noteable_id", this.companyid);

        try {
          await this.saveNote(formData);
          alertService.success("Catatan berhasil dihapus");
          // Refresh history list
          this.acthistory({
            noteable_type: "CM",
            noteable_id: this.companyid,
          });
        } catch (err) {
          alertService.error(
            err.response?.data?.message ||
              err.message ||
              "Gagal menghapus catatan",
          );
        }
      }
    },

    async handleRemoveContact(contactId) {
      const confirm = await alertService.confirm(
        "Apakah Anda yakin ingin menghapus hubungan contact ini?",
        "Hapus Hubungan Contact",
        {
          confirmButtonText: "Ya, Hapus",
          cancelButtonText: "Kembali",
        },
      );

      if (!confirm) return;

      // Filter out ID from formData
      this.formData.contactassoc = this.formData.contactassoc.filter(
        (id) => String(id) !== String(contactId),
      );

      // Update store state for immediate UI feedback
      const storeState = this.$store.state.company;
      const currentCompanyById = storeState.companybyid;

      if (
        currentCompanyById &&
        Array.isArray(currentCompanyById.contactassoc)
      ) {
        const updated = { ...currentCompanyById };
        updated.contactassoc = updated.contactassoc.filter(
          (c) => String(c.id) !== String(contactId),
        );
        this.$store.commit("company/setcompanybyid", updated);
      }

      alertService.toastSuccess("Hubungan contact dilepaskan");
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
          {{ isEditMode ? "Edit Company" : "Create Company" }}
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
          v-if="hasCompanyId"
          type="button"
          @click="activeTab = 'Contacts'"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            activeTab === 'Contacts'
              ? 'border-dark-base text-dark-base'
              : 'border-transparent text-sub-text hover:text-dark-base',
          ]"
        >
          Contacts
        </button>
        <button
          v-if="hasCompanyId"
          type="button"
          @click="activeTab = 'Deals'"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            activeTab === 'Deals'
              ? 'border-dark-base text-dark-base'
              : 'border-transparent text-sub-text hover:text-dark-base',
          ]"
        >
          Deals
        </button>
        <button
          v-if="hasCompanyId"
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
      <div class="flex-1 overflow-y-auto min-h-0">
        <!-- Master Tab Form -->
        <form
          v-if="activeTab === 'master'"
          @submit.prevent
          id="createCompanyForm"
        >
          <!-- master -->
          <div v-if="activeTab === 'master'" class="p-6 space-y-6">
            <!-- Company Name & Owner -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-dark-base mb-2"
                  >Company Name <span class="text-red-600">*</span></label
                >
                <input
                  v-model="formData.company_name"
                  type="text"
                  placeholder="Ex Siap Soft"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-dark-base mb-2"
                  >Company Owner <span class="text-red-600">*</span></label
                >
                <input
                  v-model="formData.company_owner"
                  type="text"
                  placeholder="Ex Abdul"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-dark-base mb-2"
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
                <label class="block text-sm font-medium text-dark-base mb-2"
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
                <label class="block text-sm font-medium text-dark-base mb-2"
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
                <label class="block text-sm font-medium text-dark-base mb-2"
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
                <label class="block text-sm font-medium text-dark-base mb-2"
                  >Industry</label
                >
                <div class="relative">
                  <v-select
                    v-model="formData.industry"
                    :options="industries"
                    label="label"
                    :reduce="(opt) => opt.value"
                    placeholder="Select Industry"
                  />
                </div>
              </div>
            </div>

            <!-- Address & City | Province & Country -->
            <LocationSelector v-model="formData" />

            <!-- Pos Code & Source -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-dark-base mb-2"
                  >Source</label
                >
                <div class="relative">
                  <v-select
                    v-model="formData.source"
                    :options="sources"
                    label="label"
                    :reduce="(opt) => opt.value"
                    placeholder="Select Source"
                  />
                </div>
              </div>
              <!-- Type -->
              <div>
                <label class="block text-sm font-medium text-dark-base mb-2"
                  >Type</label
                >
                <div class="relative">
                  <v-select
                    v-model="formData.type"
                    :options="types"
                    label="label"
                    :reduce="(opt) => opt.value"
                    placeholder="Select Type"
                  />
                </div>
              </div>
            </div>

            <!-- <div class="grid grid-cols-1 gap-4"></div> -->

            <!-- Contact Association -->
            <!-- <ContactAssociationForm v-model="formData.contactassoc" />
            <DealAssociationForm v-model="formData.dealsassoc" /> -->
          </div>
        </form>

        <!-- Contacts Tab (History) -->
        <div v-if="activeTab === 'Contacts'" class="p-6 h-full">
          <ContactSection
            :contacts="companybyidcontactassociated"
            @remove="(data) => onContactassocSave('d', data)"
            @save="(data) => onContactassocSave('i', data)"
            @add-new="showAddContactForm = true"
          />
        </div>

        <!-- Deals Tab (History) -->
        <div v-if="activeTab === 'Deals'" class="p-6 h-full flex flex-col">
          <DealsSection
            :deals="companybyiddealsassociated"
            @remove="(data) => ondealsassocSave('d', data)"
            @save="(data) => ondealsassocSave('i', data)"
            @add-new="showCreateDealForm = true"
          />
        </div>

        <!-- History Tab (History) -->
        <div v-if="activeTab === 'detail'" class="p-6 h-full flex flex-col">
          <HistoryDetail
            ref="historyDetail"
            :items="historyitems"
            :noteableType="'CM'"
            :noteableId="companyid"
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
            :disabled="isSubmitting"
            class="px-6 py-2 border border-outline rounded-lg text-sub-text hover:bg-light-base transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleSave"
            :disabled="isSubmitting"
            class="px-6 py-2 bg-dark-base text-white rounded-lg hover:bg-dark-hover transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <template v-if="isSubmitting">
              <span
                class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
              ></span>
              <span>Saving...</span>
            </template>
            <template v-else> Save </template>
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Add Deal Form -->
  <!-- <AddDealForm
    :isOpen="showAddDealForm"
    @close="showAddDealForm = false"
    @submit="handleDealFormSubmit"
  /> -->

  <!-- Add Contact Full Form -->
  <AddContactForm
    :isOpen="showAddContactForm"
    :companys_id="this.companyid"
    :hideDetailTab="true"
    fromPage="company"
    @close="showAddContactForm = false"
    @submit="handleContactSubmit"
  />

  <CreateDealForm
    :isOpen="showCreateDealForm"
    :companys_id="this.companyid"
    :hideDetailTab="true"
    fromPage="company"
    @close="showCreateDealForm = false"
    @saved="handleCreateDealSubmit"
  />

  <!-- <ContactDetailForm
    :isOpen="showDetailForm"
    title="Create Company / Details"
    saveButtonText="Save Company"
    entityType="company"
    :isSaving="isSubmitting"
    @close="showDetailForm = false"
    @back="showDetailForm = false"
    @submit="handleDetailSubmit"
  /> -->

  <!-- Note Drawer POPUP -->
  <Transition name="slide">
    <div v-if="isNoteDrawerOpen" class="fixed inset-0 z-60">
      <div class="absolute inset-0 bg-black/40" @click="closeNoteDrawer"></div>

      <div
        class="absolute top-0 right-0 h-screen w-full max-w-2xl bg-white shadow-2xl flex flex-col"
        @click.stop
      >
        <div
          class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10"
        >
          <h2 class="text-xl font-bold text-dark-base">
            {{ editingItemIndex !== null ? "Edit Note" : "Tambah Note" }}
          </h2>
          <button
            @click="closeNoteDrawer"
            class="p-2 hover:bg-light-base rounded-lg transition-colors"
          >
            <X :size="20" class="text-sub-text" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <NotesEditor v-model:note-data="tempNoteData" />
        </div>

        <div
          class="bg-white px-6 py-4 border-t border-outline flex justify-end gap-3"
        >
          <button
            @click="closeNoteDrawer"
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
</style>
