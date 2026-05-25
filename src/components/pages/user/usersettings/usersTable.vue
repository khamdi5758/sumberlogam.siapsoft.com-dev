<template>
  <div class="h-full min-h-0 relative">
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

    <!-- Mobile List -->
    <div
      class="lg:hidden h-full min-h-0 overflow-y-auto overflow-x-hidden relative rounded-b-lg pr-1"
    >
      <div class="space-y-3 pb-2">
        <div
          v-if="users.length === 0 && !isLoading"
          class="px-2 py-8 text-center text-sub-text"
        >
          <div class="flex flex-col items-center gap-3">
            <div
              class="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <Search :size="28" class="text-gray-400" />
            </div>
            <p class="text-base font-medium">No users found</p>
            <p class="text-xs text-gray-400 px-6">
              Try refreshing or adding a new user
            </p>
          </div>
        </div>

        <article
          v-for="(user, index) in users"
          :key="user.id"
          class="mx-1 rounded-xl border border-outline bg-white p-4 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-light-base px-2 text-[11px] font-semibold text-main-text"
                >
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </span>
                <h3 class="truncate text-sm font-semibold text-gray-800">
                  {{
                    user.firstname
                      ? `${user.firstname} ${user.lastname || ""}`
                      : user.name || "Unknown User"
                  }}
                </h3>
              </div>
              <p class="mt-1 truncate text-xs text-gray-400">
                {{ user.email }}
              </p>
            </div>

            <span
              class="shrink-0 rounded-full bg-light-base px-2.5 py-1 text-[11px] font-semibold text-main-text"
            >
              {{ user.role || "-" }}
            </span>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div class="rounded-lg bg-gray-50 px-3 py-2">
              <p class="text-[10px] uppercase tracking-wider text-gray-400">
                Team
              </p>
              <p class="mt-1 truncate font-medium text-gray-700">
                {{ user.primaryteam || user.team || "-" }}
              </p>
            </div>
            <div class="rounded-lg bg-gray-50 px-3 py-2">
              <p class="text-[10px] uppercase tracking-wider text-gray-400">
                Last Active
              </p>
              <p class="mt-1 truncate font-medium text-gray-700">
                {{
                  user.last_active || user.lastactv || user.updated_at || "-"
                }}
              </p>
            </div>
          </div>

          <div
            class="mt-4 flex items-center justify-end gap-2 border-t border-outline pt-3"
          >
            <button
              @click="$emit('edit', user)"
              class="flex h-9 items-center gap-2 rounded-lg border border-outline bg-white px-3 text-xs font-medium text-sub-text transition active:scale-95 hover:bg-light-base hover:text-main-text"
              title="Edit User"
            >
              <Pencil :size="15" />
              Edit
            </button>
            <button
              @click="$emit('delete', user)"
              class="flex h-9 items-center gap-2 rounded-lg border border-outline bg-white px-3 text-xs font-medium text-red transition active:scale-95 hover:bg-red/5"
              title="Delete User"
            >
              <Trash2 :size="15" />
              Delete
            </button>
          </div>
        </article>
      </div>
    </div>

    <div
      class="hidden lg:block h-full min-h-0 overflow-y-auto overflow-x-auto relative rounded-b-lg"
    >
      <table class="w-full table-fixed border-collapse">
        <thead class="sticky top-0 z-10 bg-white">
          <tr
            class="border-b border-outline shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
          >
            <th
              class="w-10 px-4 py-4 text-left text-sm font-bold text-main-text bg-white"
            >
              No
            </th>
            <th
              class="w-auto px-4 py-4 text-left text-sm font-bold text-main-text bg-white"
            >
              Name(Email)
            </th>
            <th
              class="w-32 px-4 py-4 text-left text-sm font-bold text-main-text bg-white"
            >
              Team
            </th>
            <th
              class="w-40 px-4 py-4 text-left text-sm font-bold text-main-text bg-white"
            >
              Last Active
            </th>
            <th
              class="w-20 px-4 py-4 text-left text-sm font-bold text-main-text bg-white"
            >
              Role
            </th>
            <th
              class="w-28 px-4 py-4 text-sm font-bold text-main-text bg-white text-center"
            >
              Actions
            </th>
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
            <td class="px-4 py-4 text-sm text-main-text truncate">
              {{ user.primaryteam || user.team || "-" }}
            </td>
            <td class="px-4 py-4 text-sm text-main-text truncate">
              {{ user.last_active || user.lastactv || user.updated_at || "-" }}
            </td>
            <td class="px-4 py-4 text-sm text-main-text font-medium">
              {{ user.role }}
            </td>
            <td class="px-4 py-4 text-sm text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="$emit('edit', user)"
                  class="p-1.5 border border-outline bg-white text-sub-text hover:text-main-text hover:bg-light-base rounded shadow-sm transition-all active:scale-95"
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
import { RefreshCcw, Search, Pencil, Trash2 } from "lucide-vue-next";

export default {
  name: "UsersTable",
  components: { RefreshCcw, Search, Pencil, Trash2 },
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
