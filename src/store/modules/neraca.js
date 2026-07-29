import api from "@/api";

const state = {
  neracaList: [],
  isLoading: false,
};

const getters = {
  neracaList: (state) => state.neracaList,
  isLoading: (state) => state.isLoading,
};

const mutations = {
  setNeracaList(state, data) {
    state.neracaList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  clearNeraca(state) {
    state.neracaList = [];
  },
};

const actions = {
  async getNeraca({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const payload = {
        bulan: requestPayload.month || requestPayload.bulan,
        tahun: requestPayload.year || requestPayload.tahun,
      };

      const response = await api.post("labarugineraca/neraca", payload);
      const resultData = response.data?.data || response.data || [];
      
      commit("setNeracaList", resultData);
    } catch (error) {
      console.error("Error getNeraca:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearNeraca({ commit }) {
    commit("clearNeraca");
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
