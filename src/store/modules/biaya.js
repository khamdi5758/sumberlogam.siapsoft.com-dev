import api from "@/api";

const state = {
  biayaList: [],
  isLoading: false,
};

const getters = {
  biayaList: (state) => state.biayaList,
  isLoading: (state) => state.isLoading,
};

const mutations = {
  setBiayaList(state, data) {
    state.biayaList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  clearBiaya(state) {
    state.biayaList = [];
  },
};

const actions = {
  async getBiaya({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const payload = {
        bulan: requestPayload.month || requestPayload.bulan,
        tahun: requestPayload.year || requestPayload.tahun,
        dariPerkiraan: requestPayload.dariPerkiraan,
        sdPerkiraan: requestPayload.sdPerkiraan,
      };

      const response = await api.post("labarugineraca/biaya", payload);
      const resultData = response.data?.data || response.data || [];
      commit("setBiayaList", resultData);
    } catch (error) {
      console.error("Error getBiaya:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearBiaya({ commit }) {
    commit("clearBiaya");
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
