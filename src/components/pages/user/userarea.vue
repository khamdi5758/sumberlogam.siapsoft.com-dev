<script>
import { mapGetters, mapState, mapActions } from "vuex";
import {
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Trash2,
  RefreshCw,
} from "lucide-vue-next";
import CreateAreaForm from "@/components/forms/CreateAreaForm.vue";
import { alertService } from "@/services/alertService";

export default {
  components: {
    CreateAreaForm,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Trash2,
    RefreshCw,
  },

  data() {
    return {
      showCreateAreaForm: false,
      selectedAreaDetail: null,
      areaApiPayload: null,
      currentPage: 1,
      itemsPerPage: 5,
      selectedArea: [],
    };
  },

  computed: {
    ...mapGetters({
      areas: "area/allAreaUsers",
      isLoading: "area/isLoading",
      error: "area/error",
    }),

    searchQuery: {
      get() {
        return this.$store.state.area.searchQuery;
      },
      set(value) {
        this.$store.dispatch("area/setSearchQuery", value);
      },
    },

    filteredAreas() {
      return this.areas;
    },

    totalPages() {
      return Math.max(
        1,
        Math.ceil(this.filteredAreas.length / this.itemsPerPage),
      );
    },

    paginatedAreas() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredAreas.slice(start, start + this.itemsPerPage);
    },

    allSelected() {
      return (
        this.paginatedAreas.length > 0 &&
        this.paginatedAreas.every((t) =>
          this.selectedArea.includes(this.getAreaId(t)),
        )
      );
    },
  },

  methods: {
    ...mapActions({
      fetchAllAreaUsers: "area/fetchAllAreaUsers",
      createArea: "area/createArea",
      deleteArea: "area/deleteArea",
      addAreaUsers: "area/addAreaUsers",
      setSearchQuery: "area/setSearchQuery",
    }),

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },

    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },

    getAreaId(area) {
      if (!area) return null;
      const id = area.area_id ?? area.areaid ?? area.id ?? area.id_area ?? (area.team_id + '_' + area.areayangdicakup);
      return id !== undefined && id !== null ? String(id) : "";
    },

    toggleSelectAll(e) {
      this.selectedArea = e.target.checked
        ? this.paginatedAreas.map((t) => this.getAreaId(t))
        : [];
    },

    async fetchData() {
      try {
        const result = await this.fetchAllAreaUsers();
        this.areaApiPayload = result || null;
      } catch (err) {
        console.error("Failed to fetch area_user:", err);
      }
    },

    openAreaDetail(area) {
      this.selectedAreaDetail = { ...area };
      this.showCreateAreaForm = true;
    },

    closeAreaDetail() {
      this.selectedAreaDetail = null;
    },

    async handleDeleteSelectedAreas() {
      if (!this.selectedArea.length) {
        return alertService.validationError(
          "Pilih tim yang ingin dihapus terlebih dahulu.",
        );
      }

      const confirm = await alertService.confirmDelete(
        `${this.selectedArea.length} tim`,
      );
      if (!confirm) return;

      try {
        // Use sequential deletion to avoid 429 and DB locks
        for (const id of this.selectedArea) {
          if (id) {
            await this.deleteArea(id);
          }
        }

        this.selectedArea = [];
        alertService.success("Tim berhasil dihapus");
        await this.fetchData();
      } catch (err) {
        console.error("Failed to delete areas:", err);
        // Look for error message in state if not in err object (some actions commit errors to state)
        const serverError = this.$store.state.area.error;
        const errorMessage =
          serverError ||
          err.response?.data?.message ||
          err.message ||
          "Gagal menghapus tim.";
        alertService.error(errorMessage, "Penghapusan Gagal");
      }
    },

    async handleCreateAreaSubmit(data) {
      if (!data.area_id || !data.selectedMembers || data.selectedMembers.length === 0) {
        alert("Pilih Area dan minimal satu Tim terlebih dahulu.");
        return;
      }

      try {
        const isEdit = !!this.selectedAreaDetail;

        // Send a request for each selected team to the area/input endpoint
        const promises = data.selectedMembers.map((team) => {
          return this.createArea({
            choice: isEdit ? "u" : "i",
            id: team.id,
            teamName: team.team_name || team.name || "",
            parentTeam: null,
            contactassoc: true,
            selectedMembers: [data.area_id],
          });
        });

        await Promise.all(promises);
        
        this.showCreateAreaForm = false;
        await this.fetchData();
      } catch (err) {
        console.error("Failed to create area:", err);
        alert("Failed to create area. Please check API payload format.");
      }
    },
  },

  mounted() {
    this.fetchData();
  },

  watch: {
    areas(e) {
      console.log(e);
    },
  },
};
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-sm border border-outline overflow-hidden mb-4 lg:mb-0"
  >
    <!-- ACTION BAR -->
    <div class="p-4 border-b border-outline">
      <p class="mb-3 text-xs text-sub-text sm:hidden">
        Cari tim, pilih baris, lalu kelola detailnya di sini.
      </p>
      <div
        class="flex flex-col md:flex-row gap-3 md:items-center justify-between"
      >
        <div
          class="flex min-w-0 items-center gap-2 sm:gap-3 w-full md:w-auto flex-1"
        >
          <button
            class="p-2 border border-outline rounded-lg hover:bg-outline/30 transition shrink-0"
          >
            <Filter :size="20" class="text-main-text" />
          </button>

          <div class="relative min-w-0 flex-1 md:max-w-xs">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search area..."
              class="w-full rounded-lg border border-outline bg-white py-2 pl-3 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
            />
          </div>

          <button
            class="p-2 bg-outline hover:bg-outline/30 rounded-lg transition shrink-0"
          >
            <Search :size="20" class="text-main-text" />
          </button>
        </div>

        <div
          class="flex flex-wrap items-center justify-between gap-3 w-full md:w-auto"
        >
          <div class="flex items-center gap-2">
            <span class="text-xs text-main-text sm:text-sm">Show</span>
            <select
              v-model="itemsPerPage"
              class="px-3 py-2 border border-outline rounded-lg text-sm"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="25">25</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="fetchData"
              :disabled="isLoading"
              class="h-9 w-9 rounded-lg border border-outline bg-white p-2 transition-all hover:bg-light-base active:scale-95 disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw
                :size="18"
                :class="{ 'animate-spin': isLoading }"
                class="text-sub-text"
              />
            </button>

            <div class="relative inline-block add-dropdown">
              <button
                @click="showCreateAreaForm = true"
                type="button"
                class="flex h-9 items-center justify-center gap-2 rounded-lg border border-outline bg-white px-3 py-2 text-sub-text transition hover:bg-sub-text hover:text-white"
              >
                <span class="text-lg font-semibold">+</span>
                <span class="text-sm font-medium">Area</span>
              </button>
            </div>

            <button
              @click="handleDeleteSelectedAreas"
              :disabled="!selectedArea.length || isLoading"
              class="h-9 w-9 rounded-lg border border-red bg-white p-2 text-red transition hover:bg-red hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- SELECT & PAGINATION -->
    <div class="px-4 py-4 sm:px-6 border-b border-outline">
      <label class="flex items-center gap-2 text-xs text-sub-text sm:text-sm">
        <input
          type="checkbox"
          @change="toggleSelectAll"
          :checked="allSelected"
          class="h-4 w-4 rounded border-gray-300"
        />
        <span class="sm:hidden">Select all</span>
        <span class="hidden sm:inline">Select all area</span>
      </label>

      <div
        class="mt-3 flex w-full items-center justify-between gap-2 text-xs text-sub-text sm:mt-0 sm:w-auto sm:ml-auto sm:justify-end sm:gap-3 sm:text-sm"
      >
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="p-2 rounded hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft :size="18" />
        </button>

        <span class="hidden sm:inline">Page</span>
        <span class="sm:hidden">Pg</span>

        <input
          type="number"
          v-model="currentPage"
          min="1"
          class="w-12 px-2 py-1 border border-gray-300 rounded text-center"
        />

        <span class="hidden sm:inline">of {{ totalPages }}</span>
        <span class="sm:hidden">/ {{ totalPages }}</span>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="p-2 rounded hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronRight :size="18" />
        </button>
      </div>
    </div>

    <!-- TABLE -->
    <div class="relative overflow-x-auto pb-4">
      <!-- Loading Overlay -->
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center"
      >
        <div class="flex flex-col items-center gap-3">
          <RefreshCw :size="32" class="animate-spin text-sub-text" />
          <p class="text-sm font-medium text-sub-text">Loading areas...</p>
        </div>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50/50">
            <th class="px-3 py-3 sm:px-6 sm:py-4"></th>

            <th
              class="px-3 py-3 text-left text-xs font-semibold text-gray-700 sm:px-6 sm:py-4 sm:text-sm"
            >
              <div class="flex items-center gap-2">
                Team Name
                <ChevronDown :size="16" class="text-gray-400" />
              </div>
            </th>
            <th
              class="px-3 py-3 text-left text-xs font-semibold text-gray-700 sm:px-6 sm:py-4 sm:text-sm"
            >
              <div class="flex items-center gap-2">
                Area Covered
                <ChevronDown :size="16" class="text-gray-400" />
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="error">
            <td
              colspan="3"
              class="px-6 py-10 text-center text-sm text-red-500 sm:text-base"
            >
              Failed to load data: {{ error }}
            </td>
          </tr>

          <!-- EMPTY STATE -->
          <tr v-else-if="!isLoading && paginatedAreas.length === 0">
            <td
              colspan="3"
              class="px-6 py-20 text-center text-sm text-sub-text sm:text-base"
            >
              No area_user data found
            </td>
          </tr>

          <!-- ROWS -->
          <tr
            v-for="area in paginatedAreas"
            :key="getAreaId(area)"
            class="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
            @click="openAreaDetail(area)"
          >
            <td class="px-3 py-4 sm:px-6">
              <input
                type="checkbox"
                :value="getAreaId(area)"
                v-model="selectedArea"
                @click.stop
                class="w-4 h-4"
              />
            </td>

            <td
              class="px-3 py-4 text-xs font-medium text-gray-800 sm:px-6 sm:py-4 sm:text-sm"
              style="cursor: pointer"
              @click="openAreaDetail(area)"
            >
              {{ area.team_name || area.team_id || '-' }}
            </td>
            <td
              class="px-3 py-4 text-xs font-medium text-gray-800 sm:px-6 sm:py-4 sm:text-sm"
              style="cursor: pointer"
              @click="openAreaDetail(area)"
            >
              {{ area.areayangdicakup || area.area_name || '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Add/Edit Area Form -->
  <CreateAreaForm
    :isOpen="showCreateAreaForm"
    :editData="selectedAreaDetail"
    @close="showCreateAreaForm = false; selectedAreaDetail = null;"
    @submit="handleCreateAreaSubmit"
  />
</template>
