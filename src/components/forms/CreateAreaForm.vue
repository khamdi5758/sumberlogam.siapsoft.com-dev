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

export default {
  emits: ["close", "submit"],

  props: {
    isOpen: {
      type: Boolean,
      default: false,
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
      membersList: [
        { id: 1, name: "Hanan Hafizhah", email: "hanan@mail.com" },
        { id: 2, name: "Aulia Rahman", email: "aulia@mail.com" },
        { id: 3, name: "Rizky Pratama", email: "rizky@mail.com" },
        { id: 4, name: "Siti Lestari", email: "siti@mail.com" },
        { id: 5, name: "Budi Santoso", email: "budi@mail.com" },
        { id: 6, name: "Kevin Wijaya", email: "kevin@mail.com" },
      ],

      areasList: [
        { id: 1, name: "Management" },
        { id: 2, name: "Marketing" },
        { id: 3, name: "Design" },
        { id: 4, name: "Finance" },
        { id: 5, name: "Development" },
        { id: 6, name: "Support" },
      ],

      formData: {
        areaName: "",
        parentArea: null,
        selectedMembers: [],
      },

      isDropdownOpen: false,
      memberSearch: "",

      isParentDropdownOpen: false,
      parentSearch: "",

      dropdownRef: null,
      parentDropdownRef: null,
    };
  },

  computed: {
    ...mapGetters({
      users: "users/allUsers",
      isLoadingTable: "users/isLoading",
      errorMsgTable: "users/error",
    }),

    filteredMembers() {
      if (!this.memberSearch) return this.users;

      return this.users.filter(
        (m) =>
          m.name.toLowerCase().includes(this.memberSearch.toLowerCase()) ||
          m.email.toLowerCase().includes(this.memberSearch.toLowerCase()),
      );
    },

    filteredAreas() {
      if (!this.parentSearch) return this.areasList;

      return this.areasList.filter((t) =>
        t.name.toLowerCase().includes(this.parentSearch.toLowerCase()),
      );
    },
  },

  methods: {
    ...mapActions({
      fetchUsers: "users/fetchAllusers",
    }),

    fetchData() {
      this.fetchUsers()
        .then(() => {
          console.log("Users fetched successfully");
        })
        .catch((err) => {
          console.error("Failed to fetch users:", err);
        });
    },

    selectParentArea(area) {
      this.formData.parentArea = area;
      this.isParentDropdownOpen = false;
      this.parentSearch = "";
    },

    removeParentArea() {
      this.formData.parentArea = null;
    },

    toggleMember(member) {
      const index = this.formData.selectedMembers.findIndex(
        (m) => m.id === member.id,
      );

      if (index === -1) {
        this.formData.selectedMembers.push(member);
      } else {
        this.formData.selectedMembers.splice(index, 1);
      }
    },

    isMemberSelected(id) {
      return this.formData.selectedMembers.some((m) => m.id === id);
    },

    removeMember(id) {
      this.formData.selectedMembers = this.formData.selectedMembers.filter(
        (m) => m.id !== id,
      );
    },

    handleClose() {
      this.$emit("close");
      this.isDropdownOpen = false;
      this.memberSearch = "";
    },

    handleSubmit() {
      this.$emit("submit", this.formData);
      this.handleReset();
      this.handleClose();
    },

    handleReset() {
      this.formData = {
        areaName: "",
        parentArea: null,
        selectedMembers: [],
      };

      this.memberSearch = "";
      this.parentSearch = "";
    },

    handleClickOutside(event) {
      if (
        this.$refs.dropdownRef &&
        !this.$refs.dropdownRef.contains(event.target)
      ) {
        this.isDropdownOpen = false;
      }

      if (
        this.$refs.parentDropdownRef &&
        !this.$refs.parentDropdownRef.contains(event.target)
      ) {
        this.isParentDropdownOpen = false;
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
        class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        <h2 class="text-xl font-bold text-main-text">Add Area</h2>
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
          <!-- Area Name -->
          <div>
            <label class="block text-sm font-medium text-main-text mb-2">
              Area Name
            </label>
            <input
              v-model="formData.areaName"
              type="text"
              placeholder="Enter area name"
              class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
              required
            />
          </div>

          <!-- Parent Area Name (Searchable Dropdown) -->
          <div class="relative" ref="parentDropdownRef">
            <label class="block text-sm font-medium text-main-text mb-2">
              Parent Area Name
            </label>

            <div
              @click="isParentDropdownOpen = !isParentDropdownOpen"
              class="w-full px-3 py-2 border border-outline rounded-lg flex flex-wrap gap-2 items-center cursor-pointer min-h-10.5 bg-white transition focus-within:ring-1 focus-within:ring-sub-text"
            >
              <div v-if="!formData.parentArea" class="text-gray-400 text-sm">
                Search and select parent area
              </div>
              <div
                v-else
                class="flex items-center gap-1 bg-light-base px-2 py-1 rounded text-xs font-medium text-main-text border border-outline"
                @click.stop
              >
                {{ formData.parentArea.name }}
                <X
                  :size="12"
                  class="cursor-pointer hover:text-red"
                  @click="removeParentArea"
                />
              </div>
              <ChevronDown :size="16" class="ml-auto text-sub-text" />
            </div>

            <!-- Parent Area Dropdown Menu -->
            <div
              v-if="isParentDropdownOpen"
              class="absolute z-50 w-full mt-1 bg-white border border-outline rounded-lg shadow-xl flex flex-col max-h-64"
            >
              <div class="p-2 border-b border-outline">
                <div class="relative">
                  <Search
                    :size="14"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-sub-text"
                  />
                  <input
                    v-model="parentSearch"
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
                  @click="selectParentArea(area)"
                  class="px-4 py-2 hover:bg-light-base cursor-pointer flex items-center justify-between text-sm transition"
                >
                  <span class="font-medium text-main-text">{{
                    area.name
                  }}</span>
                  <div
                    v-if="formData.parentArea?.id === area.id"
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

          <!-- Add Team Member (Searchable Dropdown) -->
          <div class="relative" ref="dropdownRef">
            <label class="block text-sm font-medium text-main-text mb-2">
              Add Team Member
            </label>

            <div
              @click="isDropdownOpen = !isDropdownOpen"
              class="w-full px-3 py-2 border border-outline rounded-lg flex flex-wrap gap-2 items-center cursor-pointer min-h-10.5 bg-white transition focus-within:ring-1 focus-within:ring-sub-text"
            >
              <div
                v-if="formData.selectedMembers.length === 0"
                class="text-gray-400 text-sm"
              >
                Search and select members
              </div>
              <div
                v-for="member in formData.selectedMembers"
                :key="member.id"
                class="flex items-center gap-1 bg-light-base px-2 py-1 rounded text-xs font-medium text-main-text border border-outline"
                @click.stop
              >
                {{ member.name }}
                <X
                  :size="12"
                  class="cursor-pointer hover:text-red"
                  @click="removeMember(member.id)"
                />
              </div>
              <ChevronDown :size="16" class="ml-auto text-sub-text" />
            </div>

            <!-- Dropdown Menu -->
            <div
              v-if="isDropdownOpen"
              class="absolute z-50 w-full mt-1 bg-white border border-outline rounded-lg shadow-xl flex flex-col max-h-64"
            >
              <div class="p-2 border-b border-outline">
                <div class="relative">
                  <Search
                    :size="14"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-sub-text"
                  />
                  <input
                    v-model="memberSearch"
                    type="text"
                    placeholder="Search by name or email"
                    class="w-full pl-9 pr-3 py-2 bg-light-base/50 border border-outline rounded text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
                    @click.stop
                  />
                </div>
              </div>
              <div class="flex-1 overflow-y-auto py-1">
                <div
                  v-for="member in filteredMembers"
                  :key="member.id"
                  @click="toggleMember(member)"
                  class="px-4 py-2 hover:bg-light-base cursor-pointer flex items-center justify-between text-sm transition"
                >
                  <div class="flex flex-col">
                    <span class="font-medium text-main-text">{{
                      member.name
                    }}</span>
                    <span class="text-xs text-sub-text">{{
                      member.email
                    }}</span>
                  </div>
                  <div
                    v-if="isMemberSelected(member.id)"
                    class="w-5 h-5 bg-dark-base rounded-full flex items-center justify-center"
                  >
                    <Check :size="12" class="text-white" />
                  </div>
                </div>
                <div
                  v-if="filteredMembers.length === 0"
                  class="px-4 py-6 text-center text-sm text-sub-text"
                >
                  No members found
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
            @click="handleSubmit"
            type="submit"
            class="px-6 py-2 bg-dark-base text-white rounded-lg hover:bg-dark-hover transition-colors text-sm font-medium"
          >
            Submit
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
