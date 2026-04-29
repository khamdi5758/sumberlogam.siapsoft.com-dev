import api from "@/api";
import { useCookies } from "vue3-cookies";
import { getDetailEndpointCandidates } from "@/utils/detailFormPayload";
import { buildFormData } from "@/utils/buildFormData";

const { cookies } = useCookies();

const state = {
  contacts: [],
  company: [],
  sources: [],
  status: [],
  pagination: {
    total: 0,
    current_page: 1,
    per_page: 10,
    last_page: 1,
  },
  isLoading: false,
  error: null,
  viewMode: "list",
};

const getters = {
  currentView: (state) => state.viewMode,
  allContacts: (state) => state.contacts,
  getcompany: (state) => state.company,
  pagination: (state) => state.pagination,
  isLoading: (state) => state.isLoading,
  error: (state) => state.error,
  getsources: (state) => state.sources,
  getstatus: (state) => state.status,
};

const normalizeContactData = (contact) => {
  if (!contact) return contact;
  return {
    ...contact,
    first_name: contact.first_name || contact["First Name"] || "",
    last_name: contact.last_name || contact["Last Name"] || "",
    email: contact.email || contact["Email"] || "",
    address: contact.address || contact["Address"] || "",
    telephone_1: contact.telephone_1 || contact["Telephone"] || "",
  };
};

const mutations = {
  setcompany(state, payload) {
    state.company = payload;
  },
  setsources(state, mode) {
    state.sources = mode;
  },
  setstatus(state, mode) {
    state.status = mode;
  },
  SET_VIEW_MODE(state, mode) {
    state.viewMode = mode;
  },
  SET_CONTACTS(state, payload) {
    if (payload && payload.data) {
      // Handle paginated response
      state.contacts = payload.data.map(normalizeContactData);
      state.pagination = {
        total: payload.total || 0,
        current_page: payload.current_page || 1,
        per_page: payload.per_page || 10,
        last_page: payload.last_page || 1,
      };
    } else {
      // Fallback for non-paginated or old format
      const rawContacts = Array.isArray(payload) ? payload : [];
      state.contacts = rawContacts.map(normalizeContactData);
    }
  },
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  DELETE_CONTACT(state, contactId) {
    state.contacts = state.contacts.filter(
      (contact) => contact.id !== contactId,
    );
  },
};

const actions = {
  fetchcompany(context) {
    context.commit("SET_LOADING", true);
    context.commit("SET_ERROR", null);

    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await api.get("contact/company", {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });

    promise
      .then((data) => {
        context.commit("setcompany", data);
        context.commit("SET_LOADING", false);
      })
      .catch((error) => {
        context.commit("SET_ERROR", error.message);
        context.commit("SET_LOADING", false);
      });

    return promise;
  },

  fetchAllContacts({ commit }, params = { page: 1, per_page: 10 }) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await api.get("contact", {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
          params: params,
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });

    promise
      .then((data) => {
        const contactsData = data.contacts || data.data || data;
        commit("SET_CONTACTS", contactsData);
        commit("SET_LOADING", false);
      })
      .catch((error) => {
        console.error("Vuex fetchAllContacts error:", error);
        commit("SET_ERROR", error.message);
        commit("SET_LOADING", false);
      });

    return promise;
  },

  createContact({ commit, dispatch }, contactData) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    // Tentukan choice: 'i' untuk insert (create), 'u' untuk update
    const choice = contactData.id ? "u" : "i";

    const requestPayload = {
      choice,
      ...contactData,
    };

    const { id, ...payloadForFormData } = requestPayload;
    const formPayload = buildFormData(
      payloadForFormData,
      choice === "u",
      id || null,
    );

    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await api.post("contact/input", formPayload, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });

    promise
      .then((data) => {
        const operationType = choice === "i" ? "created" : "updated";
        console.log(`Contact ${operationType} successfully:`, data);
        dispatch("fetchAllContacts");
        commit("SET_LOADING", false);
      })
      .catch((error) => {
        console.error("Vuex createContact error:", error);
        commit("SET_ERROR", error.message);
        commit("SET_LOADING", false);
      });

    return promise;
  },

  // Alias untuk update contact (backward compatibility)
  updateContact({ dispatch }, contactData) {
    return dispatch("createContact", contactData);
  },

  async saveContactDetail({ dispatch }, detailPayload) {
    const headers = {
      Authorization: "Bearer " + cookies.get("token"),
    };

    const endpoints = getDetailEndpointCandidates("contact");
    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const response = await api.post(endpoint, detailPayload, { headers });
        await dispatch("fetchAllContacts").catch(() => { });
        return response.data;
      } catch (error) {
        const status = error?.response?.status;
        if (status === 404 || status === 405) {
          lastError = error;
          continue;
        }
        throw error;
      }
    }

    throw (
      lastError ||
      new Error("Endpoint detail contact tidak ditemukan di backend.")
    );
  },

  // async deleteContact({ commit, dispatch }, contactId) {
  //   const headers = {
  //     Authorization: "Bearer " + cookies.get("token"),
  //   };

  //   try {
  //     const response = await api.post(
  //       "contact/input",
  //       { choice: "d", id: contactId },
  //       { headers },
  //     );
  //     commit("DELETE_CONTACT", contactId);
  //     await dispatch("fetchAllContacts").catch(() => {});
  //     return response.data;
  //   } catch (error) {
  //     await dispatch("fetchAllContacts").catch(() => {});
  //     throw error;
  //   }
  // },

  deleteContact({ commit, dispatch }, contactId) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    const requestPayload = {
      choice: "d",
      id: contactId,
      first_name: "", // Required by backend API even when deleting
      last_name: "", // Required by backend API even when deleting
      job_title: "",
      owner: "",
      email: "",
      telephone_1: "",
      telephone_2: "",
      telephone_3: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      notes: "",
      status: "",
      company_id: "",
      deal_id: "",
      company_label: "",
      deal_label: "",
      province: "",
      city: "",
      pos_code: "",
      country: "",
      source: "",
    };

    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await api.post("contact/input", requestPayload, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });

    promise
      .then((data) => {
        commit("DELETE_CONTACT", contactId);
        dispatch("fetchAllContacts");
        commit("SET_LOADING", false);
      })
      .catch((error) => {
        console.error("Vuex createContact error:", error);
        dispatch("fetchAllContacts");
        commit("SET_ERROR", error.message);
        commit("SET_LOADING", false);
      });

    return promise;
  },

  setViewMode({ commit }, mode) {
    commit("SET_VIEW_MODE", mode);
  },

  fetchContactById({ commit }, contactId) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await api.get(
          `contact/fetchcontactbyid?id=${contactId}`,
          {
            headers: {
              Authorization: "Bearer " + cookies.get("token"),
            },
          },
        );
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });

    promise
      .then((data) => {
        commit("SET_LOADING", false);
      })
      .catch((error) => {
        console.error("Vuex fetchContactById error:", error);
        commit("SET_ERROR", error.message);
        commit("SET_LOADING", false);
      });

    return promise;
  },

  fetchsources(context, data) {
    context.commit("SET_LOADING", true);
    context.commit("SET_ERROR", null);

    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await api.get(`contact/sources`, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });

    promise
      .then((data) => {
        context.commit("setsources", data);
        context.commit("SET_LOADING", false);
      })
      .catch((error) => {
        context.commit("SET_ERROR", error.message);
        context.commit("SET_LOADING", false);
      });

    return promise;
  },

  fetchstatus(context, data) {
    context.commit("SET_LOADING", true);
    context.commit("SET_ERROR", null);

    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await api.get(`contact/status`, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });

    promise
      .then((data) => {
        context.commit("setstatus", data);
        context.commit("SET_LOADING", false);
      })
      .catch((error) => {
        context.commit("SET_ERROR", error.message);
        context.commit("SET_LOADING", false);
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
