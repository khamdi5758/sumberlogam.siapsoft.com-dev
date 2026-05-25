<template>
  <div class="bg-white rounded-2xl w-full shadow-sm border border-outline p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-main-text">Deals Overview</h2>
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

    <!-- Sub Header -->
    <div class="flex justify-between text-sm text-sub-text font-medium mb-4">
      <span>Pipeline Summary ({{ selectedRangeLabel }})</span>
      <span>Total</span>
    </div>

    <!-- Pipeline Items -->
    <div class="space-y-3">
      <div
        v-for="item in pipelineItems"
        :key="item.key"
        class="grid grid-cols-[1fr_64px] items-center gap-4"
      >
        <div class="h-9 flex items-center">
          <div
            class="relative w-full h-9 rounded-md bg-outline/20 overflow-hidden"
          >
            <div
              class="h-full bg-outline/40 transition-all duration-500 ease-out"
              :style="{ width: getBarWidth(item.total) }"
            ></div>
            <span
              class="absolute inset-y-0 left-3 flex items-center text-sm font-medium text-main-text"
            >
              {{ item.label }}
            </span>
          </div>
        </div>
        <span
          class="text-sm font-medium text-main-text text-right tabular-nums"
        >
          {{ displayCount(item.total) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DealsOverview",
  props: {
    // Array of deals objects
    deals: {
      type: Array,
      default: () => [],
    },
    // Loading state
    isLoadingDeals: {
      type: Boolean,
      default: false,
    },
    // Array of pipeline definitions: [{ id: Number, pipeline_name: String }, ...]
    // Needed when the deal.pipeline value is stored as ID (integer) instead of string.
    pipelines: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      showFilterMenu: false,
      selectedRange: "yearly",
      rangeOptions: [
        { value: "yearly", label: "A Year" },
        { value: "monthly", label: "Monthly" },
        { value: "weekly", label: "Weekly" },
      ],
    };
  },
  computed: {
    selectedRangeLabel() {
      const found = this.rangeOptions.find(
        (item) => item.value === this.selectedRange,
      );
      return found ? found.label : "A Year";
    },
    filteredDeals() {
      if (this.isAggregateMode) {
        return this.deals;
      }

      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      const rangeMap = { yearly: 365, monthly: 30, weekly: 7 };
      const maxAgeDays = rangeMap[this.selectedRange] || 365;
      const threshold = now - maxAgeDays * day;

      return this.deals.filter((deal) => {
        const ts = this.getDealTimestamp(deal);
        return !!ts && ts >= threshold;
      });
    },
    pipelineItems() {
      if (this.isAggregateMode) {
        return this.deals.map((item, index) => ({
          key: item.pipeline_id ?? item.pipelineId ?? index,
          label: this.getPipelineLabel(
            item.pipeline_id ?? item.pipelineId ?? index + 1,
          ),
          total: Number(item.jumlah ?? item.total ?? item.count ?? 0),
        }));
      }

      // Stage keys: new, qualified, proposal, negotiation, won, lost
      const counters = {
        new: 0,
        qualified: 0,
        proposal: 0,
        negotiation: 0,
        won: 0,
        lost: 0,
      };

      this.filteredDeals.forEach((deal) => {
        const key = this.normalizePipelineKey(deal);
        if (counters[key] !== undefined) {
          counters[key] += 1;
        }
      });

      return [
        { key: "new", label: "New", total: counters.new },
        { key: "qualified", label: "Qualified", total: counters.qualified },
        { key: "proposal", label: "Proposal", total: counters.proposal },
        {
          key: "negotiation",
          label: "Negotiation",
          total: counters.negotiation,
        },
        { key: "won", label: "Close Won", total: counters.won },
        { key: "lost", label: "Close Lost", total: counters.lost },
      ];
    },
    maxPipelineTotal() {
      return Math.max(...this.pipelineItems.map((item) => item.total), 0);
    },
    isAggregateMode() {
      return this.deals.some(
        (item) =>
          Object.prototype.hasOwnProperty.call(item, "jumlah") ||
          Object.prototype.hasOwnProperty.call(item, "total") ||
          Object.prototype.hasOwnProperty.call(item, "count"),
      );
    },
  },
  methods: {
    getPipelineLabel(pipelineId) {
      const id = String(pipelineId ?? "").trim();

      const labelMap = {
        1: "New",
        2: "Qualified",
        3: "Proposal",
        4: "Negotiation",
        5: "Close Won",
        6: "Close Lost",
      };

      if (labelMap[id]) {
        return labelMap[id];
      }

      return `Pipeline ${id || "-"}`;
    },

    /**
     * Map raw deal.pipeline value (could be string or ID) to one of:
     *   new | qualified | proposal | negotiation | won | lost
     *
     * Priority:
     * 1. If pipelines prop is provided, try to match by ID.
     * 2. Fallback to normalizing the raw string value.
     */
    normalizePipelineKey(deal) {
      const raw = deal?.pipeline ?? deal?.stage ?? "new";

      // If raw looks like a number (ID) and we have pipelines, map using ID
      const numericId = Number(raw);
      if (this.pipelines.length > 0 && !isNaN(numericId)) {
        const pipeline = this.pipelines.find(
          (p) =>
            Number(p.id) === numericId || Number(p.id_pipeline) === numericId,
        );
        if (pipeline) {
          return this.mapLabelToKey(
            pipeline.pipeline_name || pipeline.label || "",
          );
        }
      }

      // Otherwise treat as string
      return this.mapLabelToKey(String(raw));
    },

    /**
     * Convert a pipeline label string to a canonical key.
     */
    mapLabelToKey(label) {
      const lower = label.toLowerCase().trim();

      if (lower === "new" || lower.includes("new")) return "new";
      if (lower === "qualified" || lower.includes("qualified"))
        return "qualified";
      if (
        lower === "proposal" ||
        lower.includes("proposal") ||
        lower.includes("offer")
      )
        return "proposal";
      if (
        lower === "negotiation" ||
        lower.includes("negotiation") ||
        lower.includes("advanced")
      )
        return "negotiation";
      if (
        lower.includes("won") ||
        lower.includes("close_won") ||
        lower.includes("close won")
      )
        return "won";
      if (
        lower.includes("lost") ||
        lower.includes("close_lost") ||
        lower.includes("close lost")
      )
        return "lost";

      // Default to new
      return "new";
    },

    getDealTimestamp(deal) {
      const rawDate =
        deal?.created_at || deal?.updated_at || deal?.expected_close_date;
      if (!rawDate) return null;
      const parsed = new Date(rawDate).getTime();
      return Number.isFinite(parsed) ? parsed : null;
    },

    getBarWidth(total) {
      if (this.isLoadingDeals) return "100%";
      if (this.maxPipelineTotal === 0) return "0%";
      return `${(total / this.maxPipelineTotal) * 100}%`;
    },

    formatCount(value) {
      return Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value || 0);
    },

    displayCount(value) {
      return this.isLoadingDeals ? "..." : this.formatCount(value);
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
      const menu = this.$refs.filterMenuRef;
      if (menu && !menu.contains(event.target)) {
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
