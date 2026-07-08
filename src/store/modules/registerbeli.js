import api from "@/api";

const state = {
  registerList: [],
  isLoading: false,
  sumcolom: [],
  avgcolom: [],
  keyfield: "NoBukti",
  gudangList: [], // Digunakan oleh RegisterPopup.vue
};

const getters = {
  registerList: (state) => state.registerList,
  isLoading: (state) => state.isLoading,
  sumcolom: (state) => state.sumcolom,
  avgcolom: (state) => state.avgcolom,
  keyfield: (state) => state.keyfield,
  gudangList: (state) => state.gudangList,
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
  clearRegister(state) {
    state.registerList = [];
    state.sumcolom = [];
    state.avgcolom = [];
  },
};

const actions = {
  async getRegister({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      // Backend membutuhkan: mulaitgl, sampaitgl, gudang
      const payloadApi = {
        mulaitgl: requestPayload.mulaitgl,
        sampaitgl: requestPayload.sampaitgl,
        gudang: requestPayload.kodegdg || "", // RegisterBase mengirim kodegdg
      };

      const response = await api.post("register/registerbeli", payloadApi);
      const resultData = response.data?.data || response.data || [];
      
      commit("setRegisterList", resultData);
      
      if (response.data?.sumcolom) {
         commit("setSumColom", response.data.sumcolom);
      }
    } catch (error) {
      console.error("Error getRegister Beli:", error);
    } finally {
      commit("setLoading", false);
    }
  },

  // Contoh action untuk memuat data gudang
  async getGudang({ commit }) {
    try {
      // Sesuaikan URL endpoint gudang dari backend Anda
      const response = await api.get("gudang"); 
      const gudangData = response.data?.data || response.data || [];
      commit("setGudangList", gudangData);
    } catch (error) {
      console.error("Error fetch Gudang:", error);
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
