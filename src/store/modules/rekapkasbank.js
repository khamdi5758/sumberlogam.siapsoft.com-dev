import api from "@/api";

const formatDate = (date) => {
  if (!(date instanceof Date)) return date;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

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
      const startDate = formatDate(requestPayload.startDate);
      const endDate = formatDate(requestPayload.endDate);

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
