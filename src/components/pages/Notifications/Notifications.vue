<template>
  <div class="flex flex-col h-full">
    <div
      class="bg-white rounded-lg shadow-sm p-4 border border-outline flex flex-col min-h-0 flex-1 gap-4"
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-main-text">All Notifications</h2>
        <button
          v-if="unreadCount > 0"
          @click="markAllRead"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold"
        >
          Mark all as read
        </button>
      </div>

      <div class="flex gap-2 mb-4">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            selectedCategory === cat
              ? 'bg-dark-base text-white'
              : 'bg-white border border-outline text-sub-text hover:bg-gray-50',
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div
          v-if="filteredNotifications.length === 0"
          class="flex flex-col items-center justify-center py-12"
        >
          <div
            class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4"
          >
            <Bell :size="32" class="text-blue-500" />
          </div>
          <p class="text-lg font-bold text-main-text">No notifications yet</p>
          <p class="text-sub-text">Your notification list will appear here.</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="n in filteredNotifications"
            :key="n.id"
            @click="handleNotificationClick(n)"
            :class="[
              'flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer',
              n.is_read == 0
                ? 'bg-blue-50 border-blue-100 hover:bg-blue-100'
                : 'bg-white border-outline hover:bg-gray-50',
            ]"
          >
            <div class="relative flex-shrink-0">
              <div
                class="w-12 h-12 rounded-full bg-white border border-outline flex items-center justify-center shadow-sm"
              >
                <Bell
                  :size="24"
                  :class="n.is_read == 1 ? 'text-gray-400' : 'text-main-text'"
                />
              </div>
              <span
                v-if="n.is_read == 0"
                class="absolute top-0 right-0 w-3 h-3 rounded-full bg-dark-base border-2 border-white"
              ></span>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-4 mb-1">
                <h4 class="font-bold text-main-text truncate">
                  {{ n.title || "Notification" }}
                </h4>
                <span
                  class="text-xs font-medium text-gray-500 whitespace-nowrap"
                  >{{ timeAgo(n.created_at) }}</span
                >
              </div>
              <p class="text-sm text-gray-600 line-clamp-2">
                {{ n.body || n.message || "You have a new message." }}
              </p>
            </div>

            <button
              v-if="n.is_read == 0"
              @click.stop="markRead(n.id)"
              class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-outline bg-white text-blue-500 hover:bg-gray-50 transition-colors"
              title="Mark as read"
            >
              <Check :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Bell, Check } from "lucide-vue-next";
import { useNotifications } from "@/composables/useNotifications";

const {
  notifications,
  unreadCount,
  markRead,
  markAllRead,
  fetchNotifications,
} = useNotifications();

onMounted(() => {
  fetchNotifications();
});

const categories = ["All", "Unread", "Read"];
const selectedCategory = ref("All");

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

function handleNotificationClick(n) {
  if (n.is_read == 0) markRead(n.id);
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-outline, #e5e7eb);
  border-radius: 6px;
}
</style>
