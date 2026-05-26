import router from "@/router";

function normalizePath(path) {
  return String(path || "")
    .trim()
    .split("?")[0]
    .split("#")[0];
}

function findRouteByPath(path) {
  const targetPath = normalizePath(path);

  if (!targetPath) {
    return null;
  }

  return (
    router.getRoutes().find((route) => normalizePath(route.path) === targetPath) ||
    null
  );
}

export default {
  namespaced: true,

  state: {
    tabs: JSON.parse(localStorage.getItem("openTabs")) || [],
    nametabs: JSON.parse(localStorage.getItem("openNameTabs")) || [],
    tabsflmenu: JSON.parse(localStorage.getItem("openTabsflmenu")) || [],
    selectedTab: localStorage.getItem("selectedTab") || null,
    selectedTabflmenu:
      JSON.parse(localStorage.getItem("selectedTabflmenu")) || null,
    openTabs: [],
    activeTab: null,
  },

  getters: {
    getTabs: (state) => state.tabs,
    getNameTabs: (state) => state.nametabs,
    getTabsFlMenu: (state) => state.tabsflmenu,
    getSelectedTab: (state) => state.selectedTab,
    getSelectedTabFlMenu: (state) => state.selectedTabflmenu,
    getOpenTabs: (state) => state.openTabs,
    getActiveTab: (state) => state.activeTab,
  },

  mutations: {
    CLEAR_TABS(state) {
      state.openTabs = [];
      state.activeTab = null;
    },
    ADD_TAB(state, tab) {
      if (!state.openTabs.find((t) => t.pathfile === tab.pathfile)) {
        state.openTabs.push(tab);
      }
      state.activeTab = tab.pathfile;
    },
    SET_TABS(state, val) {
      state.tabs = val;
      localStorage.setItem("openTabs", JSON.stringify(val));
    },
    SET_NAMETABS(state, val) {
      state.nametabs = val;
      localStorage.setItem("openNameTabs", JSON.stringify(val));
    },
    SET_TABSFLMENU(state, val) {
      state.tabsflmenu = val;
      localStorage.setItem("openTabsflmenu", JSON.stringify(val));
    },
    SET_SELECTED_TAB(state, val) {
      state.selectedTab = val;
      localStorage.setItem("selectedTab", val);
    },
    SET_SELECTED_TAB_FLMENU(state, val) {
      state.selectedTabflmenu = val;
      localStorage.setItem("selectedTabflmenu", JSON.stringify(val));
    },
  },

  actions: {
    clearTabs({ commit }) {
      commit("CLEAR_TABS");
    },
    handleOpenTab({ commit }, tab) {
      commit("ADD_TAB", tab);
    },

    clearTabsflmenu({ commit }) {
      // Kosongkan state Vuex
      commit("SET_TABS", []);
      commit("SET_NAMETABS", []);
      commit("SET_TABSFLMENU", []);
      commit("SET_SELECTED_TAB", null);
      commit("SET_SELECTED_TAB_FLMENU", null);

      // Hapus semua dari localStorage
      localStorage.removeItem("openTabs");
      localStorage.removeItem("openNameTabs");
      localStorage.removeItem("openTabsflmenu");
      localStorage.removeItem("selectedTab");
      localStorage.removeItem("selectedTabflmenu");
    },

    handleOpenTabflmenu({ state, commit, dispatch, rootGetters }, tabName) {
      if (!tabName || !tabName.pathfile) return;

      // Pastikan route memang ada
      const exists = !!findRouteByPath(tabName.pathfile);
      if (!exists) return;

      // Pastikan layout sudah siap sebelum membuka tab
      const layout = rootGetters["settingsfe/getlayoutmenuweb"];
      if (!layout || !layout.dbmenu2) {
        console.warn("Layout belum siap, abaikan openTab dulu.");
        return;
      }

      dispatch("addTab", tabName);
      dispatch("selectTab", tabName);
    },
    /** Tambahkan tab baru */
    addTab({ state, commit, dispatch }, tab) {
      if (!tab?.pathfile) return;

      // Jika belum ada tab ini
      const targetPath = normalizePath(tab.pathfile);
      const hasTab = state.tabs.some((item) => normalizePath(item) === targetPath);

      if (!hasTab) {
        const route = findRouteByPath(tab.pathfile);
        const name = route ? route.name : tab.CAPTION || tab.pathfile;

        commit("SET_TABS", [...state.tabs, targetPath]);
        commit("SET_NAMETABS", [...state.nametabs, name]);
        commit("SET_TABSFLMENU", [...state.tabsflmenu, { ...tab, pathfile: targetPath }]);
      }

      commit("SET_SELECTED_TAB", targetPath);
      dispatch("syncLocalStorage");
    },

    /** Pilih tab utama */
    selectTab({ state, commit, dispatch, rootGetters }, tab) {
      const layout = rootGetters["settingsfe/getlayoutmenuweb"];
      if (!tab?.pathfile) return;
      const targetPath = normalizePath(tab.pathfile);
      commit("SET_SELECTED_TAB", targetPath);

      //   if (router.currentRoute.value.path !== tab.pathfile) {
      //   }
      const flmenu = layout?.dbmenu2?.find(
        (i) => normalizePath(i.pathfile) === targetPath,
      );
      dispatch("selectTabFlMenu", flmenu || { ...tab, pathfile: targetPath });
      router.push(
        tab.query ? { path: targetPath, query: tab.query } : { path: targetPath },
      ).catch(() => { });
    },

    /** Pilih tab FLMenu */
    selectTabFlMenu({ commit }, tab) {
      if (!tab) return;
      commit("SET_SELECTED_TAB_FLMENU", tab);
      localStorage.setItem("selectedTabflmenu", JSON.stringify(tab));
    },

    /** Hapus satu tab */
    removeTab({ state, commit, dispatch, rootGetters }, tab) {
      const layout = rootGetters["settingsfe/getlayoutmenuweb"];

      const targetPath = normalizePath(tab.pathfile);
      const index = state.tabs.findIndex(
        (t) => normalizePath(t) === targetPath,
      );
      const newTabs = state.tabs.filter((t) => normalizePath(t) !== targetPath);

      const route = findRouteByPath(tab.pathfile);
      const routeName = route ? route.name : tab.CAPTION || tab.pathfile;
      const newNameTabs = state.nametabs.filter((n) => n !== routeName);

      const newTabsflmenu = state.tabsflmenu.filter(
        (t) => normalizePath(t.pathfile) !== targetPath,
      );

      commit("SET_TABS", newTabs);
      commit("SET_NAMETABS", newNameTabs);
      commit("SET_TABSFLMENU", newTabsflmenu);

      const selectedtab = localStorage.getItem("selectedTab") || null;

      //   // Jika tab yang dihapus adalah yang sedang aktif
      if (selectedtab === tab.pathfile) {
        if (newTabs.length > 0) {
          const nextIndex =
            index >= newTabs.length ? newTabs.length - 1 : index;
          const nextPath = newTabs[nextIndex];
          const nextTab = layout.dbmenu2.find((i) => i.pathfile === nextPath);
          dispatch("selectTab", nextTab);
        } else {
          let filter = layout.dbmenu2.filter(
            (t) => t.pathfile == layout.dbmenu2[0].pathfiledefault,
          );
          dispatch("handleOpenTab", filter[0]);
        }
      }

      //   // Jika tab flmenu yang dihapus adalah yang sedang aktif
      //   if (
      //     state.selectedTabflmenu &&
      //     state.selectedTabflmenu.pathfile === tab.pathfile
      //   ) {
      //     commit("SET_SELECTED_TAB_FLMENU", null);
      //   }

      dispatch("syncLocalStorage");
    },

    /** Tutup semua tab kecuali yang dipilih */
    removeOtherTabs({ commit, dispatch }, tab) {
      if (!tab?.pathfile) return;

      commit("SET_TABS", [tab.pathfile]);
      commit("SET_NAMETABS", [tab.CAPTION]);
      commit("SET_TABSFLMENU", [tab]);
      commit("SET_SELECTED_TAB", tab.pathfile);
      commit("SET_SELECTED_TAB_FLMENU", tab);

      dispatch("syncLocalStorage");
    },

    /** Sinkronkan semua perubahan ke localStorage */
    syncLocalStorage({ state }) {
      localStorage.setItem("openTabs", JSON.stringify(state.tabs));
      localStorage.setItem("openNameTabs", JSON.stringify(state.nametabs));
      localStorage.setItem("openTabsflmenu", JSON.stringify(state.tabsflmenu));
      localStorage.setItem("selectedTab", state.selectedTab);
      localStorage.setItem(
        "selectedTabflmenu",
        JSON.stringify(state.selectedTabflmenu),
      );
    },
  },
};

// export default {
//     namespaced: true,
//     state: () => ({
//         openTabs: [],
//         activeTab: null
//     }),
//     mutations: {
//         CLEAR_TABS(state) {
//             state.openTabs = [];
//             state.activeTab = null;
//         },
//         ADD_TAB(state, tab) {
//             if (!state.openTabs.find(t => t.pathfile === tab.pathfile)) {
//                 state.openTabs.push(tab);
//             }
//             state.activeTab = tab.pathfile;
//         }
//     },
//     actions: {
//         clearTabs({ commit }) {
//             commit("CLEAR_TABS");
//         },
//         handleOpenTab({ commit }, tab) {
//             commit("ADD_TAB", tab);
//         }
//     }
// };
