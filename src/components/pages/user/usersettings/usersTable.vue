<template>
  <div class="mt-4 flex-1 min-h-0 relative">
    <!-- Loading Overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-white/60 z-20 flex items-center justify-center"
    >
      <div class="flex flex-col items-center gap-3">
        <RefreshCcw class="animate-spin text-sub-text" :size="32" />
        <p class="text-sm text-sub-text font-medium">Loading users...</p>
      </div>
    </div>

    <div class="h-full overflow-auto relative rounded-b-lg">
      <table class="w-full table-fixed border-collapse">
        <thead
          class="sticky top-0 z-10 bg-white"
        >
          <tr class="border-b border-outline shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <th class="w-10 px-4 py-4 text-left text-sm font-bold text-dark-base bg-white">No</th>
            <th class="w-auto px-4 py-4 text-left text-sm font-bold text-dark-base bg-white">Name(Email)</th>
            <th class="w-32 px-4 py-4 text-left text-sm font-bold text-dark-base bg-white">Team</th>
            <th class="w-40 px-4 py-4 text-left text-sm font-bold text-dark-base bg-white">Last Active</th>
            <th class="w-20 px-4 py-4 text-left text-sm font-bold text-dark-base bg-white">Role</th>
            <th class="w-28 px-4 py-4 text-left text-sm font-bold text-dark-base bg-white text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          <!-- Empty State -->
          <tr v-if="users.length === 0 && !isLoading">
            <td colspan="5" class="px-6 py-20 text-center text-sub-text">
              <div class="flex flex-col items-center gap-3">
                <div
                  class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <Search :size="32" class="text-gray-400" />
                </div>
                <p class="text-lg font-medium">No users found</p>
                <p class="text-sm text-gray-400">
                  Try refreshing or adding a new user
                </p>
              </div>
            </td>
          </tr>

          <!-- Table Rows -->
          <tr
            v-for="(user, index) in users"
            :key="user.id"
            class="border-b border-gray-100 hover:bg-gray-50 transition"
          >
            <td class="px-4 py-4 text-sm text-sub-text font-medium">
              {{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </td>
            <td class="px-4 py-4 text-sm truncate">
              <div class="font-medium text-gray-800 truncate">
                {{
                  user.firstname
                    ? `${user.firstname} ${user.lastname || ""}`
                    : user.name || "Unknown User"
                }}
              </div>
              <div class="text-xs text-gray-400 truncate">{{ user.email }}</div>
            </td>
            <td class="px-4 py-4 text-sm text-dark-base truncate">
              {{ user.primaryteam || user.team || "-" }}
            </td>
            <td class="px-4 py-4 text-sm text-dark-base truncate">
              {{ user.last_active || user.lastactv || user.updated_at || "-" }}
            </td>
            <td class="px-4 py-4 text-sm text-dark-base font-medium">
              {{ user.role }}
            </td>
            <td class="px-4 py-4 text-sm text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="$emit('edit', user)"
                  class="p-1.5 border border-outline bg-white text-sub-text hover:text-dark-base hover:bg-light-base rounded shadow-sm transition-all active:scale-95"
                  title="Edit User"
                >
                  <Pencil :size="16" />
                </button>
                <button
                  @click="$emit('delete', user)"
                  class="p-1.5 border border-outline bg-white text-sub-text hover:text-red hover:bg-red/5 rounded shadow-sm transition-all active:scale-95"
                  title="Delete User"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { RefreshCcw, Search, ChevronDown, Pencil, Trash2 } from "lucide-vue-next";

export default {
  name: "UsersTable",
  components: { RefreshCcw, Search, ChevronDown, Pencil, Trash2 },
  props: {
    users: { type: Array, default: () => [] },
    isLoading: { type: Boolean, default: false },
    currentPage: { type: Number, default: 1 },
    itemsPerPage: { type: Number, default: 5 },
    selectedIds: { type: Array, default: () => [] },
    allSelected: { type: Boolean, default: false },
  },
};
</script>
