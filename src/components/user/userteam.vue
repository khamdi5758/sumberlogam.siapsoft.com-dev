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
import CreateTeamForm from "../forms/CreateTeamForm.vue";
import DetailTeamForm from "../forms/DetailTeamForm.vue";
import { alertService } from "@/services/alertService";

export default {
  components: {
    CreateTeamForm,
    DetailTeamForm,
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
      showCreateTeamForm: false,
      showTeamDetailForm: false,
      selectedTeamDetail: null,
      teamApiPayload: null,
      currentPage: 1,
      itemsPerPage: 5,
      selectedTeam: [],
    };
  },

  computed: {
    ...mapGetters({
      teams: "team/allTeamUsers",
      isLoading: "team/isLoading",
      error: "team/error",
    }),

    searchQuery: {
      get() {
        return this.$store.state.team.searchQuery;
      },
      set(value) {
        this.$store.dispatch("team/setSearchQuery", value);
      },
    },

    filteredTeams() {
      return this.teams;
    },

    totalPages() {
      return Math.max(
        1,
        Math.ceil(this.filteredTeams.length / this.itemsPerPage),
      );
    },

    paginatedTeams() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredTeams.slice(start, start + this.itemsPerPage);
    },

    allSelected() {
      return (
        this.paginatedTeams.length > 0 &&
        this.paginatedTeams.every((t) =>
          this.selectedTeam.includes(this.getTeamId(t)),
        )
      );
    },
  },

  methods: {
    ...mapActions({
      fetchAllTeamUsers: "team/fetchAllTeamUsers",
      createTeam: "team/createTeam",
      deleteTeam: "team/deleteTeam",
      addTeamUsers: "team/addTeamUsers",
      setSearchQuery: "team/setSearchQuery",
    }),

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },

    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },

    getTeamId(team) {
      if (!team) return null;
      const id = team.team_id ?? team.teamid ?? team.id ?? team.id_team;
      return id !== undefined && id !== null ? String(id) : "";
    },

    toggleSelectAll(e) {
      this.selectedTeam = e.target.checked
        ? this.paginatedTeams.map((t) => this.getTeamId(t))
        : [];
    },

    async fetchData() {
      try {
        const result = await this.fetchAllTeamUsers();
        this.teamApiPayload = result || null;
      } catch (err) {
        console.error("Failed to fetch team_user:", err);
      }
    },

    openTeamDetail(team) {
      this.selectedTeamDetail = { ...team };
      this.showTeamDetailForm = true;
    },

    closeTeamDetail() {
      this.showTeamDetailForm = false;
      this.selectedTeamDetail = null;
    },

    async handleDeleteSelectedTeams() {
      if (!this.selectedTeam.length) {
        return alertService.validationError(
          "Pilih tim yang ingin dihapus terlebih dahulu.",
        );
      }

      const confirm = await alertService.confirmDelete(
        `${this.selectedTeam.length} tim`,
      );
      if (!confirm) return;

      try {
        // Use sequential deletion to avoid 429 and DB locks
        for (const id of this.selectedTeam) {
          if (id) {
            await this.deleteTeam(id);
          }
        }

        this.selectedTeam = [];
        alertService.success("Tim berhasil dihapus");
        await this.fetchData();
      } catch (err) {
        console.error("Failed to delete teams:", err);
        // Look for error message in state if not in err object (some actions commit errors to state)
        const serverError = this.$store.state.team.error;
        const errorMessage =
          serverError ||
          err.response?.data?.message ||
          err.message ||
          "Gagal menghapus tim.";
        alertService.error(errorMessage, "Penghapusan Gagal");
      }
    },

    handleCreateTeamSubmit(data) {
      console.log(data);

      let dataparam = {
        teamName: data.teamName,
        parentTeam: data.parentTeam?.name || null,
        selectedMembers: data.selectedMembers.map((member) => member.id),
      };

      this.createTeam(dataparam)
        .then((createResult) => {
          const createdTeamId =
            createResult?.team?.id ||
            createResult?.data?.id ||
            createResult?.id;

          if (createdTeamId && dataparam.selectedMembers.length) {
            const addUsersPayload = {
              team_id: createdTeamId,
              user_ids: dataparam.selectedMembers,
            };
            return this.addTeamUsers(addUsersPayload);
          }
        })
        .then(() => {
          this.showCreateTeamForm = false;
          return this.fetchData();
        })
        .catch((err) => {
          console.error("Failed to create team:", err);
          alert("Failed to create team. Please check API payload format.");
        });
      console.log(dataparam);

      // try {
      //   const createPayload = {
      //     team_name: data.teamName,
      //     parent_id: data.parentTeam ? data.parentTeam.id : null,
      //   };

      //   const createResult = await this.createTeam(createPayload);

      //   const createdTeamId =
      //     (createResult && createResult.team && createResult.team.id) ||
      //     (createResult && createResult.data && createResult.data.id) ||
      //     (createResult && createResult.id);

      //   if (
      //     createdTeamId &&
      //     Array.isArray(data.selectedMembers) &&
      //     data.selectedMembers.length
      //   ) {
      //     const addUsersPayload = {
      //       team_id: createdTeamId,
      //       user_ids: data.selectedMembers.map((member) => member.id),
      //     };

      //     await this.addTeamUsers(addUsersPayload);
      //   }

      //   this.showCreateTeamForm = false;
      //   await this.fetchData();
      // } catch (err) {
      //   console.error("Failed to create team:", err);
      //   alert("Failed to create team. Please check API payload format.");
      // }
    },
  },

  mounted() {
    this.fetchData();
  },

  watch: {
    teams(e) {
      console.log(e);
    },
  },
};
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-sm border border-outline overflow-hidden"
  >
    <!-- ACTION BAR -->
    <div class="p-4 border-b border-outline">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- LEFT -->
        <div class="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <!-- Filter -->
          <button
            class="p-2 border border-outline rounded-lg hover:bg-outline/30 transition"
          >
            <Filter :size="20" class="text-dark-base" />
          </button>

          <!-- Search -->
          <div class="relative w-full sm:w-auto">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search team..."
              class="w-full rounded-lg border border-outline bg-white py-2 pl-3 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text sm:w-64"
            />
          </div>

          <button
            class="p-2 bg-outline hover:bg-outline/30 rounded-lg transition"
          >
            <Search :size="20" class="text-dark-base" />
          </button>

          <!-- Show -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-dark-base">Show</span>
            <select
              v-model="itemsPerPage"
              class="px-3 py-2 border border-outline rounded-lg text-sm"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="25">25</option>
            </select>
          </div>
        </div>

        <!-- Right Section: Action Buttons -->
        <div
          class="flex w-full flex-wrap items-center justify-end gap-1 sm:w-auto sm:gap-2"
        >
          <button
            @click="fetchData"
            :disabled="isLoading"
            class="h-9 w-9 rounded-lg border border-outline bg-white p-2 transition-all hover:bg-light-base active:scale-95 disabled:opacity-50 sm:h-10 sm:w-10"
            title="Refresh Data"
          >
            <RefreshCw
              :size="18"
              :class="{ 'animate-spin': isLoading }"
              class="text-sub-text"
            />
          </button>
          <!-- Add New -->
          <div class="relative inline-block add-dropdown">
            <button
              @click="showCreateTeamForm = true"
              type="button"
              class="flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-outline bg-white px-2 py-2 text-sub-text transition hover:bg-sub-text hover:text-white sm:h-10 sm:w-auto sm:px-4"
            >
              <span class="text-lg font-semibold">+</span>
              <span class="hidden text-sm font-medium md:inline">Add Team</span>
            </button>
          </div>

          <!-- Delete -->
          <button
            @click="handleDeleteSelectedTeams"
            :disabled="!selectedTeam.length || isLoading"
            class="h-9 w-9 rounded-lg border border-red bg-white p-2 text-red transition hover:bg-red hover:text-white sm:h-10 sm:w-10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 :size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- SELECT & PAGINATION -->
    <div class="px-6 py-4 flex items-center border-b border-outline">
      <label class="flex items-center gap-2 text-sm text-sub-text">
        <input
          type="checkbox"
          @change="toggleSelectAll"
          :checked="allSelected"
          class="h-4 w-4 rounded border-gray-300"
        />
        Select all team
      </label>

      <div
        class="flex w-full items-center justify-end gap-3 text-sm text-sub-text sm:w-auto sm:ml-auto"
      >
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="p-2 rounded hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft :size="18" />
        </button>

        <span>Page</span>

        <input
          type="number"
          v-model="currentPage"
          min="1"
          class="w-12 px-2 py-1 border border-gray-300 rounded text-center"
        />

        <span>of {{ totalPages }}</span>

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
    <div class="relative overflow-x-auto">
      <!-- Loading Overlay -->
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center"
      >
        <div class="flex flex-col items-center gap-3">
          <RefreshCw :size="32" class="animate-spin text-sub-text" />
          <p class="text-sm font-medium text-sub-text">Loading teams...</p>
        </div>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50/50">
            <th class="px-6 py-4"></th>

            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              <div class="flex items-center gap-2">
                Team Name
                <ChevronDown :size="16" class="text-gray-400" />
              </div>
            </th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              <div class="flex items-center gap-2">
                Parent Name
                <ChevronDown :size="16" class="text-gray-400" />
              </div>
            </th>

            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              <div class="flex items-center gap-2">
                Total Users
                <ChevronDown :size="16" class="text-gray-400" />
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="error">
            <td colspan="3" class="px-6 py-10 text-center text-red-500">
              Failed to load data: {{ error }}
            </td>
          </tr>

          <!-- EMPTY STATE -->
          <tr v-else-if="!isLoading && paginatedTeams.length === 0">
            <td colspan="3" class="px-6 py-20 text-center text-sub-text">
              No team_user data found
            </td>
          </tr>

          <!-- ROWS -->
          <tr
            v-for="team in paginatedTeams"
            :key="getTeamId(team)"
            class="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
            @click="openTeamDetail(team)"
          >
            <td class="px-6 py-4">
              <input
                type="checkbox"
                :value="getTeamId(team)"
                v-model="selectedTeam"
                @click.stop
                class="w-4 h-4"
              />
            </td>

            <td
              class="px-6 py-4 font-medium text-gray-800"
              style="cursor: pointer"
              @click="openTeamDetail(team)"
            >
              {{ team.team_name }}
            </td>
            <td
              class="px-6 py-4 font-medium text-gray-800"
              style="cursor: pointer"
              @click="openTeamDetail(team)"
            >
              {{ team.parent }}
            </td>

            <td class="px-6 py-4 text-dark-base" @click="openTeamDetail(team)">
              {{ team.total_users }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Add Team Form -->
  <CreateTeamForm
    :isOpen="showCreateTeamForm"
    @close="showCreateTeamForm = false"
    @submit="handleCreateTeamSubmit"
  />

  <DetailTeamForm
    :isOpen="showTeamDetailForm"
    :team="selectedTeamDetail"
    :apiPayload="teamApiPayload"
    @close="closeTeamDetail"
  />
</template>
