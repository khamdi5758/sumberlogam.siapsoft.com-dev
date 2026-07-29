import api from "@/api";

const state = {
  bankharianList: [],
  isLoading: false,
  ketsp: "",
};

const getters = {
  bankharianList: (state) => state.bankharianList,
  isLoading: (state) => state.isLoading,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setBankharianList(state, data) {
    state.bankharianList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setKetsp(state, ketsp) {
    state.ketsp = ketsp || "";
  },
  clearBankharian(state) {
    state.bankharianList = [];
    state.ketsp = "";
  },
};

const actions = {
  async getBankharian({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const startDate = requestPayload.startDate instanceof Date
        ? requestPayload.startDate.toISOString().split("T")[0]
        : requestPayload.startDate;
      const endDate = requestPayload.endDate instanceof Date
        ? requestPayload.endDate.toISOString().split("T")[0]
        : requestPayload.endDate;

      const response = await api.post("kasbank/bankharian", {
        startDate,
        endDate,
        perkiraan: requestPayload.perkiraan || "",
      });
      const resultData = response.data?.data || response.data || [];

      commit("setBankharianList", resultData);
      commit("setKetsp", response.data?.sqlquery || response.data?.ketsp || "");
    } catch (error) {
      console.error("Error getBankharian:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearBankharian({ commit }) {
    commit("clearBankharian");
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
