import api from "@/api";
import { useCookies } from "vue3-cookies";
import { alertService } from "@/services/alertService";

const { cookies } = useCookies();

const state = {
  kpi: null,
  grafikBulanan: null,
  distribusiBiaya: null,
  arusKas: null,
  trenSaldo: null,
  transaksiTerbaru: null,
  ringkasanBulanan: null,
};

const getters = {
  getKpi: (state) => state.kpi,
  getGrafikBulanan: (state) => state.grafikBulanan,
  getDistribusiBiaya: (state) => state.distribusiBiaya,
  getArusKas: (state) => state.arusKas,
  getTrenSaldo: (state) => state.trenSaldo,
  getTransaksiTerbaru: (state) => state.transaksiTerbaru,
  getRingkasanBulanan: (state) => state.ringkasanBulanan,
};

const mutations = {
  setKpi(state, data) {
    state.kpi = data;
  },
  setGrafikBulanan(state, data) {
    state.grafikBulanan = data;
  },
  setDistribusiBiaya(state, data) {
    state.distribusiBiaya = data;
  },
  setArusKas(state, data) {
    state.arusKas = data;
  },
  setTrenSaldo(state, data) {
    state.trenSaldo = data;
  },
  setTransaksiTerbaru(state, data) {
    state.transaksiTerbaru = data;
  },
  setRingkasanBulanan(state, data) {
    state.ringkasanBulanan = data;
  },
};

const actions = {
  actKPI(context, requestPayload) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.getbydata("finance/kpi", requestPayload, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
            "Content-Type": "multipart/form-data",
          },
        });
        resolve(network.data);
      } catch (error) {
        reject(error);
      }
    });

    promise
      .then((data) => {
        context.commit("setKpi", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    return promise;
  },
  actGrafikBulanan(context, requestPayload) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.getbydata("finance/grafik-bulanan", requestPayload, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
            "Content-Type": "multipart/form-data",
          },
        });
        resolve(network.data);
      } catch (error) {
        reject(error);
      }
    });

    promise
      .then((data) => {
        context.commit("setGrafikBulanan", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    return promise;
  },
  actDistribusiBiaya(context, requestPayload) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.getbydata("finance/distribusi-biaya", requestPayload, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
            "Content-Type": "multipart/form-data",
          },
        });
        resolve(network.data);
      } catch (error) {
        reject(error);
      }
    });

    promise
      .then((data) => {
        context.commit("setDistribusiBiaya", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    return promise;
  },
  actArusKas(context, requestPayload) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.getbydata("finance/arus-kas", requestPayload, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
            "Content-Type": "multipart/form-data",
          },
        });
        resolve(network.data);
      } catch (error) {
        reject(error);
      }
    });

    promise
      .then((data) => {
        context.commit("setArusKas", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    return promise;
  },
  actTrenSaldo(context, requestPayload) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.getbydata("finance/tren-saldo", requestPayload, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
            "Content-Type": "multipart/form-data",
          },
        });
        resolve(network.data);
      } catch (error) {
        reject(error);
      }
    });

    promise
      .then((data) => {
        context.commit("setTrenSaldo", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    return promise;
  },
  actTransaksiTerbaru(context, requestPayload) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.getbydata("finance/transaksi-terbaru", requestPayload, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
            "Content-Type": "multipart/form-data",
          },
        });
        resolve(network.data);
      } catch (error) {
        reject(error);
      }
    });

    promise
      .then((data) => {
        context.commit("setTransaksiTerbaru", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    return promise;
  },
  actRingkasanBulanan(context, requestPayload) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.getbydata("finance/ringkasan-bulanan", requestPayload, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
            "Content-Type": "multipart/form-data",
          },
        });
        resolve(network.data);
      } catch (error) {
        reject(error);
      }
    });

    promise
      .then((data) => {
        context.commit("setRingkasanBulanan", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    return promise;
  },

  actFetchfinancedashAll(context, payload) {
    context.dispatch("actKPI", payload);
    context.dispatch("actGrafikBulanan", payload);
    context.dispatch("actDistribusiBiaya", payload);
    context.dispatch("actArusKas", payload);
    context.dispatch("actTrenSaldo", payload);
    context.dispatch("actTransaksiTerbaru", payload);
    context.dispatch("actRingkasanBulanan", payload);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
