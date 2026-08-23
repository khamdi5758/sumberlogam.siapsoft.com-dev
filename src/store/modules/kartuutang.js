import api from "@/api";

const state = {
  reportList: [],
  isLoading: false,
  keyfield: "id",
  ketsp: ""
};

const getters = {
  reportList: (state) => state.reportList,
  isLoading: (state) => state.isLoading,
  keyfield: (state) => state.keyfield,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setReportList(state, data) {
    state.reportList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setKeyfield(state, keyfield) {
    state.keyfield = keyfield || "id";
  },
  setKetsp(state, ketsp) {
    state.ketsp = ketsp || "";
  },
  clearReport(state) {
    state.reportList = [];
    state.ketsp = "";
  }
};

const actions = {
  async getReport({ commit }, payload) {
    commit("setLoading", true);
    try {
      const response = await api.post("utangpiutang/kartuutang", payload);
      const data = response.data?.data || response.data || [];
      commit("setReportList", data);
      if (response.data?.keyfield) {
        commit("setKeyfield", response.data.keyfield);
      }
      if (response.data?.sqlquery) {
        commit("setKetsp", response.data.sqlquery);
      }
    } catch (error) {
      console.error("Error fetching Kartu Hutang:", error);
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
