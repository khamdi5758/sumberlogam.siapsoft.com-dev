<template>
  <div
    v-if="showMobileBackdrop"
    class="fixed inset-0 z-40 backdrop-blur-[1px] transition-opacity duration-300 md:hidden"
    :style="{ backgroundColor: 'rgba(28, 36, 52, 0.5)' }"
    @click="closeMobileSidebar"
  ></div>

  <aside
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    :class="sidebarClasses"
    :style="{
      backgroundColor: 'var(--layout-sidebar-bg)',
      color: 'var(--layout-sidebar-text)',
      borderColor: 'var(--layout-sidebar-border)',
    }"
  >
    <!-- Header -->
    <div
      :class="[
        'px-5 py-2 text-2xl font-bold flex items-center border-b shrink-0',
        isExpanded ? 'gap-2 justify-start' : 'justify-center',
      ]"
      :style="{
        color: 'var(--layout-sidebar-text)',
        borderBottomColor: 'var(--layout-sidebar-border)',
      }"
    >
      <span v-show="isExpanded" class="truncate">CRM MG26</span>
      <button
        @click="toggleCollapsed"
        :class="[
          'w-8 h-8 rounded-lg flex items-center justify-center transition hover:bg-(--layout-sidebar-hover) hover:text-(--layout-sidebar-accent)',
          isExpanded ? 'ml-auto' : '',
        ]"
        :style="{
          color: 'var(--layout-sidebar-muted)',
        }"
      >
        <ListCollapse :size="20" />
      </button>
    </div>

    <!-- Navigation -->
    <nav
      class="flex-1 min-h-0 p-4 space-y-1 overflow-y-auto menu"
      id="menufl"
      v-if="getlayoutmenuweb"
    >
      <div
        v-for="(mainMenu, index) in mainMenuItems"
        :key="mainMenu.L1"
        class="menu-item relative"
        :ref="`menuItem${mainMenu.L1}`"
      >
        <button
          type="button"
          class="menu-icon-container flex h-12 w-full items-center rounded-xl p-3 transition group hover:bg-(--layout-sidebar-hover) hover:text-(--layout-sidebar-accent)"
          @click="handleMainMenuClick(mainMenu)"
          :class="
            isExpanded
              ? 'gap-3 justify-between cursor-pointer'
              : 'justify-center cursor-pointer'
          "
          :title="!isExpanded ? mainMenu.NamaCaption : ''"
        >
          <span
            class="flex items-center gap-3 min-w-0"
            :class="isExpanded ? '' : 'justify-center'"
          >
            <!-- Icon -->
            <div class="w-6 flex justify-center">
              <component
                :is="iconMap[mainMenu.ICON]"
                :size="20"
                class="menu-icon group-hover:text-(--layout-sidebar-accent)"
                :style="{ color: 'var(--layout-sidebar-muted)' }"
              />
            </div>

            <!-- Label -->
            <span v-show="isExpanded" class="truncate text-left">{{
              mainMenu.NamaCaption
            }}</span>
          </span>

          <ChevronDown
            v-if="isExpanded && hasChildren(mainMenu)"
            :size="16"
            class="shrink-0 cursor-pointer transform-gpu transition-transform duration-300 ease-in-out group-hover:text-(--layout-sidebar-accent)"
            :style="{ color: 'var(--layout-sidebar-muted)' }"
            :class="
              isMenuExpanded(mainMenu.L1) || isDummyUserMenuExpanded(mainMenu)
                ? 'rotate-180'
                : 'rotate-0'
            "
          />
        </button>

        <!-- Inline child menu (when sidebar expanded) -->
        <div
          v-if="
            isMenuExpanded(mainMenu.L1) || isDummyUserMenuExpanded(mainMenu)
          "
        >
          <div
            v-if="getChildren(mainMenu.L1, mainMenu).length"
            class="pl-6 mt-1 space-y-1"
          >
            <div
              v-for="child in getChildren(mainMenu.L1, mainMenu)"
              :key="child.L1"
              class="flex flex-col"
            >
              <div class="flex items-center">
                <button
                  type="button"
                  @click.stop="
                    childHasChildren(child)
                      ? handleChildMenuClick(child)
                      : openTab(child)
                  "
                  class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-(--layout-sidebar-hover) hover:text-(--layout-sidebar-accent)"
                  :style="{
                    color: 'var(--layout-sidebar-text)',
                  }"
                >
                  <span class="truncate">{{ child.NamaCaption }}</span>
                  <ChevronDown
                    v-if="childHasChildren(child)"
                    :size="14"
                    class="shrink-0 cursor-pointer transform-gpu transition-transform duration-300 ease-in-out group-hover:text-(--layout-sidebar-accent)"
                    :style="{ color: 'var(--layout-sidebar-muted)' }"
                    :class="
                      isMenuExpanded(child.L1) ? 'rotate-180' : 'rotate-0'
                    "
                  />
                </button>
              </div>

              <!-- level-2 inline submenu -->
              <div
                v-if="
                  isMenuExpanded(child.L1) &&
                  getChildren(child.L1, child).length
                "
                class="pl-4 mt-1"
              >
                <div v-for="sub in getChildren(child.L1, child)" :key="sub.L1">
                  <button
                    type="button"
                    @click="openTab(sub)"
                    class="w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-(--layout-sidebar-hover) hover:text-(--layout-sidebar-accent)"
                    :style="{ color: 'var(--layout-sidebar-muted)' }"
                  >
                    <span class="truncate">{{ sub.NamaCaption }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Separator -->
        <!-- <div
          :class="[
            'h-[0.75px] my-3 bg-outline transition-all duration-300',
            isExpanded ? 'w-20 mx-auto' : 'w-6 mx-auto',
          ]"
        ></div> -->
      </div>
    </nav>

    <!-- Log Out
    <div class="p-4 border-t border-slate-800 shrink-0">
      <button
        :class="[
          'flex items-center p-3 w-full rounded-xl transition text-white hover:bg-[var(--layout-sidebar-hover)]',
          isExpanded ? 'gap-3 justify-start text-left' : 'justify-center',
        ]"
        :style="{ backgroundColor: 'var(--layout-sidebar-danger)' }"
        :title="!isExpanded ? 'Log Out' : ''"
      >
        <LogOut :size="20" />
        <span v-show="isExpanded" class="font-medium truncate"> Log Out </span>
      </button>
    </div> -->
  </aside>
</template>

<style scoped>
.chevron-expand {
  animation: chevron-expand 220ms ease-out;
}

.chevron-collapse {
  animation: chevron-collapse 220ms ease-out;
}

@keyframes chevron-expand {
  0% {
    transform: rotate(0deg) scale(1);
  }
  60% {
    transform: rotate(135deg) scale(1.08);
  }
  100% {
    transform: rotate(180deg) scale(1);
  }
}

@keyframes chevron-collapse {
  0% {
    transform: rotate(180deg) scale(1);
  }
  60% {
    transform: rotate(45deg) scale(1.08);
  }
  100% {
    transform: rotate(0deg) scale(1);
  }
}
</style>

<script>
import Dashboard from "@/components/dashboard.vue";
import Contacts from "@/components/contacts.vue";
import LoginPage from "@/components/loginpage.vue";
import MainDashboard from "@/components/maindashboard.vue";
import Companies from "@/components/companies.vue";
import Deals from "@/components/pages/deals/deals.vue";
import DealsList from "@/components/pages/deals/dealslist/DealsList.vue";
import DealsCard from "@/components/pages/deals/dealscard/DealCard.vue";
import Task from "@/components/pages/task/task.vue";
import TaskList from "@/components/pages/task/tasklist.vue";
import TaskCard from "@/components/pages/task/taskcard.vue";
import TaskCalender from "@/components/pages/task/taskcalender.vue";
import EmailBroadcast from "@/components/EmailBroadcast.vue";
// import Documents from "@/components/documents/Documents.vue";
// import DocumentList from "@/components/documents/DocumentList.vue";
// import DocumentsTemplate from "@/components/documents/DocumentsTemplate.vue";
// import DocumentsShortCode from "@/components/documents/DocumentsShortCode.vue";
import UserSetings from "@/components/pages/user/usersettings/usersetings.vue";
import UserPermission from "@/components/pages/user/userpermission.vue";
import UserTeam from "@/components/pages/user/userteam.vue";
import User from "@/components/pages/user/user.vue";
import SettingsPage from "@/components/Settings.vue";

import { mapGetters } from "vuex";

import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Building2,
  Briefcase,
  CheckSquare,
  Mail,
  FileText,
  UserCircle,
  ListCollapse,
  Package,
  BarChart3,
  ChevronDown,
  Map,
} from "lucide-vue-next";

export default {
  name: "Sidebar",
  emits: ["opentabchange"],
  components: {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Building2,
    Briefcase,
    CheckSquare,
    Mail,
    FileText,
    UserCircle,
    ListCollapse,
    Package,
    BarChart3,
    ChevronDown,
    Map,
  },

  data() {
    return {
      // collapsed removed - now using Vuex
      isHovered: false,
      mediaQuery: null,
      isMobileViewport: false,
      showSubmenu: [],
      showLevel2Submenu: [],
      activeMenuId: null,
      activeLevel2MenuId: null,
      submenuStyle: {},
      level2SubmenuStyle: {},
      userMenuExpanded: false,
      chevronAnimationMenuId: null,
      chevronAnimationDirection: "",
      chevronAnimationTimer: null,
      // track expanded menus for inline sidebar dropdowns
      expandedMenuIds: [],
      dummySidebarChildren: {
        users: [
          {
            L1: "dummy-user-settings",
            NamaCaption: "User Settings",
            CAPTION: "Users",
            pathfile: "/crmAdmin/users",
            query: { tab: "settings" },
            ICON: "UserCircle",
          },
          {
            L1: "dummy-user-permission",
            NamaCaption: "User Permission",
            CAPTION: "Users",
            pathfile: "/crmAdmin/users",
            query: { tab: "permission" },
            ICON: "CheckSquare",
          },
          {
            L1: "dummy-user-area",
            NamaCaption: "Area",
            CAPTION: "Users",
            pathfile: "/crmAdmin/users",
            query: { tab: "area" },
            ICON: "Map",
          },
          {
            L1: "dummy-user-team",
            NamaCaption: "Team",
            CAPTION: "Users",
            pathfile: "/crmAdmin/users",
            query: { tab: "team" },
            ICON: "Users",
          },
        ],
      },
    };
  },

  computed: {
    // Get collapsed state from Vuex
    collapsed() {
      return this.$store.getters["settingsfe/isSidebarCollapsed"];
    },

    sidebarWidth() {
      if (this.collapsed) {
        return this.isHovered ? "w-64" : "w-20";
      }
      return "w-64";
    },

    isExpanded() {
      return !this.collapsed || this.isHovered;
    },

    showMobileBackdrop() {
      return this.isMobileViewport && !this.collapsed;
    },

    sidebarClasses() {
      const baseClasses = "flex flex-col h-screen transition-all duration-300";

      if (this.isMobileViewport) {
        return [
          baseClasses,
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-2xl transform",
          this.collapsed
            ? "-translate-x-full opacity-0 pointer-events-none"
            : "translate-x-0 opacity-100",
        ];
      }

      return [
        baseClasses,
        this.collapsed
          ? this.isHovered
            ? "left-0 top-0 w-64 shadow-xl z-50"
            : "relative w-20"
          : "relative w-64",
      ];
    },

    ...mapGetters({
      getlayoutmenuweb: "settingsfe/getlayoutmenuweb",
      getlayoutwebl0: "settingsfe/getlayoutwebl0",
      getlayoutwebl1: "settingsfe/getlayoutwebl1",
      getlayoutwebl2: "settingsfe/getlayoutwebl2",
      getparentL1s: "settingsfe/getparentL1s",
      usersignin: "users/usersignin",
    }),

    iconMap() {
      return {
        LayoutDashboard,
        Users,
        Settings,
        Building2,
        Briefcase,
        CheckSquare,
        Mail,
        FileText,
        UserCircle,
        ListCollapse,
        Package,
        BarChart3,
        ChevronDown,
        Map,
      };
    },

    mainMenuItems() {
      if (this.getlayoutmenuweb && this.getlayoutmenuweb.dbmenu2) {
        return this.getlayoutmenuweb.dbmenu2.filter(
          (item) => item.L0 === "0" && item.HASACCESS === "1",
        );
      }
      return [];
    },

    submenuHasAccess() {
      return this.showSubmenu.filter((item) => item.hasaccess === 1);
    },

    submenuHasAccess() {
      return this.showSubmenu.filter((item) => item.hasaccess === 1);
    },
  },

  watch: {
    $route: {
      immediate: true,
      handler() {
        this.syncExpandedMenusFromRoute();
      },
    },
  },

  methods: {
    handleMedia(e) {
      // Update Vuex state instead of local
      this.$store.dispatch("settingsfe/setSidebarCollapsed", e.matches);
    },

    updateMobileViewport() {
      this.isMobileViewport = window.innerWidth <= 767;
    },

    toggleCollapsed() {
      // Toggle via Vuex
      this.$store.dispatch("settingsfe/toggleSidebar");
      this.$emit("update:collapsed", !this.collapsed);
    },

    closeMobileSidebar() {
      if (this.isMobileViewport && !this.collapsed) {
        this.$store.dispatch("settingsfe/setSidebarCollapsed", true);
        this.$emit("update:collapsed", true);
      }
    },

    getIconClass(iconName) {
      if (!iconName) return "fas fa-circle";

      const iconMap = {
        "i-Clothing-Store": "fas fa-store",
        "i-Map2": "fas fa-map",
        "i-Financial": "fas fa-chart-line",
        "i-Bar-Chart": "fas fa-chart-bar",
        "i-Money-Bag": "fas fa-money-bill-wave",
        "i-Billing": "fas fa-file-invoice",
        "i-Gear": "fas fa-cog",
        "i-Boy": "fas fa-user",
        "i-Tag-5": "fas fa-tag",
        "i-Money1": "fas fa-dollar-sign",
        "i-Coins": "fas fa-coins",
        "i-Book": "fas fa-book",
        "i-University1": "fas fa-university",
        "i-Dollar-Sign": "fas fa-dollar-sign",
        "i-Motorcycle": "fas fa-motorcycle",
        "i-Pound": "fas fa-pound-sign",
        "i-Pie-Chart-2": "fas fa-chart-pie",
      };

      return iconMap[iconName] || "fas fa-circle";
    },

    getItemColorClass(item) {
      const colorClasses = [
        "icon-wrapper bg-blue-100 text-blue-700",
        "icon-wrapper bg-green-100 text-green-700",
        "icon-wrapper bg-purple-100 text-purple-700",
        "icon-wrapper bg-yellow-100 text-yellow-700",
        "icon-wrapper bg-red-100 text-red-700",
        "icon-wrapper bg-indigo-100 text-indigo-700",
      ];

      const accessNum = parseInt(item.ACCESS) || 0;
      return colorClasses[accessNum % colorClasses.length];
    },

    openTab(menuItem) {
      // console.log("sidebaropentab", menuItem);
      // console.log("sidebaropentab", this.$router.getRoutes());

      this.expandMenuForItem(menuItem);

      if (menuItem.pathfile) {
        const routeLocation = menuItem.query
          ? { path: menuItem.pathfile, query: menuItem.query }
          : menuItem.pathfile;

        this.$router.push(routeLocation);
      }
      this.$emit("opentabchange", menuItem);
      this.closeMobileSidebar();
    },

    normalizeMenuCaption(caption) {
      return String(caption || "")
        .trim()
        .toLowerCase();
    },

    getDummyChildren(menuItem) {
      const caption = this.normalizeMenuCaption(menuItem?.NamaCaption);

      if (caption === "user") {
        return this.dummySidebarChildren.users;
      }

      return [];
    },

    closeAllMenus() {
      this.showSubmenu = [];
      this.showLevel2Submenu = [];
      this.activeMenuId = null;
      this.activeLevel2MenuId = null;
      this.submenuStyle = {};
      this.level2SubmenuStyle = {};
      this.expandedMenuIds = [];
    },

    closeSubmenu() {
      this.showSubmenu = [];
      this.showLevel2Submenu = [];
      this.activeMenuId = null;
      this.activeLevel2MenuId = null;
      this.submenuStyle = {};
      this.level2SubmenuStyle = {};
      this.expandedMenuIds = [];
    },

    closeLevel2Submenu() {
      this.showLevel2Submenu = [];
      this.activeLevel2MenuId = null;
      this.level2SubmenuStyle = {};
    },

    getChildren(menuId, menuItem = null) {
      const dummyChildren = this.getDummyChildren(menuItem);
      if (dummyChildren.length > 0) {
        return dummyChildren;
      }

      if (!this.getlayoutmenuweb || !this.getlayoutmenuweb.dbmenu2) {
        return [];
      }

      const backendChildren = this.getlayoutmenuweb.dbmenu2.filter((item) => {
        return String(item.Parent) === String(menuId) && item.HASACCESS === "1";
      });

      return backendChildren;
    },

    hasChildren(menuItem) {
      return this.getChildren(menuItem.L1, menuItem).length > 0;
    },

    childHasChildren(item) {
      return this.getChildren(item.L1, item).length > 0;
    },

    handleMainMenuClick(menuItem) {
      if (!menuItem) return;

      const menuId = String(menuItem.L1);
      const isCurrentlyExpanded = this.isDummyUserMenu(menuItem)
        ? this.userMenuExpanded
        : this.isMenuExpanded(menuId);

      this.triggerChevronAnimation(menuId, isCurrentlyExpanded);

      if (this.isDummyUserMenu(menuItem)) {
        this.userMenuExpanded = !this.userMenuExpanded;
        this.expandedMenuIds = this.userMenuExpanded ? [menuId] : [];
        return;
      }

      if (this.hasChildren(menuItem)) {
        this.expandedMenuIds = [menuId];
      } else {
        this.openTab(menuItem);
      }
    },

    isDummyUserMenu(menuItem) {
      return this.normalizeMenuCaption(menuItem?.NamaCaption) === "user";
    },

    isDummyUserMenuExpanded(menuItem) {
      return this.isDummyUserMenu(menuItem) && this.userMenuExpanded;
    },

    getChevronAnimationClass(menuId) {
      if (this.chevronAnimationMenuId !== String(menuId)) {
        return "";
      }

      return this.chevronAnimationDirection === "collapse"
        ? "chevron-collapse"
        : "chevron-expand";
    },

    triggerChevronAnimation(menuId, isCurrentlyExpanded) {
      const menuIdString = String(menuId);

      if (this.chevronAnimationTimer) {
        window.clearTimeout(this.chevronAnimationTimer);
        this.chevronAnimationTimer = null;
      }

      this.chevronAnimationMenuId = menuIdString;
      this.chevronAnimationDirection = isCurrentlyExpanded
        ? "collapse"
        : "expand";

      this.chevronAnimationTimer = window.setTimeout(() => {
        this.chevronAnimationMenuId = null;
        this.chevronAnimationDirection = "";
        this.chevronAnimationTimer = null;
      }, 220);
    },

    handleChildMenuClick(menuItem) {
      if (!menuItem) return;

      if (this.childHasChildren(menuItem)) {
        this.expandedMenuIds = [String(menuItem.L1)];
      } else {
        this.openTab(menuItem);
      }
    },

    normalizeMenuPath(pathfile) {
      return String(pathfile || "").trim();
    },

    findMenuByPath(pathfile) {
      if (
        !this.getlayoutmenuweb ||
        !Array.isArray(this.getlayoutmenuweb.dbmenu2)
      ) {
        return null;
      }

      const targetPath = this.normalizeMenuPath(pathfile);
      if (!targetPath) {
        return null;
      }

      return (
        this.getlayoutmenuweb.dbmenu2.find((item) => {
          return this.normalizeMenuPath(item.pathfile) === targetPath;
        }) || null
      );
    },

    getExpandedMenuChain(menuItem) {
      if (
        !menuItem ||
        !this.getlayoutmenuweb ||
        !Array.isArray(this.getlayoutmenuweb.dbmenu2)
      ) {
        return [];
      }

      const chain = [];
      let currentItem = menuItem;

      while (currentItem && currentItem.Parent && currentItem.Parent !== "0") {
        const parentItem = this.getlayoutmenuweb.dbmenu2.find(
          (item) => String(item.L1) === String(currentItem.Parent),
        );

        if (!parentItem) {
          break;
        }

        chain.unshift(String(parentItem.L1));
        currentItem = parentItem;
      }

      return chain;
    },

    expandMenuForItem(menuItem) {
      const nextExpandedIds = this.getExpandedMenuChain(menuItem);

      if (menuItem && this.hasChildren(menuItem)) {
        nextExpandedIds.push(String(menuItem.L1));
      }

      this.expandedMenuIds = Array.from(new Set(nextExpandedIds));
    },

    syncExpandedMenusFromRoute() {
      const currentRoutePath = this.normalizeMenuPath(
        this.$route?.fullPath || this.$route?.path,
      );

      if (currentRoutePath.startsWith("/crmAdmin/users")) {
        const userMenu = this.mainMenuItems.find((item) =>
          this.isDummyUserMenu(item),
        );

        if (userMenu) {
          this.userMenuExpanded = true;
          this.expandedMenuIds = [String(userMenu.L1)];
        }
        return;
      }

      const routeMenuItem = this.findMenuByPath(currentRoutePath);

      if (!routeMenuItem) {
        this.userMenuExpanded = false;
        this.expandedMenuIds = [];
        return;
      }

      this.userMenuExpanded = false;
      this.expandMenuForItem(routeMenuItem);
    },

    isMenuExpanded(menuId) {
      return this.expandedMenuIds.includes(String(menuId));
    },

    toggleMenuExpand(menuId) {
      const id = String(menuId);
      if (this.expandedMenuIds.includes(id)) {
        this.expandedMenuIds = [];
        return;
      }

      this.expandedMenuIds = [id];
    },

    toggleSubmenu(menuId, menuIndex = null) {
      this.activeMenuId = menuId;
      this.closeLevel2Submenu();
      this.showSubmenu = this.getlayoutmenuweb.dbmenu2.filter((item) => {
        return item.Parent == menuId;
      });

      if (menuIndex !== null) {
        this.$nextTick(() => {
          this.calculateSubmenuPosition(menuId, menuIndex);
        });
      }
    },

    toggleLevel2Submenu(menuId, event) {
      this.activeLevel2MenuId = menuId;

      this.showLevel2Submenu = this.getlayoutmenuweb.dbmenu2.filter((item) => {
        return item.Parent == menuId && item.HASACCESS === "1";
      });

      this.$nextTick(() => {
        this.calculateLevel2SubmenuPosition(menuId, event);
      });
    },

    calculateSubmenuPosition(menuId, menuIndex) {
      const menuElement = this.$refs[`menuItem${menuId}`];

      if (menuElement && menuElement[0]) {
        const menuRect = menuElement[0].getBoundingClientRect();
        const sidebarRect = this.$el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const itemCount = this.showSubmenu.length;
        const headerHeight = 65;
        const itemHeight = 56;
        const padding = 32;
        const calculatedHeight =
          headerHeight + itemCount * itemHeight + padding;
        const maxReasonableHeight = Math.min(windowHeight * 0.7, 450);
        const submenuHeight = Math.min(calculatedHeight, maxReasonableHeight);

        let topPosition = menuRect.top - sidebarRect.top;

        const submenuBottom = menuRect.top + submenuHeight;

        if (submenuBottom > windowHeight - 20) {
          topPosition = windowHeight - 20 - submenuHeight - sidebarRect.top;
          if (topPosition < 20) {
            topPosition = 20;
            const availableHeight = windowHeight - 40;
            this.submenuStyle = {
              position: "absolute",
              left: "95px",
              top: `${topPosition}px`,
              zIndex: 1000,
              height: `${Math.min(submenuHeight, availableHeight)}px`,
              maxHeight: `${Math.min(submenuHeight, availableHeight)}px`,
              overflowY: "auto",
            };
            return;
          }
        }

        this.submenuStyle = {
          position: "absolute",
          left: "95px",
          top: `${Math.max(topPosition, 0)}px`,
          zIndex: 1000,
          height: `${submenuHeight}px`,
          maxHeight: `${submenuHeight}px`,
          overflowY: submenuHeight < calculatedHeight ? "auto" : "hidden",
        };
      }
    },

    calculateLevel2SubmenuPosition(menuId, event) {
      const targetElement = this.$refs[`level1Item${menuId}`];

      if (targetElement && targetElement[0]) {
        const itemRect = targetElement[0].getBoundingClientRect();
        const sidebarRect = this.$el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const itemCount = this.showLevel2Submenu.length;
        const headerHeight = 65;
        const itemHeight = 56;
        const padding = 32;
        const calculatedHeight =
          headerHeight + itemCount * itemHeight + padding;
        const maxReasonableHeight = Math.min(windowHeight * 0.6, 400);
        const level2Height = Math.min(calculatedHeight, maxReasonableHeight);
        let topPosition = itemRect.top - sidebarRect.top;
        const leftPosition = 95 + 280;

        const level2Bottom = itemRect.top + level2Height;

        if (level2Bottom > windowHeight - 20) {
          topPosition = windowHeight - 20 - level2Height - sidebarRect.top;
          if (topPosition < 20) {
            topPosition = 20;
            const availableHeight = windowHeight - 40;
            this.level2SubmenuStyle = {
              position: "absolute",
              left: `${leftPosition}px`,
              top: `${topPosition}px`,
              zIndex: 1001,
              height: `${Math.min(level2Height, availableHeight)}px`,
              maxHeight: `${Math.min(level2Height, availableHeight)}px`,
              overflowY: "auto",
            };
            return;
          }
        }

        this.level2SubmenuStyle = {
          position: "absolute",
          left: `${leftPosition}px`,
          top: `${Math.max(topPosition, 0)}px`,
          zIndex: 1001,
          height: `${level2Height}px`,
          maxHeight: `${level2Height}px`,
          overflowY: "auto",
        };
      }
    },

    isLongText(caption) {
      if (!caption) return false;
      return caption.includes(",") || caption.length > 19;
    },

    handleClickOutside(event) {
      const sidebar = this.$el;
      if (sidebar && !sidebar.contains(event.target)) {
        this.closeAllMenus();
      }
    },

    handleResize() {
      this.updateMobileViewport();

      if (this.showSubmenu.length > 0 && this.activeMenuId) {
        const menuIndex = this.mainMenuItems.findIndex(
          (item) => item.L1 === this.activeMenuId,
        );
        this.calculateSubmenuPosition(this.activeMenuId, menuIndex);
      }
      if (this.showLevel2Submenu.length > 0 && this.activeLevel2MenuId) {
        this.calculateLevel2SubmenuPosition(this.activeLevel2MenuId, null);
      }
    },
  },

  mounted() {
    this.mediaQuery = window.matchMedia("(max-width: 1200px)");
    // Initialize Vuex state with media query
    this.updateMobileViewport();
    this.$store.dispatch(
      "settingsfe/setSidebarCollapsed",
      this.mediaQuery.matches,
    );
    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener("change", this.handleMedia);
    } else {
      this.mediaQuery.addListener(this.handleMedia);
      this.updateMobileViewport();
    }

    document.addEventListener("click", this.handleClickOutside);
    window.addEventListener("resize", this.handleResize);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
    window.removeEventListener("resize", this.handleResize);
    if (this.mediaQuery && this.mediaQuery.removeEventListener) {
      this.mediaQuery.removeEventListener("change", this.handleMedia);
    }
  },

  beforeDestroy() {
    if (this.mediaQuery) {
      if (this.mediaQuery.removeListener) {
        this.mediaQuery.removeListener(this.handleMedia);
      }
    }
  },
};
</script>
