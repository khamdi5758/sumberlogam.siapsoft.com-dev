import api from "@/api";

const formatDate = (date) => {
  if (!(date instanceof Date)) return date;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

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
      const startDate = formatDate(requestPayload.startDate);
      const endDate = formatDate(requestPayload.endDate);

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
