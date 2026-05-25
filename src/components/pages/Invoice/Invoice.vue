<script>
import InvoiceHeader from "./InvoiceHeader.vue";
import InvoiceFilterBar from "./InvoiceFilterBar.vue";
import { alertService } from "@/services/alertService";
import DataGrid from "@/components/widgets/DataGrid.vue";
import { DxSelection } from "devextreme-vue/data-grid";

export default {
  name: "Invoice",
  components: {
    InvoiceHeader,
    InvoiceFilterBar,
    DataGrid,
    DxSelection,
  },
  data() {
    return {
      showCreateForm: false,
      showBulkAddForm: false,
      showDetailForm: false,
      showAddDropdown: false,
      showDownloadDropdown: false,
      selectedInvoice: null,
      isDetailSubmitting: false,
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 10,
      invoices: [
        {
          id: 1,
          invoice_no: "INV-2024-001",
          tanggal: "2024-01-15",
          nama_deals: "(data dummy) Website Project A",
          jumlah_tagihan: 15000000,
          status: "paid",
        },
        {
          id: 2,
          invoice_no: "INV-2024-002",
          tanggal: "2024-01-20",
          nama_deals: "(data dummy) Mobile App Development",
          jumlah_tagihan: 25000000,
          status: "pending",
        },
        {
          id: 3,
          invoice_no: "INV-2024-003",
          tanggal: "2024-02-01",
          nama_deals: "(data dummy) System Integration",
          jumlah_tagihan: 18000000,
          status: "pending",
        },
        {
          id: 4,
          invoice_no: "INV-2024-004",
          tanggal: "2024-02-10",
          nama_deals: "(data dummy) Consulting Services",
          jumlah_tagihan: 5000000,
          status: "paid",
        },
        {
          id: 5,
          invoice_no: "INV-2024-005",
          tanggal: "2024-02-15",
          nama_deals: "(data dummy) Database Migration",
          jumlah_tagihan: 12000000,
          status: "overdue",
        },
        {
          id: 6,
          invoice_no: "INV-2024-006",
          tanggal: "2024-02-20",
          nama_deals: "(data dummy) API Integration",
          jumlah_tagihan: 8000000,
          status: "pending",
        },
        {
          id: 7,
          invoice_no: "INV-2024-007",
          tanggal: "2024-02-25",
          nama_deals: "(data dummy) Cloud Migration",
          jumlah_tagihan: 30000000,
          status: "pending",
        },
        {
          id: 8,
          invoice_no: "INV-2024-008",
          tanggal: "2024-03-01",
          nama_deals: "(data dummy) Security Audit",
          jumlah_tagihan: 10000000,
          status: "paid",
        },
      ],
    };
  },
  computed: {
    totalInvoices() {
      return this.invoices.length;
    },
    totalPages() {
      return Math.ceil(this.filteredInvoices.length / this.itemsPerPage);
    },
    filteredInvoices() {
      let filtered = this.invoices;
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (inv) =>
            inv.invoice_no.toLowerCase().includes(query) ||
            inv.nama_deals.toLowerCase().includes(query),
        );
      }
      return filtered;
    },
    paginatedInvoices() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredInvoices.slice(start, end);
    },
    downloadLabel() {
      return "Download";
    },
    invoiceStatusText() {
      return `${this.totalInvoices} Total Invoices`;
    },
    invoiceStatusClass() {
      return "text-sub-text";
    },
    invoiceColumns() {
      return [
        { dataField: "invoice_no", caption: "Invoice No", visible: true },
        { dataField: "tanggal", caption: "Tanggal", visible: true },
        { dataField: "nama_deals", caption: "Nama Deals", visible: true },
        {
          dataField: "jumlah_tagihan",
          caption: "Jumlah Tagihan",
          visible: true,
        },
        { dataField: "status", caption: "Status", visible: true },
      ];
    },
    tableInvoices() {
      return this.paginatedInvoices;
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    toggleDropdown() {
      this.showAddDropdown = !this.showAddDropdown;
    },

    toggleDownloadDropdown() {
      this.showDownloadDropdown = !this.showDownloadDropdown;
    },

    handleClickOutside(e) {
      if (
        !e.target.closest(".add-dropdown") &&
        !e.target.closest(".download-dropdown")
      ) {
        this.showAddDropdown = false;
        this.showDownloadDropdown = false;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    closeDetailForm() {
      this.selectedInvoice = null;
      this.showDetailForm = false;
    },

    handleDetailSubmit() {
      alertService.success("Invoice updated successfully");
      this.closeDetailForm();
    },

    handleDeleteInvoices() {
      alertService.warning("Select at least one invoice to delete");
    },

    downloadAll() {
      console.log("Download all invoices");
      this.showDownloadDropdown = false;
    },

    handleDownload() {
      console.log("Download invoices");
      this.showDownloadDropdown = false;
    },
    handleRowEdit(templateOptions) {
      const invoice = this.resolveInvoiceFromTemplate(templateOptions);
      if (!invoice) return;
      this.selectedInvoice = { ...invoice };
      this.showDetailForm = true;
    },

    handleRowDelete(templateOptions) {
      const invoice = this.resolveInvoiceFromTemplate(templateOptions);
      if (!invoice) return;

      alertService
        .confirm(
          "Delete Invoice?",
          `Are you sure you want to delete invoice ${invoice.invoice_no}?`,
        )
        .then((confirmed) => {
          if (confirmed) {
            this.invoices = this.invoices.filter(
              (inv) => inv.id !== invoice.id,
            );
            alertService.success("Invoice deleted successfully");
          }
        });
    },

    resolveInvoiceFromTemplate(templateOptions) {
      const { dataIndex } = templateOptions;
      return this.tableInvoices[dataIndex] || null;
    },
  },
};
</script>

<template>
  <div class="flex flex-col h-full">
    <div
      class="bg-white rounded-lg shadow-sm p-4 border border-outline flex flex-col min-h-0 flex-1"
    >
      <InvoiceHeader
        :isLoading="false"
        :invoiceStatusText="invoiceStatusText"
        :invoiceStatusClass="invoiceStatusClass"
        :downloadLabel="downloadLabel"
        :showAddDropdown="showAddDropdown"
        :showDownloadDropdown="showDownloadDropdown"
        @refresh="() => {}"
        @toggle-add-dropdown="toggleDropdown"
        @toggle-download-dropdown="toggleDownloadDropdown"
        @open-add-single="
          showCreateForm = true;
          showAddDropdown = false;
        "
        @open-bulk-add="
          showBulkAddForm = true;
          showAddDropdown = false;
        "
        @download-all="downloadAll"
        @download="handleDownload"
        @delete-selected="handleDeleteInvoices"
      />

      <InvoiceFilterBar
        v-model:itemsPerPage="itemsPerPage"
        v-model:currentPage="currentPage"
        v-model:searchQuery="searchQuery"
        :totalPages="totalPages"
        @prev-page="prevPage"
        @next-page="nextPage"
        @search="() => (currentPage = 1)"
        @onEnter="() => (currentPage = 1)"
      />

      <!-- Table Section -->
      <div class="mt-4 flex-1 min-h-0 overflow-auto relative">
        <div v-if="paginatedInvoices.length > 0" class="w-full h-full">
          <DataGrid
            :dataSource="tableInvoices"
            :columns="invoiceColumns"
            :keyExpr="'id'"
            :selectedRowKeys="[]"
            :rowRenderingMode="'standard'"
            :showActionColumn="true"
            :disablecol="['id']"
            @edit-click="handleRowEdit"
            @delete-click="handleRowDelete"
          >
            <DxSelection mode="multiple" showCheckBoxesMode="always" />
          </DataGrid>
        </div>

        <!-- Empty State -->
        <div v-else class="absolute inset-0 flex items-center justify-center">
          <div class="flex flex-col items-center gap-3 text-center">
            <div
              class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <span class="text-2xl">📋</span>
            </div>
            <p class="text-lg font-medium text-main-text">No invoices found</p>
            <p class="text-sm text-gray-400">
              Create your first invoice to get started
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
