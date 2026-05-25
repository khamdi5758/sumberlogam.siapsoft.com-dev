<template>
  <div class="bg-white rounded-xl shadow-sm border border-outline p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-main-text">Top Company</h2>
      <button class="text-slate-400 hover:text-gray-700">•••</button>
    </div>

    <!-- Table Header (Desktop only) -->
    <div
      class="hidden md:grid grid-cols-[2fr_0.6fr_1.2fr_0.8fr] text-sm text-slate-500 font-medium border-b pb-3"
    >
      <div>Company</div>
      <div class="text-center">Deals</div>
      <div class="text-center">Total Deal Value</div>
      <div class="text-right">% of Total</div>
    </div>

    <!-- Rows -->
    <div v-if="isLoading" class="py-6 text-center text-sm text-sub-text">
      Loading companies...
    </div>

    <div
      v-else-if="formattedCompanies.length === 0"
      class="py-6 text-center text-sm text-sub-text"
    >
      No company data from database.
    </div>

    <div v-else class="mt-3">
      <div
        v-for="(company, i) in formattedCompanies"
        :key="company.id"
        :class="[
          'py-3 px-3 border-b border-gray-100 last:border-0',
          i % 2 === 0 ? 'bg-slate-50/60 rounded' : '',
        ]"
      >
        <!-- Tampilan Mobile (Stack) -->
        <div class="md:hidden space-y-1 text-sm">
          <div>
            <span class="font-medium text-gray-800">{{ company.name }}</span>
          </div>
          <div>
            <span class="font-semibold text-slate-500">Deals:</span>
            <span class="text-gray-700 ml-1">{{ company.deals }}</span>
            <span class="font-semibold text-slate-500"> | </span>
            <span class="font-semibold text-slate-500">Total Value:</span>
            <span class="font-medium text-gray-800 ml-1">{{
              company.value
            }}</span>
          </div>
        </div>

        <!-- Tampilan Desktop (Grid) -->
        <div
          class="hidden md:grid grid-cols-[2fr_0.6fr_1.2fr_0.8fr] items-center text-sm"
        >
          <div class="font-medium text-gray-800">{{ company.name }}</div>
          <div class="text-center text-gray-700">{{ company.deals }}</div>
          <div class="text-center font-medium text-gray-800">
            {{ company.value }}
          </div>
          <div class="text-right text-gray-700">{{ company.percent }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TopCompany",
  props: {
    companies: {
      type: Array,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    formattedCompanies() {
      return this.companies.slice(0, 5).map((company, index) => ({
        id: company.id ?? index,
        name: this.getCompanyName(company),
        deals: this.formatCount(company.jumlahdeal ?? company.deals ?? 0),
        value: this.formatCurrency(
          company.totaldealvalue ?? company.value ?? company.amount_value ?? 0,
        ),
        percent: this.formatPercent(
          company.percentoftotal ?? company.percent ?? 0,
        ),
      }));
    },
  },
  methods: {
    getCompanyName(company) {
      return (
        company.name ||
        company.company ||
        company.company_name ||
        company.nama_perusahaan ||
        `Company ${company.id || ""}`
      );
    },
    formatCount(value) {
      return Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value || 0);
    },
    formatCurrency(value) {
      const number = Number(value || 0);
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number.isFinite(number) ? number : 0);
    },
    formatPercent(value) {
      const number = Number(value || 0);
      if (!Number.isFinite(number)) return "0%";
      return `${number.toFixed(1)}%`;
    },
  },
};
</script>
