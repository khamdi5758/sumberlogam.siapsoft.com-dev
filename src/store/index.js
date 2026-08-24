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
import produksiModule from "./modules/produksi";

import masterbarang from "./modules/masterbarang";
import mastergeneralledgerperkiraantipe from "./modules/mastergeneralledgerperkiraantipe";
import mastergeneralledgerperkiraan from "./modules/mastergeneralledgerperkiraan";
import mastergeneralledgeraktivatetaptipe from "./modules/mastergeneralledgeraktivatetaptipe";
import mastergeneralledgeraktivatetap from "./modules/mastergeneralledgeraktivatetap";
import mastergeneralledgerlabarugi from "./modules/mastergeneralledgerlabarugi";
import mastergeneralledgergirodibuka from "./modules/mastergeneralledgergirodibuka";
import mastergeneralledgergiroditerima from "./modules/mastergeneralledgergiroditerima";
import masterinventorygudang from "./modules/masterinventorygudang";
import masterinventorystockgolongan from "./modules/masterinventorystockgolongan";
import masterinventorystockmerk from "./modules/masterinventorystockmerk";
import masterinventorystockbarang from "./modules/masterinventorystockbarang";
import masterinventorystockkomponen from "./modules/masterinventorystockkomponen";
import mastersalesman from "./modules/mastersalesman";
import mastercustomer from "./modules/mastercustomer";
import mastersupplier from "./modules/mastersupplier";
import masterkaryawan from "./modules/masterkaryawan";
import labarugi from "./modules/labarugi";
import neraca from "./modules/neraca";
import neracalajur from "./modules/neracalajur";
import jurnal from "./modules/jurnal";
import mutasi from "./modules/mutasi";
import biaya from "./modules/biaya";
import aktivatetap from "./modules/aktivatetap";
import bukubesar from "./modules/bukubesar";
import kasharian from "./modules/kasharian";
import bankharian from "./modules/bankharian";
import rekapkasbank from "./modules/rekapkasbank";
import kasbankaruskas from "./modules/kasbankaruskas";

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
    produksi: produksiModule,

    masterbarang: masterbarang,
    mastergeneralledgerperkiraantipe: mastergeneralledgerperkiraantipe,
    mastergeneralledgerperkiraan: mastergeneralledgerperkiraan,
    mastergeneralledgeraktivatetaptipe: mastergeneralledgeraktivatetaptipe,
    mastergeneralledgeraktivatetap: mastergeneralledgeraktivatetap,
    mastergeneralledgerlabarugi: mastergeneralledgerlabarugi,
    mastergeneralledgergirodibuka: mastergeneralledgergirodibuka,
    mastergeneralledgergiroditerima: mastergeneralledgergiroditerima,
    masterinventorygudang: masterinventorygudang,
    masterinventorystockgolongan: masterinventorystockgolongan,
    masterinventorystockmerk: masterinventorystockmerk,
    masterinventorystockbarang: masterinventorystockbarang,
    masterinventorystockkomponen: masterinventorystockkomponen,
    mastersalesman: mastersalesman,
    mastercustomer: mastercustomer,
    mastersupplier: mastersupplier,
    masterkaryawan: masterkaryawan,
    labarugi: labarugi,
    neraca: neraca,
    neracalajur: neracalajur,
    jurnal: jurnal,
    mutasi: mutasi,
    biaya: biaya,
    aktivatetap: aktivatetap,
    bukubesar: bukubesar,
    kasharian: kasharian,
    bankharian: bankharian,
    rekapkasbank: rekapkasbank,
    kasbankaruskas: kasbankaruskas,
  },
});
