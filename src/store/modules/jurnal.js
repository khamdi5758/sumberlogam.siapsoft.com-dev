import api from "@/api";

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

const state = {
  jurnalList: [],
  isLoading: false,
  ketsp: "",
};

const getters = {
  jurnalList: (state) => state.jurnalList,
  isLoading: (state) => state.isLoading,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setJurnalList(state, data) {
    state.jurnalList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setKetsp(state, ketsp) {
    state.ketsp = ketsp || "";
  },
  clearJurnal(state) {
    state.jurnalList = [];
    state.ketsp = "";
  },
};

const actions = {
  async getJurnal({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const payload = {
        startDate: formatDate(requestPayload.startDate),
        endDate: formatDate(requestPayload.endDate),
        type: requestPayload.type,
      };

      const response = await api.post("labarugineraca/jurnal", payload);
      const resultData = response.data?.data || response.data || [];
      commit("setJurnalList", resultData);
      commit("setKetsp", response.data?.sqlquery || response.data?.ketsp || "");
    } catch (error) {
      console.error("Error getJurnal:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearJurnal({ commit }) {
    commit("clearJurnal");
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
