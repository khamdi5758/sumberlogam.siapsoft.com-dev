<template>
  <div class="rounded-lg min-h-28 grid grid-cols-2 lg:grid-cols-4 gap-0.5 mb-5">
    <!-- Contacts Summary Card -->
    <div class="ccard">
      <div class="flex items-center gap-5">
        <div class="w-16 h-16 rounded-xl flex items-center justify-center">
          <Users :size="45" class="text-main-text" />
        </div>
        <div>
          <div class="flex items-left gap-4">
            <h2 class="text-3xl font-bold text-main-text">
              {{ displayContacts }}
            </h2>
          </div>
          <p class="text-sub-text text-sm mt-1">Total Contacts</p>
        </div>
      </div>
    </div>

    <!-- Companies Summary Card -->
    <div class="ccard">
      <div class="flex items-center gap-5">
        <div class="w-16 h-16 rounded-xl flex items-center justify-center">
          <Building2 :size="45" class="text-main-text" />
        </div>
        <div>
          <div class="flex items-left gap-4">
            <h2 class="text-3xl font-bold text-main-text">
              {{ displayCompanies }}
            </h2>
          </div>
          <p class="text-sub-text text-sm mt-1">Total Companies</p>
        </div>
      </div>
    </div>

    <!-- Deals Summary Card -->
    <div class="ccard">
      <div class="flex items-center gap-5">
        <div class="w-16 h-16 rounded-xl flex items-center justify-center">
          <Briefcase :size="45" class="text-main-text" />
        </div>
        <div>
          <div class="flex items-left gap-4">
            <h2 class="text-3xl font-bold text-main-text">
              {{ displayDeals }}
            </h2>
          </div>
          <p class="text-sub-text text-sm mt-1">Total Deals</p>
        </div>
      </div>
    </div>

    <!-- Tasks Summary Card -->
    <div class="ccard">
      <div class="flex items-center gap-5">
        <div class="w-16 h-16 rounded-xl flex items-center justify-center">
          <ClipboardClock :size="45" class="text-main-text" />
        </div>
        <div>
          <div class="flex items-left gap-4">
            <h2 class="text-3xl font-bold text-main-text">
              {{ displayTasks }}
            </h2>
          </div>
          <p class="text-sub-text text-sm mt-1">Total Tasks</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Users, Building2, Briefcase, ClipboardClock } from "lucide-vue-next";

export default {
  name: "SummaryCards",
  components: {
    Users,
    Building2,
    Briefcase,
    ClipboardClock,
  },
  props: {
    contactsTotal: {
      type: Number,
      default: 0,
    },
    companiesTotal: {
      type: Number,
      default: 0,
    },
    dealsTotal: {
      type: Number,
      default: 0,
    },
    tasksTotal: {
      type: Number,
      default: 0,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    displayContacts() {
      if (this.isLoading) return "...";
      return this.formatCount(this.contactsTotal);
    },
    displayCompanies() {
      if (this.isLoading) return "...";
      return this.formatCount(this.companiesTotal);
    },
    displayDeals() {
      if (this.isLoading) return "...";
      return this.formatCount(this.dealsTotal);
    },
    displayTasks() {
      if (this.isLoading) return "...";
      return this.formatCount(this.tasksTotal);
    },
  },
  methods: {
    formatCount(value) {
      return Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value || 0);
    },
  },
};
</script>
