import api from "@/api";

const state = {
  reportList: [],
  isLoading: false,
  sumcolom: [],
  avgcolom: [],
  keyfield: "id",
  ketsp: "",
  perusahaan: null
};

const getters = {
  reportList: (state) => state.reportList,
  isLoading: (state) => state.isLoading,
  sumcolom: (state) => state.sumcolom,
  avgcolom: (state) => state.avgcolom,
  keyfield: (state) => state.keyfield,
  perusahaan: (state) => state.perusahaan,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setReportList(state, data) {
    state.reportList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setSumColom(state, data) {
    state.sumcolom = data;
  },
  setAvgColom(state, data) {
    state.avgcolom = data;
  },
  setKeyfield(state, keyfield) {
    state.keyfield = keyfield || "id";
  },
  setPerusahaan(state, perusahaan) {
    state.perusahaan = perusahaan;
  },
  setKetsp(state, ketsp) {
    state.ketsp = ketsp || "";
  },
  clearReport(state) {
    state.reportList = [];
    state.sumcolom = [];
    state.avgcolom = [];
    state.perusahaan = null;
    state.ketsp = "";
  }
};

const actions = {
  async getReport({ commit }, payload) {
    commit("setLoading", true);
    try {
      const response = await api.post("utangpiutang/umurpiutang", payload);
      const data = response.data?.data || response.data || [];
      commit("setReportList", data);
      if (response.data?.sumcolom) {
        commit("setSumColom", response.data.sumcolom);
      }
      if (response.data?.avgcolom) {
        commit("setAvgColom", response.data.avgcolom);
      }
      if (response.data?.keyfield) {
        commit("setKeyfield", response.data.keyfield);
      }
      if (response.data?.perusahaan) {
        commit("setPerusahaan", response.data.perusahaan);
      }
      if (response.data?.sqlquery) {
        commit("setKetsp", response.data.sqlquery);
      }
    } catch (error) {
      console.error("Error fetching Umur Piutang:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearReport({ commit }) {
    commit("clearReport");
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
