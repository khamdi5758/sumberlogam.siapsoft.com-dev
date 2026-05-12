import api from "@/api";
import { useCookies } from "vue3-cookies";

const { cookies } = useCookies();

const normalizeProjectStatus = (statusRaw) => {
    const status = String(statusRaw || "not_started")
        .toLowerCase()
        .replace(/\s+/g, "_");

    if (status.includes("progress")) return "in_progress";
    if (status.includes("wait")) return "waiting";
    if (status.includes("complete") || status.includes("done"))
        return "completed";
    if (status.includes("defer")) return "deferred";
    return "not_started";
};

const normalizeProject = (project = {}, index = 0) => {
    const fallbackId = `${project?.project_name || project?.title || project?.name || "project"}-${index}`;
    const status = normalizeProjectStatus(
        project.status || project.stage || project.pipeline,
    );
    const projectName = project.project_name || project.title || project.name || "Untitled Project";
    const description = project.description || project.task_content || "";
    const assignee = project.assignee || project.owner || project.user_name || "";
    const dueDate =
        project.due_date ||
        project.dueDate ||
        project.date ||
        project.deadline ||
        project.start ||
        null;
    const projectTime = project.project_time || project.time || project.due_time || null;
    const priority = project.priority || "";

    return {
        ...project,
        id: project.id ?? project.project_id ?? project.id_project ?? fallbackId,
        project_name: projectName,
        description,
        status: status,
        status_id: project.status_id || project.id_status || project.id_project_status || null,
        deal_id: project.deal_id || project.id_deals || project.id_deal || null,
        leader_id: project.leader_id || project.id_leader || project.assignee_id || project.id_user || null,
        deal_name: project.deal_name || project.deal?.name || project.name_deal || "-",
        leader_name: project.leader_name || project.leader?.name || project.user_name || project.name_user || project.assignee || "-",
        status_name: project.status_name || project.status?.name || project.project_status || project.name_status || "-",
        address: project.address || "-",
        kd_kelurahan: project.kd_kelurahan || "-",
        assignee: assignee || "-",
        due_date: dueDate,
        project_time: projectTime,
        priority,
        // UI aliases so existing components keep working
        title: projectName,
        name: projectName,
        stage: status,
        owner: assignee || "-",
        dueDate: dueDate,
        time: projectTime,
    };
};

const mapProjectPayload = (formData = {}) => {
    const normalizeText = (value) => {
        if (value === undefined || value === null) return "";
        if (typeof value === "string") return value.trim();
        return String(value).trim();
    };

    const taskPayload = formData.task && Object.keys(formData.task).length > 0 ? formData.task : null;
    const noteBody = normalizeText(
        formData.note || formData.notes || formData.noteData?.body,
    );
    const notePayload = formData.noteData && Object.keys(formData.noteData).length > 0
        ? formData.noteData
        : null;
    const locationPayload = formData.locationData || null;
    const historyPayload = Array.isArray(formData.historyitems)
        ? formData.historyitems
        : [];

    return {
        project_name: (
            formData.project_name || 
            formData.projectName || 
            formData.project_title ||
            formData.title || 
            formData.name || 
            ""
        ).toString().trim(),
        deal_id: formData.deal_id || formData.deal || null,
        leader_id: formData.leader_id || null,
        description: formData.description || "",
        address: formData.address || "",
        kd_kelurahan: formData.kd_kelurahan || formData.kelurahan || "",
        location: formData.location || "",
        locationData: locationPayload,
        status_id: formData.status_id || formData.status || formData.project_status || null,
        created_by: formData.created_by || null,
        task: taskPayload,
        task_json: taskPayload ? JSON.stringify(taskPayload) : null,
        note: noteBody || null,
        notes: noteBody || null,
        noteData: notePayload,
        note_json: notePayload ? JSON.stringify(notePayload) : null,
        historyitems: historyPayload,
        history_json: historyPayload.length > 0 ? JSON.stringify(historyPayload) : null,
    };
};

export default {
    namespaced: true,

    state: () => ({
        projects: [],
        viewMode: "list",
        isLoading: false,
        error: null,
        searchQuery: "",
        leaders: [],
        deals: [],
        statuses: [],
    }),

    mutations: {
        SET_VIEW_MODE(state, mode) {
            state.viewMode = mode;
        },
        SET_PROJECTS(state, projects) {
            state.projects = projects;
        },
        ADD_PROJECT(state, project) {
            state.projects = [project, ...state.projects];
        },
        UPDATE_PROJECT(state, project) {
            const index = state.projects.findIndex((item) => item.id === project.id);
            if (index !== -1) {
                state.projects.splice(index, 1, { ...state.projects[index], ...project });
            }
        },
        DELETE_PROJECT(state, projectId) {
            state.projects = state.projects.filter((project) => project.id !== projectId);
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
        SET_LEADERS(state, leaders) {
            state.leaders = leaders;
        },
        SET_DEALS(state, deals) {
            state.deals = deals;
        },
        SET_STATUSES(state, statuses) {
            state.statuses = statuses;
        },
    },

    actions: {
        setViewMode({ commit }, mode) {
            commit("SET_VIEW_MODE", mode);
        },

        fetchAllProjects({ commit }) {
            commit("SET_LOADING", true);
            commit("SET_ERROR", null);

            const promise = new Promise(async (resolve, reject) => {
                try {
                    const response = await api.get("project", {
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
                    // Backend returns { companies: { data: [...] } } based on latest sample
                    const projectsData =
                        (data.companies && data.companies.data) ||
                        data.projects ||
                        data.data ||
                        data;
                    const normalizedProjects = Array.isArray(projectsData)
                        ? projectsData.map((project, index) => normalizeProject(project, index))
                        : [];
                    commit("SET_PROJECTS", normalizedProjects);
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
                                ? "Endpoint project tidak ditemukan di server (404)."
                                : `Fetch project gagal (HTTP ${status})`
                            : error.message || "Failed to fetch projects"),
                    );
                    commit("SET_LOADING", false);
                });

            return promise;
        },

        async fetchProjectById({ commit }, projectId) {
            if (!projectId) return null;
            commit("SET_LOADING", true);
            try {
                const response = await api.get(`project/fetchprojectbyid?id=${projectId}`, {
                    headers: {
                        Authorization: "Bearer " + cookies.get("token"),
                    },
                });
                
                // Based on sample: { project: [...], taskassoc: [...] }
                const projectData = response.data?.project?.[0] || response.data?.data || response.data;
                const tasksData = response.data?.taskassoc || [];

                if (!projectData) {
                    commit("SET_LOADING", false);
                    return null;
                }

                // Merge tasks into project object for normalization
                const combinedData = {
                    ...projectData,
                    tasks: tasksData
                };

                const normalized = normalizeProject(combinedData);
                commit("SET_LOADING", false);
                return normalized;
            } catch (error) {
                console.error("Fetch project by ID failed:", error);
                commit("SET_LOADING", false);
                throw error;
            }
        },

        async fetchDeals({ commit }) {
            try {
                const response = await api.get("project/deals", {
                    headers: { Authorization: "Bearer " + cookies.get("token") }
                });
                const data = response.data?.deals || response.data?.data || response.data || [];
                commit("SET_DEALS", data);
                return data;
            } catch (error) {
                console.error("Fetch project deals failed:", error);
                return [];
            }
        },

        async fetchLeaders({ commit }) {
            try {
                const response = await api.get("project/leader", {
                    headers: { Authorization: "Bearer " + cookies.get("token") }
                });
                const data = response.data?.leaders || response.data?.data || response.data || [];
                commit("SET_LEADERS", data);
                return data;
            } catch (error) {
                console.error("Fetch project leaders failed:", error);
                return [];
            }
        },

        async fetchStatuses({ commit }) {
            try {
                const response = await api.get("project/status", {
                    headers: { Authorization: "Bearer " + cookies.get("token") }
                });
                const data = response.data?.statuses || response.data?.data || response.data || [];
                commit("SET_STATUSES", data);
                return data;
            } catch (error) {
                console.error("Fetch project statuses failed:", error);
                return [];
            }
        },

        createprojectnew({ commit }, formData) {
            commit("SET_LOADING", true);
            commit("SET_ERROR", null);
            formData.choice = "i";

            const promise = new Promise(async (resolve, reject) => {
                try {
                    const response = await api.post("tasks/input", formData, {
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
                })
                .catch((error) => {
                    const status = error?.response?.status;
                    const serverMessage = error?.response?.data?.message;
                    commit(
                        "SET_ERROR",
                        serverMessage ||
                        (status
                            ? status === 404
                                ? "Endpoint projects tidak ditemukan di server (404)."
                                : `Fetch projects gagal (HTTP ${status})`
                            : error.message || "Failed to fetch projects"),
                    );
                    commit("SET_LOADING", false);
                });

            return promise;
        },

        updateprojectnew({ commit }, formData) {
            commit("SET_LOADING", true);
            commit("SET_ERROR", null);
            formData.choice = "u";

            const promise = new Promise(async (resolve, reject) => {
                try {
                    const response = await api.post("tasks/input", formData, {
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
                })
                .catch((error) => {
                    const status = error?.response?.status;
                    const serverMessage = error?.response?.data?.message;
                    commit(
                        "SET_ERROR",
                        serverMessage ||
                        (status
                            ? status === 404
                                ? "Endpoint projects tidak ditemukan di server (404)."
                                : `Fetch projects gagal (HTTP ${status})`
                            : error.message || "Failed to fetch projects"),
                    );
                    commit("SET_LOADING", false);
                });

            return promise;
        },

        deleteprojectnew({ commit }, formData) {
            commit("SET_LOADING", true);
            commit("SET_ERROR", null);
            formData.choice = "d";

            const promise = new Promise(async (resolve, reject) => {
                try {
                    const response = await api.post("tasks/input", formData, {
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
                })
                .catch((error) => {
                    const status = error?.response?.status;
                    const serverMessage = error?.response?.data?.message;
                    commit(
                        "SET_ERROR",
                        serverMessage ||
                        (status
                            ? status === 404
                                ? "Endpoint projects tidak ditemukan di server (404)."
                                : `Fetch projects gagal (HTTP ${status})`
                            : error.message || "Failed to fetch projects"),
                    );
                    commit("SET_LOADING", false);
                });

            return promise;
        },

        async createProject({ commit, dispatch }, formData) {
            commit("SET_LOADING", true);
            commit("SET_ERROR", null);

            const headers = {
                Authorization: "Bearer " + cookies.get("token"),
            };

            // Gunakan 'append' sesuai instruksi user untuk data baru
            const choice = formData.id ? "u" : "i";

            const mappedPayload = mapProjectPayload(formData);
            const payload = {
                choice: choice,
                id: formData.id || null,
                ...mappedPayload,
            };

            try {
                const response = await api.post("project/input", payload, { headers });

                // Bersihkan error segera setelah simpan berhasil untuk menghilangkan pesan merah di UI
                commit("SET_ERROR", null);

                await dispatch("fetchAllProjects");

                commit("SET_LOADING", false);
                return response.data;
            } catch (error) {
                const status = error?.response?.status;
                const serverMessage = error?.response?.data?.message;
                const operationType = choice === "i" ? "Create" : "Update";
                commit(
                    "SET_ERROR",
                    serverMessage ||
                    (status
                        ? status === 404
                            ? "Endpoint project tidak ditemukan di server (404)."
                            : `${operationType} project gagal (HTTP ${status})`
                        : error?.message ||
                        `Failed to ${operationType.toLowerCase()} project`),
                );
                commit("SET_LOADING", false);
                throw error;
            }
        },

        async updateProject({ state, dispatch }, payload = {}) {
            const projectId = payload.id;
            if (!projectId) {
                throw new Error("Project ID is required");
            }

            const existingProject = state.projects.find((project) => project.id === projectId) || {};
            const partialForm = payload.formData || {};

            // Merge partial update with existing project data
            const formData = {
                id: projectId,
                ...existingProject,
                ...partialForm,
            };

            return dispatch("createProject", formData);
        },

        async deleteProject({ commit, dispatch, state }, projectInput) {
            const resolvedProject =
                projectInput && typeof projectInput === "object"
                    ? projectInput
                    : state.projects.find((project) => project.id === projectInput) || {
                        id: projectInput,
                    };

            const resolvedId =
                resolvedProject?.id ?? resolvedProject?.project_id ?? resolvedProject?.id_project;

            if (!resolvedId) {
                throw new Error("Project ID is required");
            }

            commit("SET_LOADING", true);
            commit("SET_ERROR", null);

            const headers = {
                Authorization: "Bearer " + cookies.get("token"),
            };

            const deletePayload = {
                choice: "d",
                id: resolvedId,
                project_id: resolvedId,
                id_project: resolvedId,
                project_name: "",
                description: "",
                status: "",
                stage: "",
                project_status: "",
                assignee: "",
                owner: "",
                due_date: "",
                project_time: "",
                priority: "",
                deal_id: "",
                leader_id: "",
                address: "",
                kd_kelurahan: "",
                location: "",
                created_by: "",
            };

            try {
                const response = await api.post("project/input", deletePayload, {
                    headers,
                });

                await dispatch("fetchAllProjects");

                commit("SET_LOADING", false);
                return response?.data;
            } catch (error) {
                await dispatch("fetchAllProjects").catch(() => { });
                const status = error?.response?.status;
                const serverMessage = error?.response?.data?.message;
                commit(
                    "SET_ERROR",
                    serverMessage ||
                    (status
                        ? status === 404
                            ? "Endpoint delete project tidak ditemukan di server (404)."
                            : `Delete project gagal (HTTP ${status})`
                        : error?.message || "Failed to delete project"),
                );
                commit("SET_LOADING", false);
                throw error;
            }
        },

        setSearchQuery({ commit }, query) {
            commit("SET_SEARCH_QUERY", query);
        },
    },

    getters: {
        currentView: (state) => state.viewMode,
        allProjects: (state) => state.projects,
        isLoading: (state) => state.isLoading,
        error: (state) => state.error,
        searchQuery: (state) => state.searchQuery,
        filteredProjects: (state) => {
            if (!state.searchQuery.trim()) {
                return state.projects;
            }
            const query = state.searchQuery.toLowerCase();
            return state.projects.filter((project) => {
                const title = (project.title || project.project_name || "").toLowerCase();
                const description = (project.description || "").toLowerCase();
                return title.includes(query) || description.includes(query);
            });
        },
    },
};
