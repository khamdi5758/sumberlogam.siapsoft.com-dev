<template>
  <header
    class="z-30 w-full px-4 py-3 shadow-sm backdrop-blur sm:px-6"
    :style="{
      backgroundColor: 'var(--layout-navbar-bg)',
      borderBottomColor: 'var(--layout-navbar-border)',
      color: 'var(--layout-navbar-text)',
    }"
  >
    <div class="flex flex-col gap-3 lg:hidden">
      <div class="flex items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <button
            class="inline-flex shrink-0 items-center justify-center rounded-xl p-2 transition text-(--layout-navbar-muted) hover:bg-(--layout-navbar-border) hover:text-(--layout-navbar-text)"
            @click="toggleSidebar"
            aria-label="Toggle sidebar"
          >
            <ListCollapse :size="20" />
          </button>

          <div class="min-w-0">
            <p
              class="truncate text-sm font-semibold tracking-wide"
              :style="{ color: 'var(--layout-navbar-text)' }"
            >
              CRM MG26
            </p>
            <p
              class="text-[11px] uppercase tracking-[0.2em]"
              :style="{ color: 'var(--layout-navbar-muted)' }"
            >
              Dashboard
            </p>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <div class="relative" ref="notificationRefMobile">
            <button
              @click="toggleNotification"
              class="relative inline-flex h-10 w-10 items-center justify-center rounded-xl transition"
              :class="{
                'bg-(--layout-navbar-border) text-(--layout-navbar-text)':
                  isNotificationOpen,
                'text-(--layout-navbar-muted)': !isNotificationOpen,
              }"
              @mouseenter="
                $event.currentTarget.style.backgroundColor =
                  'var(--layout-navbar-border)'
              "
              @mouseleave="
                $event.currentTarget.style.backgroundColor = isNotificationOpen
                  ? 'var(--layout-navbar-border)'
                  : 'transparent'
              "
            >
              <Bell :size="18" />
              <span
                v-if="unreadCount > 0"
                class="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white"
                style="background-color: var(--color-dark-base)"
              ></span>
            </button>

            <!-- Notification Dropdown Mobile -->
            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="isNotificationOpen"
                class="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-120 overflow-hidden rounded-2xl shadow-2xl z-50 p-1"
                :style="{
                  backgroundColor: 'var(--layout-navbar-bg)',
                  border: '1px solid var(--layout-navbar-border)',
                }"
                style="right: -4rem"
              >
                <div class="p-6">
                  <div class="flex items-center justify-between mb-4">
                    <h3
                      class="text-xl font-bold"
                      :style="{ color: 'var(--layout-navbar-text)' }"
                    >
                      Notifications
                    </h3>
                    <button
                      v-if="unreadCount > 0"
                      @click.stop="markAllRead"
                      class="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors text-(--layout-navbar-muted) hover:bg-(--layout-navbar-border)"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <!-- Category Dropdown -->
                  <div class="relative mb-6">
                    <button
                      @click.stop="
                        isCategoryDropdownOpen = !isCategoryDropdownOpen
                      "
                      class="w-full flex items-center justify-between px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-all"
                      style="
                        border-color: var(--layout-navbar-border);
                        color: var(--layout-navbar-muted);
                      "
                    >
                      <span>{{ selectedCategory }}</span>
                      <ChevronDown
                        :size="16"
                        class="transition-transform text-(--layout-navbar-muted)"
                        :class="{ 'rotate-180': isCategoryDropdownOpen }"
                      />
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
                        v-if="isCategoryDropdownOpen"
                        class="absolute left-0 right-0 mt-1 rounded-xl shadow-xl z-60 overflow-hidden py-1"
                        :style="{
                          backgroundColor: 'var(--layout-navbar-bg)',
                          border: '1px solid var(--layout-navbar-border)',
                        }"
                      >
                        <button
                          v-for="cat in categories"
                          :key="cat"
                          @click.stop="selectCategory(cat)"
                          class="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-(--layout-navbar-border)"
                          :class="
                            selectedCategory === cat
                              ? 'bg-(--layout-navbar-text) text-(--layout-navbar-bg)'
                              : 'text-(--layout-navbar-text)'
                          "
                        >
                          {{ cat }}
                        </button>
                      </div>
                    </Transition>
                  </div>

                  <!-- Notification List -->
                  <div
                    class="max-h-100 overflow-y-auto -mx-2 px-2 custom-scrollbar"
                  >
                    <div
                      v-if="filteredNotifications.length === 0"
                      class="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <div
                        class="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                        style="background-color: var(--color-light-base)"
                      >
                        <Bell :size="32" style="color: var(--color-points)" />
                      </div>
                      <p
                        class="text-lg font-bold"
                        style="color: var(--color-dark-base)"
                      >
                        No notification yet
                      </p>
                      <p class="text-sm" style="color: var(--color-sub-text)">
                        Your notification list will appear here.
                      </p>
                    </div>

                    <div
                      v-else
                      v-for="n in filteredNotifications"
                      :key="n.id"
                      @click="handleNotificationClick(n)"
                      class="group relative flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer mb-2 border border-transparent hover:border-outline"
                      :style="{
                        backgroundColor:
                          n.is_read == 1 ? '#ffffff' : 'var(--color-pipeline)',
                        borderColor:
                          n.is_read == 1
                            ? 'var(--color-outline)'
                            : 'transparent',
                      }"
                      onmouseover="
                        this.style.backgroundColor = 'var(--color-baris-genap)'
                      "
                      onmouseout="
                        this.style.backgroundColor =
                          this.getAttribute('data-read') === 'true'
                            ? '#ffffff'
                            : 'var(--color-pipeline)'
                      "
                      :data-read="n.is_read == 1"
                    >
                      <div class="relative shrink-0">
                        <div
                          class="w-12 h-12 rounded-full bg-white border flex items-center justify-center shadow-sm"
                          style="border-color: var(--color-outline)"
                        >
                          <Bell
                            :size="20"
                            :style="{
                              color:
                                n.is_read == 1
                                  ? 'var(--color-sub-text)'
                                  : 'var(--color-dark-base)',
                            }"
                          />
                        </div>
                        <span
                          v-if="n.is_read == 0"
                          class="absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                          style="background-color: var(--color-dark-base)"
                        ></span>
                      </div>

                      <div class="flex-1 min-w-0">
                        <div
                          class="flex items-center justify-between gap-2 mb-1"
                        >
                          <p
                            class="text-sm font-bold truncate"
                            :style="{ color: 'var(--color-dark-base)' }"
                          >
                            {{ n.title || "Notification" }}
                          </p>
                          <span
                            class="text-[11px] font-medium whitespace-nowrap text-(--layout-navbar-muted)"
                            >{{ timeAgo(n.created_at) }}</span
                          >
                        </div>
                        <p
                          class="text-xs leading-relaxed line-clamp-1"
                          :style="{ color: 'var(--color-sub-text)' }"
                        >
                          {{ n.body || n.message || "You have a new message." }}
                        </p>
                      </div>

                      <!-- Read Button -->
                      <button
                        v-if="n.is_read == 0"
                        @click.stop="markRead(n.id)"
                        class="shrink-0 p-2 rounded-lg border transition-colors shadow-sm bg-(--layout-navbar-bg) hover:bg-(--layout-navbar-border)"
                        style="
                          color: var(--layout-navbar-text);
                          border-color: var(--layout-navbar-border);
                        "
                        title="Mark as read"
                      >
                        <Check :size="16" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <div class="relative" ref="dropdownRefMobile">
            <button
              @click="toggleDropdown"
              class="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold shadow-sm transition hover:brightness-95"
              :class="{
                'ring-2 ring-(--layout-navbar-border)': isDropdownOpen,
              }"
              :style="{
                backgroundColor: 'var(--layout-navbar-text)',
                color: 'var(--layout-navbar-bg)',
              }"
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
                class="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl py-2 shadow-xl z-50"
                :style="{
                  backgroundColor: 'var(--layout-navbar-bg)',
                  border: '1px solid var(--layout-navbar-border)',
                }"
              >
                <div
                  class="px-4 py-3 border-b"
                  :style="{ borderBottomColor: 'var(--layout-navbar-border)' }"
                >
                  <p
                    class="text-xs font-semibold uppercase tracking-wider text-(--layout-navbar-muted)"
                  >
                    Account
                  </p>
                </div>

                <button
                  @click="openProfileForm"
                  class="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors text-(--layout-navbar-text) hover:bg-(--layout-navbar-border)"
                >
                  <User :size="16" class="text-(--layout-navbar-muted)" />
                  My Profile
                </button>
                <button
                  class="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors text-(--layout-navbar-text) hover:bg-(--layout-navbar-border)"
                >
                  <Settings :size="16" class="text-(--layout-navbar-muted)" />
                  Settings
                </button>

                <div class="my-1 h-px bg-(--layout-navbar-border)"></div>

                <button
                  @click="logout"
                  class="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-red hover:bg-(--layout-navbar-border)"
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
        <NotificationBell />

        <!-- User Profile Dropdown -->
        <div class="relative" ref="dropdownRef">
          <div
            @click="toggleDropdown"
            class="flex items-center gap-3 cursor-pointer rounded-lg px-2 py-1.5 transition-all hover:bg-(--layout-navbar-border)"
            :class="{ 'bg-(--layout-navbar-border)': isDropdownOpen }"
          >
            <div class="flex items-center gap-3">
              <!-- Avatar with Placeholder -->
              <div
                class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm bg-(--layout-navbar-text) text-(--layout-navbar-bg)"
              >
                {{ initials }}
              </div>

              <!-- User Info -->
              <div class="hidden sm:block text-left">
                <p
                  class="text-sm font-bold leading-tight text-(--layout-navbar-text)"
                >
                  {{ userName }}
                </p>
                <!-- <p class="text-[11px] text-gray-500 font-medium">pegawai</p> -->
              </div>
            </div>

            <!-- Dropdown Icon -->
            <ChevronDown
              :size="14"
              class="text-(--layout-navbar-muted) transition-transform duration-200"
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
              class="absolute right-0 mt-2 w-48 rounded-xl shadow-xl py-2 z-50 overflow-hidden"
              :style="{
                backgroundColor: 'var(--layout-navbar-bg)',
                border: '1px solid var(--layout-navbar-border)',
              }"
            >
              <div
                class="px-4 py-3 border-b"
                :style="{ borderBottomColor: 'var(--layout-navbar-border)' }"
              >
                <p
                  class="text-xs font-semibold uppercase tracking-wider text-(--layout-navbar-muted)"
                >
                  Account
                </p>
              </div>

              <button
                @click="openProfileForm"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-(--layout-navbar-text) hover:bg-(--layout-navbar-border)"
              >
                <User :size="16" class="text-(--layout-navbar-muted)" />
                My Profile
              </button>
              <button
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-(--layout-navbar-text) hover:bg-(--layout-navbar-border)"
              >
                <Settings :size="16" class="text-(--layout-navbar-muted)" />
                Settings
              </button>

              <div class="h-px bg-(--layout-navbar-border) my-1"></div>

              <button
                @click="logout"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors font-medium text-red hover:bg-(--layout-navbar-border)"
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
  BellOff,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ListCollapse,
  Check,
} from "lucide-vue-next";
import ProfileForm from "../forms/ProfileForm.vue";
import { mapGetters, mapActions } from "vuex";
import { alertService } from "@/services/alertService";
import { useNotifications } from "@/composables/useNotifications";
import NotificationBell from "@/components/widgets/NotificationBell.vue";

export default {
  name: "HeaderComponent",

  components: {
    Bell,
    BellOff,
    Search,
    ChevronDown,
    User,
    Settings,
    LogOut,
    ListCollapse,
    Check,
    ProfileForm,
    NotificationBell,
  },

  setup() {
    const {
      notifications,
      unreadCount,
      markRead,
      markAllRead,
      fetchNotifications,
    } = useNotifications();

    return {
      notifications,
      unreadCount,
      markRead,
      markAllRead,
      fetchNotifications,
    };
  },

  data() {
    return {
      isDropdownOpen: false,
      isNotificationOpen: false,
      isProfileFormOpen: false,
      showOnlyUnread: false,
      selectedCategory: "All general notification",
      isCategoryDropdownOpen: false,
      categories: [
        "All general notification",
        "Reminder",
        "Mention",
        "Assignment",
        "Update",
        "Download & upload",
      ],
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
    filteredNotifications() {
      let filtered = this.notifications || [];
      if (this.showOnlyUnread) {
        filtered = filtered.filter((n) => n.is_read == 0);
      }
      if (this.selectedCategory !== "All general notification") {
        // Map category to possible type fields in backend
        const cat = this.selectedCategory.toLowerCase();
        filtered = filtered.filter(
          (n) => n.category === cat || (n.type && n.type.includes(cat)),
        );
      }
      return filtered;
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
      if (this.isDropdownOpen) this.isNotificationOpen = false;
    },

    toggleNotification() {
      this.isNotificationOpen = !this.isNotificationOpen;
      if (this.isNotificationOpen) {
        this.isDropdownOpen = false;
        this.isCategoryDropdownOpen = false;
        this.fetchNotifications();
      }
    },

    selectCategory(cat) {
      this.selectedCategory = cat;
      this.isCategoryDropdownOpen = false;
    },

    handleNotificationClick(n) {
      this.markRead(n.id);
      if (n.url) {
        // Use router if it's an internal link
        if (n.url.startsWith("/")) {
          this.$router.push(n.url);
        } else {
          window.location.href = n.url;
        }
      }
      this.isNotificationOpen = false;
    },

    timeAgo(dateStr) {
      if (!dateStr) return "";
      const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
      if (diff < 60) return "Baru saja";
      if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
      return `${Math.floor(diff / 86400)} hari lalu`;
    },

    openProfileForm() {
      this.isProfileFormOpen = true;
      this.isDropdownOpen = false;
    },

    handleClickOutside(event) {
      const dropdownRefs = [
        this.$refs.dropdownRef,
        this.$refs.dropdownRefMobile,
        this.$refs.notificationRef,
        this.$refs.notificationRefMobile,
      ].filter(Boolean);

      if (
        dropdownRefs.length > 0 &&
        !dropdownRefs.some((ref) => ref.contains(event.target))
      ) {
        this.isDropdownOpen = false;
        this.isNotificationOpen = false;
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

<style scoped>
@keyframes bounce-subtle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
.animate-bounce-subtle {
  animation: bounce-subtle 3s ease-in-out infinite;
}
</style>
