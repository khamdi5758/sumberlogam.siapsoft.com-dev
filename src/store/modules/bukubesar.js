import api from "@/api";

const state = {
  bukubesarList: [],
  isLoading: false,
  sumcolom: [],
  avgcolom: [],
  keyfield: "Id",
  perusahaan: null,
  ketsp: "",
};

const getters = {
  bukubesarList: (state) => state.bukubesarList,
  isLoading: (state) => state.isLoading,
  sumcolom: (state) => state.sumcolom,
  avgcolom: (state) => state.avgcolom,
  keyfield: (state) => state.keyfield,
  perusahaan: (state) => state.perusahaan,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setBukuBesarList(state, data) {
    state.bukubesarList = data;
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
  clearBukuBesar(state) {
    state.bukubesarList = [];
    state.sumcolom = [];
    state.avgcolom = [];
    state.perusahaan = null;
    state.ketsp = "";
  },
};

const actions = {
  async getBukuBesar({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const date = requestPayload.startDate ? new Date(requestPayload.startDate) : new Date();
      const payload = {
        perkiraan: requestPayload.dariPerkiraan || "",
        bulan: date.getMonth() + 1,
        tahun: date.getFullYear(),
      };

      // Determine endpoint based on formatOption
      const isRekap = requestPayload.formatOption === "Rekap";
      const endpoint = isRekap
        ? "labarugineraca/bukubesarrekap"
        : "labarugineraca/reportbukubesardetail";

      const response = await api.post(endpoint, payload);
      const resultData = response.data?.data || response.data || [];

      commit("setBukuBesarList", resultData);
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
      console.error("Error getBukuBesar:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearBukuBesar({ commit }) {
    commit("clearBukuBesar");
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
