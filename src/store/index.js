import { createStore } from "vuex";
import dealsModule from "./modules/deals"; // Sesuaikan path filenya
import contactsModule from "./modules/contacts";
import companiesModule from "./modules/companies";
import tasksModule from "./modules/tasks";
import projectsModule from "./modules/projects";
import documentsModule from "./modules/documents";
import usersModule from "./modules/users";
import broadcastModule from "./modules/broadcast";
import settingsModule from "./modules/settings";
import authModule from "./modules/auth";
import tabsModule from "./modules/tabs";
import settingsfeModule from "./modules/settingsfe";
import teamModule from "./modules/team";
import areaModule from "./modules/area";
import activityModule from "./modules/activity";
import userpermisions from "./modules/userpermisions";
import assoc from "./modules/assoc";
import lokasi from "./modules/lokasi";
import history from "./modules/history";
import invoiceModule from "./modules/invoice";

export default createStore({
  modules: {
    auth: authModule,
    deals: dealsModule,
    contacts: contactsModule,
    company: companiesModule,
    tasks: tasksModule,
    project: projectsModule,
    documents: documentsModule,
    users: usersModule,
    broadcast: broadcastModule,
    settings: settingsModule,
    tabs: tabsModule,
    settingsfe: settingsfeModule,
    team: teamModule,
    area: areaModule,
    activity: activityModule,
    userpermisions: userpermisions,
    assoc: assoc,
    lokasi: lokasi,
    history: history,
    invoice: invoiceModule,
  },
});
