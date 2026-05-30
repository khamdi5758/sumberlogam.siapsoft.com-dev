<template>
  <div
    class="md:hidden fixed bottom-0 w-full z-50 flex flex-row overflow-x-auto overflow-y-hidden h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] custom-scrollbar bg-white"
    :style="{ 
      backgroundColor: 'var(--layout-sidebar-bg)', 
      borderTop: '1px solid var(--layout-sidebar-border)' 
    }"
  >
    
    <div 
      @click="goTo('/crmAdmin/')" 
      class="flex flex-col items-center justify-center min-w-[72px] flex-shrink-0 h-full cursor-pointer transition hover:text-(--layout-sidebar-accent)"
      :style="{ color: isActive('/crmAdmin/') ? 'var(--layout-sidebar-accent)' : 'var(--layout-sidebar-muted)' }"
    >
      <LayoutDashboard :size="20" />
      <span class="text-[10px] mt-1 font-medium">Dashboard</span>
    </div>

    <div 
      @click="goTo('/crmAdmin/companies')" 
      class="flex flex-col items-center justify-center min-w-[72px] flex-shrink-0 h-full cursor-pointer transition hover:text-(--layout-sidebar-accent)"
      :style="{ color: isActive('/crmAdmin/companies') ? 'var(--layout-sidebar-accent)' : 'var(--layout-sidebar-muted)' }"
    >
      <Building2 :size="20" />
      <span class="text-[10px] mt-1 font-medium">Companies</span>
    </div>

    <div 
      @click="goTo('/crmAdmin/contacts')" 
      class="flex flex-col items-center justify-center min-w-[72px] flex-shrink-0 h-full cursor-pointer transition hover:text-(--layout-sidebar-accent)"
      :style="{ color: isActive('/crmAdmin/contacts') ? 'var(--layout-sidebar-accent)' : 'var(--layout-sidebar-muted)' }"
    >
      <UserCircle :size="20" />
      <span class="text-[10px] mt-1 font-medium">Contacts</span>
    </div>

    <div 
      @click="goTo('/crmAdmin/deals')" 
      class="flex flex-col items-center justify-center min-w-[72px] flex-shrink-0 h-full cursor-pointer transition hover:text-(--layout-sidebar-accent)"
      :style="{ color: isActive('/crmAdmin/deals') ? 'var(--layout-sidebar-accent)' : 'var(--layout-sidebar-muted)' }"
    >
      <Briefcase :size="20" />
      <span class="text-[10px] mt-1 font-medium">Deals</span>
    </div>
    
    <div 
      @click="goTo('/crmAdmin/project')" 
      class="flex flex-col items-center justify-center min-w-[72px] flex-shrink-0 h-full cursor-pointer transition hover:text-(--layout-sidebar-accent)"
      :style="{ color: isActive('/crmAdmin/project') ? 'var(--layout-sidebar-accent)' : 'var(--layout-sidebar-muted)' }"
    >
      <Package :size="20" />
      <span class="text-[10px] mt-1 font-medium">Projects</span>
    </div>

    <div 
      @click="goTo('/crmAdmin/task')" 
      class="flex flex-col items-center justify-center min-w-[72px] flex-shrink-0 h-full cursor-pointer transition hover:text-(--layout-sidebar-accent)"
      :style="{ color: isActive('/crmAdmin/task') ? 'var(--layout-sidebar-accent)' : 'var(--layout-sidebar-muted)' }"
    >
      <CheckSquare :size="20" />
      <span class="text-[10px] mt-1 font-medium">Tasks</span>
    </div>

    <div 
      @click="goTo('/crmAdmin/invoice')" 
      class="flex flex-col items-center justify-center min-w-[72px] flex-shrink-0 h-full cursor-pointer transition hover:text-(--layout-sidebar-accent)"
      :style="{ color: isActive('/crmAdmin/invoice') ? 'var(--layout-sidebar-accent)' : 'var(--layout-sidebar-muted)' }"
    >
      <FileText :size="20" />
      <span class="text-[10px] mt-1 font-medium">Invoice</span>
    </div>

    <div 
      @click="goTo('/crmAdmin/users')" 
      class="flex flex-col items-center justify-center min-w-[72px] flex-shrink-0 h-full cursor-pointer transition hover:text-(--layout-sidebar-accent)"
      :style="{ color: isActive('/crmAdmin/users') ? 'var(--layout-sidebar-accent)' : 'var(--layout-sidebar-muted)' }"
    >
      <Users :size="20" />
      <span class="text-[10px] mt-1 font-medium">User</span>
    </div>

    <div 
      @click="goTo('/crmAdmin/settings')" 
      class="flex flex-col items-center justify-center min-w-[72px] flex-shrink-0 h-full cursor-pointer transition hover:text-(--layout-sidebar-accent)"
      :style="{ color: isActive('/crmAdmin/settings') ? 'var(--layout-sidebar-accent)' : 'var(--layout-sidebar-muted)' }"
    >
      <Settings :size="20" />
      <span class="text-[10px] mt-1 font-medium">Settings</span>
    </div>

  </div>
</template>

<script>
import { 
  LayoutDashboard, 
  Building2, 
  UserCircle, 
  Briefcase, 
  Package,
  CheckSquare,
  FileText,
  Users,
  Settings
} from "lucide-vue-next";

export default {
  name: "BottomNavbar",
  emits: ['opentabchange'],
  components: {
    LayoutDashboard,
    Building2,
    UserCircle,
    Briefcase,
    Package,
    CheckSquare,
    FileText,
    Users,
    Settings
  },
  methods: {
    goTo(path) {
      if (!this.isActive(path)) {
        this.$router.push(path);
        
        const captions = {
          '/crmAdmin/': 'Dashboard',
          '/crmAdmin/companies': 'Companies',
          '/crmAdmin/contacts': 'Contacts',
          '/crmAdmin/deals': 'Deals',
          '/crmAdmin/project': 'Projects',
          '/crmAdmin/task': 'Tasks',
          '/crmAdmin/invoice': 'Invoice',
          '/crmAdmin/users': 'User',
          '/crmAdmin/settings': 'Settings'
        };
        
        this.$emit('opentabchange', {
          pathfile: path,
          CAPTION: captions[path] || 'Tab',
          NamaCaption: captions[path] || 'Tab'
        });
      }
    },
    isActive(path) {
      if (path === '/crmAdmin/') {
        return this.$route.path === '/crmAdmin' || this.$route.path === '/crmAdmin/';
      }
      return this.$route.path.startsWith(path);
    }
  }
}
</script>

<style scoped>
/* Hide scrollbar for a cleaner look while keeping functionality */
.custom-scrollbar::-webkit-scrollbar {
  display: none;
}
.custom-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
