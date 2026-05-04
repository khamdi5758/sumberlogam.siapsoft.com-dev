<template>
  <aside
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    :class="[
      'flex flex-col bg-dark-base text-slate-300 h-screen transition-all duration-300',
      collapsed && isHovered
        ? 'left-0 top-0 w-64 shadow-xl z-50'
        : !collapsed
          ? 'relative w-64'
          : 'relative w-20',
    ]"
  >
    <!-- Header -->
    <div
      :class="[
        'px-5 py-2 text-white text-2xl font-bold flex items-center border-b border-slate-800 shrink-0',
        isExpanded ? 'gap-2 justify-start' : 'justify-center',
      ]"
    >
      <span v-show="isExpanded" class="truncate">CRM MG26</span>
      <button
        @click="toggleCollapsed"
        :class="[
          'w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800',
          isExpanded ? 'ml-auto' : '',
        ]"
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
      <!-- <div
        v-for="(mainMenu, index) in mainMenuItems"
        :key="mainMenu.L1"
        class="menu-item relative"
        :ref="`menuItem${mainMenu.L1}`"
      >
        <div
          class="menu-icon-container flex h-12 items-center p-3 rounded-xl transition group hover:bg-slate-800 hover:text-white w-full"
          @mouseenter="toggleSubmenu(mainMenu.L1, index)"
        >
          <component :is="iconMap[mainMenu.ICON]" :size="20"
      class="cursor-pointer menu-icon w-5 h-5"
    />
          <span class="menu-label cursor-pointer">{{
            mainMenu.NamaCaption
          }}</span>
        </div>
      </div> -->

      <div
        v-for="(mainMenu, index) in mainMenuItems"
        :key="mainMenu.L1"
        class="menu-item relative"
        :ref="`menuItem${mainMenu.L1}`"
      >
        <div
          class="menu-icon-container flex h-12 items-center p-3 rounded-xl transition group hover:bg-slate-800 hover:text-white w-full"
          @click="openTab(mainMenu)"
          :class="
            isExpanded
              ? 'gap-3 justify-start cursor-pointer'
              : 'justify-center cursor-pointer'
          "
          :title="!isExpanded ? mainMenu.NamaCaption : ''"
        >
          <!-- Icon -->
          <div class="w-6 flex justify-center">
            <component
              :is="iconMap[mainMenu.ICON]"
              :size="20"
              class="group-hover:text-blue-400 menu-icon"
            />
          </div>

          <!-- Label -->
          <span v-show="isExpanded" class="truncate">{{
            mainMenu.NamaCaption
          }}</span>
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

    <!-- Log Out -->
    <div class="p-4 border-t border-slate-800 shrink-0">
      <button
        :class="[
          'flex items-center p-3 w-full rounded-xl transition bg-dark-red text-white hover:bg-red-700',
          isExpanded ? 'gap-3 justify-start text-left' : 'justify-center',
        ]"
        :title="!isExpanded ? 'Log Out' : ''"
      >
        <LogOut :size="20" />
        <span v-show="isExpanded" class="font-medium truncate"> Log Out </span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* Gaya tambahan jika diperlukan */
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
import Task from "@/components/task/task.vue";
import TaskList from "@/components/task/tasklist.vue";
import TaskCard from "@/components/task/taskcard.vue";
import TaskCalender from "@/components/task/taskcalender.vue";
import EmailBroadcast from "@/components/EmailBroadcast.vue";
// import Documents from "@/components/documents/Documents.vue";
// import DocumentList from "@/components/documents/DocumentList.vue";
// import DocumentsTemplate from "@/components/documents/DocumentsTemplate.vue";
// import DocumentsShortCode from "@/components/documents/DocumentsShortCode.vue";
import UserSetings from "@/components/user/usersettings/usersetings.vue";
import UserPermission from "@/components/user/userpermission.vue";
import UserTeam from "@/components/user/userteam.vue";
import User from "@/components/user/user.vue";
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
  },

  data() {
    return {
      // collapsed removed - now using Vuex
      isHovered: false,
      mediaQuery: null,
      showSubmenu: [],
      showLevel2Submenu: [],
      activeMenuId: null,
      activeLevel2MenuId: null,
      submenuStyle: {},
      level2SubmenuStyle: {},
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
  },

  methods: {
    handleMedia(e) {
      // Update Vuex state instead of local
      this.$store.dispatch("settingsfe/setSidebarCollapsed", e.matches);
    },

    toggleCollapsed() {
      // Toggle via Vuex
      this.$store.dispatch("settingsfe/toggleSidebar");
      this.$emit("update:collapsed", this.collapsed);
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

      if (menuItem.pathfile) {
        this.$router.push(menuItem.pathfile);
      }
      this.$emit("opentabchange", menuItem);
      this.closeAllMenus();
    },

    closeAllMenus() {
      this.showSubmenu = [];
      this.showLevel2Submenu = [];
      this.activeMenuId = null;
      this.activeLevel2MenuId = null;
      this.submenuStyle = {};
      this.level2SubmenuStyle = {};
    },

    closeSubmenu() {
      this.showSubmenu = [];
      this.showLevel2Submenu = [];
      this.activeMenuId = null;
      this.activeLevel2MenuId = null;
      this.submenuStyle = {};
      this.level2SubmenuStyle = {};
    },

    closeLevel2Submenu() {
      this.showLevel2Submenu = [];
      this.activeLevel2MenuId = null;
      this.level2SubmenuStyle = {};
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
    this.$store.dispatch(
      "settingsfe/setSidebarCollapsed",
      this.mediaQuery.matches,
    );
    this.mediaQuery.addListener(this.handleMedia);

    document.addEventListener("click", this.handleClickOutside);
    window.addEventListener("resize", this.handleResize);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
    window.removeEventListener("resize", this.handleResize);
  },

  beforeDestroy() {
    if (this.mediaQuery) {
      this.mediaQuery.removeListener(this.handleMedia);
    }
  },
};
</script>
