<template>
  <div class="relative" ref="notificationRef">
    <!-- Bell Button -->
    <button
      @click="toggleNotification"
      class="notif-btn"
      :class="{ active: isNotificationOpen }"
      aria-label="Notifications"
    >
      <Bell :size="20" />
      <span v-if="unreadCount > 0" class="notif-dot" />
    </button>

    <!-- Dropdown Panel -->
    <Transition name="dropdown">
      <div v-if="isNotificationOpen" class="notif-panel">
        <!-- Header -->
        <div class="notif-header">
          <h3 class="notif-title">Notifications</h3>
          <button
            v-if="unreadCount > 0"
            @click.stop="markAllRead"
            class="mark-all-btn"
          >
            Mark all as read
          </button>
        </div>

        <!-- Category Dropdown -->
        <div class="category-wrap" ref="categoryRef">
          <button
            @click.stop="isCategoryDropdownOpen = !isCategoryDropdownOpen"
            class="category-btn"
          >
            <span>{{ selectedCategory }}</span>
            <ChevronDown
              :size="15"
              class="chevron"
              :class="{ rotated: isCategoryDropdownOpen }"
            />
          </button>

          <Transition name="dropdown">
            <div v-if="isCategoryDropdownOpen" class="category-list">
              <button
                v-for="cat in categories"
                :key="cat"
                @click.stop="selectCategory(cat)"
                class="category-item"
                :class="{ selected: selectedCategory === cat }"
              >
                {{ cat }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- Notification List -->
        <div class="notif-list custom-scrollbar">
          <!-- Empty state -->
          <div v-if="filteredNotifications.length === 0" class="notif-empty">
            <div class="empty-icon-wrap">
              <Bell :size="36" class="empty-icon" />
            </div>
            <p class="empty-title">No notifications yet</p>
            <p class="empty-sub">Your notification list will appear here.</p>
          </div>

          <!-- Items -->
          <div
            v-else
            v-for="n in filteredNotifications"
            :key="n.id"
            @click="handleNotificationClick(n)"
            class="notif-item"
            :class="{ unread: n.is_read == 0 }"
          >
            <!-- Avatar -->
            <div class="notif-avatar-wrap">
              <div class="notif-avatar">
                <Bell
                  :size="20"
                  :class="n.is_read == 1 ? 'icon-read' : 'icon-unread'"
                />
              </div>
              <span v-if="n.is_read == 0" class="unread-dot" />
            </div>

            <!-- Content -->
            <div class="notif-content">
              <div class="notif-row">
                <p class="notif-notif-title">{{ n.title || "Notification" }}</p>
                <span class="notif-time">{{ timeAgo(n.created_at) }}</span>
              </div>
              <p class="notif-body">
                {{ n.body || n.message || "You have a new message." }}
              </p>
            </div>

            <!-- Mark read button -->
            <button
              v-if="n.is_read == 0"
              @click.stop="markRead(n.id)"
              class="read-btn"
              title="Mark as read"
            >
              <Check :size="15" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Bell, ChevronDown, Check } from "lucide-vue-next";
import { useNotifications } from "@/composables/useNotifications";

// ── Notifications composable ────────────────────────────────────────
const {
  notifications,
  unreadCount,
  markRead,
  markAllRead,
  fetchNotifications,
} = useNotifications();

// ── Panel state ─────────────────────────────────────────────────────
const isNotificationOpen = ref(false);
const isCategoryDropdownOpen = ref(false);
const notificationRef = ref(null);
const categoryRef = ref(null);

function toggleNotification() {
  isNotificationOpen.value = !isNotificationOpen.value;
  if (!isNotificationOpen.value) {
    isCategoryDropdownOpen.value = false;
  } else {
    fetchNotifications();
  }
}

// ── Category filter ─────────────────────────────────────────────────
const categories = ["All", "Unread", "Read"];
const selectedCategory = ref("All");

function selectCategory(cat) {
  selectedCategory.value = cat;
  isCategoryDropdownOpen.value = false;
}

const filteredNotifications = computed(() => {
  let list = notifications.value.slice();

  if (selectedCategory.value === "Unread")
    list = list.filter((n) => n.is_read == 0);
  else if (selectedCategory.value === "Read")
    list = list.filter((n) => n.is_read == 1);

  list.sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return tb - ta; // newest first
  });

  return list;
});

// ── Click handler ───────────────────────────────────────────────────
function handleNotificationClick(n) {
  if (n.is_read == 0) markRead(n.id);
}

// ── Time ago helper ─────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ── Close on outside click ──────────────────────────────────────────
function handleOutsideClick(e) {
  if (notificationRef.value && !notificationRef.value.contains(e.target)) {
    isNotificationOpen.value = false;
    isCategoryDropdownOpen.value = false;
  }
}

onMounted(() => document.addEventListener("mousedown", handleOutsideClick));
onUnmounted(() =>
  document.removeEventListener("mousedown", handleOutsideClick),
);
</script>

<style scoped>
/* ── Transitions ──────────────────────────────────────────────────── */
.dropdown-enter-active {
  transition:
    opacity 100ms ease,
    transform 100ms ease;
}
.dropdown-leave-active {
  transition:
    opacity 75ms ease,
    transform 75ms ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

/* ── Bell button ──────────────────────────────────────────────────── */
.notif-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--color-sub-text, #9ca3af);
  cursor: pointer;
  transition:
    background 150ms,
    color 150ms;
}
.notif-btn:hover,
.notif-btn.active {
  background: var(--color-baris-genap, #f3f4f6);
  color: var(--color-dark-base, #111827);
}

/* ── Unread dot on bell ───────────────────────────────────────────── */
.notif-dot {
  position: absolute;
  top: 8px;
  right: 9px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--color-dark-base, #111827);
  border: 2px solid #fff;
}

/* ── Dropdown panel ───────────────────────────────────────────────── */
.notif-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 420px;
  background: #fff;
  border: 1px solid var(--color-outline, #e5e7eb);
  border-radius: 16px;
  box-shadow:
    0 20px 60px -12px rgba(0, 0, 0, 0.15),
    0 4px 16px -4px rgba(0, 0, 0, 0.08);
  z-index: 50;
  overflow: hidden;
}

/* ── Panel header ─────────────────────────────────────────────────── */
.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 12px;
}
.notif-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-dark-base, #111827);
  margin: 0;
}
.mark-all-btn {
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-sub-text, #6b7280);
  cursor: pointer;
  transition: background 150ms;
}
.mark-all-btn:hover {
  background: var(--color-baris-genap, #f3f4f6);
}

/* ── Category dropdown ────────────────────────────────────────────── */
.category-wrap {
  position: relative;
  padding: 0 20px 14px;
}
.category-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid var(--color-outline, #e5e7eb);
  border-radius: 8px;
  background: #fff;
  color: var(--color-sub-text, #6b7280);
  cursor: pointer;
  transition: background 150ms;
}
.category-btn:hover {
  background: var(--color-baris-genap, #f9fafb);
}
.chevron {
  transition: transform 150ms;
  color: #9ca3af;
}
.chevron.rotated {
  transform: rotate(180deg);
}

.category-list {
  position: absolute;
  left: 20px;
  right: 20px;
  top: calc(100% - 10px);
  background: #fff;
  border: 1px solid var(--color-outline, #e5e7eb);
  border-radius: 10px;
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.12);
  z-index: 60;
  overflow: hidden;
  padding: 4px;
}
.category-item {
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  font-size: 13px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #374151;
  cursor: pointer;
  transition: background 120ms;
}
.category-item:hover {
  background: var(--color-baris-genap, #f3f4f6);
}
.category-item.selected {
  background: var(--color-dark-base, #111827);
  color: #fff;
}

/* ── Notification list ────────────────────────────────────────────── */
.notif-list {
  max-height: 380px;
  overflow-y: auto;
  padding: 0 12px 12px;
}

/* ── Empty state ──────────────────────────────────────────────────── */
.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
}
.empty-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-light-base, #f0f9ff);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.empty-icon {
  color: var(--color-points, #3b82f6);
}
.empty-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-dark-base, #111827);
  margin: 0 0 4px;
}
.empty-sub {
  font-size: 13px;
  color: var(--color-sub-text, #9ca3af);
  margin: 0;
}

/* ── Notification item ────────────────────────────────────────────── */
.notif-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--color-outline, #e5e7eb);
  margin-bottom: 6px;
  background: #fff;
  cursor: pointer;
  transition:
    background 150ms,
    border-color 150ms;
}
.notif-item.unread {
  background: var(--color-pipeline, #eff6ff);
  border-color: transparent;
}
.notif-item:hover {
  background: var(--color-baris-genap, #f3f4f6);
}

/* ── Avatar ───────────────────────────────────────────────────────── */
.notif-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.notif-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid var(--color-outline, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.icon-read {
  color: var(--color-sub-text, #9ca3af);
}
.icon-unread {
  color: var(--color-dark-base, #111827);
}
.unread-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--color-dark-base, #111827);
  border: 2px solid #fff;
}

/* ── Content ──────────────────────────────────────────────────────── */
.notif-content {
  flex: 1;
  min-width: 0;
}
.notif-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 3px;
}
.notif-notif-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-dark-base, #111827);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}
.notif-time {
  font-size: 11px;
  font-weight: 500;
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
}
.notif-body {
  font-size: 12px;
  color: var(--color-sub-text, #6b7280);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

/* ── Mark read button ─────────────────────────────────────────────── */
.read-btn {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--color-outline, #e5e7eb);
  background: #fff;
  color: var(--color-progress-color, #3b82f6);
  cursor: pointer;
  transition: background 150ms;
}
.read-btn:hover {
  background: var(--color-baris-genap, #f3f4f6);
}

/* ── Custom scrollbar ─────────────────────────────────────────────── */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-outline, #e5e7eb);
  border-radius: 4px;
}
</style>
