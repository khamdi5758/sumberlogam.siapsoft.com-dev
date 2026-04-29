import api from "@/api";

import { useCookies } from "vue3-cookies";

const { cookies } = useCookies();

const extractCompaniesArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.companies)) return payload.companies;
  // Handle nested pagination structure: companies: { data: [...], current_page: 1, ... }
  if (payload?.companies?.data && Array.isArray(payload.companies.data))
    return payload.companies.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

const extractPaginationMeta = (payload) => {
  const container =
    payload?.data && !Array.isArray(payload.data) ? payload.data : payload;

  const currentPage = Number(container?.current_page);
  const lastPage = Number(container?.last_page);

  if (!Number.isFinite(currentPage) || !Number.isFinite(lastPage)) {
    return null;
  }

  return {
    currentPage,
    lastPage,
  };
};

const dedupeCompaniesById = (companies) => {
  const seen = new Set();

  return companies.filter((company) => {
    const key = String(company?.id ?? company?.company_id ?? "");

    if (!key) {
      return true;
    }

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const normalizeCompanyPayload = (payload = {}) => {
  const normalized = {
    ...payload,
  };

  const normalizeText = (value) => {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return value;
    return String(value);
  };

  const extractedDocs =
    typeof normalized.docs === "object"
      ? normalized.docs?.description
      : normalized.docs;

  const docsValue =
    normalizeText(extractedDocs) ||
    normalizeText(normalized.doc) ||
    normalizeText(normalized.doc_description);

  const noteValue =
    normalizeText(normalized.note) || normalizeText(normalized.notes);

  // Send both key styles so backend mapper can bind whichever it expects.
  normalized.note = noteValue;
  normalized.notes = noteValue;
  normalized.docs = docsValue;
  normalized.doc = docsValue;

  if (
    normalized.task_json === undefined ||
    normalized.task_json === null ||
    normalized.task_json === ""
  ) {
    const taskObj = {
      name: normalizeText(normalized.task_name),
      content: normalizeText(normalized.desktask),
      status: normalizeText(normalized.statustask),
      assignee: normalizeText(normalized.assignee),
      dueDate: normalizeText(normalized.due_date),
      time: normalizeText(normalized.task_time),
      priority: normalizeText(normalized.prioritytask),
      associatedContact: normalizeText(normalized.associated_contact),
    };

    const hasTaskValue = Object.values(taskObj).some((value) => value !== "");
    normalized.task_json = hasTaskValue ? JSON.stringify(taskObj) : null;
  }

  return normalized;
};

const state = {
  company: [],
  companyignin: null,
  companyidsignin: null,
  companybyid: [],
  rescompany: [],
  token: cookies.get("token"),
  isLoading: false,
  error: null,
  viewMode: "list",
  searchQuery: "",
  currentPage: 1,
  itemsPerPage: 10,
  industries: [],
  sources: [],
  type: [],
  companys: [],
};

const getters = {
  getrescompany: (state) => state.rescompany,
  industries: (state) => state.industries,
  sources: (state) => state.sources,
  type: (state) => state.type,
  companyList: (state) => state.company,
  companysignin: (state) => state.companysignin,
  companyidsignin: (state) => state.companyidsignin,
  companybyid: (state) => {
    return state.companybyid?.companies || [];
  },
  companybyidcontactassociated: (state) => {
    return state.companybyid?.contactassoc || [];
  },
  companybyiddealsassociated: (state) => {
    return state.companybyid?.dealsassoc || [];
  },

  allcompany: (state) => state.company,
  allCompanys: (state) => state.companys,
  companyid: (state) => state.companybyid.id,
  isLoading: (state) => state.isLoading,
  error: (state) => state.error,
  currentView: (state) => state.viewMode,
  searchQuery: (state) => state.searchQuery,
  filteredCompanies: (state) => {
    if (!state.searchQuery.trim()) {
      return state.company;
    }
    const query = state.searchQuery.toLowerCase();
    return state.company.filter(
      (company) =>
        company.company_name?.toLowerCase().includes(query) ||
        company.email?.toLowerCase().includes(query) ||
        company.telephone?.toLowerCase().includes(query) ||
        company.country?.toLowerCase().includes(query) ||
        company.city?.toLowerCase().includes(query) ||
        company.industry?.toLowerCase().includes(query),
    );
  },
  currentPage: (state) => state.currentPage,
  itemsPerPage: (state) => state.itemsPerPage,

};

const actions = {
  setCurrentPage({ commit }, page) {
    commit("SET_CURRENT_PAGE", page);
  },
  setItemsPerPage({ commit }, items) {
    commit("SET_ITEMS_PER_PAGE", items);
  },

  fetchAllcompany(context, params) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.getbydata("company", params, {
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
        // console.log("Data received in getcompanys companies page action:", data);
        // context.commit("setcompanys", data);
        context.commit("setrescompany", data.companies);
        if (!params.page || params.page === 1) {
          context.commit("setcompanys", data.companies.data);
        } else {
          // 🔥 kalau page berikutnya → append
          // context.commit("appendcompanys", data.companies.data);
          context.commit("setcompanys", data.companies.data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    return promise;
  },

  oldfetchAllcompany({ commit, state }, params = { page: 1, per_page: 100 }) {
    // Always fetch fresh data to get all companies with pagination support
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    const promise = new Promise(async (resolve, reject) => {
      try {
        let companies = [];
        let currentPage = 1;
        let hasMorePages = true;

        // Fetch all pages with per_page=100 to get all data
        while (hasMorePages) {
          const response = await api.get("company", {
            headers: {
              Authorization: "Bearer " + cookies.get("token"),
            },
            params: {
              page: currentPage,
              per_page: params.per_page || 100,
            },
          });

          const pageData = extractCompaniesArray(response.data);
          companies = companies.concat(pageData);

          const paginationMeta = extractPaginationMeta(response.data);

          if (!paginationMeta || currentPage >= paginationMeta.lastPage) {
            hasMorePages = false;
          } else {
            currentPage++;
          }
        }

        resolve({
          companies: dedupeCompaniesById(companies),
        });
      } catch (error) {
        reject(error);
      }
    });

    promise
      .then((data) => {
        commit("setcompany", data.companies);
        commit("SET_LOADING", false);
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
        commit("SET_ERROR", error.message);
        commit("SET_LOADING", false);
      });

    return promise;
  },

  tcompanyignin({ commit }) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.get("company/", {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });
        resolve(network);
      } catch (error) {
        // Jika endpoint Sanctum tidak bekerja, coba endpoint JWT
        if (error.response && error.response.status === 404) {
          try {
            let jwtNetwork = await api.get("getAuthenticatedcompany", {
              headers: {
                Authorization: "Bearer " + cookies.get("token"),
              },
            });
            resolve(jwtNetwork);
          } catch (jwtError) {
            reject(jwtError);
          }
        } else {
          reject(error);
        }
      }
    });

    promise
      .then((data) => {
        // Handle response dari Sanctum atau JWT
        const companyData = data.data.company || data.data; // JWT mengembalikan langsung company object
        commit("setcompanyidsignin", companyData.id);
        commit("setcompanyignin", companyData);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    return promise;
  },

  fetchcompanybyid(context, id) {
    let data = {
      id: id,
    };
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = api.getbydata("company/fetchcompanybyid", data, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
          // headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        resolve(network);
      } catch (error) {
        reject(error);
      }
    });

    promise.then((data) => {
      console.log("Data received in fetchcompanybyid action:", data);
      context.commit("setcompanybyid", data.data);
      // console.log(data.data);
    });
    // console.log(promise.data);

    // console.log(id);
    return promise;
  },

  insertcompany(context, data) {
    // Jika sudah FormData, teruskan langsung
    if (data instanceof FormData) {
      return context.dispatch("saveCompany", data);
    }
    // Jika object, bungkus seperti biasa (backward compatibility)
    const payload = {
      choice: "i",
      ...(data?.formdata || data),
    };
    return context.dispatch("saveCompany", payload);
  },

  saveCompany(context, payload) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let requestPayload;

        // 🔥 DETECT FormData
        if (payload instanceof FormData) {
          // tambahkan choice langsung ke FormData
          const choice =
            payload.get("choice") || (payload.get("id") ? "u" : "i");
          payload.append("choice", choice);

          requestPayload = payload;
        } else {
          // 🔥 kalau object biasa
          const choice = payload.choice || (payload.id ? "u" : "i");

          requestPayload = normalizeCompanyPayload({
            choice: choice,
            ...payload,
          });
        }

        let network = await api.post("company/input", requestPayload, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
            "Content-Type": "multipart/form-data",
          },
        });

        // Refresh daftar HANYA setelah sukses dan tunggu sampai selesai
        await context.dispatch("fetchAllcompany");
        resolve(network.data);
      } catch (error) {
        reject(error);
      }
    });

    return promise;
  },

  regcompany(context, data) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.post("reg", data, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
          // headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        resolve(network.data);
      } catch (error) {
        reject(error);
      }
      context.dispatch("fetchAllcompany");
    });

    return promise;
  },

  updatecompany(context, data) {
    // Jika sudah FormData, teruskan langsung
    if (data instanceof FormData) {
      return context.dispatch("saveCompany", data);
    }
    // Jika object, bungkus seperti biasa (backward compatibility)
    const payload = {
      choice: "u",
      id: data?.keyedit || data?.id,
      ...(data?.formdata || data),
    };
    return context.dispatch("saveCompany", payload);
  },

  async saveCompanyDetail(context, detailPayload) {
    const headers = {
      Authorization: "Bearer " + cookies.get("token"),
    };

    const requestPayload = normalizeCompanyPayload(detailPayload);
    const response = await api.post("company/input", requestPayload, {
      headers,
    });
    await context.dispatch("fetchAllcompany").catch(() => { });
    return response.data;
  },

  async deletecompany(context, data) {
    const headers = {
      Authorization: "Bearer " + cookies.get("token"),
    };

    const normalizedId = Array.isArray(data)
      ? data.find((id) => id !== null && id !== undefined && id !== "")
      : data;

    if (normalizedId === null || normalizedId === undefined || normalizedId === "") {
      throw new Error("ID company tidak valid untuk delete.");
    }

    try {
      const response = await api.post(
        "company/input",
        {
          choice: "d",
          id: String(normalizedId),
          company_name: "",
          company_owner: "",
          website: "",
          type: "",
          description: "",
          email: "",
          telephone: "",
          website: "",
          industry: "",
          address: "",
          country: "",
          city: "",
          province: "",
          pos_code: "",
          source: "",
          type: "",
          owner: "",
        },
        { headers },
      );
      await context.dispatch("fetchAllcompany");
      return response.data;
    } catch (error) {
      await context.dispatch("fetchAllcompany");
      throw error;
    }
  },

  updateprofile(context, data) {
    // console.log(data);
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.post(`editprofile`, data, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
          // headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        resolve(network.data);
      } catch (error) {
        reject(error);
      }
      // context.dispatch("fetchAllcompany");
    });

    promise.then((data) => {
      // console.log(data);
    });
  },

  setSearchQuery({ commit }, query) {
    commit("SET_SEARCH_QUERY", query);
  },

  savecompanyProfile(context, data) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.post("company/input", data, {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });
        resolve(network.data);
      } catch (error) {
        reject(error);
      }
    });

    promise.then(() => {
      context.dispatch("fetchAllcompany");
    });

    return promise;
  },

  getinduestries(context) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.get("company/industries", {
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
        context.commit("setindustries", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    return promise;
  },

  getsources(context) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.get("company/sources", {
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
        context.commit("setsources", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    return promise;
  },

  gettype(context) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.get("company/type", {
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
        context.commit("settype", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    return promise;
  },

  setViewMode({ commit }, mode) {
    commit("SET_VIEW_MODE", mode);
  },

  saveContactAssociationCompany(context, payload) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.post(
          "company/inputcontactassoccompanies",
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

  saveDealAssociationCompany(context, payload) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.post(
          "company/inputdealsassoccompanies",
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

const mutations = {
  setrescompany(state, rescompany) {
    state.rescompany = rescompany;
  },

  setcompanys(state, payload) {
    // state.companys = payload;
    state.company = payload;
  },

  appendcompanys(state, payload) {
    // state.companys = [...state.companys, ...payload];
    state.company = [...state.company, ...payload];
  },

  setcompany: (state, company) => {
    state.company = company;
  },
  setcompanyignin: (state, company) => {
    state.companyignin = company;
  },
  setcompanyidsignin: (state, company) => {
    state.companyidsignin = company;
  },

  setcompanybyid: (state, company) => {
    state.companybyid = company;
  },

  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  SET_VIEW_MODE(state, mode) {
    state.viewMode = mode;
  },
  SET_SEARCH_QUERY(state, query) {
    state.searchQuery = query;
  },
  SET_CURRENT_PAGE(state, page) {
    state.currentPage = page;
  },
  SET_ITEMS_PER_PAGE(state, items) {
    state.itemsPerPage = items;
  },

  setindustries(state, industries) {
    state.industries = industries;
  },

  setsources(state, sources) {
    state.sources = sources;
  },

  settype(state, type) {
    state.type = type;
  },


  setclearcompanybyid(state) {
    state.companybyid = [];
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
