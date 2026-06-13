<script setup>
import Dashboard from "@/components/dashboard.vue";
import Contacts from "@/components/contacts.vue";
import LoginPage from "@/components/loginpage.vue";
import MainDashboard from "@/components/maindashboard.vue";
import Companies from "@/components/companies.vue";
import Deals from "@/components/deals/deals.vue";
import DealsList from "@/components/deals/dealslist.vue";
import DealsCard from "@/components/deals/dealscard.vue";
import Task from "@/components/task/task.vue";
import TaskList from "@/components/task/tasklist.vue";
import TaskCard from "@/components/task/taskcard.vue";
import TaskCalender from "@/components/task/taskcalender.vue";
import EmailBroadcast from "@/components/EmailBroadcast.vue";
import Documents from "@/components/documents/Documents.vue";
import DocumentList from "@/components/documents/DocumentList.vue";
import DocumentsTemplate from "@/components/documents/DocumentsTemplate.vue";
import DocumentsShortCode from "@/components/documents/DocumentsShortCode.vue";
import UserSetings from "@/components/user/usersettings/usersetings.vue";
import UserPermission from "@/components/user/userpermission.vue";
import UserTeam from "@/components/user/userteam.vue";
import User from "@/components/user/user.vue";
import SettingsPage from "@/components/Settings.vue";

import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Building2,
  Briefcase,
  CheckSquare,
  Mail,
  FileText,
  UserCircle,
  ListCollapse,
} from "lucide-vue-next";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const emit = defineEmits(["update:collapsed", "open-tab"]);

const collapsed = ref(false);
const isHovered = ref(false);

const mediaQuery = window.matchMedia("(max-width: 1200px)");

const handleMedia = (e) => {
  collapsed.value = e.matches;
};

onMounted(() => {
  collapsed.value = mediaQuery.matches;
  mediaQuery.addEventListener("change", handleMedia);
});

onBeforeUnmount(() => {
  mediaQuery.removeEventListener("change", handleMedia);
});

const sidebarWidth = computed(() => {
  if (collapsed.value) {
    return isHovered.value ? "w-64" : "w-20";
  }
  return "w-64";
});

const isExpanded = computed(() => {
  return !collapsed.value || isHovered.value;
});

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value;
  emit("update:collapsed", collapsed.value);
};
</script>

<template>
  <aside
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    :class="[
      'flex flex-col bg-dark-base text-slate-300 h-screen transition-all duration-300',
      collapsed && isHovered
        ? 'left-0 top-0 w-64 shadow-xl z-50'
        : !collapsed
          ? 'relative w-64'
          : 'relative w-20',
    ]"
  >
    <!-- Header -->
    <div
      :class="[
        'px-5 py-2 text-white text-2xl font-bold flex items-center border-b border-slate-800 shrink-0',
        isExpanded ? 'gap-2 justify-start' : 'justify-center',
      ]"
    >
      <span v-show="isExpanded" class="truncate">Siap App</span>
      <button
        @click="toggleCollapsed"
        :class="[
          'w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800',
          isExpanded ? 'ml-auto' : '',
        ]"
      >
        <ListCollapse :size="20" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 min-h-0 p-4 space-y-1 overflow-y-auto">
      <!-- Dashboard -->
      <button
        @click="
          emit('open-tab', {
            name: 'dashboard',
            title: 'Dashboard',
            component: Dashboard,
          })
        "
        :class="[
          'flex h-12 items-center p-3 rounded-xl transition group hover:bg-slate-800 hover:text-white w-full',
          isExpanded ? 'gap-3 justify-start' : 'justify-center',
        ]"
        :title="!isExpanded ? 'Dashboard' : ''"
      >
        <div class="w-6 flex justify-center">
          <LayoutDashboard :size="20" class="group-hover:text-blue-400" />
        </div>
        <span v-show="isExpanded" class="truncate">Dashboard</span>
      </button>

      <div
        :class="[
          'h-[0.75px] my-3 bg-outline transition-all duration-300',
          isExpanded ? 'w-20 mx-auto' : 'w-6 mx-auto',
        ]"
      ></div>

      <!-- Contacts -->
      <button
        @click="
          emit('open-tab', {
            name: 'contacts',
            title: 'Contacts',
            component: Contacts,
          })
        "
        :class="[
          'flex h-12 items-center p-3 rounded-xl transition group hover:bg-slate-800 hover:text-white w-full',
          isExpanded ? 'gap-3 justify-start' : 'justify-center',
        ]"
        :title="!isExpanded ? 'Contacts' : ''"
      >
        <div class="w-6 flex justify-center">
          <Users :size="20" class="group-hover:text-blue-400" />
        </div>
        <span v-show="isExpanded" class="truncate">Contacts</span>
      </button>

      <!-- Companies -->
      <button
        @click="
          emit('open-tab', {
            name: 'companies',
            title: 'Companies',
            component: Companies,
          })
        "
        :class="[
          'flex h-12 items-center p-3 rounded-xl transition group hover:bg-slate-800 hover:text-white w-full',
          isExpanded ? 'gap-3 justify-start' : 'justify-center',
        ]"
        :title="!isExpanded ? 'Companies' : ''"
      >
        <div class="w-6 flex justify-center">
          <Building2 :size="20" class="group-hover:text-blue-400" />
        </div>
        <span v-show="isExpanded" class="truncate">Companies</span>
      </button>

      <div
        :class="[
          'h-[0.75px] my-3 bg-outline transition-all duration-300',
          isExpanded ? 'w-20 mx-auto' : 'w-6 mx-auto',
        ]"
      ></div>

      <!-- Deals -->
      <button
        @click="
          emit('open-tab', { name: 'deals', title: 'Deals', component: Deals })
        "
        :class="[
          'flex h-12 items-center p-3 rounded-xl transition group hover:bg-slate-800 hover:text-white w-full',
          isExpanded ? 'gap-3 justify-start' : 'justify-center',
        ]"
        :title="!isExpanded ? 'Deals' : ''"
      >
        <div class="w-6 flex justify-center">
          <Briefcase :size="20" class="group-hover:text-blue-400" />
        </div>
        <span v-show="isExpanded" class="truncate">Deals</span>
      </button>

      <div
        :class="[
          'h-[0.75px] my-3 bg-outline transition-all duration-300',
          isExpanded ? 'w-20 mx-auto' : 'w-6 mx-auto',
        ]"
      ></div>

      <!-- Task -->
      <button
        @click="
          emit('open-tab', { name: 'task', title: 'Task', component: Task })
        "
        :class="[
          'flex h-12 items-center p-3 rounded-xl transition group hover:bg-slate-800 hover:text-white w-full',
          isExpanded ? 'gap-3 justify-start' : 'justify-center',
        ]"
        :title="!isExpanded ? 'Task' : ''"
      >
        <div class="w-6 flex justify-center">
          <CheckSquare :size="20" class="group-hover:text-blue-400" />
        </div>
        <span v-show="isExpanded" class="truncate">Task</span>
      </button>

      <!-- Broadcast -->
      <button
        @click="
          emit('open-tab', {
            name: 'emailbroadcast',
            title: 'Broadcast',
            component: EmailBroadcast,
          })
        "
        :class="[
          'flex h-12 items-center p-3 rounded-xl transition group hover:bg-slate-800 hover:text-white w-full',
          isExpanded ? 'gap-3 justify-start' : 'justify-center',
        ]"
        :title="!isExpanded ? 'Broadcast' : ''"
      >
        <div class="w-6 flex justify-center">
          <Mail :size="20" class="group-hover:text-blue-400" />
        </div>
        <span v-show="isExpanded" class="truncate">Broadcast</span>
      </button>

      <div
        :class="[
          'h-[0.75px] my-3 bg-outline transition-all duration-300',
          isExpanded ? 'w-20 mx-auto' : 'w-6 mx-auto',
        ]"
      ></div>

      <!-- Documents -->
      <button
        @click="
          emit('open-tab', {
            name: 'documents',
            title: 'Documents',
            component: Documents,
          })
        "
        :class="[
          'flex h-12 items-center p-3 rounded-xl transition group hover:bg-slate-800 hover:text-white w-full',
          isExpanded ? 'gap-3 justify-start' : 'justify-center',
        ]"
        :title="!isExpanded ? 'Documents' : ''"
      >
        <div class="w-6 flex justify-center">
          <FileText :size="20" class="group-hover:text-blue-400" />
        </div>
        <span v-show="isExpanded" class="truncate">Documents</span>
      </button>

      <div
        :class="[
          'h-[0.75px] my-3 bg-outline transition-all duration-300',
          isExpanded ? 'w-20 mx-auto' : 'w-6 mx-auto',
        ]"
      ></div>

      <!-- User -->
      <button
        @click="
          emit('open-tab', { name: 'user', title: 'User', component: User })
        "
        :class="[
          'flex h-12 items-center p-3 rounded-xl transition group hover:bg-slate-800 hover:text-white w-full',
          isExpanded ? 'gap-3 justify-start' : 'justify-center',
        ]"
        :title="!isExpanded ? 'User' : ''"
      >
        <div class="w-6 flex justify-center">
          <UserCircle :size="20" class="group-hover:text-blue-400" />
        </div>
        <span v-show="isExpanded" class="truncate">User</span>
      </button>

      <!-- Settings -->
      <button
        @click="
          emit('open-tab', {
            name: 'settings',
            title: 'Settings',
            component: SettingsPage,
          })
        "
        :class="[
          'flex h-12 items-center p-3 rounded-xl transition group hover:bg-slate-800 hover:text-white w-full',
          isExpanded ? 'gap-3 justify-start' : 'justify-center',
        ]"
        :title="!isExpanded ? 'Settings' : ''"
      >
        <div class="w-6 flex justify-center">
          <Settings :size="20" class="group-hover:text-blue-400" />
        </div>
        <span v-show="isExpanded" class="truncate">Settings</span>
      </button>
    </nav>

    <!-- Log Out -->
    <div class="p-4 border-t border-slate-800 shrink-0">
      <button
        :class="[
          'flex items-center p-3 w-full rounded-xl transition bg-dark-red text-white hover:bg-red-700',
          isExpanded ? 'gap-3 justify-start text-left' : 'justify-center',
        ]"
        :title="!isExpanded ? 'Log Out' : ''"
      >
        <LogOut :size="20" />
        <span v-show="isExpanded" class="font-medium truncate"> Log Out </span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* Gaya tambahan jika diperlukan */
</style>
