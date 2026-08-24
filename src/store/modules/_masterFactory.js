import api from "@/api";

/**
 * Factory function to create a Master store module.
 * Follows the same pattern as masterbarang.js / register.js store modules.
 *
 * @param {string} endpoint - The API endpoint (e.g. "master/barang")
 * @param {object} options - Optional overrides
 * @param {function} options.buildPayload - (requestPayload) => payload for API call
 * @returns {object} Vuex store module
 */
export function createMasterModule(endpoint, options = {}) {
  const state = {
    barangList: [],
    isLoading: false,
    sumcolom: [],
    avgcolom: [],
    keyfield: "",
    ketsp: "",
  };

  const getters = {
    barangList: (state) => state.barangList,
    isLoading: (state) => state.isLoading,
    sumcolom: (state) => state.sumcolom,
    avgcolom: (state) => state.avgcolom,
    keyfield: (state) => state.keyfield,
    ketsp: (state) => state.ketsp,
  };

  const mutations = {
    setbarangList(state, data) {
      state.barangList = data;
    },
    setLoading(state, isLoading) {
      state.isLoading = isLoading;
    },
    setSumColom(state, data) {
      state.sumcolom = data;
    },
    setAvgColom(state, data) {
      state.avgcolom = data;
    },
    setKeyfield(state, field) {
      state.keyfield = field;
    },
    setKetsp(state, ketsp) {
      state.ketsp = ketsp;
    },
    clearbarang(state) {
      state.barangList = [];
      state.sumcolom = [];
      state.avgcolom = [];
      state.ketsp = "";
    },
  };

  const actions = {
    async getbarang({ commit }, requestPayload) {
      commit("setLoading", true);
      try {
        const payload = options.buildPayload
          ? options.buildPayload(requestPayload)
          : requestPayload || {};

        const response = await api.post(endpoint, payload);
        const resultData = response.data?.data || response.data || [];

        commit("setbarangList", resultData);

        if (response.data?.sumcolom) {
          commit("setSumColom", response.data.sumcolom);
        }
        if (response.data?.avgcolom) {
          commit("setAvgColom", response.data.avgcolom);
        }
        if (response.data?.keyfield) {
          commit("setKeyfield", response.data.keyfield);
        }
        if (response.data?.sqlquery) {
          commit("setKetsp", response.data.sqlquery);
        }
        return response.data;
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      } finally {
        commit("setLoading", false);
      }
    },
    clearbarang({ commit }) {
      commit("clearbarang");
    },
  };

  return {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
  };
}
