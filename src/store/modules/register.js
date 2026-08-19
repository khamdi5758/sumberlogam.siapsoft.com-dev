import api from "@/api";

const state = {
  registerList: [],
  isLoading: false,
  sumcolom: [],
  avgcolom: [],
  keyfield: "",
  ketsp:"",
  perusahaan: null
};

const getters = {
  registerList: (state) => state.registerList,
  isLoading: (state) => state.isLoading,
  sumcolom: (state) => state.sumcolom,
  avgcolom: (state) => state.avgcolom,
  keyfield: (state) => state.keyfield,
  perusahaan: (state) => state.perusahaan,
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
  setPerusahaan(state, perusahaan) {
    state.perusahaan = perusahaan;
  },
  clearRegister(state) {
    state.registerList = [];
    state.sumcolom = [];
    state.avgcolom = [];
    state.perusahaan = null;
    state.ketsp = "";
  },
  setKetsp(state, ketsp) {
    state.ketsp = ketsp;
  },
};

const actions = {
  async getRegister({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const payload = {
        mulaitgl: requestPayload.mulaitgl,
        sampaitgl: requestPayload.sampaitgl,
        nobukti: requestPayload.nobukti || "",
      };

      const response = await api.post("register/registerpo", payload);
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
      if (response.data?.perusahaan) {
         commit("setPerusahaan", response.data.perusahaan);
      }
      if (response.data?.sqlquery) {
        commit("setKetsp", response.data.sqlquery);
      }
      return response.data;
    } catch (error) {
      console.error("Error getRegister PO:", error);
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
