import api from "@/api";

const formatDate = (date) => {
  if (!(date instanceof Date)) return date;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

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
      const startDate = formatDate(requestPayload.startDate);
      const endDate = formatDate(requestPayload.endDate);

      const response = await api.post("kasbank/bankharian", {
        mulaitgl: startDate,
        sampaitgl: endDate,
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
