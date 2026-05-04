import Dashboard from "@/components/dashboard.vue";
import Contacts from "@/components/pages/Contacts/contacts.vue";
import LoginPage from "@/components/loginpage.vue";
import MainDashboard from "@/components/maindashboard.vue";
import Companies from "@/components/pages/Companies/companies.vue";
import Deals from "@/components/pages/deals/deals.vue";
import DealsList from "@/components/pages/deals/dealslist/DealsList.vue";
import DealsCard from "@/components/pages/deals/dealscard/DealCard.vue";
import Task from "@/components/task/task.vue";
import TaskList from "@/components/task/tasklist.vue";
import TaskCard from "@/components/task/taskcard.vue";
import TaskCalender from "@/components/task/taskcalender.vue";
import EmailBroadcast from "@/components/EmailBroadcast.vue";
import Documents from "@/components/pages/documents/Documents.vue";
import DocumentList from "@/components/pages/documents/DocumentList.vue";
import DocumentsTemplate from "@/components/pages/documents/DocumentsTemplate.vue";
import DocumentsShortCode from "@/components/pages/documents/DocumentsShortCode.vue";
import UserSetings from "@/components/user/usersettings/usersetings.vue";
import UserPermission from "@/components/user/userpermission.vue";
import UserTeam from "@/components/user/userteam.vue";
import User from "@/components/user/user.vue";
import SettingsPage from "@/components/Settings.vue";
import Project from "@/components/pages/Projects/project.vue";
import ProjectList from "@/components/pages/Projects/projectlist.vue";
import ProjectCard from "@/components/pages/Projects/projectcard.vue";
import ProjectCalender from "@/components/pages/Projects/projectcalender.vue";

import { createRouter, createWebHistory } from "vue-router";
import store from "@/store";
import { useCookies } from "vue3-cookies";
const { cookies } = useCookies();

const routes = [
  {
    path: "/",
    redirect: { name: "login" },
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
  },
  {
    path: "/crmAdmin",
    component: MainDashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: Dashboard,
      },

      {
        path: "contacts",
        name: "Contacts",
        component: Contacts,
      },
      {
        path: "companies",
        name: "Companies",
        component: Companies,
      },
      {
        path: "deals",
        component: Deals, // File yang barusan kamu kirim
        children: [
          {
            path: "dealscard",
            name: "DealsCard", // Gunakan nama unik
            component: DealsCard,
          },
          {
            path: "dealslist",
            name: "DealsList", // Gunakan nama unik
            component: DealsList,
          },
          {
            path: "",
            redirect: { name: "DealsCard" }, // Default ke card jika akses /deals
          },
        ],
      },
      {
        path: "task",
        component: Task,
        children: [
          {
            path: "tasklist",
            name: "TaskList",
            component: TaskList,
          },
          {
            path: "taskcard",
            name: "TaskCard",
            component: TaskCard,
          },
          {
            path: "taskcalender",
            name: "TaskCalender",
            component: TaskCalender,
          },
          {
            path: "",
            redirect: { name: "TaskList" }, // Default ke list jika akses /task
          },
        ],
      },
      {
        path: "project",
        name: "Project",
        alias: "Projects",
        component: Project,
        children: [
          {
            path: "projectlist",
            name: "ProjectList",
            component: ProjectList,
          },
          {
            path: "projectcard",
            name: "ProjectCard",
            component: ProjectCard,
          },
          {
            path: "projectcalender",
            name: "ProjectCalender",
            component: ProjectCalender,
          },
          {
            path: "",
            redirect: { name: "ProjectList" }, // Default ke list jika akses /project
          },
        ],
      },
      {
        path: "documents",
        component: Documents,
        children: [
          {
            path: "",
            name: "DocumentsList",
            component: DocumentList,
          },
          {
            path: "template",
            name: "DocumentsTemplate",
            component: DocumentsTemplate,
          },
          {
            path: "short-code",
            name: "DocumentsShortCode",
            component: DocumentsShortCode,
          },
        ],
      },
      {
        path: "users",
        component: User,
        children: [
          {
            path: "",
            name: "UserSettings",
            component: UserSetings,
          },
          {
            path: "user-permission",
            name: "UserPermission",
            component: UserPermission,
          },
          {
            path: "user-team",
            name: "UserTeam",
            component: UserTeam,
          },
        ],
      },
      {
        path: "settings",
        name: "Settings",
        component: SettingsPage,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  linkActiveClass: "open",
  routes,
  // scrollBehavior() {
  //   return { top: 0 };
  // },
});

// router.beforeEach((to, from, next) => {
//   const isAuthenticated = store.getters["auth/isAuthenticated"];
//   const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

//   if (requiresAuth && !isAuthenticated) {
//     // Redirect to login if not authenticated
//     next({ name: "login" });
//   } else if (to.name === "login" && isAuthenticated) {
//     // Redirect to dashboard if already authenticated
//     next({ name: "Dashboard" });
//   } else {
//     next();
//   }
// });

router.beforeEach((to, from, next) => {
  const token = cookies.get("token");
  const loggedIn = cookies.get("loggedIn");
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const thisIsAuth = to.matched.some((record) => record.meta.thisisauth);

  if (requiresAuth) {
    if (!token || !loggedIn) {
      return next({ name: "login" });
    }
    return next();
  }

  if (thisIsAuth && loggedIn) {
    return next({ name: "Dashboard" });
  }

  return next();
});

export default router;
