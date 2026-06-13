<template>
  <div
    class="md:hidden fixed bottom-0 w-full z-50 overflow-x-auto overflow-y-hidden h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] custom-scrollbar"
    :style="{ 
      backgroundColor: 'var(--layout-sidebar-bg)', 
      borderTop: '1px solid var(--layout-sidebar-border)' 
    }"
  >
    <div class="flex flex-row h-full">
      <template v-for="item in parentMenus" :key="item.L1">

        <!-- Level 1: Parent Tab -->
        <div
          @click="handleL1Click(item)"
          class="flex flex-col items-center justify-center min-w-[72px] flex-shrink-0 h-full cursor-pointer transition-all duration-200 relative"
          :style="{
            color: isActiveL1(item) ? 'var(--layout-sidebar-accent)' : 'var(--layout-sidebar-muted)',
            backgroundColor: expandedL1 === item.L1
              ? 'color-mix(in srgb, var(--layout-sidebar-accent) 10%, transparent)'
              : 'transparent'
          }"
        >
          <component :is="getIcon(item.ICON)" :size="20" />
          <span class="text-[10px] mt-1 font-medium">{{ item.captionmenu }}</span>
          <div
            v-if="getChildren(item.L1).length > 0"
            class="absolute top-1 right-1 transition-transform duration-200"
            :style="{
              color: 'var(--layout-sidebar-muted)',
              transform: expandedL1 === item.L1 ? 'rotate(180deg)' : 'rotate(0deg)'
            }"
          >
            <ChevronUp :size="10" />
          </div>
        </div>

        <!-- Level 2: Inline expand setelah L1 -->
        <Transition name="expand-x">
          <div
            v-if="expandedL1 === item.L1 && getChildren(item.L1).length > 0"
            class="flex flex-row h-full flex-shrink-0"
            :style="{
              borderLeft: '1px solid var(--layout-sidebar-border)',
              borderRight: '1px solid var(--layout-sidebar-border)',
            }"
          >
            <div
              v-for="child in getChildren(item.L1)"
              :key="child.L1"
              :ref="el => { if (el) tabRefs[child.L1] = el }"
              @click.stop="handleL2Click(child)"
              class="flex flex-col items-center justify-center min-w-[76px] flex-shrink-0 h-full cursor-pointer transition-all duration-150 relative"
              :style="{
                color: isActiveL2(child) ? 'var(--layout-sidebar-accent)' : 'var(--layout-sidebar-muted)',
                backgroundColor: expandedL2 === child.L1 || isActiveL2(child)
                  ? 'color-mix(in srgb, var(--layout-sidebar-accent) 15%, transparent)'
                  : 'color-mix(in srgb, var(--layout-sidebar-accent) 5%, transparent)'
              }"
            >
              <component :is="getIcon(child.ICON)" :size="18" />
              <span class="text-[10px] mt-1 font-medium text-center leading-tight px-1">
                {{ child.CAPTION }}
              </span>
              <!-- Chevron jika punya L3 -->
              <div
                v-if="getChildren(child.L1).length > 0"
                class="absolute top-1 right-1 transition-transform duration-200"
                :style="{
                  color: 'var(--layout-sidebar-muted)',
                  transform: expandedL2 === child.L1 ? 'rotate(180deg)' : 'rotate(0deg)'
                }"
              >
                <ChevronUp :size="10" />
              </div>
              <!-- Active dot -->
              <div
                v-if="isActiveL2(child) && getChildren(child.L1).length === 0"
                class="absolute bottom-1 w-1 h-1 rounded-full"
                :style="{ backgroundColor: 'var(--layout-sidebar-accent)' }"
              />
            </div>
          </div>
        </Transition>

      </template>
    </div>
  </div>

  <!-- Level 3: Popover ke atas dari tab L2 -->
  <Teleport to="body">
    <Transition name="popover">
      <div
        v-if="activePopoverL2"
        class="md:hidden fixed z-[60]"
        :style="popoverStyle"
      >
        <div
          class="rounded-xl shadow-xl overflow-visible min-w-[160px]"
          :style="{
            backgroundColor: 'var(--layout-sidebar-bg)',
            border: '1px solid var(--layout-sidebar-border)'
          }"
        >
          <!-- Label parent L2 -->
          <div
            class="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider opacity-40"
            :style="{ color: 'var(--layout-sidebar-muted)' }"
          >
            {{ activePopoverL2.CAPTION }}
          </div>

          <!-- L3 Items -->
          <div class="flex flex-col py-1">
            <div
              v-for="grandchild in getChildren(activePopoverL2.L1)"
              :key="grandchild.L1"
              @click.stop="goTo(grandchild)"
              class="flex items-center gap-2 px-3 py-2.5 cursor-pointer transition mx-1 mb-1 rounded-lg"
              :style="{
                color: isChildActive(grandchild)
                  ? 'var(--layout-sidebar-accent)'
                  : 'var(--layout-sidebar-text)',
                backgroundColor: isChildActive(grandchild)
                  ? 'color-mix(in srgb, var(--layout-sidebar-accent) 12%, transparent)'
                  : 'transparent'
              }"
            >
              <component :is="getIcon(grandchild.ICON)" :size="16" />
              <span class="text-sm font-medium whitespace-nowrap">{{ grandchild.CAPTION }}</span>
            </div>
          </div>

          <!-- Arrow bawah -->
          <div
            class="absolute bottom-[-7px] w-3 h-3 rotate-45"
            :style="{
              left: arrowLeft + 'px',
              backgroundColor: 'var(--layout-sidebar-bg)',
              borderRight: '1px solid var(--layout-sidebar-border)',
              borderBottom: '1px solid var(--layout-sidebar-border)'
            }"
          />
        </div>
      </div>
    </Transition>

    <!-- Backdrop untuk close popover L3 -->
    <div
      v-if="activePopoverL2"
      class="md:hidden fixed inset-0 z-[59]"
      @click="closePopover"
    />

    <!-- Backdrop untuk close expand L2 -->
    <div
      v-else-if="expandedL1"
      class="md:hidden fixed inset-0 z-[49]"
      @click="closeAll"
    />
  </Teleport>
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
  Settings,
  ChevronUp,
} from "lucide-vue-next";

const ICON_MAP = {
  LayoutDashboard,
  Building2,
  UserCircle,
  Briefcase,
  Package,
  CheckSquare,
  FileText,
  Users,
  Settings,
};

export default {
  name: "BottomNavbar",
  emits: ["opentabchange"],
  components: { ...ICON_MAP, ChevronUp },

  props: {
    dbmenu2: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      expandedL1: null,      // L1 dari parent level 1 yang di-expand
      expandedL2: null,      // L1 dari parent level 2 yang aktif popover
      activePopoverL2: null, // item L2 yang popovernya terbuka
      popoverStyle: {},
      arrowLeft: 20,
      tabRefs: {},
    };
  },

  computed: {
    parentMenus() {
      return this.dbmenu2.filter((m) => m.TreeLevel === "1");
    },
  },

  methods: {
    getIcon(iconName) {
      return ICON_MAP[iconName] || LayoutDashboard;
    },

    // Ambil children berdasarkan nilai Parent (= L1 milik parent)
    getChildren(parentL1) {
      return this.dbmenu2.filter((m) => m.Parent === parentL1);
    },

    // ── Level 1 ──────────────────────────────────────────
    handleL1Click(item) {
      const children = this.getChildren(item.L1);

      if (children.length === 0) {
        this.closeAll();
        this.goTo(item);
        return;
      }

      if (this.expandedL1 === item.L1) {
        this.closeAll();
      } else {
        this.expandedL1 = item.L1;
        this.expandedL2 = null;
        this.activePopoverL2 = null;
      }
    },

    // ── Level 2 ──────────────────────────────────────────
    handleL2Click(item) {
      const children = this.getChildren(item.L1);

      if (children.length === 0) {
        this.closeAll();
        this.goTo(item);
        return;
      }

      // Toggle popover L3
      if (this.expandedL2 === item.L1) {
        this.closePopover();
      } else {
        this.openPopover(item);
      }
    },

    openPopover(item) {
      const tabEl = this.tabRefs[item.L1];
      if (!tabEl) return;

      const rect = tabEl.getBoundingClientRect();
      const popoverWidth = 170;
      const screenWidth = window.innerWidth;
      const bottomNavHeight = 64;

      let left = rect.left + rect.width / 2 - popoverWidth / 2;
      left = Math.max(8, Math.min(left, screenWidth - popoverWidth - 8));

      const arrowLeft = rect.left + rect.width / 2 - left - 6;
      this.arrowLeft = Math.max(10, Math.min(arrowLeft, popoverWidth - 22));

      this.popoverStyle = {
        left: left + 'px',
        bottom: bottomNavHeight + 10 + 'px',
      };

      this.expandedL2 = item.L1;
      this.activePopoverL2 = item;
    },

    closePopover() {
      this.activePopoverL2 = null;
      this.expandedL2 = null;
    },

    closeAll() {
      this.expandedL1 = null;
      this.expandedL2 = null;
      this.activePopoverL2 = null;
    },

    // ── Navigate ─────────────────────────────────────────
    goTo(item) {
      this.closeAll();
      this.$router.push(item.pathfile);
      this.$emit("opentabchange", {
        pathfile: item.pathfile,
        CAPTION: item.CAPTION,
        NamaCaption: item.NamaCaption?.trim(),
      });
    },

    // ── Active state ─────────────────────────────────────
    isActiveL1(item) {
      // Aktif jika route cocok dengan salah satu descendant
      const descendants = this.getAllDescendants(item.L1);
      if (descendants.length > 0) {
        return descendants.some((d) => this.$route.path.startsWith(d.pathfile));
      }
      if (item.pathfile === "/crmAdmin") {
        return this.$route.path === "/crmAdmin" || this.$route.path === "/crmAdmin/";
      }
      return this.$route.path.startsWith(item.pathfile);
    },

    isActiveL2(item) {
      const descendants = this.getAllDescendants(item.L1);
      if (descendants.length > 0) {
        return descendants.some((d) => this.$route.path.startsWith(d.pathfile));
      }
      return this.$route.path.startsWith(item.pathfile);
    },

    isChildActive(item) {
      return this.$route.path.startsWith(item.pathfile);
    },

    // Rekursif: ambil semua keturunan dari suatu node
    getAllDescendants(parentL1) {
      const direct = this.getChildren(parentL1);
      if (direct.length === 0) return [];
      return direct.reduce((acc, child) => {
        return [...acc, child, ...this.getAllDescendants(child.L1)];
      }, []);
    },
  },
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { display: none; }
.custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.expand-x-enter-active,
.expand-x-leave-active {
  transition: max-width 0.25s ease, opacity 0.2s ease;
  max-width: 600px;
}
.expand-x-enter-from,
.expand-x-leave-to {
  max-width: 0;
  opacity: 0;
}

.popover-enter-active,
.popover-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>