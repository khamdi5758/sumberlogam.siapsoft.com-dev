<template>
  <div
    class="flex h-screen w-full overflow-hidden font-sans"
    :style="{ backgroundColor: 'var(--layout-shell-bg)' }"
  >
    <!-- SIDEBAR -->
    <Sidebar v-model:collapsed="collapsed" @opentabchange="handleOpenTab" />

    <div
      class="flex min-w-0 flex-1 flex-col overflow-hidden"
      :style="{ backgroundColor: 'var(--layout-content-bg)' }"
    >
      <!-- HEADER -->
      <Kepala />

      <!-- TAB HEADER -->
      <div
        class="flex items-center gap-2 bg-gray-100 px-4 py-2 border-b overflow-x-auto"
        :style="{
          backgroundColor: 'var(--layout-tab-header-bg)',
          borderBottomColor: 'var(--dark-base)',
          color: 'var(--layout-content-text)',
        }"
      >
        <div
          v-for="tab in tabsflmenu"
          :key="tab"
          class="flex items-center gap-0.5 px-4 py-2 rounded-t-lg cursor-pointer whitespace-nowrap"
          :class="{
            'bg-dark-base text-white': tab.pathfile === selectedTab,
            'bg-dark-base/75 text-white': tab.pathfile !== selectedTab,
          }"
          @click="selectTab(tab)"
        >
          {{ tab.CAPTION }}

          <span
            v-if="tab.CAPTION !== 'Dashboard'"
            @click.stop="removeTab(tab)"
            class="ml-1 hover:text-red-300 cursor-pointer"
          >
            ✕
          </span>
        </div>
      </div>

      <!-- CONTENT -->
      <main
        class="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-4"
        :style="{ backgroundColor: 'var(--layout-content-bg)' }"
      >
        <router-view v-slot="{ Component, route }">
          <keep-alive :include="this.nametabs">
            <component :is="Component" :key="$route.fullPath" />
          </keep-alive>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Sidebar from "./layouts/sidebar.vue";
import Kepala from "./layouts/kepala.vue";

/* contoh pages */
import Dashboard from "./dashboard.vue";

import functioncustom from "@/mixins/customformat";

export default {
  name: "MainLayout",

  components: {
    Sidebar,
    Kepala,
    Dashboard,
  },
  mixins: [functioncustom],
  computed: {
    ...mapGetters({
      getlayoutmenuweb: "settingsfe/getlayoutmenuweb",
      tabsflmenu: "tabs/getTabsFlMenu",
      nametabs: "tabs/getNameTabs",
      selectedTab: "tabs/getSelectedTab",
      selectedTabFlMenu: "tabs/getSelectedTabFlMenu",
      allContactsassoc: "assoc/allContacts",
      allDealsassoc: "assoc/allDeals",
      allCompanysassoc: "assoc/allCompanys",
    }),

    isScrollable() {
      return this.$route.meta.scrollable === true;
    },

    key() {
      return this.$route.path;
    },

    currentYear() {
      return new Date().getFullYear();
    },

    opentab() {
      const stored = JSON.parse(localStorage.getItem("openTabsflmenu")) ?? [];
      // const stored = localStorage.getItem("openTabs") ?? [];
      // console.log(stored);
      return stored;
    },
  },

  data() {
    return {
      collapsed: false,

      opentabsflmenu: [],
      dropdownOpen: false,
      dropdownButton: null,
      dropdownMenu: null,

      /* ========================
         TAB STATE
      ======================== */
      tabs: [
        {
          name: "dashboard",
          title: "Dashboard",
          component: Dashboard,
        },
      ],

      activeTab: "dashboard",
    };
  },

  methods: {
    ...mapActions({
      addTab: "tabs/addTab",
      removeTabvuex: "tabs/removeTab",
      removeOtherTabs: "tabs/removeOtherTabs",
      removeAllTabs: "tabs/removeAllTabs",
      selectTabvuex: "tabs/selectTab",
      selectTabFlMenu: "tabs/selectTabFlMenu",
      handleOpenTabs: "tabs/handleOpenTabflmenu",
      actlayoutweb: "settingsfe/actlayoutwebflmenu",
      getcontactsassoc: "assoc/getcontacts",
      getdealsassoc: "assoc/getdeals",
      getcompanysassoc: "assoc/getcompanys",
    }),

    cekdatamaster() {
      if (!this.allContactsassoc || this.allContactsassoc.length === 0) {
        this.getcontactsassoc();
      }

      if (!this.allDealsassoc || this.allDealsassoc.length === 0) {
        this.getdealsassoc();
      }

      if (!this.allCompanysassoc || this.allCompanysassoc.length === 0) {
        this.getcompanysassoc();
      }
    },

    activeTabIndex() {
      if (!this.selectedTabFlMenu) return 0;
      const idx = this.tabsflmenu.findIndex(
        (tab) => tab.pathfile === this.selectedTabFlMenu.pathfile,
      );
      return idx >= 0 ? idx + 1 : 0;
    },

    handleOpenTab(tab) {
      this.handleOpenTabs(tab);
    },

    selectTab(tab) {
      this.selectTabvuex(tab);
    },

    removeTab(tab) {
      this.removeTabvuex(tab);
    },

    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },

    selectTabFromDropdown(tab) {
      this.selectTab(tab);
      this.selectTabFlMenu(tab);
      this.dropdownOpen = false;
    },
  },

  async mounted() {
    if (!this.getlayoutmenuweb || this.getlayoutmenuweb.length === 0) {
      await this.actlayoutweb().then((e) => {});
    }

    this.cekdatamaster();
    // this.loadTabsFromStorage();
  },

  watch: {
    nametabs(e) {},
    getlayoutmenuweb(e) {
      console.log(e);
    },
    allContactsassoc(e) {
      // console.log("allContactsassoc",e);
    },
    allDealsassoc(e) {
      // console.log("allDealsassoc",e);
    },
  },
};
</script>
