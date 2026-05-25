<template>
  <div
    class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 w-full h-full"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-main-text">Top Salespeople</h2>
      <button class="text-slate-400 hover:text-gray-700">•••</button>
    </div>

    <!-- Table Header (Desktop only) -->
    <div
      class="hidden md:grid grid-cols-[1.5fr_1fr_1fr] gap-4 text-sm text-gray-400 mb-2 px-3"
    >
      <span>Name</span>
      <span class="text-right">Deals</span>
      <span class="text-right">Won</span>
    </div>

    <!-- List -->
    <div v-if="isLoading" class="py-6 text-center text-sm text-sub-text">
      Loading users...
    </div>

    <div
      v-else-if="formattedSalespeople.length === 0"
      class="py-6 text-center text-sm text-sub-text"
    >
      No user data from database.
    </div>

    <div v-else>
      <div
        v-for="(person, i) in formattedSalespeople"
        :key="person.id"
        :class="[
          'py-3 px-3 border-b border-gray-100 last:border-0',
          i % 2 === 0 ? 'bg-slate-50/60 rounded' : '',
        ]"
      >
        <!-- Tampilan Mobile (Stack) -->
        <div class="md:hidden space-y-1 text-sm px-2">
          <div>
            <!-- <span class="font-semibold text-slate-500">Name:</span> -->
            <span class="font-medium text-gray-700 ml-1">{{
              person.name
            }}</span>
          </div>
          <!--<div>
            <span class="font-semibold text-slate-500">Deals:</span>
            <span class="text-gray-600 ml-1">{{ person.deals }}</span>
          </div>
          <div>
            <span class="font-semibold text-slate-500">Won:</span>
            <span class="font-semibold text-gray-800 ml-1">{{
              person.won
            }}</span>
          </div>-->
        </div>

        <!-- Tampilan Desktop (Grid 3 kolom) -->
        <div
          class="hidden md:grid text-sm grid-cols-[1.5fr_1fr_1fr] gap-4 items-center px-3 py-2 rounded-lg transition"
          :class="i % 2 === 0 ? 'hover:bg-slate-100' : 'hover:bg-gray-50'"
        >
          <span class="font-medium text-gray-700">{{ person.name }}</span>
          <span class="text-right text-gray-600">{{ person.deals }}</span>
          <span class="text-right font-semibold text-gray-800">{{
            person.won
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TopSalespeople",
  props: {
    users: {
      type: Array,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    formattedSalespeople() {
      return this.users.slice(0, 5).map((user, index) => ({
        id: user.id ?? index,
        name: this.getDisplayName(user),
        deals: this.formatCount(user.jumlahdeals ?? user.deals ?? 0),
        won: this.formatCount(user.jumlahwon ?? user.won ?? 0),
      }));
    },
  },
  methods: {
    getDisplayName(user) {
      const fullName =
        user.name ||
        user.user_name ||
        user.username ||
        user.user_name ||
        [user.firstname || user.first_name, user.lastname || user.last_name]
          .filter(Boolean)
          .join(" ") ||
        user.email ||
        `User ${user.id || ""}`;
      return String(fullName).trim();
    },
    formatCount(value) {
      return Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value || 0);
    },
  },
};
</script>
