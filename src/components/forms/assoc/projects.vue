<template>
  <div class="relative" ref="projectDropdownRef">
    <div class="flex items-center gap-1.5 mb-2">
      <label class="block text-sm font-medium text-main-text">
        Project Association
      </label>
      <div v-if="filterByCompany" class="relative group flex items-center">
        <Info
          :size="14"
          class="text-gray-400 cursor-help hover:text-gray-600 transition-colors"
        />
        <!-- Info Tooltip (Menggunakan Warna dari welcome.css) -->
        <div
          class="absolute right-0 top-6 w-44 p-2.5 text-white text-[10px] leading-snug rounded shadow-2xl z-[70] border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
          style="background-color: var(--color-waiting-color, #404460)"
        >
          <div class="flex items-start gap-1.5">
            <Info :size="10" class="mt-0.5 shrink-0 text-blue-300" />
            <p>Kontak difilter berdasarkan perusahaan terpilih.</p>
          </div>
          <!-- Arrow Tooltip -->
          <div
            class="absolute -top-1 right-1.5 w-2 h-2 rotate-45 border-t border-l border-white/10"
            style="background-color: var(--color-waiting-color, #404460)"
          ></div>
        </div>
      </div>
    </div>

    <div
      @click="handledropdown"
      class="w-full px-3 py-2 border border-outline rounded-lg flex flex-wrap gap-2 items-center cursor-pointer min-h-10.5 bg-white transition focus-within:ring-1 focus-within:ring-sub-text"
    >
      <div v-if="projectassoc.length === 0" class="text-gray-400 text-sm">
        {{
          mode === "single" ? "Select a project" : "Search and select projects"
        }}
      </div>
      <div
        v-for="project in selectedprojects"
        :key="project.id"
        class="flex items-center gap-1 bg-light-base px-2 py-1 rounded text-xs font-medium text-main-text border border-outline"
        @click.stop
      >
        {{ getDisplayNameFromproject(project) }}
        <X
          :size="12"
          class="cursor-pointer hover:text-red"
          @click="toggleproject(project)"
        />
      </div>
      <ChevronDown :size="16" class="ml-auto text-sub-text" />
    </div>

    <!-- Dropdown Menu -->
    <div
      v-if="isprojectDropdownOpen"
      class="absolute z-50 w-full mt-1 bg-white border border-outline rounded-lg shadow-xl flex flex-col max-h-64"
    >
      <div class="p-2 border-b border-outline">
        <div class="relative">
          <Search
            :size="14"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-sub-text"
          />
          <input
            v-model="projectSearch"
            type="text"
            placeholder="Search by project name"
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
          v-for="project in filteredprojects"
          :key="project.id"
          @click="toggleproject(project)"
          class="px-4 py-2 hover:bg-light-base cursor-pointer flex items-center justify-between text-sm transition"
        >
          <div class="flex flex-col">
            <span class="font-medium text-main-text">{{
              getDisplayNameFromproject(project)
            }}</span>
          </div>
          <div
            v-if="isprojectSelected(project.id)"
            class="w-5 h-5 bg-dark-base rounded-full flex items-center justify-center"
          >
            <Check :size="12" class="text-white" />
          </div>
        </div>
        <div
          v-if="filteredprojects.length === 0"
          class="px-4 py-6 text-center text-sm text-sub-text"
        >
          No projects found
        </div>
      </div>
    </div>
  </div>

  <!-- <AddprojectQuickForm
    :isOpen="showAddprojectQuickForm"
    @close="showAddprojectQuickForm = false"
    @submit="handleprojectQuickSubmit"
  /> -->
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import { X, ChevronDown, Search, Check, Plus, Info } from "lucide-vue-next";
// import AddprojectQuickForm from "@/components/forms/AddprojectQuickForm.vue";
import { alertService } from "@/services/alertService";

export default {
  name: "projectAssociationForm",

  components: {
    X,
    ChevronDown,
    Search,
    Check,
    Plus,
    Info,
    // AddprojectQuickForm,
  },

  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    projects: {
      type: Array,
      default: () => [],
    },
    companyId: {
      type: [String, Number, Array],
      default: () => [],
    },
    filterByCompany: {
      type: Boolean,
      default: false,
    },
    limit: {
      type: [Number, String],
      default: null,
    },
    // ✅ Prop baru: 'single' atau 'multiple' (default: 'multiple')
    mode: {
      type: String,
      default: "multiple",
      validator: (value) => ["single", "multiple"].includes(value),
    },
    customMessage: {
      type: String,
      default: "",
    },
  },

  data() {
    return {
      isprojectDropdownOpen: false,
      projectSearch: "",
      showAddprojectQuickForm: false,
      page: 1,
      debounceTimer: null,
      hasMore: true,
      isLoading: false,
    };
  },

  computed: {
    ...mapGetters({
      allprojects: "assoc/allprojects",
      dealsprojects: "deals/getproject",
    }),

    projectassoc: {
      get() {
        if (!this.modelValue) return [];
        return Array.isArray(this.modelValue)
          ? this.modelValue
          : [this.modelValue];
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },

    projectOptions() {
      let storeData =
        (this.filterByCompany ? this.dealsprojects : this.allprojects) || [];
      if (storeData && storeData.data && Array.isArray(storeData.data))
        storeData = storeData.data;

      // Gabungkan data awal (prop projects) dengan data dari store
      const combined = [
        ...(this.projects || []),
        ...(Array.isArray(storeData) ? storeData : []),
      ];

      const map = new Map();
      combined.forEach((item) => {
        const id = item.value || item.id;
        if (id) {
          map.set(String(id), {
            ...item,
            id: String(id),
            label:
              item.label || item.project_name || item.name || "Unknown project",
          });
        }
      });

      return Array.from(map.values());
    },

    filteredprojects() {
      if (!this.projectSearch.trim()) {
        return this.projectOptions;
      }
      const query = this.projectSearch.toLowerCase();
      return this.projectOptions.filter((p) =>
        (p.label || p.project_name || p.name || "")
          .toLowerCase()
          .includes(query),
      );
    },

    selectedprojects() {
      if (!this.projectassoc.length) return [];
      return this.projectOptions.filter((project) =>
        this.projectassoc.map(String).includes(String(project.id)),
      );
    },
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside);
    if (this.filterByCompany) {
      this.resetDealsprojects();
      this.fetchprojects();
    }
  },

  unmounted() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  methods: {
    ...mapActions({
      getprojects: "assoc/getprojects",
      dealsFetchproject: "deals/fetchproject",
    }),

    ...mapMutations({
      resetAssocprojects: "assoc/resetprojects",
      resetDealsprojects: "deals/RESET_projectS",
    }),

    handledropdown() {
      if (!this.isprojectDropdownOpen) {
        if (this.filterByCompany) {
          this.resetDealsprojects();
        } else {
          this.resetAssocprojects();
        }
        this.page = 1;
        this.hasMore = true;

        // Trigger fetch immediately when opening
        this.$nextTick(() => {
          this.fetchprojects();
        });
      }
      this.isprojectDropdownOpen = !this.isprojectDropdownOpen;
    },

    async fetchprojects() {
      // Jika data sudah dipasok via prop 'projects', kita tidak perlu fetch internal
      if (this.projects && this.projects.length > 0) return;

      if (!this.hasMore || this.isLoading) return;

      this.isLoading = true;
      const params = {
        page: this.page,
        search: this.projectSearch,
      };

      try {
        if (this.filterByCompany) {
          let cid = null;
          if (Array.isArray(this.companyId) && this.companyId.length > 0) {
            cid = this.companyId[0];
          } else if (this.companyId && !Array.isArray(this.companyId)) {
            cid = this.companyId;
          }

          if (!cid) {
            console.log("fetchprojects: No companyId available, clearing list");
            this.resetDealsprojects();
            this.isLoading = false;
            this.hasMore = false;
            return;
          }

          params.companyid = cid;
          const res = await this.dealsFetchproject(params);
          this.hasMore =
            res && typeof res === "object" && res.next_page_url ? true : false;
        } else {
          const res = await this.getprojects(params);
          this.hasMore =
            res && typeof res === "object" && res.next_page_url ? true : false;
          if (this.hasMore) this.page++;
        }
      } catch (e) {
        this.hasMore = false;
      } finally {
        this.isLoading = false;
      }
    },

    handleScroll() {
      const el = this.$refs.scrollContainer;
      if (!el || this.isLoading || !this.hasMore) return;
      const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
      if (bottom) {
        this.fetchprojects();
      }
    },

    toggleproject(project) {
      const projectId = String(project.id);

      if (this.mode === "single") {
        // ✅ Single mode: langsung replace dengan item yang dipilih, lalu tutup
        const isSame =
          this.projectassoc[0] &&
          String(this.projectassoc[0]).trim() === projectId;
        this.projectassoc = isSame ? [] : [projectId]; // klik item sama = deselect
        this.isprojectDropdownOpen = false;
      } else {
        // ✅ Multiple mode: toggle seperti semula
        let newValue;
        const currentAssoc = Array.isArray(this.projectassoc)
          ? this.projectassoc
          : this.projectassoc
            ? [this.projectassoc]
            : [];
        const exists = currentAssoc.some((id) => String(id) === projectId);
        if (exists) {
          newValue = currentAssoc.filter((id) => String(id) !== projectId);
        } else {
          if (this.limit && currentAssoc.length >= Number(this.limit)) {
            alertService.toastInfo(
              this.customMessage || `Hanya diperbolehkan ${this.limit} project`,
            );
            return;
          }
          newValue = [...this.projectassoc, projectId];
        }
        this.projectassoc = newValue;
        // Don't close dropdown on multiple toggle
      }
    },

    isprojectSelected(id) {
      return this.projectassoc.map(String).includes(String(id));
    },

    getDisplayNameFromproject(project) {
      return (
        project.label ||
        project.project_name ||
        project.name ||
        "Unknown project"
      );
    },

    handleClickOutside(e) {
      if (!this.$refs.projectDropdownRef?.contains(e.target)) {
        this.isprojectDropdownOpen = false;
      }
    },

    handleprojectQuickSubmit(e) {
      console.log("New project created", e);
    },
  },

  watch: {
    isprojectDropdownOpen(val) {
      if (!val) {
        this.projectSearch = "";
        this.page = 1;
        this.hasMore = true;
      } else if (this.projectOptions.length === 0) {
        this.fetchprojects();
      }
    },

    projectSearch() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.page = 1;
        this.hasMore = true;
        if (this.filterByCompany) {
          this.resetDealsprojects();
        } else {
          this.resetAssocprojects();
        }
        this.fetchprojects();
      }, 300);
    },

    companyId: {
      deep: true,
      handler(newVal, oldVal) {
        if (this.filterByCompany) {
          const newId = Array.isArray(newVal) ? newVal[0] : newVal;
          const oldId = Array.isArray(oldVal) ? oldVal[0] : oldVal;

          // Hanya reset jika ID perusahaan benar-benar berubah (bukan inisialisasi pertama)
          if (oldId && newId != oldId) {
            console.log("Company changed, resetting list");
            this.projectassoc = [];
          }

          this.resetDealsprojects();
          this.page = 1;
          this.hasMore = true;
          this.fetchprojects();
        }
      },
    },
  },
};
</script>
