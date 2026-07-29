import api from "@/api";

const state = {
  mutasiList: [],
  isLoading: false,
};

const getters = {
  mutasiList: (state) => state.mutasiList,
  isLoading: (state) => state.isLoading,
};

const mutations = {
  setMutasiList(state, data) {
    state.mutasiList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  clearMutasi(state) {
    state.mutasiList = [];
  },
};

const actions = {
  async getMutasi({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const payload = {
        bulan: requestPayload.month || requestPayload.bulan,
        tahun: requestPayload.year || requestPayload.tahun,
      };

      const response = await api.post("labarugineraca/mutasi", payload);
      const resultData = response.data?.data || response.data || [];
      commit("setMutasiList", resultData);
    } catch (error) {
      console.error("Error getMutasi:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearMutasi({ commit }) {
    commit("clearMutasi");
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
