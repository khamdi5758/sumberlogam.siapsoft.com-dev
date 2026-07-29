import api from "@/api";

const state = {
  aktivaTetapList: [],
  isLoading: false,
  ketsp: "",
};

const getters = {
  aktivaTetapList: (state) => state.aktivaTetapList,
  isLoading: (state) => state.isLoading,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setAktivaTetapList(state, data) {
    state.aktivaTetapList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setKetsp(state, ketsp) {
    state.ketsp = ketsp || "";
  },
  clearAktivaTetap(state) {
    state.aktivaTetapList = [];
    state.ketsp = "";
  },
};

const actions = {
  async getAktivaTetap({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const payload = {
        bulan: requestPayload.month || requestPayload.bulan,
        tahun: requestPayload.year || requestPayload.tahun,
      };

      const response = await api.post("labarugineraca/aktivatetap", payload);
      const resultData = response.data?.data || response.data || [];
      commit("setAktivaTetapList", resultData);
      commit("setKetsp", response.data?.sqlquery || response.data?.ketsp || "");
    } catch (error) {
      console.error("Error getAktivaTetap:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearAktivaTetap({ commit }) {
    commit("clearAktivaTetap");
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
