<script>
import { mapGetters } from "vuex";
import { User, UserCog, Users, Map } from "lucide-vue-next";
import UserSettings from "./usersettings/usersetings.vue";
import UserPermission from "./userpermission.vue";
import UserArea from "./userarea.vue";
import UserTeam from "./userteam.vue";

export default {
  name: "UserPage",
  components: {
    UserSettings,
    UserPermission,
    UserArea,
    UserTeam,
  },
  data() {
    return {
      activeTab: "settings",
      menuItems: [
        { key: "settings", label: "User Settings", icon: User },
        { key: "permission", label: "User Permission", icon: UserCog },
        { key: "area", label: "Area", icon: Map },
        { key: "team", label: "Team", icon: Users },
      ],
      maxUsers: 10,
    };
  },
  computed: {
    ...mapGetters({
      users: "users/allUsers",
    }),
    totalUser() {
      return Array.isArray(this.users) ? this.users.length : 0;
    },
  },
  watch: {
    "$route.query.tab": {
      immediate: true,
      handler(tab) {
        const allowedTabs = new Set(["settings", "permission", "area", "team"]);
        if (allowedTabs.has(tab)) {
          this.activeTab = tab;
        }
      },
    },
  },
  methods: {
    setActiveTab(tabKey) {
      this.activeTab = tabKey;
    },
  },
};
</script>

<template>
  <div
    class="flex flex-col gap-4 lg:grid lg:grid-cols-[220px_1fr] lg:gap-6 h-full"
  >
    <div
      class="lg:hidden bg-white rounded-xl shadow-sm border border-outline p-2"
    >
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="item in menuItems"
          :key="item.key"
          @click="setActiveTab(item.key)"
          class="flex flex-col items-center justify-center gap-1 rounded-lg border px-3 py-3 text-center transition cursor-pointer"
          :class="
            activeTab === item.key
              ? 'border-dark-base bg-dark-base text-white shadow-sm'
              : 'border-outline bg-light-base/30 text-sub-text hover:bg-light-base/60'
          "
        >
          <component :is="item.icon" :size="18" />
          <span class="text-[11px] font-medium leading-none">{{
            item.label
          }}</span>
        </button>
      </div>
    </div>

    <div
      class="hidden lg:block bg-white rounded-xl shadow-sm border border-outline overflow-hidden sticky top-4"
    >
      <div class="bg-light-base/50 px-5 py-3 border-b border-outline">
        <h3 class="font-bold text-main-text uppercase tracking-wider text-xs">
          User Menu
        </h3>
      </div>

      <nav class="p-2 space-y-1">
        <button
          v-for="item in menuItems"
          :key="item.key"
          @click="setActiveTab(item.key)"
          class="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-left transition cursor-pointer"
          :class="
            activeTab === item.key
              ? 'bg-gray-50/80 text-main-text border-outline/50 shadow-sm font-semibold'
              : 'hover:bg-gray-50/50 text-sub-text'
          "
        >
          <component :is="item.icon" :size="18" />
          <span class="text-sm">{{ item.label }}</span>
        </button>
      </nav>

      <div class="p-4 bg-light-base/30 border-t border-outline">
        <div class="text-[11px] text-gray-400 font-medium uppercase mb-2">
          User Total
        </div>
        <div class="space-y-2 text-sm text-sub-text">
          <div class="flex justify-between">
            <span>Number of Users</span>
            <span class="font-medium">{{ totalUser }}</span>
          </div>
          <div class="flex justify-between">
            <span>Maximum Users</span>
            <span class="font-medium">{{ maxUsers }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="min-w-0 flex flex-col h-full">
      <UserSettings v-if="activeTab === 'settings'" />
      <UserPermission v-else-if="activeTab === 'permission'" />
      <UserArea v-else-if="activeTab === 'area'" />
      <UserTeam v-else-if="activeTab === 'team'" />
    </div>
  </div>
</template>
