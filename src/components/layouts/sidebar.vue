<template>
  <div
    v-if="showMobileBackdrop"
    class="fixed inset-0 z-40 bg-black/50 md:hidden"
    @click="closeMobileSidebar"
  ></div>
  <aside
    ref="sidebarContainer"
    :class="sidebarClasses"
    :style="sidebarStyles"
  >
    <!-- Header -->
    <div
      :class="[
        'px-2 py-3 font-bold flex flex-col items-center border-b shrink-0 h-[65px]',
      ]"
      :style="{
        color: 'var(--layout-sidebar-text)',
        borderBottomColor: 'var(--layout-sidebar-border)',
      }"
    >
      <span class="text-[12px] font-bold truncate text-center leading-tight flex flex-col items-center justify-center gap-1 w-full">
        <span class="mt-1">Siap App</span>
        <button v-if="isMobileViewport" @click="toggleCollapsed" class="p-1 text-slate-400 hover:text-slate-200 mt-1">
          <ListCollapse :size="18" />
        </button>
      </span>
    </div>

    <!-- Navigation -->
    <nav
      class="flex-1 min-h-0 py-2 px-1 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar menu"
      id="menufl"
      v-if="getlayoutmenuweb"
    >
      <div
        v-for="(mainMenu, index) in mainMenuItems"
        :key="mainMenu.L1"
        class="menu-item relative"
        :ref="`menuItem${mainMenu.L1}`"
      >
        <!-- Desktop Mode (Hover Trigger) -->
        <button
          type="button"
          class="flex flex-col items-center justify-center w-full min-h-[72px] rounded-xl p-2 transition group hover:bg-[var(--layout-sidebar-hover)] hover:text-[var(--layout-sidebar-accent)]"
          @mouseenter="!isMobileViewport ? handleMainMenuHover(mainMenu.L1, $event) : null"
          @click="!hasChildren(mainMenu) ? openTab(mainMenu) : handleMainMenuClick(mainMenu, $event)"
          :class="activeMenuId === mainMenu.L1 ? 'bg-[var(--layout-sidebar-hover)] text-[var(--layout-sidebar-accent)]' : ''"
          :title="mainMenu.NamaCaption"
        >
          <div class="mb-1.5 flex justify-center w-full">
            <component :is="iconMap[mainMenu.ICON] || iconMap.LayoutDashboard" :size="22" class="group-hover:text-[var(--layout-sidebar-accent)]" :style="{ color: activeMenuId === mainMenu.L1 ? 'var(--layout-sidebar-accent)' : 'var(--layout-sidebar-muted)' }" />
          </div>
          <span class="text-[10px] font-semibold text-center leading-tight whitespace-normal w-full px-1" :style="{ color: activeMenuId === mainMenu.L1 ? 'var(--layout-sidebar-accent)' : 'var(--layout-sidebar-text)' }">
            {{ displayMenuCaption(mainMenu.NamaCaption) }}
          </span>
        </button>
      </div>
    </nav>

    <div
      v-if="!isMobileViewport"
      class="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent transition hover:bg-[var(--layout-sidebar-accent)]/40"
      @mousedown.prevent="startSidebarResize"
      title="Drag untuk ubah lebar sidebar"
    ></div>

    <!-- Mobile Backdrop for Popups -->
    <Teleport to="body" v-if="isMobileViewport && menuStack.length > 0">
      <div class="fixed inset-0 z-[1005] bg-black/40" @click="closeAllMenus"></div>
    </Teleport>

    <!-- POPUP MENUS - Multi Level (unlimited depth) -->
    <Teleport to="body" :disabled="!isMobileViewport">
      <div
        v-for="(level, depth) in menuStack"
        :key="depth"
        v-show="!isMobileViewport || depth === menuStack.length - 1"
        class="bg-white rounded-xl shadow-2xl border border-slate-100 pb-2 transition-opacity duration-200"
        :class="isMobileViewport ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] z-[1010]' : 'w-[250px]'"
        :style="!isMobileViewport ? level.style : { maxHeight: '80vh', overflowY: 'auto' }"
        @click.stop
      >
        <div class="px-4 pt-4 pb-2 font-bold text-slate-800 border-b border-slate-100 mb-2 sticky top-0 bg-white z-10 rounded-t-xl flex justify-between items-center">
          <div class="flex items-center gap-2">
            <button v-if="isMobileViewport && depth > 0" @click.stop="goBackLevel" class="text-slate-400 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <span>{{ getMenuCaptionById(level.parentId) }}</span>
          </div>
          <button v-if="isMobileViewport" @click.stop="closeAllMenus" class="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div
          v-for="item in level.items"
          :key="item.L1"
        >
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 py-2 text-sm transition hover:bg-blue-50 hover:text-blue-700 group"
            :class="menuStack[depth + 1] && String(menuStack[depth + 1].parentId) === String(item.L1) ? 'bg-blue-50 text-blue-700' : 'text-slate-600'"
            @mouseenter="!isMobileViewport ? handleChildItemHover(depth, item, $event) : null"
            @click="!childHasChildren(item) ? openTab(item) : (isMobileViewport ? openLevel(depth + 1, item.L1, $event.currentTarget) : null)"
            :title="item.NamaCaption"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 transition-colors group-hover:bg-white">
                <component :is="iconMap[item.ICON] || iconMap.LayoutDashboard" :size="18" :class="menuStack[depth + 1] && String(menuStack[depth + 1].parentId) === String(item.L1) ? 'text-blue-700' : 'text-slate-400 group-hover:text-blue-700'" />
              </div>
              <span class="font-medium text-left leading-snug">{{ displayMenuCaption(item.NamaCaption) }}</span>
            </div>
            <ChevronDown v-if="childHasChildren(item)" :size="14" class="-rotate-90 text-slate-400 shrink-0" />
          </button>
        </div>
      </div>
    </Teleport>

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
  HandCoins,
  Landmark,
} from "lucide-vue-next";

export default {
  name: "Sidebar",
  inheritAttrs: false,
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
    HandCoins,
    Landmark,
  },

  data() {
    return {
      isHovered: false,
      mediaQuery: null,
      isMobileViewport: false,
      menuStack: [],
      userMenuExpanded: false,
      chevronAnimationMenuId: null,
      chevronAnimationDirection: "",
      chevronAnimationTimer: null,
      sidebarCustomWidth: this.getStoredSidebarWidth(),
      isResizingSidebar: false,
      sidebarResizeStartX: 0,
      sidebarResizeStartWidth: 0,
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

    sidebarStyles() {
      const baseStyles = {
        backgroundColor: "var(--layout-sidebar-bg)",
        color: "var(--layout-sidebar-text)",
        borderColor: "var(--layout-sidebar-border)",
      };

      if (this.isMobileViewport) {
        return this.collapsed
          ? baseStyles
          : { ...baseStyles, width: `95px` };
      }

      return { ...baseStyles, width: `95px` };
    },

    sidebarClasses() {
      const baseClasses = "flex flex-col h-screen transition-all duration-300";

      if (this.isMobileViewport) {
        return [
          baseClasses,
          this.collapsed
            ? "hidden"
            : "fixed left-0 top-0 h-full w-[95px] shadow-xl z-50",
        ];
      }

      return [
        baseClasses,
        "relative shrink-0 z-40",
      ];
    },

    activeMenuId() {
      return this.menuStack[0] ? this.menuStack[0].parentId : null;
    },

    activeLevel2MenuId() {
      return this.menuStack[1] ? this.menuStack[1].parentId : null;
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
        HandCoins,
        Landmark,
        "i-Pie-Chart-2": BarChart3,
        "i-Map2": Map,
        "i-Motorcycle": Package,
        "i-Pound": FileText,
        "i-Tag-5": ListCollapse,
        "i-Financial": Landmark,
        "i-University1": Building2,
        "i-Dollar-Sign": HandCoins,
        "i-Bar-Chart": BarChart3,
        "i-Book": FileText,
        "i-Gear": Settings,
        "i-Boy": Users,
        "i-Clothing-Store": Building2,
      };
    },

    mainMenuItems() {
      if (this.getlayoutmenuweb && this.getlayoutmenuweb.dbmenu2) {
        return this.getlayoutmenuweb.dbmenu2.filter(
          (item) =>
            (item.L0 === "0" || item.Parent === "0") &&
            item.HASACCESS === "1"
        );
      }
      return [];
    },

    submenuHasAccess() {
      return this.menuStack[0]
        ? this.menuStack[0].items.filter((item) => item.hasaccess === 1)
        : [];
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
      this.$store.dispatch("settingsfe/setSidebarCollapsed", e.matches);
    },

    updateMobileViewport() {
      this.isMobileViewport = window.innerWidth <= 767;
    },

    toggleCollapsed() {
      this.$store.dispatch("settingsfe/toggleSidebar");
      this.$emit("update:collapsed", !this.collapsed);
    },

    closeMobileSidebar() {
      if (this.isMobileViewport && !this.collapsed) {
        this.$store.dispatch("settingsfe/setSidebarCollapsed", true);
        this.$emit("update:collapsed", true);
      }
      this.closeAllMenus();
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
      this.expandMenuForItem(menuItem);

      if (this.isRegisterMenu(menuItem)) {
        this.$router.push({ name: "RegisterPo", query: { openPopup: "1" } });
        this.$emit("opentabchange", menuItem);
        this.closeMobileSidebar();
        return;
      }

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

    displayMenuCaption(caption) {
      return String(caption || "")
        .replace(/^\s*\d+\s*[-–—.:]?\s*/, "")
        .trim();
    },

    getStoredSidebarWidth() {
      const storedWidth = Number(localStorage.getItem("sidebarCustomWidth"));

      if (
        Number.isFinite(storedWidth) &&
        storedWidth >= 220 &&
        storedWidth <= 420
      ) {
        return storedWidth;
      }

      return 256;
    },

    clampSidebarWidth(width) {
      return Math.min(420, Math.max(220, width));
    },

    startSidebarResize(event) {
      if (this.isMobileViewport) return;

      this.isResizingSidebar = true;
      this.sidebarResizeStartX = event.clientX;
      this.sidebarResizeStartWidth = this.sidebarCustomWidth;

      window.addEventListener("mousemove", this.onSidebarResizeMove);
      window.addEventListener("mouseup", this.stopSidebarResize);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    },

    onSidebarResizeMove(event) {
      if (!this.isResizingSidebar) return;

      const nextWidth = this.clampSidebarWidth(
        this.sidebarResizeStartWidth +
          (event.clientX - this.sidebarResizeStartX),
      );

      this.sidebarCustomWidth = nextWidth;
      localStorage.setItem("sidebarCustomWidth", String(nextWidth));
    },

    stopSidebarResize() {
      if (!this.isResizingSidebar) return;

      this.isResizingSidebar = false;
      window.removeEventListener("mousemove", this.onSidebarResizeMove);
      window.removeEventListener("mouseup", this.stopSidebarResize);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    },

    handleMainMenuHover(menuId, event) {
      if (this.isMobileViewport) return;
      this.openLevel(0, menuId, event.currentTarget);
    },

    handleChildItemHover(depth, item, event) {
      if (this.childHasChildren(item)) {
        this.openLevel(depth + 1, item.L1, event.currentTarget);
      } else {
        // Potong level stack di bawah kedalaman saat ini jika item tidak punya anak
        this.menuStack = this.menuStack.slice(0, depth + 1);
      }
    },

    getMenuCaptionById(menuId) {
      if (!this.getlayoutmenuweb || !this.getlayoutmenuweb.dbmenu2) return "";
      const item = this.getlayoutmenuweb.dbmenu2.find(m => String(m.L1) === String(menuId));
      if (item) return item.NamaCaption;

      const dummyItem = this.dummySidebarChildren.users.find(m => String(m.L1) === String(menuId));
      return dummyItem ? dummyItem.NamaCaption : "";
    },

    getDummyChildren(menuItem) {
      const caption = this.normalizeMenuCaption(menuItem?.NamaCaption);

      if (caption === "user") {
        return this.dummySidebarChildren.users;
      }

      return [];
    },

    openLevel(depth, menuId, targetElement) {
      const item = this.getlayoutmenuweb?.dbmenu2?.find(
        (m) => String(m.L1) === String(menuId)
      ) || this.dummySidebarChildren.users.find(
        (m) => String(m.L1) === String(menuId)
      );

      const children = this.getChildren(menuId, item);

      // Selalu potong stack level ini (dan level di bawahnya) dulu,
      // supaya popup child dari menu sebelumnya tidak nyangkut/tetap
      // terbuka ketika mouse pindah ke menu lain — termasuk saat menu
      // yang baru di-hover ternyata tidak punya child sama sekali.
      this.menuStack = this.menuStack.slice(0, depth);

      if (!children.length) return;

      this.menuStack.push({
        parentId: menuId,
        items: children,
        style: {},
      });

      if (targetElement) {
        this.$nextTick(() => {
          this.calculateLevelPosition(depth, targetElement);
        });
      }
    },

    calculateLevelPosition(depth, targetElement) {
      if (!targetElement || !this.menuStack[depth]) return;

      let anchorRight;
      if (depth === 0) {
        const sidebarRect = this.$refs.sidebarContainer.getBoundingClientRect();
        anchorRight = sidebarRect.right;
      } else {
        const rect = targetElement.getBoundingClientRect();
        anchorRight = rect.right;
      }

      const zIndex = 1000 + depth;
      this.menuStack[depth].style = this.calculatePopupStyle(
        targetElement,
        anchorRight,
        this.menuStack[depth].items.length,
        zIndex
      );
    },

    goBackLevel() {
      if (this.menuStack.length > 1) {
        this.menuStack.pop();
      } else {
        this.closeAllMenus();
      }
    },

    closeAllMenus() {
      this.menuStack = [];
      this.expandedMenuIds = [];
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

      backendChildren.sort((a, b) => {
        const aCaption = String(a.NamaCaption || "").toLowerCase();
        const bCaption = String(b.NamaCaption || "").toLowerCase();

        const aPriority = aCaption.includes("register outstanding") ? 2 : (aCaption.includes("register stock") ? 1 : 0);
        const bPriority = bCaption.includes("register outstanding") ? 2 : (bCaption.includes("register stock") ? 1 : 0);

        if (aPriority > bPriority) return -1;
        if (aPriority < bPriority) return 1;

        return 0;
      });

      return backendChildren;
    },

    hasChildren(menuItem) {
      return this.getChildren(menuItem.L1, menuItem).length > 0;
    },

    childHasChildren(item) {
      return this.getChildren(item.L1, item).length > 0;
    },

    handleMainMenuClick(menuItem, event) {
      if (!menuItem) return;

      if (this.isDummyUserMenu(menuItem)) {
        this.userMenuExpanded = !this.userMenuExpanded;
        this.expandedMenuIds = this.userMenuExpanded ? [String(menuItem.L1)] : [];
        return;
      }

      if (!this.hasChildren(menuItem)) {
        this.openTab(menuItem);
        return;
      }

      this.openLevel(0, menuItem.L1, event ? event.currentTarget : null);
    },

    isDummyUserMenu(menuItem) {
      return this.normalizeMenuCaption(menuItem?.NamaCaption) === "user";
    },

    isRegisterMenu(menuItem) {
      const caption = this.normalizeMenuCaption(menuItem?.NamaCaption);
      const pathfile = this.normalizeMenuCaption(menuItem?.pathfile);

      return (
        caption === "register" ||
        caption === "registrasi" ||
        caption === "register po" ||
        caption === "registerpo" ||
        pathfile === "/crmadmin/register" ||
        pathfile === "/crmadmin/registrasi" ||
        pathfile === "/crmadmin/register/po" ||
        pathfile === "/crmadmin/register-po"
      );
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
        const menuId = String(menuItem.L1);
        if (this.isMenuExpanded(menuId)) {
          this.expandedMenuIds = this.expandedMenuIds.filter(
            (id) => id !== menuId,
          );
          return;
        }

        const nextExpandedIds = this.getExpandedMenuChain(menuItem);
        nextExpandedIds.push(menuId);
        this.expandedMenuIds = Array.from(new Set(nextExpandedIds));
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

    calculatePopupStyle(targetElement, anchorRightPosition, itemCount, zIndex) {
      if (!targetElement || !this.$refs.sidebarContainer) return {};

      const rect = targetElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      let topPosition = rect.top;
      let availableBelow = windowHeight - topPosition - 20;

      const maxAllowedHeight = 310;
      const expectedHeight = 50 + (itemCount * 48) + 16;
      const actualHeight = Math.min(expectedHeight, maxAllowedHeight);

      if (actualHeight > availableBelow) {
        const shortfall = actualHeight - availableBelow;
        topPosition = Math.max(20, topPosition - shortfall);
        availableBelow = windowHeight - topPosition - 20;
      }

      const finalMaxHeight = Math.min(availableBelow, maxAllowedHeight);

      return {
        position: "fixed",
        left: `${anchorRightPosition + 6}px`,
        top: `${topPosition}px`,
        zIndex: zIndex,
        maxHeight: `${finalMaxHeight}px`,
        overflowY: "auto",
      };
    },

    isLongText(caption) {
      if (!caption) return false;
      return caption.includes(",") || caption.length > 19;
    },

    handleClickOutside(event) {
      const sidebar = this.$refs.sidebarContainer;
      const clickedInsideSidebar = sidebar && sidebar.contains(event.target);
      const clickedInsidePopup = event.target.closest &&
        event.target.closest(".bg-white.rounded-xl.shadow-2xl");

      if (!clickedInsideSidebar && !clickedInsidePopup) {
        this.closeAllMenus();
      }
    },

    handleResize() {
      this.updateMobileViewport();
      this.closeAllMenus();
    },
  },

  mounted() {
    this.mediaQuery = window.matchMedia("(max-width: 1200px)");
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
    this.stopSidebarResize();
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