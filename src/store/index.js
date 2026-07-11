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
import financeModule from "./modules/finance";
import registerModule from "./modules/register";
import registerbeliModule from "./modules/registerbeli";
import registerreturbeliModule from "./modules/registerreturbeli";
import registersoModule from "./modules/registerso";
import registerjualModule from "./modules/registerjual";
import registerreturjualModule from "./modules/registerreturjual";
import registerkoreksiModule from "./modules/registerkoreksi";
import registerrepackingModule from "./modules/registerrepacking";
import registercreditenoteModule from "./modules/registercreditenote";
import registerstockserialModule from "./modules/registerstockserial";
import registerstockserialrekapModule from "./modules/registerstockserialrekap";
import registeroutstandingpoModule from "./modules/registeroutstandingpo";
import registeroutstandingsoModule from "./modules/registeroutstandingso";
import registeroutstandingtransferModule from "./modules/registeroutstandingtransfer";

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
    
    finance: financeModule,
    register: registerModule,
    registerbeli: registerbeliModule,
    registerreturbeli: registerreturbeliModule,
    registerso: registersoModule,
    registerjual: registerjualModule,
    registerreturjual: registerreturjualModule,
    registerkoreksi: registerkoreksiModule,
    registerrepacking: registerrepackingModule,
    registercreditenote: registercreditenoteModule,
    registerstockserial: registerstockserialModule,
    registerstockserialrekap: registerstockserialrekapModule,
    registeroutstandingpo: registeroutstandingpoModule,
    registeroutstandingso: registeroutstandingsoModule,
    registeroutstandingtransfer: registeroutstandingtransferModule,
  },
});
