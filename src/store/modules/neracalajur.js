import api from "@/api";

const state = {
  neracalajurList: [],
  isLoading: false,
  sumcolom: [],
  avgcolom: [],
  keyfield: "Id",
  perusahaan: null,
  ketsp: "",
};

const getters = {
  neracalajurList: (state) => state.neracalajurList,
  isLoading: (state) => state.isLoading,
  sumcolom: (state) => state.sumcolom,
  avgcolom: (state) => state.avgcolom,
  keyfield: (state) => state.keyfield,
  perusahaan: (state) => state.perusahaan,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setNeracalajurList(state, data) {
    state.neracalajurList = data;
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
  clearNeracalajur(state) {
    state.neracalajurList = [];
    state.sumcolom = [];
    state.avgcolom = [];
    state.perusahaan = null;
    state.ketsp = "";
  },
};

const actions = {
  async getNeracalajur({ commit }, requestPayload) {
    commit("setLoading", true);
    try {
      const payload = {
        bulan: requestPayload.month || requestPayload.bulan || (requestPayload.endDate ? new Date(requestPayload.endDate).getMonth() + 1 : undefined),
        tahun: requestPayload.year || requestPayload.tahun || (requestPayload.endDate ? new Date(requestPayload.endDate).getFullYear() : undefined),
      };

      const response = await api.post("labarugineraca/neracalajur", payload);
      const resultData = response.data?.data || response.data || [];
      
      const mappedData = resultData.map((item) => {
        const val = (k) => {
          if (item[k] !== undefined) return Number(item[k] || 0);
          const lowerK = k.toLowerCase();
          const foundKey = Object.keys(item).find(key => key.toLowerCase() === lowerK);
          return foundKey !== undefined ? Number(item[foundKey] || 0) : 0;
        };

        const strVal = (keys) => {
          for (const key of keys) {
            if (item[key] !== undefined) return String(item[key] || "");
            const lowerK = key.toLowerCase();
            const foundKey = Object.keys(item).find(k => k.toLowerCase() === lowerK);
            if (foundKey !== undefined) return String(item[foundKey] || "");
          }
          return "";
        };

        return {
          ...item,
          perkiraan: strVal(["Perkiraan", "perkiraan", "Kode", "KodePerkiraan", "accountCode", "KodeAkun"]),
          keterangan: strVal(["Keterangan", "keterangan", "Nama", "NamaPerkiraan", "accountName", "NamaAkun"]),
          saDebet: val("SaldoAwD"),
          saKredit: val("SaldoAwK"),
          mutasiDebet: val("MutasiDebet") || val("mutasiDebet") || val("MD") || val("MutasiD") || val("MutDebet") || val("Debet") || val("debet"),
          mutasiKredit: val("MutasiKredit") || val("mutasiKredit") || val("MK") || val("MutasiK") || val("MutKredit") || val("Kredit") || val("kredit"),
          penyesuaianDebet: val("JPD"),
          penyesuaianKredit: val("JPK"),
          nsDebet: val("NeracaSaldoAkd"),
          nsKredit: val("NeracaSaldoAkk"),
          lrDebet: val("LRK"),
          lrKredit: val("LRD"),
          neracaDebet: val("NeracaSaldoAkD"),
          neracaKredit: val("NeracaSaldoAkK"),
        };
      });

      commit("setNeracalajurList", mappedData);
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
      console.error("Error getNeracalajur:", error);
    } finally {
      commit("setLoading", false);
    }
  },
  clearNeracalajur({ commit }) {
    commit("clearNeracalajur");
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
