<style scoped>
.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 2px;
  height: 100%;
  cursor: col-resize;
  z-index: 20;
}

.resize-handle:hover {
  background-color: color-mix(in srgb, var(--color-dark-base) 70%, transparent);
}
</style>
<template>
  <div class="mt-4 flex-1 min-h-0 relative">
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-white/60 z-20 flex items-center justify-center"
    >
      <div class="flex flex-col items-center gap-3">
        <RefreshCw class="animate-spin text-blue-950" :size="32" />
        <p class="text-sm text-sub-text font-medium">Loading contacts...</p>
      </div>
    </div>

    <div class="h-full overflow-auto overflow-x-auto">
      <table class="table-fixed min-w-max">
        <thead
          class="sticky top-0 z-10 bg-white shadow-sm ring-1 ring-gray-200"
        >
          <tr class="border-b border-gray-200">
            <!-- CHECKBOX -->
            <th
              :style="{ width: columns[0] + 'px' }"
              class="relative px-6 py-4 text-left bg-white"
            >
              <input
                type="checkbox"
                class="w-4 h-4 text-blue-600 rounded focus:ring-sub-text border-gray-300"
                :checked="allSelected"
                @change="$emit('toggle-select-all', $event.target.checked)"
              />

              <div
                class="resize-handle"
                @mousedown="startResize($event, 0)"
              ></div>
            </th>

            <!-- CONTACT NAME -->
            <th
              :style="{ width: columns[1] + 'px' }"
              class="relative px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-white"
            >
              <div class="flex items-center gap-2">
                Contact Name
                <ChevronDown :size="16" class="text-gray-400" />
              </div>

              <div
                class="resize-handle"
                @mousedown="startResize($event, 1)"
              ></div>
            </th>

            <!-- CONTACT INFO -->
            <th
              :style="{ width: columns[2] + 'px' }"
              class="relative px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-white"
            >
              <div class="flex items-center gap-2">
                Contact Info
                <ChevronDown :size="16" class="text-gray-400" />
              </div>

              <div
                class="resize-handle"
                @mousedown="startResize($event, 2)"
              ></div>
            </th>

            <!-- ASSOCIATED -->
            <th
              :style="{ width: columns[3] + 'px' }"
              class="relative px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-white"
            >
              <div class="flex items-center gap-2">
                Associated with
                <ChevronDown :size="16" class="text-gray-400" />
              </div>

              <div
                class="resize-handle"
                @mousedown="startResize($event, 3)"
              ></div>
            </th>

            <!-- STATUS -->
            <th
              :style="{ width: columns[4] + 'px' }"
              class="relative px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-white"
            >
              <div class="flex items-center gap-2">
                Status
                <ChevronDown :size="16" class="text-gray-400" />
              </div>

              <div
                class="resize-handle"
                @mousedown="startResize($event, 4)"
              ></div>
            </th>

            <!-- CREATED -->
            <th
              :style="{ width: columns[5] + 'px' }"
              class="relative px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-white"
            >
              <div class="flex items-center gap-2">
                Created/Update
                <ChevronDown :size="16" class="text-gray-400" />
              </div>

              <div
                class="resize-handle"
                @mousedown="startResize($event, 5)"
              ></div>
            </th>

            <!-- OWNER -->
            <th
              :style="{ width: columns[6] + 'px' }"
              class="relative px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-white"
            >
              <div class="flex items-center gap-2">
                Owner
                <ChevronDown :size="16" class="text-gray-400" />
              </div>

              <div
                class="resize-handle"
                @mousedown="startResize($event, 6)"
              ></div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="contacts.length === 0 && !isLoading">
            <td colspan="7" class="px-6 py-20 text-center text-sub-text">
              <div class="flex flex-col items-center gap-3">
                <div
                  class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <Search :size="32" class="text-gray-400" />
                </div>
                <p class="text-lg font-medium">No contacts found</p>
                <p class="text-sm text-gray-400">
                  We couldn't find any contacts matching your criteria.
                </p>
                <button
                  @click="$emit('open-add-single')"
                  class="mt-2 text-blue-600 font-medium hover:underline text-sm"
                >
                  + Add Your First Contact
                </button>
              </div>
            </td>
          </tr>

          <tr
            v-for="contact in contacts"
            :key="contact.id"
            class="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
            @click="$emit('row-click', contact)"
          >
            <td
              class="px-6 py-4"
              :style="{ width: columns[0] + 'px' }"
              @click.stop
            >
              <input
                type="checkbox"
                class="w-4 h-4 text-blue-600 rounded focus:ring-sub-text border-gray-300"
                :checked="selectedIds.includes(contact.id)"
                @change="onToggleRow(contact.id, $event.target.checked)"
              />
            </td>

            <td
              class="px-6 py-4 text-sm text-gray-800 font-medium"
              :style="{ width: columns[1] + 'px' }"
            >
              {{ contact.first_name }} {{ contact.last_name }}
            </td>

            <td
              class="px-6 py-4 text-sm text-main-text"
              :style="{ width: columns[2] + 'px' }"
            >
              <div>{{ contact.email || "-" }}</div>
              <div
                class="text-xs text-sub-text"
                :style="{ width: columns[2] + 'px' }"
              >
                {{ contact.telephone_1 || "-" }}
              </div>
            </td>

            <td
              class="px-6 py-4 text-sm text-main-text leading-5"
              :style="{ width: columns[3] + 'px' }"
            >
              <div>{{ contact.companyLabelsText }}</div>
              <div>{{ contact.dealLabelsText }}</div>
            </td>

            <td class="px-6 py-4" :style="{ width: columns[4] + 'px' }">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="contact.statusClass"
              >
                {{ contact.statusName || contact.status || "Inactive" }}
              </span>
            </td>

            <td
              class="px-6 py-4 text-sm text-main-text"
              :style="{ width: columns[5] + 'px' }"
            >
              {{ contact.updatedAtText }}
            </td>

            <td
              class="px-6 py-4 text-sm text-main-text"
              :style="{ width: columns[6] + 'px' }"
            >
              {{ contact.owner || "-" }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ChevronDown, RefreshCw, Search } from "lucide-vue-next";

export default {
  name: "ContactsTable",
  components: { ChevronDown, RefreshCw, Search },
  props: {
    contacts: { type: Array, default: () => [] }, // contacts view-model sudah siap tampil
    isLoading: { type: Boolean, default: false },
    selectedIds: { type: Array, default: () => [] },
    allSelected: { type: Boolean, default: false },
  },

  emits: [
    "row-click",
    "open-add-single",
    "toggle-select-all",
    "update:selectedIds",
  ],

  methods: {
    startResize(e, index) {
      this.resizing = {
        index,
        startX: e.clientX,
        startWidth: this.columns[index],
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      document.addEventListener("mousemove", this.onResize);
      document.addEventListener("mouseup", this.stopResize);
    },

    onResize(e) {
      if (!this.resizing) return;

      const diff = e.clientX - this.resizing.startX;
      const newWidth = this.resizing.startWidth + diff;

      this.columns[this.resizing.index] = newWidth < 80 ? 80 : newWidth;
    },

    stopResize() {
      document.removeEventListener("mousemove", this.onResize);
      document.removeEventListener("mouseup", this.stopResize);

      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      this.resizing = null;
    },
  },

  data() {
    return {
      columns: [
        70, // checkbox
        220, // name
        260, // info
        240, // associated
        140, // status
        200, // created
        180, // owner
      ],
      resizing: null,
    };
  },
};
</script>
