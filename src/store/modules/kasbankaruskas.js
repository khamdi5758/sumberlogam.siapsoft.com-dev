import api from "@/api";

const state = {
  aruskasList: [],
  isLoading: false,
  ketsp: "",
};

const getters = {
  aruskasList: (state) => state.aruskasList,
  isLoading: (state) => state.isLoading,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setAruskasList(state, data) {
    state.aruskasList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setKetsp(state, ketsp) {
    state.ketsp = ketsp || "";
  },
  clearAruskas(state) {
    state.aruskasList = [];
    state.ketsp = "";
  },
};

const actions = {
  async getAruskas({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const response = await api.post("kasbank/aruskas", {
        bulan: requestPayload.month || requestPayload.bulan,
        tahun: requestPayload.year || requestPayload.tahun,
      });
      const resultData = response.data?.data || response.data || [];

      commit("setAruskasList", resultData);
      commit("setKetsp", response.data?.sqlquery || response.data?.ketsp || "");
    } catch (error) {
      console.error("Error getAruskas:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearAruskas({ commit }) {
    commit("clearAruskas");
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
