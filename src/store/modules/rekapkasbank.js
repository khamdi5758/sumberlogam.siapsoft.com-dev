import api from "@/api";

const state = {
  rekapkasbankList: [],
  isLoading: false,
  ketsp: "",
};

const getters = {
  rekapkasbankList: (state) => state.rekapkasbankList,
  isLoading: (state) => state.isLoading,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setRekapkasbankList(state, data) {
    state.rekapkasbankList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setKetsp(state, ketsp) {
    state.ketsp = ketsp || "";
  },
  clearRekapkasbank(state) {
    state.rekapkasbankList = [];
    state.ketsp = "";
  },
};

const actions = {
  async getRekapkasbank({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const startDate = requestPayload.startDate instanceof Date
        ? requestPayload.startDate.toISOString().split("T")[0]
        : requestPayload.startDate;
      const endDate = requestPayload.endDate instanceof Date
        ? requestPayload.endDate.toISOString().split("T")[0]
        : requestPayload.endDate;

      const response = await api.post("kasbank/bukukasbank", {
        mulaitgl: startDate,
        sampaitgl: endDate,
        perkiraan: requestPayload.perkiraan || "",
      });
      const resultData = response.data?.data || response.data || [];

      commit("setRekapkasbankList", resultData);
      commit("setKetsp", response.data?.sqlquery || response.data?.ketsp || "");
    } catch (error) {
      console.error("Error getRekapkasbank:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearRekapkasbank({ commit }) {
    commit("clearRekapkasbank");
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
