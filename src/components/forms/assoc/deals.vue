<template>
  <div class="relative" ref="dealDropdownRef">
    <label class="block text-sm font-medium text-main-text mb-2">
      Deals Association
    </label>
    <div
      @click="isDealDropdownOpen = !isDealDropdownOpen"
      class="w-full px-3 py-2 border border-outline rounded-lg flex flex-wrap gap-2 items-center cursor-pointer min-h-10.5 bg-white transition focus-within:ring-1 focus-within:ring-sub-text"
    >
      <div v-if="dealsassoc.length === 0" class="text-gray-400 text-sm">
        {{ mode === "single" ? "Select a Deal" : "Search and select Deals" }}
      </div>
      <div
        v-for="deal in selectedDeals"
        :key="deal.id"
        class="flex items-center gap-1 bg-light-base px-2 py-1 rounded text-xs font-medium text-main-text border border-outline"
        @click.stop
      >
        {{ getDisplayNameFromDeal(deal) }}
        <X
          :size="12"
          class="cursor-pointer hover:text-red"
          @click="toggleDeal(deal)"
        />
      </div>
      <ChevronDown :size="16" class="ml-auto text-sub-text" />
    </div>

    <!-- Dropdown Menu -->
    <div
      v-show="isDealDropdownOpen"
      class="absolute z-50 w-full mt-1 bg-white border border-outline rounded-lg shadow-xl flex flex-col max-h-64"
    >
      <div class="p-2 border-b border-outline">
        <div class="relative">
          <Search
            :size="14"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-sub-text"
          />
          <input
            v-model="dealSearch"
            type="text"
            placeholder="Search deals"
            class="w-full pl-9 pr-3 py-2 bg-light-base/50 border border-outline rounded text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
            @click.stop
          />
        </div>
      </div>
      <div class="flex-1 overflow-y-auto py-1">
        <div
          v-for="deal in filteredDeals"
          :key="deal.id"
          @click="toggleDeal(deal)"
          class="px-4 py-2 hover:bg-light-base cursor-pointer flex items-center justify-between text-sm transition"
        >
          <div class="flex flex-col">
            <span class="font-medium text-main-text">{{
              getDisplayNameFromDeal(deal)
            }}</span>
            <span class="text-xs text-sub-text">{{
              deal.description || "No description"
            }}</span>
          </div>
          <div
            v-if="isDealSelected(deal.id)"
            class="w-5 h-5 bg-dark-base rounded-full flex items-center justify-center"
          >
            <Check :size="12" class="text-white" />
          </div>
        </div>
        <div
          v-if="filteredDeals.length === 0"
          class="px-4 py-6 text-center text-sm text-sub-text"
        >
          No deals found
        </div>
      </div>
    </div>
  </div>

  <button
    type="button"
    @click="showAddDealForm = true"
    class="mt-2 text-sm text-sub-text hover:text-main-text font-medium flex items-center gap-1"
  >
    <Plus :size="14" />
    Add Another Deal
  </button>

  <AddDealForm
    :isOpen="showAddDealForm"
    @close="showAddDealForm = false"
    @submit="handleDealFormSubmit"
  />
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { X, ChevronDown, Search, Check, Plus } from "lucide-vue-next";
import AddDealForm from "@/components/forms/AddDealForm.vue";

export default {
  name: "DealAssociationForm",

  components: {
    X,
    ChevronDown,
    Search,
    Check,
    Plus,
    AddDealForm,
  },

  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    // ✅ Prop baru: 'single' atau 'multiple' (default: 'multiple')
    mode: {
      type: String,
      default: "multiple",
      validator: (value) => ["single", "multiple"].includes(value),
    },
  },

  data() {
    return {
      isDealDropdownOpen: false,
      dealSearch: "",
      showAddDealForm: false,
    };
  },

  computed: {
    ...mapGetters({
      allDeals: "assoc/allDeals",
    }),

    dealsassoc: {
      get() {
        return this.modelValue || [];
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },

    filteredDeals() {
      // if (!this.dealSearch) return this.allDeals || [];

      // return (this.allDeals || []).filter((d) => {
      //   const name = (d.deal_name || d.name || "").toLowerCase();
      //   const search = this.dealSearch.toLowerCase();

      //   return name.includes(search);
      // });
      const deals = this.allDeals || [];

      if (!this.dealSearch) {
        return deals.slice(0, 50); // 🔥 batasi 50 dulu
      }

      return deals.filter((d) => {
        const name = (d.deal_name || d.name || "").toLowerCase();
        return name.includes(this.dealSearch.toLowerCase());
      });
    },

    selectedDeals() {
      // return (this.allDeals || []).filter((d) =>
      //   this.dealsassoc.includes(String(d.id).trim()),
      // );

      const selectedSet = new Set(
        this.dealsassoc.map((id) => String(id).trim()),
      );
      return (this.allDeals || []).filter((d) =>
        selectedSet.has(String(d.id).trim()),
      );
    },
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },

  destroyed() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  methods: {
    ...mapActions({
      getdeals: "assoc/getdeals",
    }),

    handleDealFormSubmit() {},

    toggleDeal(deal) {
      const dealId = String(deal.id).trim();

      if (this.mode === "single") {
        // ✅ Single mode: langsung replace dengan item yang dipilih, lalu tutup
        const isSame =
          this.dealsassoc[0] && String(this.dealsassoc[0]).trim() === dealId;
        this.dealsassoc = isSame ? [] : [dealId]; // klik item sama = deselect
        this.isDealDropdownOpen = false;
      } else {
        const index = this.dealsassoc.findIndex(
          (id) => String(id).trim() === dealId,
        );

        let newValue;
        if (index === -1) {
          newValue = [...this.dealsassoc, dealId];
        } else {
          newValue = this.dealsassoc.filter((id, i) => i !== index);
        }
        this.dealsassoc = newValue;
        this.isDealDropdownOpen = false;
      }
    },

    isDealSelected(id) {
      const dealId = String(id).trim();
      return this.dealsassoc.some((did) => String(did).trim() === dealId);
    },

    getDisplayNameFromDeal(deal) {
      return deal.deal_name || deal.name || `Deal #${deal.id}`;
    },

    handleClickOutside(e) {
      if (!this.$refs.dealDropdownRef?.contains(e.target)) {
        this.isDealDropdownOpen = false;
      }
    },

    closeTopLayer() {
      if (this.showAddDealForm) {
        this.showAddDealForm = false;
        return true;
      }

      if (this.isDealDropdownOpen) {
        this.isDealDropdownOpen = false;
        return true;
      }

      return false;
    },
  },
};
</script>
