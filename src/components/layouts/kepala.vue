<template>
  <header
    class="z-30 w-full border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6"
  >
    <div class="flex flex-col gap-3 lg:hidden">
      <div class="flex items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <button
            class="inline-flex shrink-0 items-center justify-center rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            @click="toggleSidebar"
            aria-label="Toggle sidebar"
          >
            <ListCollapse :size="20" />
          </button>

          <div class="min-w-0">
            <p
              class="truncate text-sm font-semibold tracking-wide text-gray-900"
            >
              CRM MG26
            </p>
            <p class="text-[11px] uppercase tracking-[0.2em] text-gray-400">
              Dashboard
            </p>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <button
            class="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <Bell :size="18" />
            <span
              class="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500"
            ></span>
          </button>

          <div class="relative" ref="dropdownRefMobile">
            <button
              @click="toggleDropdown"
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white shadow-sm transition hover:brightness-95"
              :class="{ 'ring-2 ring-blue-200': isDropdownOpen }"
            >
              {{ initials }}
            </button>

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
                class="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-xl z-50"
              >
                <div class="px-4 py-3 border-b border-gray-50">
                  <p
                    class="text-xs font-semibold uppercase tracking-wider text-gray-400"
                  >
                    Account
                  </p>
                </div>

                <button
                  @click="openProfileForm"
                  class="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <User :size="16" class="text-gray-400" />
                  My Profile
                </button>
                <button
                  class="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Settings :size="16" class="text-gray-400" />
                  Settings
                </button>

                <div class="my-1 h-px bg-gray-100"></div>

                <button
                  @click="logout"
                  class="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut :size="16" />
                  Sign Out
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!--<div class="relative">
        <Search
          class="pointer-events-none absolute left-3 top-2.5 text-gray-400"
          :size="18"
        />
        <input
          type="text"
          placeholder="Type to search..."
          class="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        />
      </div>-->
    </div>

    <div class="hidden items-center justify-between gap-3 lg:flex">
      <div class="relative w-full sm:w-72">
        <!--<Search class="absolute left-3 top-2.5 text-gray-400" :size="18" />
        <input
          type="text"
          placeholder="Type to search..."
          class="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
        />-->
      </div>

      <div class="flex items-center gap-3 sm:gap-4">
        <!-- Notification Bell -->
        <button
          class="relative rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100"
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
  ListCollapse,
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
    ListCollapse,
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
      toggleSidebar: "settingsfe/toggleSidebar",
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
      const dropdownRefs = [
        this.$refs.dropdownRef,
        this.$refs.dropdownRefMobile,
      ].filter(Boolean);

      if (
        dropdownRefs.length > 0 &&
        !dropdownRefs.some((ref) => ref.contains(event.target))
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
