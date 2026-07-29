import api from "@/api";

const state = {
  labarugiList: [],
  isLoading: false,
};

const getters = {
  labarugiList: (state) => state.labarugiList,
  isLoading: (state) => state.isLoading,
};

const mutations = {
  setLabarugiList(state, data) {
    state.labarugiList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  clearLabarugi(state) {
    state.labarugiList = [];
  },
};

const actions = {
  async getLabarugi({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const payload = {
        bulan: requestPayload.month || requestPayload.bulan,
        tahun: requestPayload.year || requestPayload.tahun,
      };

      const response = await api.post("labarugineraca/labarugi", payload);
      const resultData = response.data?.data || response.data || [];
      
      commit("setLabarugiList", resultData);
    } catch (error) {
      console.error("Error getLabarugi:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearLabarugi({ commit }) {
    commit("clearLabarugi");
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
