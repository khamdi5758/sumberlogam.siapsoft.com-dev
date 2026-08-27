import api from "@/api";

const state = {
  registerList: [],
  isLoading: false,
  sumcolom: [],
  avgcolom: [],
  keyfield: "",
  gudangList: [],
  ketsp: ""
};

const getters = {
  registerList: (state) => state.registerList,
  isLoading: (state) => state.isLoading,
  sumcolom: (state) => state.sumcolom,
  avgcolom: (state) => state.avgcolom,
  keyfield: (state) => state.keyfield,
  gudangList: (state) => state.gudangList,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setRegisterList(state, data) {
    state.registerList = data;
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
  setKeyfield(state, field) {
    state.keyfield = field;
  },
  setGudangList(state, data) {
    state.gudangList = data;
  },
  setKetsp(state, ketsp) {
    state.ketsp = ketsp;
  },
  clearRegister(state) {
    state.registerList = [];
    state.sumcolom = [];
    state.avgcolom = [];
    state.ketsp = "";
  },
};

const actions = {
  async getRegister({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const payloadApi = {
        mulaitgl: requestPayload.mulaitgl,
        sampaitgl: requestPayload.sampaitgl,
        kodebrg: requestPayload.kodebrg || "",
        kodejob: requestPayload.kodejob || "",
      };

      const response = await api.post("register/registerbahan", payloadApi);
      const resultData = response.data?.data || response.data || [];

      commit("setRegisterList", resultData);

      if (response.data?.sumcolom) {
        commit("setSumColom", response.data.sumcolom);
      }
      if (response.data?.avgcolom) {
        commit("setAvgColom", response.data.avgcolom);
      }
      if (response.data?.keyfield) {
        commit("setKeyfield", response.data.keyfield);
      }
      if (response.data?.sqlquery) {
        commit("setKetsp", response.data.sqlquery);
      }
    } catch (error) {
      console.error("Error getRegister Bahan:", error);
    } finally {
      commit("setLoading", false);
    }
  },

  clearRegister({ commit }) {
    commit("clearRegister");
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
