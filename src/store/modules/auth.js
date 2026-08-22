import api from "@/api";
import router from "../../router";
import notifications from "@/mixins/notifications";
const { shownotifsuccess, shownotiffail, shownotifsuccesswithact } =
  notifications.methods;

import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

import { useCookies } from "vue3-cookies";

const { cookies } = useCookies();

const state = {
  // loggedIn: localStorage.getItem("loggedIn"),
  // // authuser: null,
  // authtoken: localStorage.getItem("token"),
  token: cookies.get("token"),
  loadinglogout: false,
  user: null,
  token: null,
  isAuthenticated: false,
};

const getters = {
  authuser: (state) => state.authuser,
  authtoken: (state) => state.authtoken,
  getloadinglogout: (state) => state.loadinglogout,
  currentUser: (state) => state.user,
  isAuthenticated: (state) => state.isAuthenticated,
  userInitials: (state) => {
    if (!state.user) return "??";

    // Try to get from name or combined firstname/lastname
    const fullName =
      state.user.name ||
      (state.user.firstname && state.user.lastname
        ? `${state.user.firstname} ${state.user.lastname}`
        : state.user.first_name && state.user.last_name
          ? `${state.user.first_name} ${state.user.last_name}`
          : state.user.email || "User");

    return fullName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  },
};

const actions = {
  async authsigninnew({ commit }, credentials) {
    const apiBaseUrl =
      import.meta.env.VITE_APP_API_URL ||
      import.meta.env.BACKEND_APP_API_URL ||
      "";
    const loginUrl = `${apiBaseUrl.replace(/\/$/, "")}/api/login`;

    console.log("DEBUG: Attempting login...");
    console.log("DEBUG: apiBaseUrl:", apiBaseUrl);
    console.log("DEBUG: loginUrl:", loginUrl);

    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const authData = {
          user: data.user || {
            name: "User",
            email: credentials.email,
            role: "user",
          },
          token: data.token,
        };
        commit("SET_AUTH", authData);
        return { success: true };
      } else {
        return Promise.reject(
          new Error(data.message || "Email atau password salah"),
        );
      }
    } catch (error) {
      console.error("Vuex authsignin error:", error);
      return Promise.reject(error);
    }
  },
  // For updating current user data after profile edit
  setAuth({ commit }, authData) {
    commit("SET_AUTH", authData);
  },
  logout({ commit }) {
    commit("CLEAR_AUTH");
  },
  authsignin(context, user) {
    context.commit("settingsfe/setloading", true, { root: true });
    const promise = new Promise((resolve, reject) => {
      api
        .post(
          "login",
          {
            email: user.email,
            password: user.password,
          },
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          },
        )
        .then((res) => {
          // Set token dan status login
          cookies.set("token", res.data.token, "10h");
          cookies.set("loggedIn", "true", "10h");
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("loggedIn", "true");
          localStorage.setItem("perusahaan", JSON.stringify(res.data.perusahaan));

          // Ambil data user yang login
          return context.dispatch("users/getusersignin", null, { root: true });
        })
        .then(() => {
          resolve(); // Redirect ke dashboard setelah login
        })
        .catch((error) => {
          reject(error);
        })
        .finally(() => {
          context.commit("settingsfe/setloading", false, { root: true });
        });
    });

    return promise;
  },

  authsigninbytoken(user) {
    // console.log(user);
    // localStorage.setItem("token", user.token);
    // localStorage.setItem("loggedIn", "true");
    // router.push({ name: "home" });
  },

  authsignout(context) {
    context.commit("settingsfe/setloading", true, { root: true });
    // console.log("logout user");
    context.commit("setloadinglogout", true);
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.get("logout");
        resolve(network.data);
      } catch (error) {
        reject(error);
      }
    });
    promise
      .then((data) => {
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("tokenmpmhnda");
        localStorage.removeItem("perusahaan");
        sessionStorage.removeItem("loggedIn");
        cookies.remove("loggedIn");
        cookies.remove("token");
        context.commit("setloadinglogout", false);
        context.commit("settingsfe/setloading", false, { root: true });

        // Show success toast
        // toast.success("Logout berhasil!", {
        //   autoClose: 500,
        //   position: "top-right",
        //   theme: "colored",
        //   type: "success",
        //   newestOnTop: true,
        //   onClose: () => {
        //     // Perform any additional actions after the toast is closed
        //     router.push({ name: "login" });
        //   },
        // });

        shownotifsuccesswithact("Logout Berhasil", () => {
          router.push({ name: "login" });
        });
        context.commit("tagsView/setvisitedViews", [], { root: true });
        context.commit("tagsView/setcachedViews", [], { root: true });
        context.commit("settingsfe/setlayoutweb", null, { root: true });
      })
      .catch((error) => {
        context.commit("settingsfe/setloading", false, { root: true });
        shownotiffail("Logout Gagal");
      });
    // context.commit("setloadinglogout", false);
    return promise;
  },

  authlogout(context) {
    console.log("logout user");
    context.commit("settingsfe/setloading", true, { root: true });
    // context.commit("setloadinglogout", true);
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.get("logout");
        resolve(network.data);
      } catch (error) {
        reject(error);
      }
    });
    promise
      .then((data) => {
        context.dispatch("tabs/clearTabs", null, { root: true });
        localStorage.clear();
        sessionStorage.clear();
        cookies.remove("loggedIn");
        cookies.remove("token");
        // context.commit("setloadinglogout", false);
        context.commit("settingsfe/setloading", false, { root: true });
      })
      .catch((error) => {
        console.log(error);
        context.commit("settingsfe/setloading", false, { root: true });
      });
    return promise;
  },

  logindealermpmhonda(context) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        let network = await api.get("logindealer", {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        resolve(network.data);
      } catch (error) {
        reject(error);
      }
    });
    promise.then((data) => {
      console.log(data);
    });
    // return promise;
  },
};

const mutations = {
  SET_AUTH(state, { user, token }) {
    state.user = user;
    state.token = token;
    state.isAuthenticated = !!user;
  },
  CLEAR_AUTH(state) {
    state.user = null;
    state.token = null;
    state.isAuthenticated = false;
  },
  setauthuser: (state, user) => {
    state.authuser = user;
  },

  setauthtoken: (state, token) => {
    // console.log(token);
    state.authtoken = token;
  },

  setloadinglogout: (state, kondisi) => {
    state.loadinglogout = kondisi;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

// import api from "@/api";

// export default {
//     namespaced: true,

//     state: () => ({
//         user: null,
//         token: null,
//         isAuthenticated: false,
//     }),

//     mutations: {
//         SET_AUTH(state, { user, token }) {
//             state.user = user;
//             state.token = token;
//             state.isAuthenticated = !!user;
//         },
//         CLEAR_AUTH(state) {
//             state.user = null;
//             state.token = null;
//             state.isAuthenticated = false;
//         },
//     },

//     actions: {
//         async authsignin({ commit }, credentials) {
//             const apiBaseUrl = import.meta.env.VITE_APP_API_URL || import.meta.env.BACKEND_APP_API_URL || "";
//             const loginUrl = `${apiBaseUrl.replace(/\/$/, "")}/api/login`;

//             console.log("DEBUG: Attempting login...");
//             console.log("DEBUG: apiBaseUrl:", apiBaseUrl);
//             console.log("DEBUG: loginUrl:", loginUrl);

//             try {
//                 const response = await fetch(loginUrl, {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                         Accept: "application/json",
//                     },
//                     body: JSON.stringify({
//                         email: credentials.email,
//                         password: credentials.password
//                     }),
//                 });

//                 const data = await response.json();

//                 if (response.ok) {
//                     const authData = {
//                         user: data.user || {
//                             name: "User",
//                             email: credentials.email,
//                             role: "user"
//                         },
//                         token: data.token
//                     };
//                     commit("SET_AUTH", authData);
//                     return { success: true };
//                 } else {
//                     return Promise.reject(new Error(data.message || "Email atau password salah"));
//                 }
//             } catch (error) {
//                 console.error("Vuex authsignin error:", error);
//                 return Promise.reject(error);
//             }
//         },
//         // For updating current user data after profile edit
//         setAuth({ commit }, authData) {
//             commit("SET_AUTH", authData);
//         },
//         logout({ commit }) {
//             commit("CLEAR_AUTH");
//         },
//     },

//     getters: {
//         currentUser: (state) => state.user,
//         isAuthenticated: (state) => state.isAuthenticated,
//         userInitials: (state) => {
//             if (!state.user) return "??";

//             // Try to get from name or combined firstname/lastname
//             const fullName = state.user.name ||
//                 (state.user.firstname && state.user.lastname ?
//                     `${state.user.firstname} ${state.user.lastname}` :
//                     state.user.first_name && state.user.last_name ?
//                         `${state.user.first_name} ${state.user.last_name}` :
//                         state.user.email || "User");

//             return fullName
//                 .split(" ")
//                 .filter(Boolean)
//                 .map((n) => n[0])
//                 .join("")
//                 .toUpperCase()
//                 .substring(0, 2);
//         },
//     },
// };
