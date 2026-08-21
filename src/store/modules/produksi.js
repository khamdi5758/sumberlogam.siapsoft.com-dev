import api from "@/api";

const state = {
  produksiList: [],
  isLoading: false,
  sumcolom: [],
  avgcolom: [],
  keyfield: "",
  ketsp: "",
  perusahaan: null,
};

const getters = {
  produksiList: (state) => state.produksiList,
  isLoading: (state) => state.isLoading,
  sumcolom: (state) => state.sumcolom,
  avgcolom: (state) => state.avgcolom,
  keyfield: (state) => state.keyfield,
  perusahaan: (state) => state.perusahaan,
  ketsp: (state) => state.ketsp,
};

const mutations = {
  setProduksiList(state, data) {
    state.produksiList = data;
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
  clearProduksi(state) {
    state.produksiList = [];
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
  async getProduksi({ commit }, { endpoint, payload: requestPayload }) {
    commit("setLoading", true);
    try {
      const payload = {
        mulaitgl: requestPayload.mulaitgl,
        sampaitgl: requestPayload.sampaitgl,
        nobukti: requestPayload.nobukti || "",
        ...requestPayload,
      };

      console.log(`[Produksi] Calling endpoint: ${endpoint}`);
      console.log(`[Produksi] Payload:`, payload);

      const response = await api.post(endpoint, payload);
      
      console.log(`[Produksi] Response:`, response.data);

      const resultData = response.data?.data || response.data || [];

      commit("setProduksiList", resultData);

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
      console.error(`[Produksi] Error getProduksi (${endpoint}):`, error);
      console.error(`[Produksi] Error response:`, error.response?.data);
      console.error(`[Produksi] Error status:`, error.response?.status);
      
      // If 404, show mock data for development
      if (error.response?.status === 404) {
        console.warn(`[Produksi] Endpoint ${endpoint} not found. Using mock data for development.`);
        
        const mockData = {
          data: [
            {
              Id: 1,
              NoBukti: "PROD-2026-001",
              Tanggal: "2026-08-20",
              KodeBrg: "BRG-001",
              NamaBrg: "Produk Contoh 1",
              Satuan: "PCS",
              Qnt: 100,
              Harga: 50000,
              Diskon: 0,
              Jumlah: 5000000,
            },
            {
              Id: 2,
              NoBukti: "PROD-2026-001",
              Tanggal: "2026-08-20",
              KodeBrg: "BRG-002",
              NamaBrg: "Produk Contoh 2",
              Satuan: "PCS",
              Qnt: 50,
              Harga: 75000,
              Diskon: 5000,
              Jumlah: 3500000,
            },
            {
              Id: 3,
              NoBukti: "PROD-2026-002",
              Tanggal: "2026-08-21",
              KodeBrg: "BRG-003",
              NamaBrg: "Produk Contoh 3",
              Satuan: "UNIT",
              Qnt: 25,
              Harga: 120000,
              Diskon: 0,
              Jumlah: 3000000,
            },
          ],
          sumcolom: ["Jumlah", "Qnt"],
          avgcolom: [],
          keyfield: "Id",
          perusahaan: {
            namaperusahaan: "PT SIAP INTEGRASI",
            alamat1: "Jl. Contoh No. 123",
            alamat2: "Jakarta",
            telpon: "021-12345678",
          },
          sqlquery: "-- Mock data for development",
        };

        commit("setProduksiList", mockData.data);
        commit("setSumColom", mockData.sumcolom);
        commit("setAvgColom", mockData.avgcolom);
        commit("setKeyfield", mockData.keyfield);
        commit("setPerusahaan", mockData.perusahaan);
        commit("setKetsp", mockData.sqlquery);

        return mockData;
      }
      
      throw error;
    } finally {
      commit("setLoading", false);
    }
  },
  clearProduksi({ commit }) {
    commit("clearProduksi");
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
