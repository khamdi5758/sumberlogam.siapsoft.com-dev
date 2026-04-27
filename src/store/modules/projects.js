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
        status,
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

    const projectName =
        normalizeText(formData.project_name) ||
        normalizeText(formData.projectName) ||
        null;
    const description =
        normalizeText(formData.description) ||
        normalizeText(formData.projectContent) ||
        null;
    const assignee =
        normalizeText(formData.assignee) || normalizeText(formData.owner) || null;
    const now = new Date().toISOString();
    const createdAt = formData.created_at || now;
    const updatedAt = now;

    return {
        project_name: projectName,
        name: projectName,
        description,
        project_content: description,
        status: normalizeProjectStatus(
            formData.status || formData.stage || formData.project_status,
        ),
        stage: normalizeProjectStatus(
            formData.status || formData.stage || formData.project_status,
        ),
        project_status: normalizeText(formData.project_status) || undefined,
        assignee,
        owner: assignee,
        due_date: formData.due_date || formData.dueDate || null,
        dueDate: formData.due_date || formData.dueDate || null,
        date: formData.due_date || formData.dueDate || null,
        deadline: formData.due_date || formData.dueDate || null,
        project_time: formData.project_time || formData.time || null,
        due_time: formData.project_time || formData.time || null,
        time: formData.project_time || formData.time || null,
        priority: formData.priority || null,
        deal_id: formData.deal_id ?? formData.deal ?? null,
        leader_id: formData.leader_id ?? null,
        address: normalizeText(formData.address) || null,
        kd_kelurahan:
            normalizeText(formData.kd_kelurahan) ||
            normalizeText(formData.kelurahan) ||
            null,
        location: normalizeText(formData.location) || null,
        created_by: formData.created_by ?? null,
        created_at: createdAt,
        updated_at: updatedAt,
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
                    const response = await api.get("tasks", {
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
                    const projectsData = data.tasks || data.data || data;
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
                                ? "Endpoint projects tidak ditemukan di server (404)."
                                : `Fetch projects gagal (HTTP ${status})`
                            : error.message || "Failed to fetch projects"),
                    );
                    commit("SET_LOADING", false);
                });

            return promise;
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

            // Tentukan choice: 'i' untuk insert, 'u' untuk update
            const choice = formData.id ? "u" : "i";

            const mappedPayload = mapProjectPayload(formData);
            const now = new Date().toISOString();
            const payload = {
                choice: choice,
                ...(choice === "u" ? { id: formData.id } : {}),
                ...mappedPayload,
                created_at:
                    choice === "i"
                        ? formData.created_at || mappedPayload.created_at || now
                        : formData.created_at || undefined,
                updated_at: now,
            };

            // Keep backend compatibility with payload shape used in company delete/update flow.
            if (choice === "u") {
                payload.project_id = formData.id;
                payload.id_project = formData.id;
            }

            try {
                const response = await api.post("tasks/input", payload, { headers });

                await dispatch("fetchAllProjects").catch(() => {
                    const createdProject =
                        response?.data?.task || response?.data?.data || response?.data;
                    if (createdProject) {
                        if (choice === "i") {
                            commit("ADD_PROJECT", normalizeProject(createdProject));
                        } else {
                            commit("UPDATE_PROJECT", normalizeProject(createdProject));
                        }
                    }
                });

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
                project_name:
                    partialForm.project_name ||
                    partialForm.projectName ||
                    existingProject.project_name ||
                    existingProject.title ||
                    existingProject.name ||
                    "",
                description:
                    partialForm.description ??
                    partialForm.projectContent ??
                    existingProject.description ??
                    existingProject.project_content ??
                    "",
                status:
                    partialForm.status ||
                    partialForm.stage ||
                    existingProject.status ||
                    existingProject.stage ||
                    "not_started",
                assignee:
                    partialForm.assignee ??
                    partialForm.owner ??
                    existingProject.assignee ??
                    existingProject.owner ??
                    existingProject.user_name ??
                    "",
                due_date:
                    partialForm.due_date ??
                    partialForm.dueDate ??
                    existingProject.due_date ??
                    existingProject.dueDate ??
                    existingProject.date ??
                    "",
                project_time:
                    partialForm.project_time ??
                    partialForm.time ??
                    existingProject.project_time ??
                    existingProject.time ??
                    "",
                priority: partialForm.priority ?? existingProject.priority ?? "",
                deal_id:
                    partialForm.deal_id ??
                    existingProject.deal_id ??
                    existingProject.deal ??
                    "",
                leader_id:
                    partialForm.leader_id ??
                    existingProject.leader_id ??
                    "",
                address:
                    partialForm.address ??
                    existingProject.address ??
                    "",
                kd_kelurahan:
                    partialForm.kd_kelurahan ??
                    existingProject.kd_kelurahan ??
                    existingProject.kelurahan ??
                    "",
                location:
                    partialForm.location ??
                    existingProject.location ??
                    "",
                project_status:
                    partialForm.project_status ??
                    existingProject.project_status ??
                    existingProject.status ??
                    existingProject.stage ??
                    "",
                created_by:
                    partialForm.created_by ??
                    existingProject.created_by ??
                    "",
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
                const response = await api.post("tasks/input", deletePayload, {
                    headers,
                });

                await dispatch("fetchAllProjects").catch(() => {
                    commit("DELETE_PROJECT", resolvedId);
                });

                commit("SET_LOADING", false);
                return response?.data;
            } catch (error) {
                await dispatch("fetchAllProjects").catch(() => {});
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
