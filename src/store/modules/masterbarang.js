import api from "@/api";

const state = {
  barangList: [],
  isLoading: false,
  sumcolom: [],
  avgcolom: [],
  keyfield: "",
};

const getters = {
  barangList: (state) => state.barangList,
  isLoading: (state) => state.isLoading,
  sumcolom: (state) => state.sumcolom,
  avgcolom: (state) => state.avgcolom,
  keyfield: (state) => state.keyfield,
};

const mutations = {
  setbarangList(state, data) {
    state.barangList = data;
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
  clearbarang(state) {
    state.barangList = [];
    state.sumcolom = [];
    state.avgcolom = [];
  },
};

const actions = {
  async getbarang({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const payload = {
        mulaitgl: requestPayload.mulaitgl,
        sampaitgl: requestPayload.sampaitgl,
        nobukti: requestPayload.nobukti || "",
      };

      const response = await api.post("master/barang", payload);
      const resultData = response.data?.data || response.data || [];
      
      commit("setbarangList", resultData);
      
      if (response.data?.sumcolom) {
         commit("setSumColom", response.data.sumcolom);
      }
      if (response.data?.avgcolom) {
         commit("setAvgColom", response.data.avgcolom);
      }
      if (response.data?.keyfield) {
         commit("setKeyfield", response.data.keyfield);
      }
    } catch (error) {
      console.error("Error getbarang PO:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearbarang({ commit }) {
    commit("clearbarang");
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
