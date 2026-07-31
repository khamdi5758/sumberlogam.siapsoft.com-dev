import api from "@/api";

const state = {
  bukubesarList: [],
  isLoading: false,
  ketsp: "",
};

const getters = {
  bukubesarList: (state) => state.bukubesarList,
  isLoading: (state) => state.isLoading,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setBukuBesarList(state, data) {
    state.bukubesarList = data;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setKetsp(state, ketsp) {
    state.ketsp = ketsp || "";
  },
  clearBukuBesar(state) {
    state.bukubesarList = [];
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
        : "labarugineraca/bukubesardetail";

      const response = await api.post(endpoint, payload);
      const resultData = response.data?.data || response.data || [];
      
      commit("setBukuBesarList", resultData);
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
