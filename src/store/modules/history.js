import api from "@/api";
import { useCookies } from "vue3-cookies";
import { getDetailEndpointCandidates } from "@/utils/detailFormPayload";

const { cookies } = useCookies();

const state = {
  history: [],
};

const getters = {
  history: (state) => state.history,
};

const mutations = {
  setHistory(state, payload) {
    state.history = payload;
  },

};

const actions = {
  acthistory(context, params = {}) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.getbydata("history", params, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });
        resolve(network.data);
      } catch (error) {
        reject(error);
      }
    });

    promise
      .then((data) => {
        console.log("Data received in acthistory action:", data);
        // context.commit("setHistory", data);
        context.commit("setHistory", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    return promise;
  },


  saveNote(context, payload = {}) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.post(
          "history/inputnote",
          payload,
          {
            headers: {
              Authorization: "Bearer " + cookies.get("token"),
              "Content-Type": "multipart/form-data",
            },
          },
        );

        resolve(network.data);
      } catch (error) {
        reject(error);
      }
    });

    return promise;
  },

};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
