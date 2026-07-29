import api from "@/api";

const state = {
  neracalajurList: [],
  isLoading: false,
};

const getters = {
  neracalajurList: (state) => state.neracalajurList,
  isLoading: (state) => state.isLoading,
};

const mutations = {
  setNeracalajurList(state, data) {
    state.neracalajurList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  clearNeracalajur(state) {
    state.neracalajurList = [];
  },
};

const actions = {
  async getNeracalajur({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const payload = {
        bulan: requestPayload.month || requestPayload.bulan,
        tahun: requestPayload.year || requestPayload.tahun,
      };

      const response = await api.post("labarugineraca/neracalajur", payload);
      const resultData = response.data?.data || response.data || [];
      
      commit("setNeracalajurList", resultData);
    } catch (error) {
      console.error("Error getNeracalajur:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearNeracalajur({ commit }) {
    commit("clearNeracalajur");
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
