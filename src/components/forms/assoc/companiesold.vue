<template>
  <div class="relative" ref="CompaniesDropdownRef">
    <label class="block text-sm font-medium text-main-text mb-2">
      Companies Association
    </label>
    <div
      @click="isCompaniesDropdownOpen = !isCompaniesDropdownOpen"
      class="w-full px-3 py-2 border border-outline rounded-lg flex flex-wrap gap-2 items-center cursor-pointer min-h-10.5 bg-white transition focus-within:ring-1 focus-within:ring-sub-text"
    >
      <div v-if="Companiesassoc.length === 0" class="text-gray-400 text-sm">
        Search and select Companiess
      </div>
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
            <span class="font-medium text-main-text">
              {{ Companies.company_name || "" }}
            </span>
            <span class="text-xs text-sub-text">{{ Companies.email }}</span>
          </div>
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
          No Companiess found
        </div>
      </div>
    </div>
  </div>

  <!-- <button
    type="button"
    @click="showAddCompaniesQuickForm = true"
    class="mt-2 text-sm text-sub-text hover:text-main-text font-medium flex items-center gap-1"
  >
    <Plus :size="14" />
    Create Companies
  </button> -->

  <!-- <AddCompaniesQuickForm
    :isOpen="showAddCompaniesQuickForm"
    @close="showAddCompaniesQuickForm = false"
    @submit="handleCompaniesQuickSubmit"
  /> -->
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { X, ChevronDown, Search, Check, Plus } from "lucide-vue-next";
// import AddCompaniesQuickForm from "@/components/forms/AddCompaniesQuickForm.vue";

export default {
  name: "CompanyAssociationForm",

  components: {
    X,
    ChevronDown,
    Search,
    Check,
    Plus,
    // AddCompaniesQuickForm,
  },

  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    initialData: {
      type: Array,
      default: () => [],
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

      // return (this.allCompaniess || []).filter((c) => {
      //   const name = `${c.first_name || ""} ${c.last_name || ""}`
      //     .toLowerCase()
      //     .trim();
      //   const email = (c.email || "").toLowerCase();
      //   const search = this.CompaniesSearch.toLowerCase();

      //   return name.includes(search) || email.includes(search);
      // });
    },

    selectedCompanies() {
      if (
        !Array.isArray(this.Companiesassoc) ||
        this.Companiesassoc.length === 0
      ) {
        return [];
      }

      // 1. Ambil dari list allCompanies (hasil fetch/search)
      const selected = (this.allCompanies || []).filter((company) =>
        this.Companiesassoc.some(
          (id) => String(id).trim() === String(company.id).trim(),
        ),
      );

      // 2. Gabungkan dengan initialData (data dari parent agar tidak loading lama)
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

      // 3. Jika masih ada yang belum ketemu, beri placeholder Loading
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
      if (this.hasMore) {
        this.page++;
      }

      // console.log("Fetched Companiess:", this.hasMore);
      // console.log("Fetched Companiess:", res);
      // console.log("page:", this.page);
    },

    handleCompaniesQuickSubmit(e) {
      console.log("New Companies created", e);
    },

    handleScroll() {
      const el = this.$refs.scrollContainer;

      if (!el) return;

      const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
      if (bottom) {
        this.fetchCompanies();
      }
    },

    toggleCompanies(Companies) {
      const CompaniesId = String(Companies.id).trim();
      // console.log("Toggling Companiesassoc :", this.Companiesassoc);

      const index = this.Companiesassoc.findIndex(
        (id) => String(id).trim() === CompaniesId,
      );

      // console.log("Toggling Companies with ID:", CompaniesId,index);

      let newValue;
      if (index === -1) {
        newValue = [...this.Companiesassoc, CompaniesId];
      } else {
        newValue = this.Companiesassoc.filter((id, i) => i !== index);
      }
      // console.log("Toggling Companies with ID:", CompaniesId,index,newValue);
      this.Companiesassoc = newValue;
      this.isCompaniesDropdownOpen = false;
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
  },

  watch: {
    isCompaniesDropdownOpen(e) {
      if (e == false) {
        this.CompaniesSearch = "";
        this.page = 1;
      }
      if (e && (!this.allCompanies || this.allCompanies.length === 0)) {
        this.fetchCompanies();
      }
    },

    CompaniesSearch(e) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.page = 1; // reset page
        this.fetchCompanies();
      }, 300);
    },

    allCompanies(e) {
      console.log("allCompanies", e);
    },
    selectedCompanies(e) {
      console.log("selectedCompanies", e);
    },
  },
};
</script>
