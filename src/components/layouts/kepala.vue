<template>
  <header
    class="z-30 flex min-h-16 w-full flex-wrap items-center justify-between gap-3 bg-white px-4 py-2 shadow-sm sm:px-6"
  >
    <div class="relative w-full sm:w-72">
      <Search class="absolute left-3 top-2.5 text-gray-400" :size="18" />
      <input
        type="text"
        placeholder="Type to search..."
        class="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
      />
    </div>

    <div class="flex w-full items-center justify-end gap-3 sm:w-auto sm:gap-4">
      <!-- Notification Bell -->
      <button
        class="p-2 text-gray-400 hover:bg-gray-100 rounded-full relative transition-colors"
      >
        <Bell :size="20" />
        <span
          class="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"
        ></span>
      </button>

      <!-- User Profile Dropdown -->
      <div class="relative" ref="dropdownRef">
        <div
          @click="toggleDropdown"
          class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-all"
          :class="{ 'bg-gray-50': isDropdownOpen }"
        >
          <div class="flex items-center gap-3">
            <!-- Avatar with Placeholder -->
            <div
              class="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
            >
              {{ initials }}
            </div>

            <!-- User Info -->
            <div class="hidden sm:block text-left">
              <p class="text-sm font-bold text-gray-800 leading-tight">
                {{ userName }}
              </p>
              <!-- <p class="text-[11px] text-gray-500 font-medium">pegawai</p> -->
            </div>
          </div>

          <!-- Dropdown Icon -->
          <ChevronDown
            :size="14"
            class="text-gray-400 transition-transform duration-200"
            :class="{ 'rotate-180': isDropdownOpen }"
          />
        </div>

        <!-- Dropdown Menu -->
        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            v-if="isDropdownOpen"
            class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
          >
            <div class="px-4 py-3 border-b border-gray-50">
              <p
                class="text-xs text-gray-400 font-semibold uppercase tracking-wider"
              >
                Account
              </p>
            </div>

            <button
              @click="openProfileForm"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User :size="16" class="text-gray-400" />
              My Profile
            </button>
            <button
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings :size="16" class="text-gray-400" />
              Settings
            </button>

            <div class="h-px bg-gray-100 my-1"></div>

            <button
              @click="logout"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut :size="16" />
              Sign Out
            </button>
          </div>
        </Transition>
      </div>

      <!-- My Profile Form -->
      <ProfileForm
        :isOpen="isProfileFormOpen"
        @close="isProfileFormOpen = false"
        @submit="(data) => console.log('Profile update requested:', data)"
      />
    </div>
  </header>
</template>

<script>
import {
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-vue-next";
import ProfileForm from "../forms/ProfileForm.vue";
import { mapGetters, mapActions } from "vuex";
import { alertService } from "@/services/alertService";

export default {
  name: "HeaderComponent",

  components: {
    Bell,
    Search,
    ChevronDown,
    User,
    Settings,
    LogOut,
    ProfileForm,
  },

  data() {
    return {
      isDropdownOpen: false,
      isProfileFormOpen: false,
    };
  },

  computed: {
    // user() {
    //   return (
    //     this.$store.getters["auth/currentUser"] || {
    //       name: "Guest",
    //       role: "Visitor"
    //     }
    //   );
    // },
    ...mapGetters("users", ["usersignin"]),
    userName() {
      if (this.usersignin?.name) return this.usersignin.name;
      if (this.usersignin?.user?.name) return this.usersignin.user.name;
      return "User";
    },
    initials() {
      return this.$store.getters["auth/userInitials"];
    },
  },

  methods: {
    ...mapActions({
      getusersignin: "users/getusersignin",
      authlogout: "auth/authlogout",
    }),

    async logout() {
      const result = await alertService.confirmLogout();
      if (result) {
        this.authlogout()
          .then((data) => {
            alertService.success(data.msg || "");
            this.$router.push({ name: "login" });
            alertService.logoutSuccess();
          })
          .catch((error) => {
            console.log(error.response?.data?.message);
            alertService.error(error.response?.data?.message || "", "");
          });
      }
    },
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },

    openProfileForm() {
      this.isProfileFormOpen = true;
      this.isDropdownOpen = false;
    },

    handleClickOutside(event) {
      if (
        this.$refs.dropdownRef &&
        !this.$refs.dropdownRef.contains(event.target)
      ) {
        this.isDropdownOpen = false;
      }
    },
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },

  beforeDestroy() {
    // Vue 2 lifecycle
    document.removeEventListener("click", this.handleClickOutside);
  },

  created() {
    this.getusersignin();
  },
};
</script>

<style scoped></style>
