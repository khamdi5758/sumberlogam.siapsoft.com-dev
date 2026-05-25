<template>
  <div class="bg-white rounded-xl shadow-sm border border-outline p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-main-text">Top Contacts</h2>
      <button class="text-slate-400 hover:text-gray-700">•••</button>
    </div>

    <!-- Table Header (Desktop only) -->
    <div
      class="hidden md:grid grid-cols-[2fr_0.7fr_1.2fr_1fr] text-sm text-slate-500 font-medium border-b pb-3"
    >
      <div>Contact</div>
      <div class="text-center">Deals</div>
      <div class="text-center">Last Activity</div>
      <div class="text-right">Deals Value</div>
    </div>

    <!-- Rows -->
    <div v-if="isLoading" class="py-6 text-center text-sm text-sub-text">
      Loading contacts...
    </div>

    <div
      v-else-if="formattedContacts.length === 0"
      class="py-6 text-center text-sm text-sub-text"
    >
      No contact data from database.
    </div>

    <div v-else class="mt-3">
      <div
        v-for="(contact, i) in formattedContacts"
        :key="contact.id"
        :class="[
          'py-3 px-3 border-b border-gray-100 last:border-0',
          i % 2 === 0 ? 'bg-slate-50/60 rounded' : '',
        ]"
      >
        <!-- Tampilan Mobile (Stack) -->
        <div class="md:hidden space-y-1 text-sm">
          <div>
            <!-- <span class="font-semibold text-slate-500">Contact:</span> -->
            <span class="font-medium text-gray-800">{{ contact.name }}</span>
          </div>
          <div>
            <span class="font-semibold text-slate-500">Deals:</span>
            <span class="text-gray-700 ml-1">{{ contact.deals }}</span>
            <span class="font-semibold text-slate-500"> | </span>
            <span class="font-semibold text-slate-500">Last Activity:</span>
            <span class="text-gray-700 ml-1">{{ contact.last }}</span>
          </div>
        </div>

        <!-- Tampilan Desktop (Grid) -->
        <div
          class="hidden md:grid grid-cols-[2fr_0.7fr_1.2fr_1fr] items-center text-sm"
        >
          <div class="font-medium text-gray-800">{{ contact.name }}</div>
          <div class="text-center text-gray-700">{{ contact.deals }}</div>
          <div class="text-center text-gray-700">{{ contact.last }}</div>
          <div class="text-right font-medium text-gray-800">
            {{ contact.value }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TopContacts",
  props: {
    contacts: {
      type: Array,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    formattedContacts() {
      return this.contacts.slice(0, 5).map((contact, index) => ({
        id: contact.id ?? index,
        name: this.getContactName(contact),
        deals: this.formatCount(contact.jumlahdeal ?? contact.deals ?? 0),
        last: this.formatDate(contact.lastactivity || contact.last_activity),
        value: this.formatCurrency(
          contact.dealsvalue ??
            contact.amount_value ??
            contact.total_value ??
            0,
        ),
      }));
    },
  },
  methods: {
    getContactName(contact) {
      return (
        contact.name ||
        contact.contact ||
        contact.contact_name ||
        [contact.first_name, contact.last_name].filter(Boolean).join(" ") ||
        contact.email ||
        `Contact ${contact.id || ""}`
      );
    },
    formatDate(value) {
      if (!value) return "-";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
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
  },
};
</script>
