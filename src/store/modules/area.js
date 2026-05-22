import api from "@/api";
import { useCookies } from "vue3-cookies";

const { cookies } = useCookies();

const state = {
  areaUsers: [],
  usersarea: [],
  isLoading: false,
  error: null,
  searchQuery: "",
};

const getters = {
  allAreaUsers: (state) => state.areaUsers,
  allusersarea: (state) => state.usersarea,
  isLoading: (state) => state.isLoading,
  error: (state) => state.error,
  searchQuery: (state) => state.searchQuery,
  filteredAreaUsers: (state) => {
    if (!state.searchQuery.trim()) return state.areaUsers;
    const query = state.searchQuery.toLowerCase();
    return state.areaUsers.filter((item) => {
      const areaId = String(item.area_id ?? "").toLowerCase();
      const areaName = String(item.area_name ?? "").toLowerCase();
      return areaId.includes(query) || areaName.includes(query);
    });
  },
};

const mutations = {
  SET_TEAM_USERS(state, payload) {
    state.areaUsers = Array.isArray(payload) ? payload : [];
  },
  SET_USERSTEAM(state, payload) {
    state.usersarea = Array.isArray(payload) ? payload : [];
  },
  SET_LOADING(state, payload) {
    state.isLoading = payload;
  },
  SET_ERROR(state, payload) {
    state.error = payload;
  },
  SET_SEARCH_QUERY(state, payload) {
    state.searchQuery = payload;
  },
};

const actions = {
  setSearchQuery({ commit }, query) {
    commit("SET_SEARCH_QUERY", query);
  },

  createArea(context, data) {
    // Gunakan saveArea dengan choice='i' untuk backward compatibility
    const payload = {
      choice: "i",
      ...data,
    };
    return context.dispatch("saveArea", payload);
  },

  saveArea(context, formData) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        // Tentukan choice: 'i' untuk insert, 'u' untuk update
        const choice = formData.choice || (formData.id ? "u" : "i");

        const requestPayload = {
          choice: choice,
          id: formData.id || "",
          areaName: formData.areaName || formData.area_name || "",
          parentArea: formData.parentArea || formData.parent_id || "",
          selectedMembers: formData.selectedMembers || [],
          contactassoc: formData.selectedMembers || [], // Backend checks this key
          // Keep variants for compatibility
          area_name: formData.areaName || formData.area_name || "",
          parent_id: formData.parentArea || formData.parent_id || null,
        };

        let network = await api.post("area/input", requestPayload, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });
        // Refresh daftar HANYA setelah sukses dan tunggu sampai selesai
        await context.dispatch("fetchAllAreaUsers");

        resolve(network.data);
      } catch (error) {
        reject(error);
      }
    });

    return promise;
  },

  // Alias untuk update area (backward compatibility)
  updateArea(context, data) {
    const payload = {
      choice: "u",
      ...data,
    };
    return context.dispatch("saveArea", payload);
  },

  async addAreaUsers({ dispatch }, payload) {
    const headers = {
      Authorization: "Bearer " + cookies.get("token"),
    };

    const response = await api.post("area/addareausers", payload, { headers });
    await dispatch("fetchAllAreaUsers");
    return response.data;
  },

  deleteArea({ commit, dispatch }, areaId) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    const requestPayload = {
      choice: "d",
      id: areaId,
      areaName: "", // Backend needs this key even for delete
      parentArea: "", // Backend needs this key even for delete
      selectedMembers: [], // Backend needs this key
      contactassoc: [], // Backend checks this key
      // Variants
      area_id: areaId,
      idarea: areaId,
    };

    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await api.post("area/input", requestPayload, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });

        // Refresh daftar
        await dispatch("fetchAllAreaUsers");
        resolve(response.data);
      } catch (error) {
        console.error("Store deleteArea error:", error);
        commit("SET_ERROR", error.response?.data?.message || error.message);
        reject(error);
      } finally {
        commit("SET_LOADING", false);
      }
    });

    return promise;
  },

  fetchAllAreaUsers({ commit }) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.get("area", {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
          // headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });

        resolve(network.data);
      } catch (error) {
        reject(error);
      }
    });

    promise
      .then((data) => {
        commit("SET_TEAM_USERS", data.areas);
        commit("SET_LOADING", false);
      })
      .catch((error) => {
        // Tangani error lain jika ada
        console.error("Error:", error);
        commit("SET_ERROR", error.message);
        commit("SET_LOADING", false);
      });

    return promise;
  },

  fetchUsersarea({ commit }, data) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.getbydata("area/usersarea", data, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
          // headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });

        resolve(network.data);
      } catch (error) {
        reject(error);
      }
    });
    promise
      .then((data) => {
        console.log("Fetched usersarea data:", data);
        commit("SET_USERSTEAM", data.usersareas);
        commit("SET_LOADING", false);
      })
      .catch((error) => {
        // Tangani error lain jika ada
        console.error("Error:", error);
        commit("SET_ERROR", error.message);
        commit("SET_LOADING", false);
      });

    return promise;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
