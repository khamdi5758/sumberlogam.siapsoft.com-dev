import api from "@/api";

const state = {
  aktivaTetapList: [],
  isLoading: false,
  sumcolom: [],
  avgcolom: [],
  keyfield: "Id",
  perusahaan: null,
  ketsp: "",
};

const getters = {
  aktivaTetapList: (state) => state.aktivaTetapList,
  isLoading: (state) => state.isLoading,
  sumcolom: (state) => state.sumcolom,
  avgcolom: (state) => state.avgcolom,
  keyfield: (state) => state.keyfield,
  perusahaan: (state) => state.perusahaan,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setAktivaTetapList(state, data) {
    state.aktivaTetapList = data;
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
  clearAktivaTetap(state) {
    state.aktivaTetapList = [];
    state.sumcolom = [];
    state.avgcolom = [];
    state.perusahaan = null;
    state.ketsp = "";
  },
};

const actions = {
  async getAktivaTetap({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const payload = {
        bulan: requestPayload.month || requestPayload.bulan,
        tahun: requestPayload.year || requestPayload.tahun,
      };

      const response = await api.post("labarugineraca/aktivatetap", payload);
      const resultData = response.data?.data || response.data || [];
      commit("setAktivaTetapList", resultData);
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
      console.error("Error getAktivaTetap:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearAktivaTetap({ commit }) {
    commit("clearAktivaTetap");
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
