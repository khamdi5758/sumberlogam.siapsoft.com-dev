import api from "@/api";

const state = {
  labarugiList: [],
  isLoading: false,
  sumcolom: [],
  avgcolom: [],
  keyfield: "Id",
  perusahaan: null,
  ketsp: "",
};

const getters = {
  labarugiList: (state) => state.labarugiList,
  isLoading: (state) => state.isLoading,
  sumcolom: (state) => state.sumcolom,
  avgcolom: (state) => state.avgcolom,
  keyfield: (state) => state.keyfield,
  perusahaan: (state) => state.perusahaan,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setLabarugiList(state, data) {
    state.labarugiList = data;
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
    state.keyfield = field || "Id";
  },
  setPerusahaan(state, perusahaan) {
    state.perusahaan = perusahaan;
  },
  setKetsp(state, ketsp) {
    state.ketsp = ketsp || "";
  },
  clearLabarugi(state) {
    state.labarugiList = [];
    state.sumcolom = [];
    state.avgcolom = [];
    state.perusahaan = null;
    state.ketsp = "";
  },
};

const actions = {
  async getLabarugi({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const payload = {
        bulan: requestPayload.month || requestPayload.bulan,
        tahun: requestPayload.year || requestPayload.tahun,
      };

      const response = await api.post("labarugineraca/labarugi", payload);
      const resultData = response.data?.data || response.data || [];

      commit("setLabarugiList", resultData);
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
      commit("setKetsp", response.data?.sqlquery || response.data?.ketsp || "");
    } catch (error) {
      console.error("Error getLabarugi:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearLabarugi({ commit }) {
    commit("clearLabarugi");
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
