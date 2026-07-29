import api from "@/api";

const state = {
  labarugiList: [],
  isLoading: false,
  ketsp: "",
};

const getters = {
  labarugiList: (state) => state.labarugiList,
  isLoading: (state) => state.isLoading,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setLabarugiList(state, data) {
    state.labarugiList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setKetsp(state, ketsp) {
    state.ketsp = ketsp || "";
  },
  clearLabarugi(state) {
    state.labarugiList = [];
    state.ketsp = "";
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
      commit("setKetsp", response.data?.sqlquery || response.data?.ketsp || "");
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
