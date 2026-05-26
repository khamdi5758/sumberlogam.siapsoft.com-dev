<!-- <script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { X, Search, ChevronDown, Check } from "lucide-vue-next";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "submit"]);

// Dummy Users for search dropdown
const membersList = [
  { id: 1, name: "Hanan Hafizhah", email: "hanan@mail.com" },
  { id: 2, name: "Aulia Rahman", email: "aulia@mail.com" },
  { id: 3, name: "Rizky Pratama", email: "rizky@mail.com" },
  { id: 4, name: "Siti Lestari", email: "siti@mail.com" },
  { id: 5, name: "Budi Santoso", email: "budi@mail.com" },
  { id: 6, name: "Kevin Wijaya", email: "kevin@mail.com" },
];

// Dummy Areas for parent area dropdown
const areasList = [
  { id: 1, name: "Management" },
  { id: 2, name: "Marketing" },
  { id: 3, name: "Design" },
  { id: 4, name: "Finance" },
  { id: 5, name: "Development" },
  { id: 6, name: "Support" },
];

// Form data
const formData = ref({
  areaName: "",
  parentArea: null,
  selectedMembers: [],
});

// Dropdown State
const isDropdownOpen = ref(false);
const memberSearch = ref("");

const filteredMembers = computed(() => {
  if (!memberSearch.value) return membersList;
  return membersList.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearch.value.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.value.toLowerCase()),
  );
});

// Parent Area Dropdown State
const isParentDropdownOpen = ref(false);
const parentSearch = ref("");

const filteredAreas = computed(() => {
  if (!parentSearch.value) return areasList;
  return areasList.filter((t) =>
    t.name.toLowerCase().includes(parentSearch.value.toLowerCase()),
  );
});

const selectParentArea = (area) => {
  formData.value.parentArea = area;
  isParentDropdownOpen.value = false;
  parentSearch.value = "";
};

const removeParentArea = () => {
  formData.value.parentArea = null;
};

const toggleMember = (member) => {
  const index = formData.value.selectedMembers.findIndex(
    (m) => m.id === member.id,
  );
  if (index === -1) {
    formData.value.selectedMembers.push(member);
  } else {
    formData.value.selectedMembers.splice(index, 1);
  }
};

const isMemberSelected = (id) => {
  return formData.value.selectedMembers.some((m) => m.id === id);
};

const removeMember = (id) => {
  formData.value.selectedMembers = formData.value.selectedMembers.filter(
    (m) => m.id !== id,
  );
};

const handleClose = () => {
  emit("close");
  isDropdownOpen.value = false;
  memberSearch.value = "";
};

const handleSubmit = () => {
  emit("submit", formData.value);
  handleClose();
};

const handleReset = () => {
  formData.value = {
    areaName: "",
    parentArea: null,
    selectedMembers: [],
  };
  memberSearch.value = "";
  parentSearch.value = "";
};

// Outside click handling
const dropdownRef = ref(null);
const parentDropdownRef = ref(null);

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
  if (
    parentDropdownRef.value &&
    !parentDropdownRef.value.contains(event.target)
  ) {
    isParentDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});
</script> -->

<script>
import { X, Search, ChevronDown, Check } from "lucide-vue-next";
import { useStore, mapActions, mapGetters } from "vuex";
import api from "@/api";
import { useCookies } from "vue3-cookies";

export default {
  emits: ["close", "submit"],

  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    editData: {
      type: Object,
      default: null,
    },
  },

  components: {
    X,
    Search,
    ChevronDown,
    Check,
  },

  data() {
    return {
      formData: {
        area: null,
        selectedTeams: [],
      },

      isAreaDropdownOpen: false,
      areaSearch: "",
      areaDropdownRef: null,

      isTeamDropdownOpen: false,
      teamSearch: "",
      teamDropdownRef: null,
    };
  },

  computed: {
    ...mapGetters({
      areaInputs: "area/areaInputs",
      teamInputs: "area/teamInputs",
    }),

    filteredAreas() {
      const inputs = this.areaInputs || [];
      if (!this.areaSearch) return inputs;
      const search = this.areaSearch.toLowerCase();
      return inputs.filter((a) =>
        (a.name || "").toLowerCase().includes(search)
      );
    },

    filteredTeams() {
      const inputs = this.teamInputs || [];
      if (!this.teamSearch) return inputs;
      const search = this.teamSearch.toLowerCase();
      return inputs.filter((t) =>
        (t.team_name || "").toLowerCase().includes(search)
      );
    },
  },

  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.fetchData();
        if (this.editData && this.editData.team_id) {
          this.loadEditData();
        }
      } else {
        this.handleReset();
      }
    }
  },

  methods: {
    ...mapActions({
      fetchAreaInput: "area/fetchAreaInput",
      fetchTeamsInput: "area/fetchTeamsInput",
    }),

    fetchData() {
      this.fetchAreaInput().catch((err) =>
        console.error("Failed to fetch areas:", err)
      );
      this.fetchTeamsInput().catch((err) =>
        console.error("Failed to fetch teams:", err)
      );
    },

    async loadEditData() {
      const { cookies } = useCookies();
      try {
        const response = await api.getbydata("area/det", { id: this.editData.team_id }, {
          headers: { Authorization: "Bearer " + cookies.get("token") }
        });
        
        const areas = response.data.areas || [];
        const clickedAreaId = String(this.editData.areayangdicakup);
        const match = areas.find(a => String(a.area_id) === clickedAreaId);
        
        if (match) {
          this.formData.area = {
            id: match.area_id,
            name: match.name
          };
          this.formData.selectedTeams = [{
            id: match.team_id,
            team_name: match.team_name
          }];
        } else if (areas.length > 0) {
          this.formData.area = {
            id: areas[0].area_id,
            name: areas[0].name
          };
          this.formData.selectedTeams = [{
            id: areas[0].team_id,
            team_name: areas[0].team_name
          }];
        }
      } catch (err) {
        console.error("Failed to fetch edit data:", err);
      }
    },

    selectArea(area) {
      this.formData.area = area;
      this.isAreaDropdownOpen = false;
      this.areaSearch = "";
    },

    removeArea() {
      this.formData.area = null;
    },

    toggleTeam(team) {
      const index = this.formData.selectedTeams.findIndex(
        (t) => t.id === team.id
      );

      if (index === -1) {
        this.formData.selectedTeams.push(team);
      } else {
        this.formData.selectedTeams.splice(index, 1);
      }
    },

    isTeamSelected(id) {
      return this.formData.selectedTeams.some((t) => t.id === id);
    },

    removeTeam(id) {
      this.formData.selectedTeams = this.formData.selectedTeams.filter(
        (t) => t.id !== id
      );
    },

    handleClose() {
      this.$emit("close");
      this.isAreaDropdownOpen = false;
      this.areaSearch = "";
      this.isTeamDropdownOpen = false;
      this.teamSearch = "";
    },

    handleSubmit() {
      // Map to backward compatible keys if needed
      const payload = {
        ...this.formData,
        areaName: this.formData.area ? this.formData.area.name : "",
        area_id: this.formData.area ? this.formData.area.id : null,
        selectedMembers: this.formData.selectedTeams,
      };
      this.$emit("submit", payload);
      this.handleReset();
      this.handleClose();
    },

    handleReset() {
      this.formData = {
        area: null,
        selectedTeams: [],
      };

      this.areaSearch = "";
      this.teamSearch = "";
    },

    handleClickOutside(event) {
      if (
        this.$refs.areaDropdownRef &&
        !this.$refs.areaDropdownRef.contains(event.target)
      ) {
        this.isAreaDropdownOpen = false;
      }
      if (
        this.$refs.teamDropdownRef &&
        !this.$refs.teamDropdownRef.contains(event.target)
      ) {
        this.isTeamDropdownOpen = false;
      }
    },
  },

  mounted() {
    document.addEventListener("mousedown", this.handleClickOutside);
    this.fetchData();
  },

  beforeDestroy() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  },
};
</script>

<template>
  <!-- Overlay Background -->
  <Transition name="overlay">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-sub-text/80 z-40 transition-all duration-300"
      @click="handleClose"
    ></div>
  </Transition>

  <!-- Form Slide Panel -->
  <Transition name="slide">
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-screen w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-4 sm:p-6 border-b border-outline"
      >
        <h2 class="text-lg sm:text-xl font-bold text-main-text">
          {{ editData ? "Edit Area" : "Add Area" }}
        </h2>
        <button
          @click="handleClose"
          class="p-2 hover:bg-light-base rounded-lg transition-colors"
        >
          <X :size="20" class="text-sub-text" />
        </button>
      </div>

      <!-- Form Content (Scrollable) -->
      <div class="flex-1 overflow-y-auto">
        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
          <!-- Area Name (Searchable Dropdown) -->
          <div class="relative" ref="areaDropdownRef">
            <label class="block text-sm font-medium text-main-text mb-2">
              Area Name
            </label>

            <div
              @click="isAreaDropdownOpen = !isAreaDropdownOpen"
              class="w-full px-3 py-2 border border-outline rounded-lg flex flex-wrap gap-2 items-center cursor-pointer min-h-10.5 bg-white transition focus-within:ring-1 focus-within:ring-sub-text"
            >
              <div v-if="!formData.area" class="text-gray-400 text-sm">
                Search and select area
              </div>
              <div
                v-else
                class="flex items-center gap-1 bg-light-base px-2 py-1 rounded text-xs font-medium text-main-text border border-outline"
                @click.stop
              >
                {{ formData.area.name }}
                <X
                  :size="12"
                  class="cursor-pointer hover:text-red"
                  @click="removeArea"
                />
              </div>
              <ChevronDown :size="16" class="ml-auto text-sub-text" />
            </div>

            <!-- Area Dropdown Menu -->
            <div
              v-if="isAreaDropdownOpen"
              class="absolute z-50 w-full mt-1 bg-white border border-outline rounded-lg shadow-xl flex flex-col max-h-64"
            >
              <div class="p-2 border-b border-outline">
                <div class="relative">
                  <Search
                    :size="14"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-sub-text"
                  />
                  <input
                    v-model="areaSearch"
                    type="text"
                    placeholder="Search areas"
                    class="w-full pl-9 pr-3 py-2 bg-light-base/50 border border-outline rounded text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
                    @click.stop
                  />
                </div>
              </div>
              <div class="flex-1 overflow-y-auto py-1">
                <div
                  v-for="area in filteredAreas"
                  :key="area.id"
                  @click="selectArea(area)"
                  class="px-4 py-2 hover:bg-light-base cursor-pointer flex items-center justify-between text-sm transition"
                >
                  <span class="font-medium text-main-text">{{
                    area.name
                  }}</span>
                  <div
                    v-if="formData.area?.id === area.id"
                    class="w-5 h-5 bg-dark-base rounded-full flex items-center justify-center"
                  >
                    <Check :size="12" class="text-white" />
                  </div>
                </div>
                <div
                  v-if="filteredAreas.length === 0"
                  class="px-4 py-6 text-center text-sm text-sub-text"
                >
                  No areas found
                </div>
              </div>
            </div>
          </div>

          <!-- Add Team (Searchable Dropdown) -->
          <div class="relative" ref="teamDropdownRef">
            <label class="block text-sm font-medium text-main-text mb-2">
              Add Team
            </label>

            <div
              @click="isTeamDropdownOpen = !isTeamDropdownOpen"
              class="w-full px-3 py-2 border border-outline rounded-lg flex flex-wrap gap-2 items-center cursor-pointer min-h-10.5 bg-white transition focus-within:ring-1 focus-within:ring-sub-text"
            >
              <div
                v-if="formData.selectedTeams.length === 0"
                class="text-gray-400 text-sm"
              >
                Search and select teams
              </div>
              <div
                v-for="team in formData.selectedTeams"
                :key="team.id"
                class="flex items-center gap-1 bg-light-base px-2 py-1 rounded text-xs font-medium text-main-text border border-outline"
                @click.stop
              >
                {{ team.team_name }}
                <X
                  :size="12"
                  class="cursor-pointer hover:text-red"
                  @click="removeTeam(team.id)"
                />
              </div>
              <ChevronDown :size="16" class="ml-auto text-sub-text" />
            </div>

            <!-- Team Dropdown Menu -->
            <div
              v-if="isTeamDropdownOpen"
              class="absolute z-50 w-full mt-1 bg-white border border-outline rounded-lg shadow-xl flex flex-col max-h-64"
            >
              <div class="p-2 border-b border-outline">
                <div class="relative">
                  <Search
                    :size="14"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-sub-text"
                  />
                  <input
                    v-model="teamSearch"
                    type="text"
                    placeholder="Search by team name"
                    class="w-full pl-9 pr-3 py-2 bg-light-base/50 border border-outline rounded text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
                    @click.stop
                  />
                </div>
              </div>
              <div class="flex-1 overflow-y-auto py-1">
                <div
                  v-for="team in filteredTeams"
                  :key="team.id"
                  @click="toggleTeam(team)"
                  class="px-4 py-2 hover:bg-light-base cursor-pointer flex items-center justify-between text-sm transition"
                >
                  <div class="flex flex-col">
                    <span class="font-medium text-main-text">{{
                      team.team_name
                    }}</span>
                  </div>
                  <div
                    v-if="isTeamSelected(team.id)"
                    class="w-5 h-5 bg-dark-base rounded-full flex items-center justify-center"
                  >
                    <Check :size="12" class="text-white" />
                  </div>
                </div>
                <div
                  v-if="filteredTeams.length === 0"
                  class="px-4 py-6 text-center text-sm text-sub-text"
                >
                  No teams found
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer Actions (Sticky) -->
      <div
        class="bg-white flex items-center justify-between px-6 py-4 border-t border-outline shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        <button
          type="button"
          @click="handleReset"
          class="text-sm text-red font-medium hover:underline"
        >
          Reset
        </button>
        <div class="flex gap-3">
          <button
            type="button"
            @click="handleClose"
            class="px-6 py-2 border border-outline rounded-lg text-sub-text hover:bg-light-base transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-dark-base text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition"
            @click="handleSubmit"
          >
            {{ editData ? "Update" : "Submit" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Overlay Animation */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Slide Animation */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* Custom scrollbar for dropdown */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>
