<script>
import api from "@/api";
import Summary from "./carddb/summary.vue";
import Deals from "./carddb/deals.vue";
import Activity from "./carddb/activity.vue";
import LeadsReport from "./carddb/leadsreport.vue";
import TopCont from "./carddb/topcont.vue";
import TopComp from "./carddb/topcomp.vue";
import TasksKPI from "./carddb/tasksKPI.vue";
import TaskList from "./carddb/taskList.vue";
import TopslsPeople from "./carddb/topslspeople.vue";
import MapCard from "./carddb/mapcard.vue"; // <-- import komponen peta baru
import { RefreshCcw } from "lucide-vue-next";

export default {
  name: "MainDashboard",
  components: {
    Summary,
    Deals,
    Activity,
    LeadsReport,
    TopCont,
    TopComp,
    TasksKPI,
    TaskList,
    TopslsPeople,
    MapCard,
    RefreshCcw,
  },
  data() {
    return {
      isLoadingDashboard: false,
      dashboardError: "",
      dashboardSummary: {
        contactsTotal: 0,
        companiesTotal: 0,
        dealsTotal: 0,
        tasksTotal: 0,
      },
      dashboardDeals: [],
      dashboardPipelines: [],
      dashboardActivities: [],
      dashboardLeadsContacts: [],
      dashboardLeadsCompanies: [],
      dashboardLeadsDeals: [],
      dashboardTopContacts: [],
      dashboardTopCompanies: [],
      dashboardTasks: [],
      dashboardUsers: [],
      dashboardCompanyLocations: [],
    };
  },
  computed: {
    contactsTotal() {
      return this.dashboardSummary.contactsTotal;
    },
    companiesTotal() {
      return this.dashboardSummary.companiesTotal;
    },
    dealsTotal() {
      return this.dashboardSummary.dealsTotal;
    },
    tasksTotal() {
      return this.dashboardSummary.tasksTotal;
    },
    isSummaryLoading() {
      return this.isLoadingDashboard;
    },
    dealsList() {
      return this.dashboardDeals;
    },
    isLoadingDeals() {
      return this.isLoadingDashboard;
    },
    pipelines() {
      return this.dashboardPipelines;
    },
    activities() {
      return this.dashboardActivities;
    },
    isLoadingActivity() {
      return this.isLoadingDashboard;
    },
    leadsContacts() {
      return this.dashboardLeadsContacts;
    },
    leadsCompanies() {
      return this.dashboardLeadsCompanies;
    },
    leadsDeals() {
      return this.dashboardLeadsDeals;
    },
    isLoadingLeads() {
      return this.isLoadingDashboard;
    },
    topContactsList() {
      return this.dashboardTopContacts;
    },
    isLoadingTopContacts() {
      return this.isLoadingDashboard;
    },
    topCompaniesList() {
      return this.dashboardTopCompanies;
    },
    isLoadingTopCompanies() {
      return this.isLoadingDashboard;
    },
    tasksList() {
      return this.dashboardTasks;
    },
    isLoadingTasksKPI() {
      return this.isLoadingDashboard;
    },
    taskListData() {
      return this.dashboardTasks;
    },
    isLoadingTaskList() {
      return this.isLoadingDashboard;
    },
    usersList() {
      return this.dashboardUsers;
    },
    allUsers() {
      return this.$store.getters["users/allUsers"] || [];
    },
    isLoadingUsers() {
      return this.isLoadingDashboard;
    },

    // Data untuk peta: prioritaskan dashboardCompanyLocations (dari backend baru), fallback ke estimasi top companies
    companyLocations() {
      const dbLocations = this.dashboardCompanyLocations;

      if (Array.isArray(dbLocations) && dbLocations.length > 0) {
        const validLocations = [];

        dbLocations.forEach((item) => {
          let lat = parseFloat(item.latitude || item.lat);
          let lng = parseFloat(item.longitude || item.lng);

          // Jika tidak ada lat/lng langsung, coba parse dari field 'lokasi'
          if (isNaN(lat) || isNaN(lng)) {
            lat = null;
            lng = null;
            if (item.lokasi) {
              if (typeof item.lokasi === "string") {
                const parts = item.lokasi.split(",");
                if (parts.length === 2) {
                  lat = parseFloat(parts[0]);
                  lng = parseFloat(parts[1]);
                }
              } else if (typeof item.lokasi === "object") {
                lat = parseFloat(item.lokasi.latitude || item.lokasi.lat);
                lng = parseFloat(item.lokasi.longitude || item.lokasi.lng);
              }
            }
          }

          // Pastikan koordinat valid dan tidak nol
          if (
            lat !== null &&
            lng !== null &&
            !isNaN(lat) &&
            !isNaN(lng) &&
            lat !== 0 &&
            lng !== 0
          ) {
            validLocations.push({
              lat,
              lng,
              name: item.company || item.company_name || "Perusahaan",
              address: item.address || item.alamat || "",
              contact: item.contact_person || item.pic || "",
              phone: item.phone || item.telp || "",
              email: item.email || "",
              deals: item.jumlahdeal || item.deals || 0,
              dealsValue: item.totaldealvalue || item.dealsvalue || 0,
            });
          }
        });

        if (validLocations.length > 0) {
          return validLocations;
        }
      }

      // ─── FALLBACK LOGIC (Jika DB locations masih kosong atau tidak ada koordinat) ───
      const companies = this.dashboardTopCompanies;
      if (!Array.isArray(companies)) return [];

      // Daftar koordinat wilayah populer di Indonesia sebagai fallback
      const regionCoords = {
        jakarta: { lat: -6.2088, lng: 106.8456 },
        "jawa barat": { lat: -6.9175, lng: 107.6191 },
        bandung: { lat: -6.9175, lng: 107.6191 },
        "jawa timur": { lat: -7.2575, lng: 112.7521 },
        surabaya: { lat: -7.2575, lng: 112.7521 },
        "jawa tengah": { lat: -7.0051, lng: 110.4381 },
        semarang: { lat: -7.0051, lng: 110.4381 },
        yogyakarta: { lat: -7.7956, lng: 110.3695 },
        banten: { lat: -6.12, lng: 106.1502 },
        tangerang: { lat: -6.1783, lng: 106.6319 },
        bekasi: { lat: -6.2383, lng: 106.9756 },
        depok: { lat: -6.4025, lng: 106.7942 },
        bogor: { lat: -6.5971, lng: 106.806 },
        bali: { lat: -8.4095, lng: 115.1889 },
        denpasar: { lat: -8.6705, lng: 115.2126 },
        "sumatera utara": { lat: 2.1121, lng: 99.3998 },
        medan: { lat: 3.5952, lng: 98.6722 },
        "sulawesi selatan": { lat: -3.6687, lng: 119.974 },
        makassar: { lat: -5.1477, lng: 119.4327 },
      };

      return companies.map((company, index) => {
        let lat = parseFloat(company.latitude);
        let lng = parseFloat(company.longitude);
        let isEstimated = false;

        if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
          const city = String(company.city || company.kota || "")
            .toLowerCase()
            .trim();
          const province = String(company.province || company.provinsi || "")
            .toLowerCase()
            .trim();
          const address = String(company.address || company.alamat || "")
            .toLowerCase()
            .trim();

          let matched = null;
          for (const [key, coords] of Object.entries(regionCoords)) {
            if (
              city.includes(key) ||
              province.includes(key) ||
              address.includes(key)
            ) {
              matched = coords;
              break;
            }
          }

          if (matched) {
            const offsetLat = (Math.random() - 0.5) * 0.04;
            const offsetLng = (Math.random() - 0.5) * 0.04;
            lat = matched.lat + offsetLat;
            lng = matched.lng + offsetLng;
            isEstimated = true;
          } else {
            const offsetLat = (Math.random() - 0.5) * 0.15;
            const offsetLng = (Math.random() - 0.5) * 0.15;
            lat = -6.2088 + offsetLat;
            lng = 106.8456 + offsetLng;
            isEstimated = true;
          }
        }

        const rawAddress = company.address || company.alamat || "";
        const finalAddress = isEstimated
          ? rawAddress
            ? `${rawAddress} (Estimasi Koordinat)`
            : "Koordinat estimasi berdasarkan wilayah"
          : rawAddress;

        return {
          lat,
          lng,
          name: company.name || company.company_name || "Perusahaan",
          address: finalAddress,
          contact: company.contact_person || company.pic || "",
          phone: company.phone || company.telp || "",
          email: company.email || "",
          deals: company.jumlahdeal || company.deals || 0,
          dealsValue: company.totaldealvalue || company.dealsvalue || 0,
        };
      });
    },
  },
  methods: {
    async loadAllData() {
      this.isLoadingDashboard = true;
      this.dashboardError = "";

      try {
        const requests = [
          ["datacard", api.get("dashboard/datacard")],
          ["dealsoverview", api.get("dashboard/dealsoverview")],
          ["systemactivity", api.get("dashboard/systemactivity")],
          ["topcontact", api.get("dashboard/topcontact")],
          ["topcompany", api.get("dashboard/topcompany")],
          ["tasklist", api.get("dashboard/tasklist")],
          ["topsalespeople", api.get("dashboard/topsalespeople")],
          [
            "companylocations",
            api
              .get("dashboard/company-locations")
              .catch(() => api.get("company-locations")),
          ], // Mendukung fallback jika tanpa prefix 'dashboard'
        ];

        const results = await Promise.allSettled(
          requests.map(([, request]) => request),
        );

        const payloads = {};
        const failedEndpoints = [];

        results.forEach((result, index) => {
          const [key] = requests[index];

          if (result.status === "fulfilled") {
            payloads[key] = this.getResponsePayload(result.value);
            return;
          }

          // Kunci 'companylocations' opsional dan aman jika gagal/legacy
          if (key !== "companylocations") {
            failedEndpoints.push(key);
          }
        });

        this.applyDashboardPayloads(payloads);

        if (failedEndpoints.length > 0) {
          this.dashboardError = `Sebagian data dashboard gagal dimuat: ${failedEndpoints.join(
            ", ",
          )}.`;
        }
      } finally {
        this.isLoadingDashboard = false;
      }
    },
    getResponsePayload(response) {
      const payload = response?.data;
      if (!payload || typeof payload !== "object") {
        return payload ?? null;
      }

      if (Object.prototype.hasOwnProperty.call(payload, "data")) {
        return payload.data;
      }

      return payload;
    },
    normalizeList(payload, preferredKeys = []) {
      if (Array.isArray(payload)) {
        return payload;
      }

      if (!payload || typeof payload !== "object") {
        return [];
      }

      const keys = [
        ...preferredKeys,
        "data",
        "items",
        "results",
        "list",
        "rows",
        "records",
        "payload",
      ];

      for (const key of keys) {
        const value = payload[key];
        if (Array.isArray(value)) {
          return value;
        }
      }

      for (const key of [
        "data",
        "items",
        "results",
        "list",
        "rows",
        "records",
        "payload",
      ]) {
        const value = payload[key];
        if (value && typeof value === "object") {
          const nested = this.normalizeList(value, preferredKeys);
          if (nested.length) {
            return nested;
          }
        }
      }

      return [];
    },
    normalizeNumber(value) {
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }

      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    },
    extractCount(payload, keys = [], fallback = 0) {
      if (Array.isArray(payload)) {
        return payload.length;
      }

      if (!payload || typeof payload !== "object") {
        return this.normalizeNumber(fallback);
      }

      for (const key of keys) {
        const value = payload[key];
        const normalized = this.normalizeNumber(value);
        if (normalized > 0 || value === 0 || value === "0") {
          return normalized;
        }
      }

      const nestedList = this.normalizeList(payload, keys);
      if (nestedList.length) {
        return nestedList.length;
      }

      return this.normalizeNumber(fallback);
    },
    applyDashboardPayloads(payloads) {
      const datacard = payloads.datacard || {};
      const dealsoverview = payloads.dealsoverview || {};
      const systemactivity = payloads.systemactivity || {};
      const topcontact = payloads.topcontact || {};
      const topcompany = payloads.topcompany || {};
      const tasklist = payloads.tasklist || {};
      const topsalespeople = payloads.topsalespeople || {};

      const deals = this.normalizeList(dealsoverview, [
        "data",
        "deals",
        "deal",
        "items",
        "rows",
        "records",
      ]).map((item) => ({
        ...item,
        pipeline_id: item.pipeline_id ?? item.pipelineId ?? item.id,
        jumlah: item.jumlah ?? item.total ?? item.count ?? 0,
      }));
      const activities = this.normalizeList(systemactivity, [
        "data",
        "activities",
        "activity",
        "logs",
        "items",
        "rows",
        "records",
      ]).map((item) => ({
        ...item,
        date: item.date || item.created_at || item.createdAt,
        user: item.user || item.user_id || item.userId,
        user_name: item.user_name || item.username || item.full_name,
        note: item.note || item.details || item.description || "-",
      }));
      const contacts = this.normalizeList(topcontact, [
        "data",
        "contacts",
        "contact",
        "items",
        "rows",
        "records",
      ]).map((item) => ({
        ...item,
        id: item.id ?? item.contact_id ?? item.contactId,
        name: item.name || item.contact || item.contact_name,
        contact_name: item.contact_name || item.contact || item.name,
        jumlahdeal: item.jumlahdeal ?? item.deals ?? item.total ?? 0,
        lastactivity:
          item.lastactivity || item.last_activity || item.created_at,
        dealsvalue:
          item.dealsvalue ?? item.amount_value ?? item.total_value ?? 0,
      }));
      const companies = this.normalizeList(topcompany, [
        "data",
        "companies",
        "company",
        "items",
        "rows",
        "records",
      ]).map((item) => ({
        ...item,
        id: item.id ?? item.company_id ?? item.companyId,
        name: item.name || item.company || item.company_name,
        company_name: item.company_name || item.company || item.name,
        jumlahdeal: item.jumlahdeal ?? item.deals ?? item.total ?? 0,
        totaldealvalue:
          item.totaldealvalue ?? item.dealsvalue ?? item.amount_value ?? 0,
        percentoftotal: item.percentoftotal ?? item.percent ?? 0,
        // Ambil koordinat dan data kontak dari response
        latitude: item.latitude ?? item.lat ?? null,
        longitude: item.longitude ?? item.lng ?? null,
        address: item.address ?? item.alamat ?? "",
        phone: item.phone ?? item.telp ?? "",
        email: item.email ?? "",
        contact_person: item.contact_person ?? item.pic ?? "",
      }));
      const tasks = this.normalizeList(tasklist, [
        "data",
        "tasks",
        "task",
        "items",
        "rows",
        "records",
      ]).map((item) => ({
        ...item,
        DueDate: item.DueDate || item.due_date || item.dueDate,
        taskname: item.taskname || item.task_name || item.title,
        pic: item.pic || item.assignee || item.owner || item.user_name,
        status: item.status || item.status_name || item.stage,
      }));
      const users = this.normalizeList(topsalespeople, [
        "data",
        "users",
        "user",
        "salespeople",
        "sales_people",
        "items",
        "rows",
        "records",
      ]).map((item) => ({
        ...item,
        name: item.name || item.user_name,
        jumlahdeals: item.jumlahdeals ?? item.deals ?? 0,
        jumlahwon: item.jumlahwon ?? item.won ?? 0,
      }));

      this.dashboardSummary = {
        contactsTotal: this.extractCount(
          datacard,
          [
            "totalcontact",
            "contactsTotal",
            "contacts_total",
            "totalContacts",
            "total_contacts",
            "contactCount",
            "contacts_count",
          ],
          contacts.length,
        ),
        companiesTotal: this.extractCount(
          datacard,
          [
            "totalcompany",
            "companiesTotal",
            "companies_total",
            "totalCompanies",
            "total_companies",
            "companyCount",
            "companies_count",
          ],
          companies.length,
        ),
        dealsTotal: this.extractCount(
          datacard,
          [
            "totalproject",
            "dealsTotal",
            "deals_total",
            "totalDeals",
            "total_deals",
            "dealCount",
            "deals_count",
          ],
          deals.length,
        ),
        tasksTotal: this.extractCount(
          datacard,
          [
            "totaltask",
            "tasksTotal",
            "tasks_total",
            "totalTasks",
            "total_tasks",
            "taskCount",
            "tasks_count",
          ],
          tasks.length,
        ),
      };

      this.dashboardDeals = deals;
      this.dashboardPipelines = this.normalizeList(dealsoverview, [
        "data",
        "pipelines",
        "pipeline",
        "stages",
        "groups",
      ]);
      this.dashboardActivities = activities;
      this.dashboardLeadsContacts = contacts;
      this.dashboardLeadsCompanies = companies;
      this.dashboardLeadsDeals = deals;
      this.dashboardTopContacts = this.normalizeList(topcontact, [
        "data",
        "topContacts",
        "contacts",
        "items",
        "rows",
        "records",
      ]);
      this.dashboardTopCompanies = companies;
      this.dashboardTasks = tasks;
      this.dashboardUsers = users;
      this.dashboardCompanyLocations = this.normalizeList(
        payloads.companylocations || [],
        ["data", "items", "rows", "records"],
      );
    },
  },
  mounted() {
    if ((this.allUsers || []).length === 0) {
      this.$store.dispatch("users/fetchAllusers").catch(() => {});
    }
    this.loadAllData();
  },
};
</script>

<template>
  <div>
    <!-- Header Refresh -->
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-2xl font-bold text-main-text">Dashboard</h1>
        <p v-if="dashboardError" class="mt-1 text-sm text-amber-600">
          {{ dashboardError }}
        </p>
      </div>
      <button
        class="flex items-center gap-2 px-4 py-2 border border-outline bg-white text-sub-text rounded-lg hover:bg-sub-text hover:text-white transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        :disabled="isLoadingDashboard"
        @click="loadAllData"
      >
        <span class="text-sm font-medium">Refresh</span>
        <RefreshCcw
          :size="18"
          :class="isLoadingDashboard ? 'animate-spin' : ''"
        />
      </button>
    </div>

    <!-- Summary Cards -->
    <Summary
      :contactsTotal="contactsTotal"
      :companiesTotal="companiesTotal"
      :dealsTotal="dealsTotal"
      :tasksTotal="tasksTotal"
      :isLoading="isSummaryLoading"
    />

    <!-- Deals and Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 mb-5">
      <Deals
        :deals="dealsList"
        :isLoadingDeals="isLoadingDeals"
        :pipelines="pipelines"
      />
      <Activity
        :activities="activities"
        :users="allUsers"
        :isLoading="isLoadingActivity"
      />
    </div>

    <!-- Map Card - Peta Sebaran Perusahaan -->
    <MapCard
      :locations="companyLocations"
      title="Peta Sebaran Perusahaan"
      :mapHeight="450"
      class="mb-5"
    />

    <!-- Top Contacts and Companies -->
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5 mb-5">
      <TopCont :contacts="topContactsList" :isLoading="isLoadingTopContacts" />
      <TopComp
        :companies="topCompaniesList"
        :isLoading="isLoadingTopCompanies"
      />
    </div>

    <!-- Task List and Top Salespeople -->
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 mb-5">
      <TaskList :tasks="taskListData" :isLoading="isLoadingTaskList" />
      <TopslsPeople :users="usersList" :isLoading="isLoadingUsers" />
    </div>
  </div>
</template>
