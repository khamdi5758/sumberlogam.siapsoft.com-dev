<template>
  <div class="relative w-full max-w-35">
    <button
      @click.stop="isOpen = !isOpen"
      :disabled="isSyncing"
      class="w-full px-3 py-1.5 rounded-md text-[11px] font-bold inline-flex items-center justify-between gap-2 border border-transparent transition hover:border-outline/40 disabled:opacity-60"
      :class="stageColor(normalizedStage)"
    >
      <span class="truncate">{{ currentLabel }}</span>
      <chevron-down
        :size="14"
        :class="{ 'rotate-180': isOpen }"
        class="transition-transform duration-200"
      />
    </button>

    <transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute top-full mt-1 left-0 w-44 bg-white border border-outline rounded-lg shadow-xl z-50 py-1 overflow-hidden"
      >
        <button
          v-for="opt in stageOptions"
          :key="opt.value"
          @click.stop="handleSelect(opt.value)"
          class="w-full text-left px-3 py-2 text-xs transition hover:bg-slate-50 flex items-center justify-between group"
          :class="
            normalizedStage === opt.value
              ? 'font-bold text-sub-text bg-slate-50'
              : 'text-gray-600'
          "
        >
          <span>{{ opt.label }}</span>
          <span
            v-if="normalizedStage === opt.value"
            class="text-sub-text text-[10px]"
            >✓</span
          >
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import { ChevronDown } from "lucide-vue-next";

export default {
  name: "StageDropdown",
  components: { ChevronDown },
  props: {
    deal: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isOpen: false,
      isSyncing: false,
      stageOptions: [
        { value: "prospect", label: "Prospect" },
        { value: "qualified", label: "Qualified" },
        { value: "offer", label: "Offer" },
        { value: "negotiation", label: "Negotiation" },
        { value: "closed_won", label: "Won" },
        { value: "closed_lost", label: "Lost" },
        { value: "closed_cancel", label: "Cancel" },
      ],
    };
  },
  computed: {
    normalizedStage() {
      return this.normalizeStage(this.deal.stage || this.deal.pipeline);
    },

    // Label yang ditampilkan pada tombol (berdasarkan stage yang sudah dinormalisasi)
    currentLabel() {
      const found = this.stageOptions.find(
        (opt) => opt.value === this.normalizedStage,
      );
      return found ? found.label : this.normalizedStage;
    },
  },
  methods: {
    // Fungsi untuk menormalisasi berbagai varian stage menjadi kunci standar
    normalizeStage(stage) {
      const s = String(stage || "")
        .toLowerCase()
        .trim();

      if (s.startsWith("closed:")) {
        const [_, status] = s.split(":");
        if (status === "won") return "closed_won";
        if (status === "lost") return "closed_lost";
        if (status === "cancel") return "closed_cancel";
        return "prospect";
      }

      if (s.includes("prospect") || s === "new") return "prospect";
      if (s.includes("qual")) return "qualified";
      if (
        s.includes("offer") ||
        s.includes("proposal") ||
        s.includes("payment")
      )
        return "offer";
      if (s.includes("negot") || s.includes("adv")) return "negotiation";
      if (s === "closed_won" || s.includes("won") || s.includes("closed_won"))
        return "closed_won";
      if (s === "closed_los" || s.includes("lost") || s.includes("closed_lost"))
        return "closed_lost";
      if (
        s === "closed_can" ||
        s.includes("cancel") ||
        s.includes("closed_cancel")
      )
        return "closed_cancel";
      return "prospect";
    },

    // Warna berdasarkan stage yang sudah dinormalisasi
    stageColor(stage) {
      const normalized = this.normalizeStage(stage);
      if (normalized === "prospect") return "bg-slate-100 text-slate-700";
      if (normalized === "qualified") return "bg-blue-100 text-blue-700";
      if (normalized === "offer") return "bg-indigo-100 text-indigo-700";
      if (normalized === "negotiation") return "bg-yellow-100 text-yellow-700";
      if (normalized === "closed_won") return "bg-emerald-100 text-emerald-700";
      if (normalized === "closed_lost") return "bg-red-100 text-red-700";
      if (normalized === "closed_cancel") return "bg-gray-100 text-gray-500";
      return "bg-slate-100 text-slate-700";
    },

    // Menangani pemilihan stage
    async handleSelect(newStage) {
      if (newStage === this.normalizedStage) {
        this.isOpen = false;
        return;
      }

      this.isSyncing = true;
      this.isOpen = false;

      try {
        await this.$store.dispatch("deals/updateDealStage", {
          dealId: this.deal.id,
          newStage,
        });
      } catch (error) {
        console.error("Failed to update stage:", error);
      } finally {
        this.isSyncing = false;
      }
    },
  },
};
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
