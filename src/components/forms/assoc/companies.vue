<template>
  <div class="relative" ref="CompaniesDropdownRef">
    <label class="block text-sm font-medium text-main-text mb-2">
      Companies Association
    </label>
    <div
      @click="isCompaniesDropdownOpen = !isCompaniesDropdownOpen"
      class="w-full px-3 py-2 border border-outline rounded-lg flex flex-wrap gap-2 items-center cursor-pointer min-h-10.5 bg-white transition focus-within:ring-1 focus-within:ring-sub-text"
    >
      <!-- Placeholder -->
      <div v-if="Companiesassoc.length === 0" class="text-gray-400 text-sm">
        {{
          mode === "single" ? "Select a Company" : "Search and select Companies"
        }}
      </div>

      <!-- Selected Tags -->
      <div
        v-for="Companies in selectedCompanies"
        :key="Companies.id"
        class="flex items-center gap-1 bg-light-base px-2 py-1 rounded text-xs font-medium text-main-text border border-outline"
        @click.stop
      >
        {{ Companies.company_name || "" }}
        <X
          :size="12"
          class="cursor-pointer hover:text-red"
          @click="toggleCompanies(Companies)"
        />
      </div>

      <ChevronDown :size="16" class="ml-auto text-sub-text" />
    </div>

    <!-- Dropdown Menu -->
    <div
      v-if="isCompaniesDropdownOpen"
      class="absolute z-50 w-full mt-1 bg-white border border-outline rounded-lg shadow-xl flex flex-col max-h-64"
    >
      <div class="p-2 border-b border-outline">
        <div class="relative">
          <Search
            :size="14"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-sub-text"
          />
          <input
            v-model="CompaniesSearch"
            type="text"
            placeholder="Search by name or email"
            class="w-full pl-9 pr-3 py-2 bg-light-base/50 border border-outline rounded text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
            @click.stop
          />
        </div>
      </div>

      <div
        ref="scrollContainer"
        class="flex-1 overflow-y-auto py-1"
        @scroll="handleScroll"
      >
        <div
          v-for="Companies in filteredCompanies"
          :key="Companies.id"
          @click="toggleCompanies(Companies)"
          class="px-4 py-2 hover:bg-light-base cursor-pointer flex items-center justify-between text-sm transition"
        >
          <div class="flex flex-col">
            <span class="font-medium text-main-text">{{
              Companies.company_name || ""
            }}</span>
            <span class="text-xs text-sub-text">{{ Companies.email }}</span>
          </div>

          <!-- Checkmark: di single mode, tampilkan hanya jika item ini yang terpilih -->
          <div
            v-if="isCompaniesSelected(Companies.id)"
            class="w-5 h-5 bg-dark-base rounded-full flex items-center justify-center"
          >
            <Check :size="12" class="text-white" />
          </div>
        </div>

        <div
          v-if="filteredCompanies.length === 0"
          class="px-4 py-6 text-center text-sm text-sub-text"
        >
          No Companies found
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { X, ChevronDown, Search, Check, Plus } from "lucide-vue-next";

export default {
  name: "CompanyAssociationForm",

  components: { X, ChevronDown, Search, Check, Plus },

  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    initialData: {
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
      isCompaniesDropdownOpen: false,
      CompaniesSearch: "",
      showAddCompaniesQuickForm: false,
      page: 1,
      debounceTimer: null,
      hasMore: false,
    };
  },

  computed: {
    ...mapGetters({
      allCompanies: "assoc/allCompanys",
    }),

    Companiesassoc: {
      get() {
        return this.modelValue || [];
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },

    filteredCompanies() {
      if (!this.CompaniesSearch) return this.allCompanies || [];
      return this.allCompanies;
    },

    selectedCompanies() {
      if (
        !Array.isArray(this.Companiesassoc) ||
        this.Companiesassoc.length === 0
      ) {
        return [];
      }

      const selected = (this.allCompanies || []).filter((company) =>
        this.Companiesassoc.some(
          (id) => String(id).trim() === String(company.id).trim(),
        ),
      );

      const foundIds = selected.map((s) => String(s.id).trim());

      if (Array.isArray(this.initialData)) {
        this.initialData.forEach((item) => {
          const sid = String(item.id).trim();
          const isSelected = this.Companiesassoc.some(
            (cid) => String(cid).trim() === sid,
          );
          if (isSelected && !foundIds.includes(sid)) {
            selected.push(item);
            foundIds.push(sid);
          }
        });
      }

      if (selected.length < this.Companiesassoc.length) {
        this.Companiesassoc.forEach((id) => {
          const sid = String(id).trim();
          if (!foundIds.includes(sid) && sid !== "") {
            selected.push({ id: sid, company_name: `Loading (${sid})...` });
          }
        });
      }

      return selected;
    },
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside);
    this.fetchCompanies();
  },

  destroyed() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  methods: {
    ...mapActions({
      getCompanies: "assoc/getcompanys",
    }),

    async fetchCompanies() {
      const res = await this.getCompanies({
        page: this.page,
        search: this.CompaniesSearch,
      });

      this.hasMore = res.next_page_url !== null;
      if (this.hasMore) this.page++;
    },

    handleScroll() {
      const el = this.$refs.scrollContainer;
      if (!el) return;
      const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
      if (bottom) this.fetchCompanies();
    },

    toggleCompanies(Companies) {
      const CompaniesId = String(Companies.id).trim();

      if (this.mode === "single") {
        // ✅ Single mode: langsung replace dengan item yang dipilih, lalu tutup
        const isSame =
          this.Companiesassoc[0] &&
          String(this.Companiesassoc[0]).trim() === CompaniesId;
        this.Companiesassoc = isSame ? [] : [CompaniesId]; // klik item sama = deselect
        this.isCompaniesDropdownOpen = false;
      } else {
        // ✅ Multiple mode: toggle seperti semula
        const index = this.Companiesassoc.findIndex(
          (id) => String(id).trim() === CompaniesId,
        );
        if (index === -1) {
          this.Companiesassoc = [...this.Companiesassoc, CompaniesId];
        } else {
          this.Companiesassoc = this.Companiesassoc.filter(
            (_, i) => i !== index,
          );
        }
        this.isCompaniesDropdownOpen = false;
      }
    },

    isCompaniesSelected(id) {
      const CompaniesId = String(id).trim();
      return this.Companiesassoc.some(
        (cid) => String(cid).trim() === CompaniesId,
      );
    },

    handleClickOutside(e) {
      if (!this.$refs.CompaniesDropdownRef?.contains(e.target)) {
        this.isCompaniesDropdownOpen = false;
      }
    },

    handleCompaniesQuickSubmit(e) {
      console.log("New Companies created", e);
    },
  },

  watch: {
    isCompaniesDropdownOpen(val) {
      if (!val) {
        this.CompaniesSearch = "";
        this.page = 1;
      }
      if (val && (!this.allCompanies || this.allCompanies.length === 0)) {
        this.fetchCompanies();
      }
    },

    CompaniesSearch() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.page = 1;
        this.fetchCompanies();
      }, 300);
    },
  },
};
</script>
