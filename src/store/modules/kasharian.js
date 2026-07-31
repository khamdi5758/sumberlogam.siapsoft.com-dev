import api from "@/api";

const state = {
  kasharianList: [],
  isLoading: false,
  ketsp: "",
};

const getters = {
  kasharianList: (state) => state.kasharianList,
  isLoading: (state) => state.isLoading,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setKasharianList(state, data) {
    state.kasharianList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setKetsp(state, ketsp) {
    state.ketsp = ketsp || "";
  },
  clearKasharian(state) {
    state.kasharianList = [];
    state.ketsp = "";
  },
};

const actions = {
  async getKasharian({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const startDate = requestPayload.startDate instanceof Date
        ? requestPayload.startDate.toISOString().split("T")[0]
        : requestPayload.startDate;
      const endDate = requestPayload.endDate instanceof Date
        ? requestPayload.endDate.toISOString().split("T")[0]
        : requestPayload.endDate;

      const response = await api.post("kasbank/kasharian", {
        mulaitgl: startDate,
        sampaitgl: endDate,
        perkiraan: requestPayload.perkiraan || "",
      });
      const resultData = response.data?.data || response.data || [];

      commit("setKasharianList", resultData);
      commit("setKetsp", response.data?.sqlquery || response.data?.ketsp || "");
    } catch (error) {
      console.error("Error getKasharian:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearKasharian({ commit }) {
    commit("clearKasharian");
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
