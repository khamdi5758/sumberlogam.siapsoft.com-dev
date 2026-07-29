import api from "@/api";

const state = {
  mutasiList: [],
  isLoading: false,
  ketsp: "",
};

const getters = {
  mutasiList: (state) => state.mutasiList,
  isLoading: (state) => state.isLoading,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setMutasiList(state, data) {
    state.mutasiList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setKetsp(state, ketsp) {
    state.ketsp = ketsp || "";
  },
  clearMutasi(state) {
    state.mutasiList = [];
    state.ketsp = "";
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
      commit("setKetsp", response.data?.sqlquery || response.data?.ketsp || "");
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
