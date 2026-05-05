<template>
  <div class="flex flex-col h-full">
    <div
      class="bg-white rounded-lg shadow-sm p-4 border border-outline flex flex-col min-h-0 flex-1 gap-2"
    >
      <ContactsHeader
        :isLoading="isLoading"
        :contactsStatusText="contactsStatusText"
        :contactsStatusClass="contactsStatusClass"
        :downloadLabel="downloadLabel"
        :showAddDropdown="showDropdown"
        :showDownloadDropdown="showDownloadDropdown"
        @refresh="fetchData"
        @toggle-add-dropdown="toggleDropdown"
        @toggle-download-dropdown="toggleDownloadDropdown"
        @open-add-single="openAddSingle"
        @open-bulk-add="openBulkAdd"
        @download-all="downloadAll"
        @download="handleDownload"
        @delete-selected="handleDeleteContacts"
      />

      <ContactsFilterBar
        v-model:itemsPerPage="itemsPerPage"
        v-model:currentPage="currentPage"
        v-model:searchQuery="searchQuery"
        :totalPages="totalPages"
        @prev-page="prevPage"
        @next-page="nextPage"
        @search="handleSearch"
      />

      <!-- <ContactsTable
        :contacts="tableContacts"
        :isLoading="isLoading"
        :selectedIds="selectedIds"
        :allSelected="allSelected"
        @update:selectedIds="selectedIds = $event"
        @toggle-select-all="toggleSelectAll"
        @row-click="openContactDetail"
        @open-add-single="openAddSingle"
      /> -->

      <DataGrid
        ref="contactGrid"
        :dataSource="tableContacts"
        :keyExpr="'id'"
        :selectedRowKeys="selectedIds"
        @focused-row-changed="handleFocusedRowChanged"
        @edit-click="handleRowEdit"
        @delete-click="handleRowDelete"
        @cell-prepared="handleCellPrepared"
        @contentready="handleContentReady"
        @selection-changed="handleSelectionChanged"
        :rowRenderingMode="'standard'"
        :showActionColumn="true"
        :wordwrap="true"
        :columnAutoWidth="isDesktop"
        :columnHidingEnabled="false"
        :height="'100%'"
        :columns="contactColumns"

        <!----> :disablecol="[
          'First Name',
          'Last Name',
          'Email',
          'Address',
          'Telephone',
          'ID',
          'statusid',
          'taskid',
          'tasks',
          'location',
          'pathphoto',
          'deals',
          'contact',
          'id',
          'email',
          'phone',
          'first_name',
          'last_name',
          'job_title',
          'id_owner',
          'telephone_1',
          'telephone_2',
          'status',
          'address',
          'country',
          'province',
          'city',
          'pos_code',
          'source',
          'companyassoc',
          'dealsassoc',
          'notes',
          'created_at',
          'updated_at',
          'owner_name',
          'task_name',
          'desktask',
          'statustask',
          'assignee',
          'due_date',
          'task_time',
          'prioritytask',
          'docs',
          'associated_contact',
          'telephone_3',
          'state',
          'zip',
          'company_id',
          'deal_id',
          'company_label',
          'deal_label',
          'level',
          'isParent',
          'keyindex',
          'PageTotal',
          'owner',
          'descdocs',
          'pathfile',
          'file_source',
        ]" -->
      >
        <DxSelection mode="multiple" showCheckBoxesMode="always" />
      </DataGrid>
    </div>

    <!-- Add Contact Form -->
    <AddContactForm
      :isOpen="showAddContactForm"
      @close="closeAddContactForm"
      @submit="handleContactSubmit"
    />

    <!-- Contact Detail Form
    <DetailForm
      :isOpen="showDetailForm"
      title="Add Contact / Details"
      saveButtonText="Save Contact"
      :entityType="'contact'"
      :contact="selectedContact"
      :isSaving="isDetailFormSubmitting"
      @close="showDetailForm = false"
      @submit="handleDetailFormSubmit"
    /> -->

    <!-- Contact Data Detail Form (for row click) -->
    <DetailDataContact
      :isOpen="showDetailDataContact"
      :contactData="selectedContact"
      @close="closeDetailDataContact"
      @submit="
        (data) => {
          showDetailDataContact = false;
          showDetailForm = false;
          fetchData(); // 🔥 Refresh data after submit
        }
      "


      />
<!--       
            :contact="selectedContact"
            :isSubmitting="isDetailDataSubmitting"
            @close="closeDetailDataContact"
            @back="closeDetailDataContact"
            @submit="handleDetailDataContactSubmit" -->

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
import { alertService } from "@/services/alertService";
import { useStatuses } from "@/composables/useStatuses";

import { DxSelection } from "devextreme-vue/data-grid";

import ContactsHeader from "./ContactsHeader.vue";
import ContactsFilterBar from "./ContactsFilterBar.vue";
import ContactsTable from "./ContactsTable.vue";

import AddContactForm from "../../forms/AddContactForm.vue";
import DetailDataContact from "../../forms/AddContactForm.vue";

import BulkAddContactForm from "../../forms/BulkAddContactForm.vue";
import DetailForm from "../../forms/DetailFormDuplicate.vue";

import {
  getAssociationCandidates,
  resolveAssociationLabels,
} from "@/utils/associations";
import { buildUpdateContactPayload } from "@/utils/contactPayload";
import {
  buildEntityDetailPayload,
  buildDetailFormPayload,
  getDetailSaveAction,
  getUpdateAction,
} from "@/utils/detailFormPayload";

import DataGrid from "@/components/widgets/DataGrid.vue";

export default {
  name: "Contacts",

  components: {
    ContactsHeader,
    ContactsFilterBar,
    ContactsTable,
    AddContactForm,
    BulkAddContactForm,
    DetailForm,
    DetailDataContact,
    DataGrid,
    DxSelection,
  },

  data() {
    return {
      // server pagination + filters
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: "",

      // statuses mapping
      statuses: [],

      // dropdowns & modals
      showAddContactForm: false,
      showBulkAddForm: false,
      showDropdown: false,
      showDownloadDropdown: false,

      // selection & detail
      selectedIds: [],
      selectedContact: null,
      showDetailForm: false,
      showDetailDataContact: false,
      isDetailDataSubmitting: false,
      isDetailFormSubmitting: false,
      detailFormEntityId: null,
      gridInitialized: false,
      // responsive flag: true when desktop viewport
      isDesktop: true,
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

    contactColumns() {
      const desktop = this.isDesktop;

      const makeCol = (opts) => {
        const col = {
          dataField: opts.dataField,
          caption: opts.caption,
          visible: opts.visible !== false,
          allowHiding: opts.allowHiding === true,
          allowResizing: true,
        };
        if (!desktop && opts.width) col.width = opts.width;
        return col;
      };

      return [
        makeCol({ dataField: "Contact Name", caption: "Contact Name", width: 240, allowHiding: false }),
        makeCol({ dataField: "Contact Info", caption: "Contact Info", width: 280, allowHiding: false }),
        makeCol({ dataField: "Status", caption: "Status", width: 150, allowHiding: false }),
      ];
    },

    totalContacts() {
      return this.pagination?.total || 0;
    },

    totalPages() {
      return this.pagination?.last_page || 1;
    },

    contactsStatusText() {
      if (this.isLoading) return "Searching contacts...";
      return `${this.totalContacts.toLocaleString()} Total Contacts`;
    },

    contactsStatusClass() {
      if (this.isLoading) return "text-blue-600";
      return "text-sub-text";
    },

    downloadLabel() {
      return this.selectedIds.length
        ? `Download (${this.selectedIds.length})`
        : "Download";
    },

    // untuk checkbox select-all di table
    allSelected() {
      const ids = (this.contacts || []).map((c) => c.id).filter(Boolean);
      if (!ids.length) return false;
      return ids.every((id) => this.selectedIds.includes(id));
    },

    // View-model untuk table agar ContactsTable.vue simpel
    tableContacts() {
      const baseContacts = this.contacts || [];

      const companyOptions = (this.allCompanies || []).map((company) => ({
        value: company.id,
        label: company.company_name || company.name || "Unknown",
      }));

      const dealOptions = (this.allDeals || []).map((deal) => ({
        value: deal.id,
        label: deal.deal_name || deal.name || "Unknown",
      }));

      return baseContacts.map((contact) => {
        const companyCandidates = getAssociationCandidates(
          contact?.companyassoc,
          contact?.companiesAssociation,
          contact?.company_id,
          contact?.companies_id,
          contact?.company,
          contact?.company_name,
        );

        const dealCandidates = getAssociationCandidates(
          contact?.dealsassoc,
          contact?.dealsAssociation,
          contact?.deal_id,
          contact?.deals_id,
          contact?.deal,
          contact?.deal_name,
        );

        const companyLabels = resolveAssociationLabels(
          companyCandidates,
          companyOptions,
        );
        const dealLabels = resolveAssociationLabels(
          dealCandidates,
          dealOptions,
        );

        const companyStr = (companyLabels.length ? companyLabels : ["-"]).join(
          ", ",
        );
        const dealStr = (dealLabels.length ? dealLabels : ["-"]).join(", ");

        const rawStatus =
          contact.status_name ||
          contact.name_status ||
          contact.statusName ||
          contact.statusname ||
          contact.Status ||
          contact.status ||
          contact.statusid ||
          contact.status_id ||
          contact.statusId;

        const resolvedStatusName =
          typeof rawStatus === "number" || /^[0-9]+$/.test(String(rawStatus))
            ? this.getStatusName(rawStatus)
            : rawStatus || this.getStatusName(contact.status);

        return {
          ...contact,
          id: contact.id,
          email: contact.email,
          phone: contact.telephone_1,
          "Contact Name": `${contact.first_name || ""} ${
            contact.last_name || ""
          }`.trim(),
          "Contact Info": `${contact.email || "-"}\n${contact.telephone_1 || "-"}`,
          "Associated with": `${companyStr}\n${dealStr}`,
          Status: resolvedStatusName,
          statusname: resolvedStatusName,
          /*"Created/Update": this.formatDate(
            contact.updated_at || contact.created_at,
          ),
          Owner: contact.owner_name || contact.owner || "-",*/
        };
      });
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
    handleContactSubmit(data) {
  this.fetchData(); // async
  this.showAddContactForm = false;
},
    resolveContactFromTemplate(templateOptions) {
      if (!templateOptions) return null;
      return (
        templateOptions?.data?.data ||
        templateOptions?.row?.data ||
        templateOptions?.data ||
        templateOptions
      );
    },

    handleRowEdit(templateOptions) {
      const contact = this.resolveContactFromTemplate(templateOptions);
      if (!contact) return;
      this.openContactDetail(contact);
    },

    async handleRowDelete(templateOptions) {
      const contact = this.resolveContactFromTemplate(templateOptions);
      const contactId = contact?.id;

      if (!contactId) {
        alertService.error("ID contact tidak ditemukan.");
        return;
      }

      const contactName =
        contact?.["Contact Name"] ||
        [contact?.first_name, contact?.last_name].filter(Boolean).join(" ") ||
        contact?.email ||
        "contact ini";

      const confirmDelete = await alertService.confirm(
        "Hapus Contact?",
        `${contactName} akan dihapus secara permanen.`,
      );

      if (!confirmDelete) return;

      try {
        await this.deleteContact(contactId);
        this.selectedIds = this.selectedIds.filter((id) => id !== contactId);
        alertService.success("Contact berhasil dihapus");
        this.fetchData();
      } catch (err) {
        const status = err?.response?.status;
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message;
        alertService.error(
          `Gagal menghapus contact ${status ? `(Status ${status})` : ""}. ${message || ""}`,
        );
      }
    },

    handleFocusedRowChanged(e) {
      const contact = e?.data;
      if (contact) {
        this.openContactDetail(contact);
      }
    },
    handleContentReady(e) {
      if (!this.gridInitialized && e.component) {
        const instance = e.component;

        // Define widths (only when mobile / not desktop)
        //instance.columnOption("Contact Name", "width", 250);
        //instance.columnOption("Contact Info", "width", 240);
        //instance.columnOption("Associated with", "width", 240);
        if (!this.isDesktop) {
          instance.columnOption("Status", "width", 150);
        }
        //instance.columnOption("Created/Update", "width", 180);
        //instance.columnOption("Owner", "width", 180);

        // Define robust stacked templates
        instance.columnOption(
          "Contact Name",
          "cellTemplate",
          (container, options) => {
            const val = options.displayValue || "-";
            container.innerHTML = `<div style="font-weight: bold; color: #1e293b;">${val}</div>`;
          },
        );

        instance.columnOption(
          "Contact Info",
          "cellTemplate",
          (container, options) => {
            const email = options.data.email || "-";
            const phone = options.data.phone || "-";
            container.innerHTML = `
            <div style="display: block; width: 100%;">
              <div style="color: #1e293b; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${phone}</div>
              <div style="color: #64748b; font-size: 12px; margin-top: 2px; display: block;">${email}</div>
            </div>
          `;
          },
        );

        instance.columnOption(
          "Associated with",
          "cellTemplate",
          (container, options) => {
            const val = options.displayValue || "-";
            const parts = val.split("\n");
            container.innerHTML = `
            <div style="display: block; width: 100%;">
              ${parts
                .map(
                  (text, idx) => `
                <div style="color: ${idx === 0 ? "#1e293b" : "#64748b"}; font-size: ${idx === 0 ? "13px" : "12px"}; margin-top: ${idx > 0 ? "2px" : "0"}; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${text}
                </div>
              `,
                )
                .join("")}
            </div>
          `;
          },
        );

        // Status column: show readable name as plain text (no badge)
        const vm = this;
        instance.columnOption("Status", "cellTemplate", (container, options) => {
          const data = options.data || {};
          const name =
            data.Status ||
            data.statusname ||
            data.status_name ||
            data.name_status ||
            data.statusName ||
            vm.getStatusName(data.status) ||
            vm.getStatusName(data.status_id) ||
            vm.getStatusName(data.statusid) ||
            "-";

          // Render plain text
          container.innerText = name;
        });

        this.gridInitialized = true;
      }
    },
    handleSelectionChanged(e) {
      this.selectedIds = e.selectedRowKeys || [];
    },
    handleCellPrepared(e) {
      // We moved rendering to cellTemplate for robustness
    },
    ...mapActions({
      fetchAllContacts: "contacts/fetchAllContacts",
      fetchAllcompany: "company/fetchAllcompany",
      fetchAllDeals: "deals/fetchAllDeals",
      updateContact: "contacts/updateContact",
      saveContactDetail: "contacts/saveContactDetail",
      deleteContact: "contacts/deleteContact",
    }),

    // ========================
    // API / data
    // ========================
    fetchData() {
      // kalau store belum support params, kamu bisa abaikan param di action
      return this.fetchAllContacts({
        page: this.currentPage,
        per_page: this.itemsPerPage,
        // q: this.searchQuery, // aktifkan kalau API mendukung search
      }).catch((err) => {
        console.error("Failed to fetch contacts:", err);
      });
    },

    handleSearch() {
      // Saat search, reset page
      this.currentPage = 1;
      this.fetchData();
    },

    // ========================
    // Header dropdown actions
    // ========================
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
      // optional: close lainnya
      if (this.showDropdown) this.showDownloadDropdown = false;
    },

    toggleDownloadDropdown() {
      this.showDownloadDropdown = !this.showDownloadDropdown;
      if (this.showDownloadDropdown) this.showDropdown = false;
    },

    openAddSingle() {
      this.showAddContactForm = true;
      this.showDropdown = false;
    },

    openBulkAdd() {
      this.showBulkAddForm = true;
      this.showDropdown = false;
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

    // ========================
    // Table selection
    // ========================
    toggleSelectAll(checked) {
      const ids = (this.contacts || []).map((c) => c.id).filter(Boolean);
      this.selectedIds = checked ? ids : [];
    },

    // ========================
    // Detail modal
    // ========================
    openContactDetail(contact) {
      this.selectedContact = { ...contact };
      this.showDetailDataContact = true;
    },

    closeAddContactForm() {
      this.showAddContactForm = false;
      this.selectedContact = null;
    },

    closeDetailDataContact() {
      this.showDetailDataContact = false;
      this.selectedContact = null;
    },

    handleDetailDataContactSubmit(payload) {
      const contactId = this.selectedContact?.id;

      const { data, error } = buildUpdateContactPayload({
        selectedContactId: contactId,
        payload,
      });

      if (error) return alertService.error(error);

      const { data: detailPayload, error: detailError } =
        buildEntityDetailPayload({
          entityType: "contact",
          entityId: contactId,
          payload,
        });

      if (detailError) return alertService.error(detailError);

      this.isDetailDataSubmitting = true;

      this.updateContact(data)
        .then(() => this.saveContactDetail(detailPayload))
        .then(() => {
          alertService.success("Detail contact berhasil diperbarui.");
          this.closeDetailDataContact();
        })
        .catch((err) => {
          const message =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Gagal update contact.";
          alertService.error(message);
        })
        .finally(() => {
          this.isDetailDataSubmitting = false;
        });
    },

    handleDetailFormSubmit(data) {
      const entityType = data?.entityType || "contact";
      const entityId = this.detailFormEntityId;

      if (!entityId) {
        return alertService.error("ID entity tidak ditemukan.");
      }

      const detailActionName = getDetailSaveAction(entityType);
      const payloadBuilder = detailActionName
        ? buildEntityDetailPayload
        : buildDetailFormPayload;

      const { data: payload, error } = payloadBuilder({
        entityType,
        entityId,
        payload: data,
      });

      if (error) {
        return alertService.error(error);
      }

      this.isDetailFormSubmitting = true;

      const actionName = detailActionName || getUpdateAction(entityType);
      if (!actionName) {
        this.isDetailFormSubmitting = false;
        return alertService.error(
          `Entity type "${entityType}" tidak didukung.`,
        );
      }

      this.$store
        .dispatch(actionName, payload)
        .then(() => {
          alertService.success(
            `Detail ${entityType} berhasil disimpan ke database.`,
          );
          this.showDetailForm = false;
          this.detailFormEntityId = null;
          // Refresh data setelah save
          return this.fetchAllContacts();
        })
        .catch((error) => {
          const message =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            `Gagal menyimpan detail ${entityType}`;

          alertService.error(message);
        })
        .finally(() => {
          this.isDetailFormSubmitting = false;
        });
    },

    handleAddContact(contactData) {
      console.log("New contact:", contactData);
      // TODO: Implement API call via Vuex
    },

    // ========================
    // Delete
    // ========================
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
        .catch((err) => {
          const status = err?.response?.status;
          const message =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message;

          alertService.error(
            `Gagal menghapus contact ${status ? `(Status ${status})` : ""}. ${
              message || ""
            }`,
          );
        });
    },

    // ========================
    // Pagination helpers (filter bar)
    // ========================
    prevPage() {
      if (this.currentPage > 1) this.currentPage -= 1;
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage += 1;
    },

    // ========================
    // Utilities
    // ========================
    handleClickOutside(e) {
      if (
        !e.target.closest(".printable-dropdown") &&
        !e.target.closest(".add-dropdown")
      ) {
        this.showDropdown = false;
        this.showDownloadDropdown = false;
      }
    },

    updateIsDesktop() {
      this.isDesktop = window.innerWidth >= 1024;
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

    getStatusClass(status) {
      if (!status) return "bg-gray-100 text-gray-700";

      // Map status ID to class
      const statusId = parseInt(status);
      if (statusId === 1 || statusId === 6 || statusId === 7)
        return "bg-green-100 text-green-700"; // Competitor, Partner, Qualified
      if (statusId === 4) return "bg-yellow-100 text-yellow-700"; // Lead
      if (statusId === 5) return "bg-blue-100 text-blue-700"; // Opportunity

      return "bg-gray-100 text-gray-700";
    },

    getStatusName(id) {
      if (!id) return "-";
      // If already a string (name), return as-is
      if (typeof id === "string") return id;
      // If numeric ID, map to name
      const status = this.statuses.find((s) => s.id == id);
      return status ? status.name : "-";
    },

    // async fetchStatuses() {
    //   try {
    //     const { cookies } = await import("vue3-cookies");
    //     const api = (await import("@/api")).default;
    //     const response = await api.get("statuses", {
    //       headers: {
    //         Authorization: "Bearer " + cookies.get("token"),
    //       },
    //     });
    //     this.statuses = response.data || [];
    //   } catch (error) {
    //     console.error("Failed to fetch statuses:", error);
    //     // Fallback
    //     this.statuses = [
    //       { id: 1, name: "Competitor" },
    //       { id: 2, name: "Customer" },
    //       { id: 3, name: "Ex Customer" },
    //       { id: 4, name: "Lead" },
    //       { id: 5, name: "Opportunity" },
    //       { id: 6, name: "Partner" },
    //       { id: 7, name: "Qualified" },
    //     ];
    //   }
    // },
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside);

    // responsive setup
    this.updateIsDesktop();
    window.addEventListener('resize', this.updateIsDesktop);

    // Load statuses first so grid can render status names instead of ids
    try {
      const statusUtil = useStatuses();
      statusUtil
        .fetchStatuses()
        .then((data) => {
          this.statuses = data || [];
        })
        .catch((err) => {
          console.warn("Failed to load statuses, fallback will be used:", err);
        })
        .finally(() => {
          // Fetch contacts after statuses are loaded (or fallback applied)
          this.fetchData();
        });
    } catch (e) {
      // If composable fails for any reason, still fetch contacts
      console.warn("useStatuses failed:", e);
      this.fetchData();
    }
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
    window.removeEventListener('resize', this.updateIsDesktop);
  },
};
</script>

<style scoped>
/* tidak berubah dari file lama */
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

/* Compact row spacing */
:deep(.dx-datagrid-rowsview .dx-row > td) {
  padding-top: 6px !important;
  padding-bottom: 6px !important;
  vertical-align: middle !important;
}

:deep(.dx-datagrid-headers .dx-header-row > td) {
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}
</style>