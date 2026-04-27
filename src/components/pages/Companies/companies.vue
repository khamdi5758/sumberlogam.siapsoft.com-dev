<script>
import { mapState, mapGetters, mapActions } from "vuex";
import { useCookies } from "vue3-cookies";
import api from "@/api";

import CompaniesHeader from "./CompaniesHeader.vue";
import CompaniesFilterBar from "./CompaniesFilterBar.vue";
import CompaniesTable from "./CompaniesTable.vue";

import CreateCompanyForm from "../../forms/CreateCompanyForm.vue";
import BulkAddCompanyForm from "../../forms/BulkAddCompanyForm.vue";
import DetailForm from "../../forms/DetailFormDuplicate.vue";
// import DetailDataCompany from "../../forms/DetailDataCompany.vue";
import DetailDataCompany from "../../forms/CreateCompanyForm.vue";
import { alertService, alertServicenew } from "@/services/alertService";
import {
  buildDetailFormPayload,
  getUpdateAction,
} from "@/utils/detailFormPayload";
import { DxSelection } from "devextreme-vue/data-grid";

import DataGrid from "@/components/widgets/DataGrid.vue";

export default {
  components: {
    CompaniesHeader,
    CompaniesFilterBar,
    CompaniesTable,
    CreateCompanyForm,
    BulkAddCompanyForm,
    DetailForm,
    DetailDataCompany,
    DataGrid,
    DxSelection,
  },

  data() {
    return {
      showCreateCompanyForm: false,
      showBulkAddForm: false,
      showDetailForm: false,
      showDetailDataCompany: false,
      showDropdown: false,
      showDownloadDropdown: false,
      selectedIds: [],
      selectedCompany: null,
      isDetailDataSubmitting: false,
      isDetailFormSubmitting: false,
      detailFormEntityId: null,
      statuses: [],
      debounceTimer: null,
      isAlertOpen: false,
    };
  },

  computed: {
    searchQuery: {
      get() {
        return this.$store.getters["company/searchQuery"];
      },
      set(value) {
        this.$store.dispatch("company/setSearchQuery", value);
      },
    },

    currentPage: {
      get() {
        return this.$store.getters["company/currentPage"];
      },
      set(value) {
        this.$store.dispatch("company/setCurrentPage", value);
      },
    },
    itemsPerPage: {
      get() {
        return this.$store.getters["company/itemsPerPage"];
      },
      set(value) {
        this.$store.dispatch("company/setItemsPerPage", value);
      },
    },

    ...mapGetters({
      companies: "company/companyList",
      getrescompany: "company/getrescompany",
      isLoading: "company/isLoading",
      error: "company/error",
      allContacts: "contacts/allContacts",
      allDeals: "deals/allDeals",
    }),

    totalCompanies() {
      return this.companies.length;
    },

    totalPages() {
      return this.getrescompany.last_page || 0;
      // return Math.max(1, Math.ceil(this.totalCompanies / this.itemsPerPage));
    },

    paginatedCompanies() {
      // Sort by updated_at DESC (newest first)
      const sorted = [...this.companies].sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
        const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
        return dateB - dateA; // DESC: newest first
      });

      // 🔥 Remove manual slicing because the server already paginates
      return sorted;
    },

    allSelected() {
      const ids = this.companies.map((c) => c.id).filter(Boolean);
      if (!ids.length) return false;
      return ids.every((id) => this.selectedIds.includes(id));
    },

    tableCompanies() {
      // console.log("Computing tableCompanies with companies:", this.companies);
      return this.companies;
      return this.paginatedCompanies.map((company) => {
        const contactLabels = this.getAssociatedContactLabels(company);
        const dealLabels = this.getAssociatedDealLabels(company);

        // format date using basic logic since helper is absent
        let formattedDate = "-";
        if (company.updated_at || company.created_at) {
          const date = new Date(company.updated_at || company.created_at);
          formattedDate =
            date.toLocaleDateString() +
            " " +
            date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }

        return {
          ...company,
          contactLabelsText: contactLabels.join(", "),
          dealLabelsText: dealLabels.join(", "),
          updatedAtText: formattedDate,
          typeName: this.getTypeName(company.type),
        };
      });
    },

    downloadLabel() {
      return this.selectedIds.length
        ? `Download (${this.selectedIds.length})`
        : "Download";
    },

    companiesStatusText() {
      if (this.isLoading) return "Searching company...";
      if (this.error) return `Error: ${this.error}`;
      return `${this.getrescompany.total} Total Companies`;
    },

    companiesStatusClass() {
      if (this.isLoading) return "text-blue-600";
      if (this.error) return "text-red-600";
      return "text-sub-text";
    },

    companyColumns() {
      return [
        { dataField: "Company Name", caption: "Company Name", visible: true },
        { dataField: "Company_Owner", caption: "Company Owner", visible: true },

        { dataField: "Email", caption: "Email", visible: true },
        {
          dataField: "Address",
          caption: "Address",
          visible: true,
        },
      ];
    },
  },

  mounted() {
    // this.fetchStatuses();
    this.fetchData();
    // this.fetchAllContacts();
    // this.fetchAllDeals();companyColumns

    document.addEventListener("click", this.handleClickOutside);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  methods: {
    handleFocusedRowChanged(e) {
      if (this.isAlertOpen) return;
      const company = e?.data;

      console.log("Focused company:", company);
      if (company) {
        this.openCompanyDetail(company);
      }
    },
    ...mapActions("company", [
      "fetchAllcompany",
      "fetchcompanybyid",
      "updatecompany",
      "deletecompany",
      "newfetchallcompany",
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
      // if (this.currentPage < this.totalPages) this.currentPage++;
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.fetchData();
      }
    },

    prevPage() {
      // if (this.currentPage > 1) this.currentPage--;
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchData();
      }
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

        console.log("Fetched company detail:", response.data);
        const companyDetail =
          response?.data?.company ||
          response?.data?.data ||
          response?.data ||
          response?.company ||
          response?.companies ||
          company;

        // this.selectedCompany = { ...company, ...companyDetail };
        this.selectedCompany = response.data.companies[0] ?? [];
        this.showDetailDataCompany = true;
      } catch (error) {
        this.selectedCompany = { ...company };
        this.showDetailDataCompany = false;

        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Gagal mengambil detail terbaru dari server. Menampilkan data yang tersedia.";
        alertServicenew.warning(message);
      } finally {
        this.isDetailDataSubmitting = false;
      }
    },

    closeDetailDataCompany() {
      this.selectedCompany = null;
      this.showDetailDataCompany = false;
    },

    handleDetailDataCompanySubmit(payload) {
      // console.log(payload);
      const companyId = this.selectedCompany?.id;
      const companyName = payload?.company?.company_name?.trim();

      if (!companyId) {
        return alertService.error("ID company tidak ditemukan.");
      }

      if (!companyName) {
        return alertService.error("Company Name wajib diisi.");
      }

      this.isDetailDataSubmitting = true;

      this.updatecompany({
        keyedit: companyId,
        formdata: {
          ...payload.company,
          notes: payload?.note || "",
          task_name: payload?.task?.name || "",
          desktask: payload?.task?.content || "",
          statustask: payload?.task?.status || "",
          assignee: payload?.task?.assignee || "",
          due_date: payload?.task?.dueDate || "",
          task_time: payload?.task?.time || "",
          prioritytask: payload?.task?.priority || "",
          associated_contact: payload?.task?.associatedContact || "",
          docs: payload?.docs?.description || "",
          updated_at: new Date().toISOString(),
        },
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

    handleDetailFormSubmit(data) {
      const entityType = data?.entityType || "company";
      const entityId = this.detailFormEntityId;

      if (!entityId) {
        return alertService.error("ID entity tidak ditemukan.");
      }

      const { data: payload, error } = buildDetailFormPayload({
        entityType,
        entityId,
        payload: data,
      });

      if (error) {
        return alertService.error(error);
      }

      this.isDetailFormSubmitting = true;

      if (entityType === "company") {
        this.updatecompany({
          keyedit: entityId,
          formdata: {
            ...(this.selectedCompany || {}),
            notes: data?.note || "",
            task_name: data?.task?.name || "",
            desktask: data?.task?.content || "",
            statustask: data?.task?.status || "",
            assignee: data?.task?.assignee || "",
            due_date: data?.task?.dueDate || "",
            task_time: data?.task?.time || "",
            prioritytask: data?.task?.priority || "",
            associated_contact: data?.task?.associatedContact || "",
            docs: data?.docs?.description || "",
            updated_at: new Date().toISOString(),
          },
        })
          .then(() => {
            alertService.success(
              `Detail ${entityType} berhasil disimpan ke database.`,
            );
            this.showDetailForm = false;
            this.detailFormEntityId = null;
            return this.fetchAllcompany({
              page: this.currentPage,
              per_page: this.itemsPerPage,
              search: this.searchQuery,
            });
          })
          .catch((submitError) => {
            const message =
              submitError?.response?.data?.message ||
              submitError?.response?.data?.error ||
              submitError?.message ||
              `Gagal menyimpan detail ${entityType}`;

            alertService.error(message);
          })
          .finally(() => {
            this.isDetailFormSubmitting = false;
          });
        return;
      }

      const actionName = getUpdateAction(entityType);
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
          return this.fetchAllcompany({
            page: this.currentPage,
            per_page: this.itemsPerPage,
            search: this.searchQuery,
          });
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

    handleDeleteCompanies() {
      if (!this.selectedIds.length) {
        return alertServicenew.warning(
          "Pilih minimal satu company untuk dihapus",
        );
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
          this.fetchData(); // 🔥 Refresh data after successful delete
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

    resolveCompanyFromTemplate(templateOptions) {
      if (!templateOptions) return null;

      // DevExtreme template payload can be nested differently depending on renderer.
      return (
        templateOptions?.data?.data ||
        templateOptions?.row?.data ||
        templateOptions?.data ||
        templateOptions
      );
    },

    handleRowEdit(templateOptions) {
      const company = this.resolveCompanyFromTemplate(templateOptions);
      if (!company) return;
      this.openCompanyDetail(company);
    },

    handleRowDelete(templateOptions) {
      const company = this.resolveCompanyFromTemplate(templateOptions);
      const companyId = company?.id;

      if (!companyId) {
        return alertService.error("ID company tidak ditemukan.");
      }

      const companyName =
        company?.company_name || company?.["Company Name"] || "company ini";

      this.isAlertOpen = true;

      alertService
        .confirm(
          "Hapus Company?",
          `${companyName} akan dihapus secara permanen.`,
        )
        .then((confirmDelete) => {
          this.isAlertOpen = false; // 🔥 reset
          if (!confirmDelete) return;
          return this.deletecompany(companyId);
        })
        .then((result) => {
          if (result === undefined) return;
          this.selectedIds = this.selectedIds.filter((id) => id !== companyId);
          alertService.success("Company berhasil dihapus");
          return this.fetchData();
        })
        .catch(async (error) => {
          this.isAlertOpen = false;
          // Backend may return 500 after delete due to response-query bug.
          // Re-sync list first, then infer final result from actual data.
          try {
            await this.fetchData();
          } catch (_syncError) {
            // ignore sync error and continue with original error handling
          }

          const stillExists = (this.companies || []).some(
            (item) => String(item?.id) === String(companyId),
          );

          if (!stillExists) {
            this.selectedIds = this.selectedIds.filter(
              (id) => id !== companyId,
            );
            alertService.success("Company berhasil dihapus");
            return;
          }

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

    toggleSelectAll(checked) {
      const ids = this.companies.map((c) => c.id).filter(Boolean);
      if (checked) {
        this.selectedIds = [...new Set([...this.selectedIds, ...ids])];
      } else {
        this.selectedIds = this.selectedIds.filter((id) => !ids.includes(id));
      }
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

    async fetchData() {
      this.showDropdown = false;
      this.showDownloadDropdown = false;

      try {
        await this.fetchAllcompany({
          page: this.currentPage,
          per_page: this.itemsPerPage,
          search: this.searchQuery,
        });
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Gagal ambil data company";

        alertService.error(message);
      }

      // return this.fetchAllcompany({ forceRefresh: true }).catch((error) => {
      //   const message =
      //     error?.response?.data?.message ||
      //     error?.response?.data?.error ||
      //     error?.message ||
      //     "Gagal refresh data company";

      //   alertService.error(message);
      // });
    },

    getTypeName(id) {
      if (!id) return "-";
      // If already a string (name), return as-is
      if (typeof id === "string") return id;
      // If numeric ID, map to name
      const status = this.statuses.find((s) => s.id == id);
      return status ? status.name : "-";
    },

    handleSelectionChanged(e) {
      this.selectedIds = e.selectedRowKeys || [];
    },

    async fetchStatuses() {
      try {
        const { cookies } = useCookies();
        const response = await api.get("statuses", {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });
        this.statuses = response.data || [];
      } catch (error) {
        console.error("Failed to fetch statuses:", error);
        // Fallback ke hardcoded jika API fail
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

  watch: {
    totalCompanies() {
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
    },

    selectedCompany(e) {
      console.log("Selected company changed:", e);
    },

    searchQuery(val) {
      clearTimeout(this.debounceTimer);

      this.debounceTimer = setTimeout(() => {
        this.currentPage = 1; // reset ke page 1
        this.fetchData();
      }, 400);
    },

    itemsPerPage() {
      this.currentPage = 1; // reset ke page 1
      this.fetchData();
    },
  },
};
</script>

<template>
  <div class="flex flex-col h-full">
    <div
      class="bg-white rounded-lg shadow-sm p-4 border border-outline flex flex-col min-h-0 flex-1"
    >
      <CompaniesHeader
        :isLoading="isLoading"
        :companiesStatusText="companiesStatusText"
        :companiesStatusClass="companiesStatusClass"
        :downloadLabel="downloadLabel"
        :showAddDropdown="showDropdown"
        :showDownloadDropdown="showDownloadDropdown"
        @refresh="fetchData"
        @toggle-add-dropdown="toggleDropdown"
        @toggle-download-dropdown="toggleDownloadDropdown"
        @open-add-single="
          showCreateCompanyForm = true;
          showDropdown = false;
        "
        @open-bulk-add="handleBulkAdd"
        @download-all="downloadAll"
        @download="handleDownload"
        @delete-selected="handleDeleteCompanies"
      />

      <CompaniesFilterBar
        v-model:itemsPerPage="itemsPerPage"
        v-model:currentPage="currentPage"
        v-model:searchQuery="searchQuery"
        :totalPages="totalPages"
        @prev-page="prevPage"
        @next-page="nextPage"
        @search="fetchData"
        @onEnter="fetchData"
      />

      <!-- <CompaniesTable
        :companies="tableCompanies"
        :isLoading="isLoading"
        :selectedIds="selectedIds"
        :allSelected="allSelected"
        @update:selectedIds="selectedIds = $event"
        @toggle-select-all="toggleSelectAll"
        @row-click="openCompanyDetail"
      /> -->

      <DataGrid
        :dataSource="tableCompanies"
        :columns="companyColumns"
        :keyExpr="'id'"
        :selectedRowKeys="selectedIds"
        :rowRenderingMode="'standard'"
        @focused-row-changed="handleFocusedRowChanged"
        @selection-changed="handleSelectionChanged"
        @edit-click="handleRowEdit"
        @delete-click="handleRowDelete"
        :showActionColumn="true"
        :disablecol="[
          'tasks',
          'location',
          'pathphoto',
          'id',
          'contactassoc',
          'dealsassoc',
          'notes',
          'task_name',
          'desktask',
          'statustask',
          'assignee',
          'due_date',
          'task_time',
          'prioritytask',
          'docs',
          'associated_contact',
          'contactAssociation',
          'contacts_id',
          'contact_id',
          'contact',
          'contact_name',
          'deals_id',
          'deal_id',
          'deal',
          'deal_name',
          'contact_email',
          'contact_phone',
          'industry',
          'website',
          'state',
          'zip',
          'country',
          'phone',
          'telephone_1',
          'telephone_2',
          'telephone_3',
          'pos_code',
          'source',
          'dealsAssociation',
          'description',
          'file_source',
          'file_url',
          'pathfile',
          'descdocs',
          'owner',
          'province',
          'city',
          'telephone',
          'type',
        ]"
      >
        <DxSelection mode="multiple" showCheckBoxesMode="always" />
      </DataGrid>
    </div>

    <!-- Add Company Form -->
    <CreateCompanyForm
      :isOpen="showCreateCompanyForm"
      @close="showCreateCompanyForm = false"
      @submit="
        (data) => {
          console.log('Company added:', data);
          showCreateCompanyForm = false;
          // showDetailDataCompany = true;
          showDetailForm = false;
          fetchData(); // 🔥 Refresh data after submit
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

    <!-- Detail Form (Notes, Tasks, Docs) -->
    <!-- <DetailForm
      :isOpen="showDetailForm"
      :entityType="'company'"
      :contact="selectedCompany"
      :isSaving="isDetailFormSubmitting"
      title="Add Company Details"
      saveButtonText="Save Details"
      @close="showDetailForm = false"
      @back="
        showDetailForm = false;
        showCreateCompanyForm = true;
      "
      @submit="handleDetailFormSubmit"
    /> -->

    <!-- <DetailDataCompany
      :isOpen="showDetailDataCompany"
      :company="selectedCompany"
      :isSubmitting="isDetailDataSubmitting"
      @close="closeDetailDataCompany"
      @back="closeDetailDataCompany"
      @submit="handleDetailDataCompanySubmit"
    /> -->

    <DetailDataCompany
      :isOpen="showDetailDataCompany"
      :initialData="selectedCompany"
      @close="showDetailDataCompany = false"
      @submit="
        (data) => {
          console.log('Company added:', data);
          showDetailDataCompany = false;
          showDetailForm = false;
          fetchData(); // 🔥 Refresh data after submit
        }
      "
    />
  </div>
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
