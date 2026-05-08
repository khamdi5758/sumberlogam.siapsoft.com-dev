import api from "@/api";
import { useCookies } from "vue3-cookies";

const { cookies } = useCookies();

const normalizeNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeTaskStatus = (statusRaw) => {
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

const normalizeTask = (task = {}, index = 0) => {
  const fallbackId = `${task?.task_name || task?.title || task?.name || "task"}-${index}`;
  const status = normalizeTaskStatus(
    task.status || task.stage || task.pipeline,
  );
  const taskName = task.task_name || task.title || task.name || "Untitled Task";
  const description = task.description || task.task_content || "";
  const assignee = task.assignee || task.owner || task.user_name || "";
  const dueDate =
    task.due_date ||
    task.dueDate ||
    task.date ||
    task.deadline ||
    task.start ||
    null;
  const taskTime = task.task_time || task.time || task.due_time || null;
  const priority = task.priority || "";

  return {
    ...task,
    id: task.id ?? task.task_id ?? task.id_task ?? fallbackId,
    task_name: taskName,
    description,
    status,
    assignee: assignee || "-",
    due_date: dueDate,
    task_time: taskTime,
    priority,
    // UI aliases so existing components keep working
    title: taskName,
    name: taskName,
    stage: status,
    owner: assignee || "-",
    dueDate: dueDate,
    time: taskTime,
  };
};

const mapTaskPayload = (formData = {}) => {
  const taskName =
    formData.task_name?.trim() || formData.taskName?.trim() || null;
  const description =
    formData.description?.trim() || formData.taskContent?.trim() || null;
  const assignee = formData.assignee || formData.owner?.trim() || null;
  const dueDate = formData.due_date || formData.dueDate || null;
  const taskTime = formData.task_time || formData.time || null;
  const now = new Date().toISOString();
  const createdAt = formData.created_at || now;
  const updatedAt = now;

  return {
    task_name: taskName,
    description: description,
    assigned_id: normalizeNumber(assignee),
    due_date: dueDate,
    priority: normalizeNumber(formData.priority),
    progress: normalizeNumber(formData.progress) || 0,
    status_id: normalizeNumber(formData.status_id) || formData.status_id || null,
    project_id: normalizeNumber(formData.project_id) || formData.project_id || null,
    created_by: normalizeNumber(formData.created_by) || formData.created_by || null,
    // Keep legacy fields for compatibility
    assignee: assignee,
    status: formData.status_id || formData.status || null,
    task_time: taskTime,
    created_at: createdAt,
    updated_at: updatedAt,
  };
};

export default {
  namespaced: true,

  state: () => ({
    tasks: [],
    viewMode: "list",
    isLoading: false,
    error: null,
    searchQuery: "",
    projects: [],
    statuses: [],
    priorities: [],
    assignees: [],
    currentTask: null,
  }),

  mutations: {
    SET_VIEW_MODE(state, mode) {
      state.viewMode = mode;
    },
    SET_TASKS(state, tasks) {
      state.tasks = tasks;
    },
    ADD_TASK(state, task) {
      state.tasks = [task, ...state.tasks];
    },
    UPDATE_TASK(state, task) {
      const index = state.tasks.findIndex((item) => item.id === task.id);
      if (index !== -1) {
        state.tasks.splice(index, 1, { ...state.tasks[index], ...task });
      }
    },
    DELETE_TASK(state, taskId) {
      state.tasks = state.tasks.filter((task) => task.id !== taskId);
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
    SET_PROJECTS(state, projects) {
      state.projects = projects;
    },
    SET_STATUSES(state, statuses) {
      state.statuses = statuses;
    },
    SET_PRIORITIES(state, priorities) {
      state.priorities = priorities;
    },
    SET_ASSIGNEES(state, assignees) {
      state.assignees = assignees;
    },
    SET_CURRENT_TASK(state, task) {
      state.currentTask = task;
    },
  },

  actions: {
    setViewMode({ commit }, mode) {
      commit("SET_VIEW_MODE", mode);
    },

    fetchAllTasks({ commit }) {
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
          const tasksData = data.tasks || data.data || data;
          const normalizedTasks = Array.isArray(tasksData)
            ? tasksData.map((task, index) => normalizeTask(task, index))
            : [];
          commit("SET_TASKS", normalizedTasks);
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
                  ? "Endpoint tasks tidak ditemukan di server (404)."
                  : `Fetch tasks gagal (HTTP ${status})`
                : error.message || "Failed to fetch tasks"),
          );
          commit("SET_LOADING", false);
        });

      return promise;
    },

    createtasknew({ commit }, formData) {
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
                  ? "Endpoint tasks tidak ditemukan di server (404)."
                  : `Fetch tasks gagal (HTTP ${status})`
                : error.message || "Failed to fetch tasks"),
          );
          commit("SET_LOADING", false);
        });

      return promise;
    },

    updatetasknew({ commit }, formData) {
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
                  ? "Endpoint tasks tidak ditemukan di server (404)."
                  : `Fetch tasks gagal (HTTP ${status})`
                : error.message || "Failed to fetch tasks"),
          );
          commit("SET_LOADING", false);
        });

      return promise;
    },

    deletetasknew({ commit }, formData) {
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
                  ? "Endpoint tasks tidak ditemukan di server (404)."
                  : `Fetch tasks gagal (HTTP ${status})`
                : error.message || "Failed to fetch tasks"),
          );
          commit("SET_LOADING", false);
        });

      return promise;
    },

    async createTask({ commit, dispatch }, formData) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      const headers = {
        Authorization: "Bearer " + cookies.get("token"),
      };

      // Tentukan choice: 'i' untuk insert, 'u' untuk update
      const choice = formData.id ? "u" : "i";

      const mappedPayload = mapTaskPayload(formData);
      const now = new Date().toISOString();
      const payload = {
        choice: choice,
        ...(choice === "u" ? { id: normalizeNumber(formData.id) } : {}),
        ...mappedPayload,
        created_at:
          choice === "i"
            ? formData.created_at || mappedPayload.created_at || now
            : formData.created_at || undefined,
        updated_at: now,
      };

      try {
        const response = await api.post("tasks/input", payload, { headers });

        await dispatch("fetchAllTasks").catch(() => {
          const createdTask =
            response?.data?.task || response?.data?.data || response?.data;
          if (createdTask) {
            if (choice === "i") {
              commit("ADD_TASK", normalizeTask(createdTask));
            } else {
              commit("UPDATE_TASK", normalizeTask(createdTask));
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
                ? "Endpoint task tidak ditemukan di server (404)."
                : `${operationType} task gagal (HTTP ${status})`
              : error?.message ||
                `Failed to ${operationType.toLowerCase()} task`),
        );
        commit("SET_LOADING", false);
        throw error;
      }
    },

    async updateTask({ state, dispatch }, payload = {}) {
      const taskId = payload.id;
      if (!taskId) {
        throw new Error("Task ID is required");
      }

      const existingTask = state.tasks.find((task) => task.id === taskId) || {};
      const partialForm = payload.formData || {};

      // Merge partial update with existing task data so update behaves like deals
      const formData = {
        id: taskId,
        task_name:
          partialForm.task_name ||
          partialForm.taskName ||
          existingTask.task_name ||
          existingTask.title ||
          existingTask.name ||
          "",
        description:
          partialForm.description ??
          partialForm.taskContent ??
          existingTask.description ??
          existingTask.task_content ??
          "",
        status_id:
          partialForm.status_id ||
          partialForm.status ||
          existingTask.status_id ||
          existingTask.status ||
          "1",
        status:
          partialForm.status ||
          partialForm.stage ||
          existingTask.status ||
          existingTask.stage ||
          "not_started",
        assignee:
          partialForm.assignee ??
          partialForm.owner ??
          existingTask.assignee ??
          existingTask.owner ??
          existingTask.user_name ??
          "",
        due_date:
          partialForm.due_date ??
          partialForm.dueDate ??
          existingTask.due_date ??
          existingTask.dueDate ??
          existingTask.date ??
          "",
        task_time:
          partialForm.task_time ??
          partialForm.time ??
          existingTask.task_time ??
          existingTask.time ??
          "",
        priority: partialForm.priority ?? existingTask.priority ?? "",
        progress: partialForm.progress ?? existingTask.progress ?? 0,
        project_id: partialForm.project_id ?? existingTask.project_id ?? null,
        created_by: partialForm.created_by ?? existingTask.created_by ?? null,
      };

      return dispatch("createTask", formData);
    },

    async deleteTask({ commit, dispatch, state }, taskInput) {
      const resolvedTask =
        taskInput && typeof taskInput === "object"
          ? taskInput
          : state.tasks.find((task) => task.id === taskInput) || {
              id: taskInput,
            };

      const resolvedId =
        resolvedTask?.id ?? resolvedTask?.task_id ?? resolvedTask?.id_task;

      if (!resolvedId) {
        throw new Error("Task ID is required");
      }

      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      const headers = {
        Authorization: "Bearer " + cookies.get("token"),
      };

      const deletePayload = {
        choice: "d",
        id: resolvedId,
        task_id: resolvedId,
        id_task: resolvedId,
      };

      try {
        const response = await api.post("tasks/input", deletePayload, {
          headers,
        });

        await dispatch("fetchAllTasks").catch(() => {
          commit("DELETE_TASK", resolvedId);
        });

        commit("SET_LOADING", false);
        return response?.data;
      } catch (error) {
        const status = error?.response?.status;
        const serverMessage = error?.response?.data?.message;
        commit(
          "SET_ERROR",
          serverMessage ||
            (status
              ? status === 404
                ? "Endpoint delete task tidak ditemukan di server (404)."
                : `Delete task gagal (HTTP ${status})`
              : error?.message || "Failed to delete task"),
        );
        commit("SET_LOADING", false);
        throw error;
      }
    },

    setSearchQuery({ commit }, query) {
      commit("SET_SEARCH_QUERY", query);
    },

    async fetchProjects({ commit }) {
      try {
        const response = await api.get("tasks/project", {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });
        const data = response.data?.projects || response.data?.data || response.data || [];
        commit("SET_PROJECTS", data);
        return data;
      } catch (error) {
        console.error("Failed to fetch projects for tasks:", error);
        return [];
      }
    },

    async fetchStatuses({ commit }) {
      try {
        const response = await api.get("tasks/status", {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });
        const data = response.data?.status || response.data?.data || response.data || [];
        commit("SET_STATUSES", data);
        return data;
      } catch (error) {
        console.error("Failed to fetch task statuses:", error);
        return [];
      }
    },

    async fetchPriorities({ commit }) {
      try {
        const response = await api.get("tasks/priority", {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });
        const data = response.data?.priority || response.data?.data || response.data || [];
        commit("SET_PRIORITIES", data);
        return data;
      } catch (error) {
        console.error("Failed to fetch task priorities:", error);
        return [];
      }
    },

    async fetchAssignedTo({ commit }) {
      try {
        const response = await api.get("tasks/assignedto", {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });
        const data = response.data?.assignedto || response.data?.data || response.data || [];
        commit("SET_ASSIGNEES", data);
        return data;
      } catch (error) {
        console.error("Failed to fetch assignedto users:", error);
        return [];
      }
    },

    async fetchTaskById({ commit }, id) {
      if (!id) return null;
      commit("SET_LOADING", true);
      try {
        const response = await api.get(`tasks/fetchtaskbyid`, {
          params: { id },
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });
        let task = response.data?.task || response.data?.data || response.data;
        
        // Jika backend (DB::select) mengembalikan array, ambil index pertama
        if (Array.isArray(task) && task.length > 0) {
          task = task[0];
        }
        
        commit("SET_CURRENT_TASK", task);
        commit("SET_LOADING", false);
        return task;
      } catch (error) {
        console.error("Failed to fetch task by id:", error);
        commit("SET_LOADING", false);
        return null;
      }
    },
  },

  getters: {
    currentView: (state) => state.viewMode,
    allTasks: (state) => state.tasks,
    isLoading: (state) => state.isLoading,
    error: (state) => state.error,
    searchQuery: (state) => state.searchQuery,
    filteredTasks: (state) => {
      if (!state.searchQuery.trim()) {
        return state.tasks;
      }
      const query = state.searchQuery.toLowerCase();
      return state.tasks.filter(
        (task) =>
          task.title?.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query),
      );
    },
    allProjects: (state) => state.projects,
    allStatuses: (state) => state.statuses,
    allPriorities: (state) => state.priorities,
    allAssignees: (state) => state.assignees,
    currentTask: (state) => state.currentTask,
  },
};
