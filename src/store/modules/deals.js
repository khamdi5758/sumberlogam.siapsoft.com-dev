import api from "@/api";
import { useCookies } from "vue3-cookies";
import { getDetailEndpointCandidates } from "@/utils/detailFormPayload";
import { buildFormData } from "@/utils/buildFormData";

const { cookies } = useCookies();

const normalizeNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeAssociationId = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
};

const resolveDealId = (responseData, fallbackId = null) => {
  const candidates = [
    responseData?.deal?.id,
    responseData?.data?.id,
    responseData?.id,
    responseData?.deal_id,
    fallbackId,
  ];

  return (
    candidates.find(
      (candidate) =>
        candidate !== "" && candidate !== null && candidate !== undefined,
    ) || null
  );
};

const mapCreateDealPayload = (formData = {}) => {
  const normalizeText = (value) => {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return value;
    return String(value);
  };

  const normalizedAmount = normalizeNumber(
    formData.amount ?? formData.amount_value,
  );
  const normalizedDealName =
    formData.dealName?.trim() ||
    formData.deal_name?.trim() ||
    formData.name?.trim() ||
    formData.title?.trim() ||
    null;
  const normalizedPipeline =
    formData.pipeline || formData.stage || formData.status || "prospect";

  // Helper to ensure association is a string
  const formatAssoc = (assoc) => {
    if (Array.isArray(assoc)) {
      const normalized = assoc
        .map((item) => (item === undefined || item === null ? "" : item))
        .map((item) => String(item).trim())
        .filter(Boolean);
      return normalized.length ? normalized.join(",") : null;
    }

    if (assoc === undefined || assoc === null) {
      return null;
    }

    const normalized = String(assoc).trim();
    return normalized || null;
  };

  // Helper untuk extract task data
  const extractTaskData = (task) => {
    const fallbackTask = {
      name: formData.task_name || formData.title || "",
      content: formData.desktask || formData.task_content || "",
      status: formData.statustask || formData.status || "",
      priority: formData.prioritytask || "",
      dueDate: formData.due_date || formData.dueDate || "",
      time: formData.task_time || formData.time || "",
      task_name: formData.task_name || formData.title || "",
      desktask: formData.desktask || formData.task_content || "",
      statustask: formData.statustask || formData.status || "",
      prioritytask: formData.prioritytask || "",
      due_date: formData.due_date || formData.dueDate || "",
      task_time: formData.task_time || formData.time || "",
    };

    const taskCandidate =
      task && typeof task === "object" && Object.keys(task).length > 0
        ? task
        : fallbackTask;

    const isBlank = (v) =>
      v === null || v === undefined || String(v).trim() === "";

    // Abaikan task object default yang hanya berisi field kosong/null.
    if (typeof taskCandidate === "object") {
      const rawValues = [
        taskCandidate.name,
        taskCandidate.title,
        taskCandidate.content,
        taskCandidate.status,
        taskCandidate.priority,
        taskCandidate.dueDate,
        taskCandidate.time,
      ];

      if (rawValues.every(isBlank)) {
        return null;
      }
    }

    if (typeof taskCandidate === "object") {
      return {
        name: normalizeText(taskCandidate.name || taskCandidate.title),
        content: normalizeText(taskCandidate.content),
        status: normalizeText(taskCandidate.status),
        priority: normalizeText(taskCandidate.priority),
        dueDate: normalizeText(taskCandidate.dueDate),
        time: normalizeText(taskCandidate.time),
        task_name: normalizeText(
          taskCandidate.task_name || taskCandidate.name || taskCandidate.title,
        ),
        desktask: normalizeText(
          taskCandidate.desktask || taskCandidate.content,
        ),
        statustask: normalizeText(
          taskCandidate.statustask || taskCandidate.status,
        ),
        prioritytask: normalizeText(
          taskCandidate.prioritytask || taskCandidate.priority,
        ),
        due_date: normalizeText(
          taskCandidate.due_date || taskCandidate.dueDate,
        ),
        task_time: normalizeText(taskCandidate.task_time || taskCandidate.time),
      };
    }

    return null;
  };

  const normalizeStringOrNull = (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  };

  const docsDescription =
    normalizeStringOrNull(formData.docs?.description) ||
    normalizeStringOrNull(formData.doc);

  const docsFiles = Array.isArray(formData.docs?.files)
    ? formData.docs.files
    : [];

  const docsPayload =
    docsDescription || docsFiles.length
      ? {
        description: docsDescription,
        fileSource: normalizeStringOrNull(formData.docs?.fileSource) || "",
        files: docsFiles,
      }
      : null;

  const taskPayload = extractTaskData(formData.task);
  // SELALU konvert task ke JSON string, jangan null - backend SP akan filter kalau kosong
  const taskJsonValue = taskPayload
    ? JSON.stringify(taskPayload)
    : formData.task && Object.keys(formData.task).length > 0
      ? JSON.stringify(formData.task)
      : null;

  return {
    // Mapping utama sesuai kolom DB
    deal_name: normalizedDealName,
    pipeline: normalizedPipeline,
    currency: formData.currency || "IDR",
    amount_value: normalizedAmount,
    expected_close_date:
      formData.expectedCloseDate || formData.expected_close_date || null,
    owner: formData.owner_id || formData.id_owner || formData.id_user || formData.owner || null,
    owner_id: formData.owner_id || formData.id_owner || formData.id_user || null,
    priority: formData.priority || null,
    source: formData.source || null,
    probability: formData.probability || null,
    status: formData.status ?? 1,
    // Associations
    contactassoc: formatAssoc(formData.contactassoc || formData.contacts_id || formData.contact_id),
    companyassoc: formatAssoc(formData.companyassoc || formData.companies_id || formData.company_id),
    // Notes, Tasks, & Docs - penting: backend expect lowercase singular keys
    // Support both 'notes' dan 'note' untuk backward compatibility
    note:
      normalizeText(
        formData.note || formData.notes || formData.noteData?.body,
      ).trim() || null,
    notes:
      normalizeText(
        formData.note || formData.notes || formData.noteData?.body,
      ).trim() || null,
    task_json: taskJsonValue,
    task: taskPayload,
    docs: docsPayload,
    doc: docsDescription,
    // Alias untuk kompatibilitas variasi backend
    name: normalizedDealName,
    dealName: normalizedDealName,
    amount: normalizedAmount,
    stage: normalizedPipeline,
    expectedCloseDate:
      formData.expectedCloseDate || formData.expected_close_date || null,
  };
};

const mapBoardStageToPipeline = (stage) => {
  const stageMap = {
    new: 1,
    qualified: 2,
    proposal: 3,
    negotiation: 4,
    close_won: 5,
    close_lost: 6,
    // Backward compatibility for old keys
    prospect: 1,
    offer: 3,
    closed_won: 5,
    closed_lost: 6,
    closed_cancel: 6,
    won: 5,
    lost: 6,
    cancel: 6,
  };

  return stageMap[stage] || stage || 1;
};

const normalizeStage = (rawStage) => {
  const stage = String(rawStage || "new")
    .toLowerCase()
    .trim();

  if (stage === "1" || stage === "new" || stage === "prospect") return "new";
  if (stage === "2" || stage.includes("qual")) return "qualified";
  if (stage === "3" || stage.includes("prop") || stage.includes("offer") || stage.includes("payment")) return "proposal";
  if (stage === "4" || stage.includes("negot") || stage.includes("adv")) return "negotiation";
  if (stage === "5" || stage.includes("won") || stage.includes("close_won") || stage.includes("close won")) return "close_won";
  if (stage === "6" || stage.includes("lost") || stage.includes("close_lost") || stage.includes("close lost") || stage.includes("closed_los")) return "close_lost";

  if (stage.includes("closed")) return "close_won";

  return "new";
};

export default {
  namespaced: true,

  state: () => ({
    deals: [],
    viewMode: "card", // default
    isLoading: false,
    error: null,
    searchQuery: "", // Add search state
    pagination: null, // Add pagination state
    sources: null,
    pipelines: null,
    priority: null,
    users: null,
    company: null,
    contact: null
  }),

  mutations: {
    setsources(state, sources) {
      state.sources = sources;
    },
    setpipelines(state, pipelines) {
      state.pipelines = Array.isArray(pipelines)
        ? pipelines.map((p) => ({
          ...p,
          label: p.pipeline_name || p.name || p.label,
          value: p.id_pipeline || p.id || p.value,
        }))
        : [];
    },
    setpriority(state, priority) {
      state.priority = priority;
    },
    setusers(state, users) {
      state.users = users;
    },
    setcompany(state, company) {
      state.company = company;
    },
    setcontact(state, contact) {
      state.contact = contact;
    },
    RESET_CONTACTS(state) {
      state.contact = null;
    },
    SET_VIEW_MODE(state, mode) {
      state.viewMode = mode;
    },

    SET_DEALS(state, deals) {
      state.deals = deals;
    },

    ADD_DEAL(state, deal) {
      if (!deal) return;
      // Map properties if needed to match frontend expectation
      const normalizedDeal = {
        ...deal,
        id: deal.id || Date.now(), // Fallback ID if missing
        name: deal.deal_name || deal.dealName || deal.name || "New Deal",
        stage: deal.pipeline || deal.stage || "prospect",
        amount: deal.amount_value || deal.amount || 0,
      };
      state.deals = [normalizedDeal, ...state.deals];
    },

    UPDATE_DEAL_STAGE(state, payload) {
      const { dealId, newStage } = payload;
      const targetDeal = state.deals.find((deal) => deal.id === dealId);
      if (targetDeal) {
        targetDeal.stage = newStage;
      }
    },

    UPDATE_DEAL(state, payload) {
      const { dealId, updatedData } = payload;
      const index = state.deals.findIndex(
        (deal) => String(deal.id) === String(dealId),
      );
      if (index !== -1) {
        // Create new array to trigger Vue 3 reactivity
        const newDeals = [...state.deals];
        newDeals[index] = { ...newDeals[index], ...updatedData };
        state.deals = newDeals;
      }
    },

    DELETE_DEAL(state, dealId) {
      state.deals = state.deals.filter((deal) => deal.id !== dealId);
    },

    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading;
    },

    SET_ERROR(state, error) {
      state.error = error;
    },

    SET_SEARCH_QUERY(state, query) {
      state.searchQuery = query;
    },

    SET_PAGINATION(state, pagination) {
      state.pagination = pagination;
    },
  },

  actions: {
    setViewMode({ commit }, mode) {
      commit("SET_VIEW_MODE", mode);
    },

    setSearchQuery({ commit }, query) {
      commit("SET_SEARCH_QUERY", query);
    },

    fetchAllDeals({ commit }, params = {}) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      const requestParams = { ...params };
      // Hapus &q= jika kosong agar backend tidak bingung
      if (
        requestParams.q === "" ||
        requestParams.q === null ||
        requestParams.q === undefined
      ) {
        delete requestParams.q;
      }

      const promise = new Promise(async (resolve, reject) => {
        try {
          const response = await api.get("deals", {
            params: requestParams,
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
          // Tangani struktur paginasi Laravel (deals.data)
          const dealsData = data.deals?.data || data.deals || data.data || data;

          commit("SET_DEALS", Array.isArray(dealsData) ? dealsData : []);

          // Simpan info paginasi jika ada
          if (data.deals && data.deals.current_page) {
            const { data: _, ...pagination } = data.deals;
            commit("SET_PAGINATION", pagination);
          } else if (data.current_page) {
            const { data: _, ...pagination } = data;
            commit("SET_PAGINATION", pagination);
          }

          commit("SET_LOADING", false);
        })
        .catch((error) => {
          const status = error?.response?.status;
          const serverMessage = error?.response?.data?.message;
          commit(
            "SET_ERROR",
            serverMessage ||
            (status
              ? status === 404
                ? "Endpoint deals tidak ditemukan di server (404)."
                : `Fetch deals gagal (HTTP ${status})`
              : error.message || "Failed to fetch deals"),
          );
          commit("SET_LOADING", false);
        });

      return promise;
    },

    fetchDealById({ commit }, id) {
      commit("SET_LOADING", true);
      const promise = new Promise(async (resolve, reject) => {
        try {
          const response = await api.get(`deals/fetchdealsbyid?id=${id}`, {
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
          commit("SET_LOADING", false);
          return data;
        })
        .catch((error) => {
          commit("SET_LOADING", false);
          throw error;
        });

      return promise;
    },

    fetchProjectsByDeal({ commit }, id) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await api.get(`deals/project?dealid=${id}`, {
            headers: {
              Authorization: "Bearer " + cookies.get("token"),
            },
          });
          resolve(response.data?.projects || response.data?.data || response.data || []);
        } catch (error) {
          reject(error);
        }
      });
    },

    async updateDealStage({ commit, state, dispatch }, payload) {
      const { dealId, newStage } = payload;

      // Map stage name (key) back to actual ID from state.pipelines if available
      let pipelineValue = mapBoardStageToPipeline(newStage);
      if (state.pipelines && Array.isArray(state.pipelines)) {
        const found = state.pipelines.find(
          (p) =>
            String(p.label).toLowerCase() === String(newStage).toLowerCase() ||
            String(p.value) === String(newStage),
        );
        if (found) pipelineValue = found.value;
      }

      // Cari deal yang akan diupdate untuk mendapatkan data lengkapnya
      const existingDeal = state.deals.find(
        (deal) => String(deal.id) === String(dealId),
      );
      if (!existingDeal) return;

      const previousStage =
        existingDeal.stage || normalizeStage(existingDeal.pipeline);

      // Optimistic update
      commit("UPDATE_DEAL_STAGE", { dealId, newStage });

      const headers = {
        Authorization: "Bearer " + cookies.get("token"),
      };

      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Helper to ensure association is a string
      const formatAssoc = (assoc) => {
        if (Array.isArray(assoc)) {
          const normalized = assoc
            .map((item) => (item === undefined || item === null ? "" : item))
            .map((item) => String(item).trim())
            .filter(Boolean);
          return normalized.length ? normalized.join(",") : null;
        }
        if (assoc && typeof assoc === "object") {
          const normalized = String(assoc.id || "").trim();
          return normalized || null;
        }
        if (assoc === undefined || assoc === null) return null;
        const normalized = String(assoc).trim();
        return normalized || null;
      };

      const parseJSON = (value, fallback = null) => {
        try {
          if (!value) return fallback;
          if (typeof value === "object") return value;
          return JSON.parse(value);
        } catch {
          return fallback;
        }
      };

      const cAssoc = formatAssoc(
        existingDeal.contactassoc ||
        existingDeal.dealsassoc ||
        existingDeal.contacts_id ||
        existingDeal.contact_id ||
        existingDeal.id_contact,
      );
      const mAssoc = formatAssoc(
        existingDeal.companyassoc ||
        existingDeal.companies_id ||
        existingDeal.company_id ||
        existingDeal.id_company,
      );

      const firstContactId = cAssoc ? String(cAssoc).split(",")[0] || "" : "";
      const firstCompanyId = mAssoc ? String(mAssoc).split(",")[0] || "" : "";

      const taskFromDb = parseJSON(existingDeal.task_json, null);
      const stageTask =
        taskFromDb && typeof taskFromDb === "object"
          ? taskFromDb
          : {
            name: existingDeal.task_name || "",
            content: existingDeal.desktask || "",
            status: existingDeal.statustask || "",
            priority: existingDeal.prioritytask || "",
            dueDate: existingDeal.due_date || "",
            time: existingDeal.task_time || "",
          };

      const hasStageTask = Object.values(stageTask).some(
        (value) => String(value || "").trim() !== "",
      );

      const docsDescription =
        (typeof existingDeal.docs === "object"
          ? existingDeal.docs?.description
          : existingDeal.docs || existingDeal.doc || "") || "";

      const requestPayload = {
        choice: "u",
        id: dealId,
        id_deals: dealId,
        deal_name:
          existingDeal.deal_name ||
          existingDeal.name ||
          existingDeal.dealName ||
          "Untitled Deal",
        name: existingDeal.name || existingDeal.deal_name || "Untitled Deal",
        dealName:
          existingDeal.deal_name || existingDeal.name || "Untitled Deal",
        pipeline: pipelineValue,
        stage: pipelineValue,
        pipeline_id: pipelineValue, // Ensure ID is sent
        currency: existingDeal.currency || "IDR",
        amount_value: existingDeal.amount_value || existingDeal.amount || null,
        amount: existingDeal.amount_value || existingDeal.amount || null,
        expected_close_date:
          existingDeal.expected_close_date ||
          existingDeal.expectedCloseDate ||
          null,
        owner:
          existingDeal.owner_id ||
          existingDeal.id_owner ||
          existingDeal.id_user ||
          existingDeal.owner ||
          null,
        owner_id:
          existingDeal.owner_id ||
          existingDeal.id_owner ||
          existingDeal.id_user ||
          null,
        priority: existingDeal.priority_id || existingDeal.priority || null,
        priority_id: existingDeal.priority_id || existingDeal.priority || null,
        source: existingDeal.source_id || existingDeal.source || null,
        source_id: existingDeal.source_id || existingDeal.source || null,
        updated_at: now,

        // Backend strongly requires these association fields (Flattened)
        contactassoc: cAssoc,
        companyassoc: mAssoc,
        contacts_id: firstContactId,
        companies_id: firstCompanyId,
        contact_id: firstContactId,
        company_id: firstCompanyId,

        // Notes, Tasks, & Docs
        note: existingDeal.note || existingDeal.notes || "",
        notes: existingDeal.notes || "",
        task: hasStageTask ? stageTask : null,
        docs: docsDescription
          ? {
            description: String(docsDescription),
          }
          : null,
        doc: docsDescription || null,
      };

      try {
        await api.post("deals/input", requestPayload, { headers });

        // PENTING: Refresh state dengan parameter yang sama agar tampilan tidak reset
        await dispatch("fetchAllDeals", {
          page: state.pagination?.current_page || 1,
          per_page: state.pagination?.per_page || 10,
          q: state.searchQuery,
        });

        return { success: true };
      } catch (error) {
        // Rollback jika gagal
        commit("UPDATE_DEAL_STAGE", {
          dealId,
          newStage: previousStage,
        });
        throw error;
      }
    },

    async saveDeal({ dispatch, commit, state }, formData) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      const promise = new Promise(async (resolve, reject) => {
        try {
          const choice = formData.choice || (formData.id ? "u" : "i");
          const mappedData = mapCreateDealPayload(formData);

          const payload = {
            ...formData,
            ...mappedData,
            choice,
          };

          const { choice: _choice, id, id_deals, ...payloadForForm } = payload;

          const requestPayload = buildFormData(
            payloadForForm,
            choice === "u",
            id || id_deals || null,
          );

          const response = await api.post("deals/input", requestPayload, {
            headers: {
              Authorization: "Bearer " + cookies.get("token"),
              //"Content-Type": "multipart/form-data",
            },
          });

          if (
            response?.data?.msg === "gagal" ||
            response?.data?.success === false
          ) {
            throw new Error(
              response?.data?.message || "Backend gagal menyimpan deal.",
            );
          }

          await dispatch("fetchAllDeals", {
            page: state.pagination?.current_page || 1,
            per_page: state.pagination?.per_page || 10,
            q: state.searchQuery,
          });

          resolve(response.data);
        } catch (error) {
          reject(error);
        }
      });

      promise
        .then(() => {
          commit("SET_LOADING", false);
        })
        .catch((error) => {
          const status = error?.response?.status;
          const serverMessage = error?.response?.data?.message;
          commit(
            "SET_ERROR",
            serverMessage ||
            (status
              ? `Save deal gagal (HTTP ${status})`
              : error?.message || "Failed to save deal"),
          );
          commit("SET_LOADING", false);
        });

      return promise;
    },

    createDeal({ dispatch }, formData) {
      const mappedData = mapCreateDealPayload(formData);
      const payload = {
        ...formData,
        ...mappedData,
        choice: formData.choice || (formData.id ? "u" : "i"),
      };

      return dispatch("saveDeal", payload);
    },

    // Backward compatibility for older callers that still dispatch `deals/input`.
    input({ dispatch }, formData) {
      return dispatch("createDeal", formData);
    },

    async updateDeal({ dispatch }, payload) {
      const { keyedit, formdata } = payload;

      // Gunakan saveDeal dengan choice='u' untuk backward compatibility
      const requestPayload = {
        choice: "u",
        id: keyedit,
        ...formdata,
        // Backend strictly requires amount_value
        amount_value:
          formdata.amount !== undefined
            ? formdata.amount
            : formdata.amount_value,
      };

      return dispatch("saveDeal", requestPayload);
    },

    async saveDealDetail({ dispatch }, detailPayload) {
      const headers = {
        Authorization: "Bearer " + cookies.get("token"),
      };

      const endpoints = getDetailEndpointCandidates("deal");
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          const response = await api.post(endpoint, detailPayload, { headers });
          await dispatch("fetchAllDeals").catch(() => { });
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
        new Error("Endpoint detail deal tidak ditemukan di backend.")
      );
    },

    async deleteDeal({ commit, dispatch }, dealId) {
      const headers = {
        Authorization: "Bearer " + cookies.get("token"),
      };

      try {
        const response = await api.post(
          "deals/input",
          {
            choice: "d",
            id: dealId,
            // Tambahkan semua field yang ada (isi kosong) untuk kompatibilitas
            deal_name: "",
            pipeline: "",
            currency: "",
            amount_value: "",
            expected_close_date: "",
            owner: "",
            priority: "",
            source: "",
            description: "",
            contactassoc: "",
            companyassoc: "",
            notes: "",
            docs: "",
          },
          { headers },
        );
        commit("DELETE_DEAL", dealId);
        await dispatch("fetchAllDeals").catch(() => { });
        return response.data;
      } catch (error) {
        await dispatch("fetchAllDeals").catch(() => { });
        throw error;
      }
    },

    fetchsources(context, data) {
      context.commit("SET_LOADING", true);
      context.commit("SET_ERROR", null);

      const promise = new Promise(async (resolve, reject) => {
        try {
          const response = await api.get(`deals/sources`, {
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

    fetchpipelines(context, data) {
      context.commit("SET_LOADING", true);
      context.commit("SET_ERROR", null);

      const promise = new Promise(async (resolve, reject) => {
        try {
          const response = await api.get(`deals/pipelines`, {
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
          context.commit("setpipelines", data);
          context.commit("SET_LOADING", false);
        })
        .catch((error) => {
          context.commit("SET_ERROR", error.message);
          context.commit("SET_LOADING", false);
        });

      return promise;
    },

    fetchpriority(context, data) {
      context.commit("SET_LOADING", true);
      context.commit("SET_ERROR", null);

      const promise = new Promise(async (resolve, reject) => {
        try {
          const response = await api.get(`deals/priority`, {
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
          context.commit("setpriority", data);
          context.commit("SET_LOADING", false);
        })
        .catch((error) => {
          context.commit("SET_ERROR", error.message);
          context.commit("SET_LOADING", false);
        });

      return promise;
    },

    fetchusers(context, data) {
      context.commit("SET_LOADING", true);
      context.commit("SET_ERROR", null);

      const promise = new Promise(async (resolve, reject) => {
        try {
          const response = await api.get(`deals/users`, {
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
          context.commit("setusers", data);
          context.commit("SET_LOADING", false);
        })
        .catch((error) => {
          context.commit("SET_ERROR", error.message);
          context.commit("SET_LOADING", false);
        });

      return promise;
    },

    fetchcompany(context, data) {
      context.commit("SET_LOADING", true);
      context.commit("SET_ERROR", null);

      const promise = new Promise(async (resolve, reject) => {
        try {
          const response = await api.get(`deals/company`, {
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

    fetchcontact(context, params = {}) {
      context.commit("SET_LOADING", true);
      context.commit("SET_ERROR", null);

      const promise = new Promise(async (resolve, reject) => {
        try {
          const response = await api.get(`deals/contact`, {
            params: params,
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
          context.commit("setcontact", data);
          context.commit("SET_LOADING", false);
        })
        .catch((error) => {
          context.commit("SET_ERROR", error.message);
          context.commit("SET_LOADING", false);
        });

      return promise;
    },

  },

  getters: {
    getsources: (state) => state.sources,
    getpipelines: (state) => state.pipelines,
    getpriority: (state) => state.priority,
    getusers: (state) => state.users,
    getcompany: (state) => state.company,
    getcontact: (state) => state.contact,
    currentView: (state) => state.viewMode || "card",
    allDeals: (state) => state.deals,
    isLoading: (state) => state.isLoading,
    error: (state) => state.error,
    searchQuery: (state) => state.searchQuery,
    filteredDeals: (state) => {
      if (!state.searchQuery.trim()) {
        return state.deals;
      }
      const query = state.searchQuery.toLowerCase();
      return state.deals.filter((deal) => {
        return (
          deal.dealName?.toLowerCase().includes(query) ||
          deal.name?.toLowerCase().includes(query) ||
          deal.deal_name?.toLowerCase().includes(query)
        );
      });
    },

    pagination: (state) => state.pagination,
    uiDeals: (state, getters) => {
      const normalizeAssocText = (value) => {
        if (value === null || value === undefined) return "";

        if (Array.isArray(value)) {
          return value
            .map((item) => {
              if (item && typeof item === "object") {
                return (
                  item.name ||
                  item.contact_name ||
                  item.company_name ||
                  item.label ||
                  item.id ||
                  ""
                );
              }
              return item;
            })
            .filter(Boolean)
            .join(", ");
        }

        if (typeof value === "object") {
          return (
            value.name ||
            value.contact_name ||
            value.company_name ||
            value.label ||
            value.id ||
            ""
          );
        }

        return String(value).trim();
      };

      const normalizeStage = (rawStage) => {
        const stage = String(rawStage || "prospect")
          .toLowerCase()
          .trim();

        // Handle encoded format "closed:won", "closed:lost", "closed:cancel"
        if (stage.startsWith("closed:")) {
          const [_, status] = stage.split(":");
          if (status === "won") return "closed_won";
          if (status === "lost") return "closed_lost";
          if (status === "cancel") return "closed_cancel";
          return "closed";
        }

        if (stage.includes("prospect") || stage === "new") return "prospect";
        if (stage.includes("qual")) return "qualified";
        if (
          stage.includes("offer") ||
          stage.includes("proposal") ||
          stage.includes("payment")
        )
          return "offer";
        if (stage.includes("negot") || stage.includes("adv"))
          return "negotiation";
        if (stage === "closed_los") return "closed_lost";
        if (stage === "closed_can") return "closed_cancel";
        if (stage.includes("won") || stage.includes("closed_won"))
          return "closed_won";
        if (stage.includes("lost") || stage.includes("closed_lost"))
          return "closed_lost";
        if (stage.includes("cancel") || stage.includes("closed_cancel"))
          return "closed_cancel";
        if (stage.includes("closed")) return "closed";
        return "prospect";
      };

      return getters.filteredDeals.map((deal) => {
        const contactText =
          normalizeAssocText(deal.associated_contact) ||
          normalizeAssocText(deal.contact_name) ||
          normalizeAssocText(deal.contact) ||
          normalizeAssocText(deal.contactassoc);

        const companyText =
          normalizeAssocText(deal.associated_company) ||
          normalizeAssocText(deal.company_name) ||
          normalizeAssocText(deal.company) ||
          normalizeAssocText(deal.companyassoc);

        const amountValue = deal.amount_value ?? deal.amount ?? "-";
        const updatedValue =
          deal.updated_at || deal.updatedAt || deal.update_at || "-";

        const rawStage =
          deal.stage ||
          deal.pipeline ||
          deal.pipelinenm ||
          deal.id_pipeline ||
          deal.pipeline_id;

        let normalizedStage = "new";
        const stageStr = String(rawStage || "new").toLowerCase().trim();

        // Dynamic check
        if (state.pipelines && state.pipelines.length > 0) {
          const found = state.pipelines.find(p =>
            String(p.id_pipeline || p.value || "").toLowerCase() === stageStr ||
            String(p.pipeline_name || p.label || "").toLowerCase().trim() === stageStr
          );
          if (found) {
            const name = String(found.pipeline_name || found.label || "").toLowerCase();
            normalizedStage = (name.includes("won") || name.includes("lost") || name.includes("close"))
              ? (name.includes("won") ? "Close Won" : "Close Lost")
              : name.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          } else {
            const staticStage = normalizeStage(rawStage);
            normalizedStage = staticStage.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          }
        } else {
          const staticStage = normalizeStage(rawStage);
          normalizedStage = staticStage.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }

        return {
          ...deal,
          name: deal.deal_name || deal.dealName || deal.name || "Untitled Deal",
          stage: normalizedStage,
          amount: amountValue,
          jumlah: amountValue,
          tertanggal: deal.expected_close_date || deal.expectedCloseDate || "-",
          associated_contact: contactText || "-",
          contact: contactText || "-",
          company: companyText || "-",
          updated_at: updatedValue,
          updatedAt: updatedValue,
          owner: deal.owner_name || deal.owner || "-",
        };
      });
    },
  },
};
