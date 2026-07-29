import api from "@/api";

const state = {
  biayaList: [],
  isLoading: false,
  ketsp: "",
};

const getters = {
  biayaList: (state) => state.biayaList,
  isLoading: (state) => state.isLoading,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setBiayaList(state, data) {
    state.biayaList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setKetsp(state, ketsp) {
    state.ketsp = ketsp || "";
  },
  clearBiaya(state) {
    state.biayaList = [];
    state.ketsp = "";
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
      commit("setKetsp", response.data?.sqlquery || response.data?.ketsp || "");
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
