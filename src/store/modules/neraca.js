import api from "@/api";

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

const state = {
  neracaList: [],
  isLoading: false,
  ketsp: "",
};

const getters = {
  neracaList: (state) => state.neracaList,
  isLoading: (state) => state.isLoading,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setNeracaList(state, data) {
    state.neracaList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setKetsp(state, ketsp) {
    state.ketsp = ketsp || "";
  },
  clearNeraca(state) {
    state.neracaList = [];
    state.ketsp = "";
  },
};

const actions = {
  async getNeraca({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const payload = {
        startDate: formatDate(requestPayload.startDate),
        endDate: formatDate(requestPayload.endDate),
        bulan: requestPayload.month || requestPayload.bulan,
        tahun: requestPayload.year || requestPayload.tahun,
      };

      const response = await api.post("labarugineraca/neraca", payload);
      const resultData = response.data?.data || response.data || [];
      
      commit("setNeracaList", resultData);
      commit("setKetsp", response.data?.sqlquery || response.data?.ketsp || "");
    } catch (error) {
      console.error("Error getNeraca:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearNeraca({ commit }) {
    commit("clearNeraca");
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
