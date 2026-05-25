<template>
  <div class="bg-white rounded-xl shadow-sm border border-outline p-6 mb-5">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800">Leads Report</h2>

      <div ref="filterMenuRef" class="relative">
        <button
          @click="toggleFilterMenu"
          class="text-slate-400 hover:text-gray-700 px-2 py-1 rounded"
          title="Filter"
        >
          •••
        </button>

        <div
          v-if="showFilterMenu"
          class="absolute right-0 mt-2 w-40 bg-white border border-outline rounded-lg shadow-lg z-20 py-1"
        >
          <button
            v-for="option in rangeOptions"
            :key="option.value"
            @click="selectRange(option.value)"
            class="w-full text-left px-3 py-2 text-sm hover:bg-outline/20 transition"
            :class="
              option.value === selectedRange
                ? 'text-main-text font-semibold'
                : 'text-sub-text'
            "
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Table Head (Desktop only) -->
    <div
      class="hidden md:grid md:grid-cols-[1.2fr_2fr_2fr_1fr_1fr_0.8fr] text-sm text-slate-500 font-medium border-b pb-3 items-center"
    >
      <span>Name</span>
      <span>Company</span>
      <span>Email</span>
      <span>Projects</span>
      <span class="text-center">Duration</span>
      <span class="text-center">Status</span>
    </div>

    <!-- Rows -->
    <div v-if="isLoading" class="py-6 text-center text-sm text-sub-text">
      Loading leads...
    </div>

    <div
      v-else-if="filteredLeads.length === 0"
      class="py-6 text-center text-sm text-sub-text"
    >
      No leads data from database.
    </div>

    <div v-else class="mt-3 max-h-80 overflow-y-auto pr-1 space-y-3">
      <div
        v-for="(lead, i) in filteredLeads"
        :key="lead.id || i"
        :class="['py-3 px-3 rounded-xl', i % 2 ? 'bg-slate-100/60' : '']"
      >
        <!-- Tampilan Mobile (Stack) -->
        <div class="md:hidden space-y-1 text-sm">
          <div>
            <span class="font-semibold text-slate-500">Name:</span>
            <span class="font-medium text-gray-800 ml-1">{{ lead.name }}</span>
          </div>
          <div>
            <span class="font-semibold text-slate-500">Company:</span>
            <span class="text-gray-700 ml-1">{{ lead.company }}</span>
          </div>
          <div>
            <span class="font-semibold text-slate-500">Email:</span>
            <span class="text-gray-600 ml-1 truncate">{{ lead.email }}</span>
          </div>
          <div>
            <span class="font-semibold text-slate-500">Projects:</span>
            <span class="text-gray-700 ml-1">{{ lead.project }}</span>
          </div>
          <div>
            <span class="font-semibold text-slate-500">Duration:</span>
            <span class="text-gray-700 ml-1">{{ lead.duration }}</span>
          </div>
          <div>
            <span class="font-semibold text-slate-500">Status:</span>
            <span
              :class="[
                'ml-2 px-2 py-0.5 rounded-full text-xs font-semibold inline-block',
                statusClass(lead.status),
              ]"
            >
              {{ lead.status }}
            </span>
          </div>
        </div>

        <!-- Tampilan Desktop (Grid) -->
        <div
          class="hidden md:grid md:grid-cols-[1.5fr_2.5fr_2.5fr_1.5fr_1fr_0.8fr] items-center text-sm"
        >
          <div class="font-medium text-gray-800">{{ lead.name }}</div>
          <div class="text-gray-700">{{ lead.company }}</div>
          <div class="truncate">{{ lead.email }}</div>
          <div>{{ lead.project }}</div>
          <div class="text-center">{{ lead.duration }}</div>
          <div class="flex justify-center">
            <span
              :class="[
                'px-4 py-1 rounded-full text-xs font-semibold',
                statusClass(lead.status),
              ]"
            >
              {{ lead.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LeadsReport",
  props: {
    contacts: {
      type: Array,
      default: () => [],
    },
    companies: {
      type: Array,
      default: () => [],
    },
    deals: {
      type: Array,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showFilterMenu: false,
      selectedRange: "yearly",
      rangeOptions: [
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
        { value: "yearly", label: "Yearly" },
      ],
      filterMenuRef: null,
    };
  },
  computed: {
    leads() {
      return this.deals.map((deal) => {
        const dealContactCandidates = this.toAssociationCandidates(
          deal?.contactassoc,
          deal?.dealsassoc,
          deal?.contacts_id,
          deal?.contact_id,
          deal?.contact_association,
          deal?.contactAssociation,
        );

        let contact = this.contacts.find((item) =>
          dealContactCandidates.includes(String(item.id)),
        );

        if (!contact) {
          const dealContactName = String(
            deal?.contact || deal?.contact_name || "",
          ).toLowerCase();

          if (dealContactName) {
            contact = this.contacts.find((item) => {
              return (
                this.getContactName(item).toLowerCase() === dealContactName
              );
            });
          }
        }

        const contactCompanyCandidates = this.toAssociationCandidates(
          contact?.companyassoc,
          contact?.companiesAssociation,
          contact?.company_id,
          contact?.companies_id,
        );

        const dealCompanyCandidates = this.toAssociationCandidates(
          deal?.companyassoc,
          deal?.companies_id,
          deal?.company_id,
          deal?.companies_association,
          deal?.companiesAssociation,
          deal?.company,
          deal?.company_name,
        );

        const company =
          this.findCompanyByCandidates(contactCompanyCandidates) ||
          this.findCompanyByCandidates(dealCompanyCandidates);

        const rawStatus = String(
          deal?.pipeline || deal?.stage || "",
        ).toLowerCase();

        let status = "Process";
        if (rawStatus.includes("won")) status = "Won";
        else if (rawStatus.includes("lost")) status = "Lost";

        return {
          id: deal.id,
          name: contact ? this.getContactName(contact) : deal?.contact || "-",
          company: company
            ? this.getCompanyName(company)
            : deal?.company || deal?.company_name || "-",
          email: contact?.email || deal?.email || deal?.contact_email || "-",
          project: deal?.deal_name || deal?.name || deal?.project || "-",
          duration: this.formatDate(
            deal?.duration ||
              deal?.expected_close_date ||
              deal?.expectedCloseDate ||
              deal?.tertanggal,
          ),
          status,
          timestamp: this.getDealTimestamp(deal),
        };
      });
    },
    filteredLeads() {
      const day = 24 * 60 * 60 * 1000;
      const now = Date.now();

      const rangeMap = {
        weekly: 7,
        monthly: 30,
        yearly: 365,
      };

      const maxAgeDays = rangeMap[this.selectedRange] || 365;
      const threshold = now - maxAgeDays * day;

      return this.leads.filter((lead) => {
        if (!lead.timestamp) return true;
        return lead.timestamp >= threshold;
      });
    },
  },
  methods: {
    formatDate(value) {
      if (!value) return "-";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    },
    toAssociationCandidates(...values) {
      const candidates = [];

      values.forEach((value) => {
        if (value === "" || value === null || value === undefined) return;

        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item !== "" && item !== null && item !== undefined) {
              candidates.push(item);
            }
          });
          return;
        }

        if (typeof value === "object") {
          if (value.id !== undefined && value.id !== null && value.id !== "") {
            candidates.push(value.id);
          }
          if (
            value.value !== undefined &&
            value.value !== null &&
            value.value !== ""
          ) {
            candidates.push(value.value);
          }
          return;
        }

        String(value)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .forEach((item) => candidates.push(item));
      });

      return [...new Set(candidates.map((item) => String(item).trim()))].filter(
        Boolean,
      );
    },
    getContactName(contact = {}) {
      return (
        contact.name ||
        contact.contact_name ||
        [contact.first_name, contact.last_name].filter(Boolean).join(" ") ||
        contact.email ||
        `Contact ${contact.id || ""}`
      );
    },
    getCompanyName(company = {}) {
      return (
        company.company_name || company.name || `Company ${company.id || ""}`
      );
    },
    findCompanyByCandidates(candidates = []) {
      if (candidates.length === 0) return null;

      const byId = this.companies.find((company) =>
        candidates.includes(String(company.id)),
      );
      if (byId) return byId;

      const candidateLower = candidates.map((candidate) =>
        candidate.toLowerCase(),
      );
      return (
        this.companies.find((company) => {
          const companyName = String(
            company.company_name || company.name || "",
          ).toLowerCase();
          return candidateLower.includes(companyName);
        }) || null
      );
    },
    getDealTimestamp(deal = {}) {
      const rawDate =
        deal?.created_at ||
        deal?.updated_at ||
        deal?.expected_close_date ||
        deal?.expectedCloseDate ||
        deal?.duration ||
        deal?.tertanggal;

      if (!rawDate) return null;

      const timestamp = new Date(rawDate).getTime();
      return Number.isFinite(timestamp) ? timestamp : null;
    },
    statusClass(status) {
      if (status === "Won") return "bg-green-100 text-green-600";
      if (status === "Lost") return "bg-red-100 text-red-500";
      return "bg-amber-100 text-amber-500";
    },
    toggleFilterMenu() {
      this.showFilterMenu = !this.showFilterMenu;
    },
    selectRange(value) {
      this.selectedRange = value;
      this.showFilterMenu = false;
    },
    handleClickOutside(event) {
      if (!this.showFilterMenu) return;
      if (
        this.$refs.filterMenuRef &&
        !this.$refs.filterMenuRef.contains(event.target)
      ) {
        this.showFilterMenu = false;
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>
