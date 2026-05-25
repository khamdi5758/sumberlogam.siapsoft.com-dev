<template>
  <div class="bg-white rounded-2xl shadow-sm border border-outline p-6 h-full">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-main-text">System Activity</h2>

      <div ref="filterMenuRef" class="relative">
        <button
          @click="toggleFilterMenu"
          class="flex items-center gap-2 text-sm text-slate-400 hover:text-main-text transition"
        >
          <span>{{ selectedRangeLabel }}</span>
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <div
          v-if="showFilterMenu"
          class="absolute right-0 mt-2 w-36 bg-white border border-outline rounded-lg shadow-lg z-20 py-1"
        >
          <button
            v-for="option in rangeOptions"
            :key="option.value"
            @click="selectRange(option.value)"
            class="w-full text-left px-3 py-2 text-sm hover:bg-outline/20 transition"
            :class="
              option.value === selectedRange
                ? 'font-semibold text-main-text'
                : 'text-sub-text'
            "
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Table Header (Desktop only) -->
    <div
      class="hidden md:grid grid-cols-3 text-sm text-slate-500 font-medium border-b border-outline pb-3"
    >
      <span>Date</span>
      <span>Action</span>
      <span>Note</span>
    </div>

    <!-- Activity List -->
    <div class="mt-2 max-h-64 overflow-y-auto pr-2">
      <div v-if="isLoading" class="py-8 text-center text-sm text-sub-text">
        Loading activities...
      </div>

      <template v-else>
        <div
          v-for="(item, index) in filteredActivities"
          :key="item.id || index"
          :class="[
            'py-3 text-sm',
            index % 2 === 1 ? 'bg-slate-100/60 rounded-sm' : '',
          ]"
        >
          <!-- Tampilan Mobile (Stack / Card) -->
          <div class="md:hidden space-y-1 px-2">
            <div>
              <span class="font-semibold text-slate-500">Date:</span>
              <span class="text-main-text ml-1">{{ item.displayDate }}</span>
            </div>
            <div>
              <span class="font-semibold text-slate-500">Action:</span>
              <span class="text-main-text ml-1">{{ item.displayAction }}</span>
            </div>
            <div>
              <span class="font-semibold text-slate-500">Note:</span>
              <span class="text-main-text ml-1">
                <span class="font-bold">{{ item.userName }}</span>
                {{ item.displayNote }}
              </span>
            </div>
          </div>

          <!-- Tampilan Desktop (Grid 3 kolom) -->
          <div class="hidden md:grid md:grid-cols-3">
            <span class="text-main-text font-medium">{{
              item.displayDate
            }}</span>
            <span class="text-main-text font-medium">{{
              item.displayAction
            }}</span>
            <span class="text-main-text">
              <span class="font-bold">{{ item.userName }}</span>
              {{ item.displayNote }}
            </span>
          </div>
        </div>

        <div
          v-if="filteredActivities.length === 0"
          class="py-8 text-center text-sm text-sub-text"
        >
          Belum ada aktivitas pada periode ini.
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "SystemActivity",
  props: {
    activities: {
      type: Array,
      default: () => [],
    },
    users: {
      type: Array,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showFilterMenu: false,
      selectedRange: "daily",
      rangeOptions: [
        { value: "daily", label: "Daily", days: 1 },
        { value: "weekly", label: "Weekly", days: 7 },
        { value: "monthly", label: "Monthly", days: 30 },
        { value: "yearly", label: "A Year", days: 365 },
      ],
    };
  },
  computed: {
    selectedRangeLabel() {
      const found = this.rangeOptions.find(
        (opt) => opt.value === this.selectedRange,
      );
      return found ? found.label : "Daily";
    },
    filteredActivities() {
      const selected = this.rangeOptions.find(
        (opt) => opt.value === this.selectedRange,
      );
      const days = selected?.days || 1;
      const now = Date.now();
      const cutoff = now - days * 24 * 60 * 60 * 1000;

      return this.activities
        .filter((item) => {
          const ts = new Date(
            item.date || item.created_at || item.createdAt,
          ).getTime();
          return Number.isFinite(ts) && ts >= cutoff;
        })
        .map((item) => ({
          ...item,
          date: item.date || item.created_at || item.createdAt,
          displayAction: this.resolveActionLabel(item),
          userName: this.resolveUserName(item),
          displayNote: this.buildNote(item),
          displayDate: this.formatDate(
            item.date || item.created_at || item.createdAt,
          ),
        }));
    },
  },
  methods: {
    resolveActionLabel(item = {}) {
      const rawAction = String(
        item.operation || item.choice || item.action || item.type || "",
      ).toLowerCase();
      const actionMap = {
        i: "Input",
        input: "Input",
        add: "Input",
        added: "Input",
        create: "Input",
        created: "Input",
        u: "Update",
        update: "Update",
        updated: "Update",
        edit: "Update",
        edited: "Update",
        d: "Delete",
        delete: "Delete",
        deleted: "Delete",
        remove: "Delete",
        removed: "Delete",
      };

      if (actionMap[rawAction]) {
        return actionMap[rawAction];
      }

      if (item.action) {
        const normalizedAction = String(item.action).trim();
        if (/^(i|input|add|added|create|created)$/i.test(normalizedAction)) {
          return "Input";
        }
        if (/^(u|update|updated|edit|edited)$/i.test(normalizedAction)) {
          return "Update";
        }
        if (/^(d|delete|deleted|remove|removed)$/i.test(normalizedAction)) {
          return "Delete";
        }
        return normalizedAction;
      }

      if (item.entity_name || item.entity) {
        return "Update";
      }

      return "Update";
    },
    resolveUserName(item = {}) {
      const candidateNames = [
        item.user_name,
        item.username,
        item.full_name,
        item.fullname,
        item.name,
      ].filter((value) => typeof value === "string" && value.trim());

      if (candidateNames.length) {
        return candidateNames[0];
      }

      const userId = item.user_id ?? item.userId ?? item.user;
      const matchedUser = (this.users || []).find((user) => {
        const candidateId =
          user?.id ?? user?.user_id ?? user?.userId ?? user?.id_user;
        return String(candidateId) === String(userId);
      });

      if (matchedUser) {
        return (
          matchedUser.name ||
          [matchedUser.firstname, matchedUser.lastname]
            .filter(Boolean)
            .join(" ") ||
          matchedUser.user_name ||
          matchedUser.username ||
          String(userId)
        );
      }

      if (userId !== undefined && userId !== null && String(userId).trim()) {
        return String(userId);
      }

      return "System";
    },
    getActivitySubject(item = {}) {
      const candidateFields = [
        item.target_name,
        item.record_name,
        item.subject,
        item.entity_name,
        item.company_name,
        item.contact_name,
        item.deal_name,
        item.task_name,
        item.project_name,
        item.title,
        item.label,
        item.name,
      ];

      for (const value of candidateFields) {
        if (typeof value === "string" && value.trim()) {
          return value.trim();
        }
      }

      if (item.entity) {
        return String(item.entity).replace(/_/g, " ");
      }

      return "data";
    },
    buildNote(item = {}) {
      const actionLabel = this.resolveActionLabel(item);
      const userName = this.resolveUserName(item);
      const subject = this.getActivitySubject(item);
      const rawDetail = [item.note, item.details, item.description]
        .find((value) => typeof value === "string" && value.trim())
        ?.trim();

      const verbMap = {
        Input: "menambahkan",
        Update: "memperbarui",
        Delete: "menghapus",
      };
      const verb = verbMap[actionLabel] || "memproses";
      const baseSentence = `${userName} ${verb} ${subject}`;

      if (!rawDetail) {
        return `${baseSentence}.`;
      }

      // If it looks like a JSON string, try to parse it for richer details
      if (
        (rawDetail.startsWith("{") && rawDetail.endsWith("}")) ||
        (rawDetail.startsWith("[") && rawDetail.endsWith("]"))
      ) {
        try {
          const details = JSON.parse(rawDetail);
          const readableDetail = this.formatDetails(details, actionLabel);
          if (readableDetail) {
            return `${baseSentence}: ${readableDetail}.`;
          }
        } catch (e) {
          // Fallback to raw string if parsing fails or isn't our expected format
        }
      }

      if (/^(?:-\s*)?(?:GET|POST|PUT|PATCH|DELETE)\s+/i.test(rawDetail)) {
        return `${baseSentence}.`;
      }

      return `${baseSentence}: ${rawDetail}.`;
    },
    formatFieldName(field) {
      if (!field) return "";
      // Handle special mappings
      const fieldMap = {
        companyassoc: "Company",
        contactassoc: "Contact",
        company_id: "Company",
        contact_id: "Contact",
        owner_id: "Owner",
        assigned_id: "Assignee",
        status_id: "Status",
        pipeline: "Stage/Pipeline",
        amount_value: "Amount",
        expected_close_date: "Expected Close",
        kd_kelurahan: "Kelurahan",
      };

      if (fieldMap[field]) return fieldMap[field];

      return field
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },
    shouldIgnoreField(field) {
      if (!field) return true;
      const ignored = [
        "id",
        "choice",
        "created_at",
        "updated_at",
        "created_by",
        "updated_by",
        "deleted_at",
        "user_id",
        "entity_id",
        "id_deals",
        "id_status",
        "id_leader",
        "id_project",
        "id_task",
        "parent_type",
        "parent_id",
        "visibility",
        "attachment",
        "lat",
        "lang",
        "latitude",
        "longitude",
      ];
      return ignored.includes(field.toLowerCase());
    },
    resolveValueLabel(field, value) {
      if (value === null || value === undefined || value === "") return "-";

      const val = String(value);
      const f = field.toLowerCase();

      if (f.includes("status")) {
        const statusMap = {
          1: "Open",
          2: "In Progress",
          3: "Pending",
          4: "Closed",
          5: "Cancelled",
          14: "Started",
          20: "New",
          23: "Done",
        };
        return statusMap[val] || val;
      }

      if (f.includes("priority")) {
        const priorityMap = {
          1: "Low",
          2: "Medium",
          3: "High",
        };
        return priorityMap[val] || val;
      }

      if (f.includes("pipeline") || f.includes("stage")) {
        const pipelineMap = {
          1: "Qualification",
          2: "Proposal",
          4: "Negotiation",
          5: "Closed Won",
        };
        return pipelineMap[val] || val;
      }

      return val;
    },
    formatDetails(details = {}, actionLabel = "") {
      const before = Array.isArray(details.before)
        ? details.before[0]
        : details.before;
      const after = details.after;

      if (actionLabel === "Update" && before && after) {
        const changes = [];
        // Loop through 'after' state to find what changed from 'before'
        Object.keys(after).forEach((key) => {
          if (this.shouldIgnoreField(key)) return;

          const valAfter = after[key];
          // Try to find matching value in 'before' (handling potential key naming variations)
          const beforeKeys = [
            key,
            key.replace("_id", "assoc"),
            key.replace("assoc", "_id"),
          ];
          let valBefore = undefined;
          for (const bKey of beforeKeys) {
            if (before[bKey] !== undefined) {
              valBefore = before[bKey];
              break;
            }
          }

          if (valBefore === undefined) return; // Field not in before state, skip comparison

          // Check for significant equality (handle nulls and strings/numbers)
          if (String(valBefore ?? "") !== String(valAfter ?? "")) {
            const labelBefore = this.resolveValueLabel(key, valBefore);
            const labelAfter = this.resolveValueLabel(key, valAfter);

            changes.push(
              `${this.formatFieldName(key)} dari ${labelBefore} ke ${labelAfter}`,
            );
          }
        });
        return changes.length > 0
          ? `Merubah ${changes.join(", ")}`
          : "Update informasi record";
      }

      if (actionLabel === "Input" && after) {
        // Find the first available name/title field to keep it short
        const priorityFields = [
          "deal_name",
          "company_name",
          "contact_name",
          "task_name",
          "project_name",
          "name",
          "title",
          "first_name",
        ];
        let identifier = null;
        for (const f of priorityFields) {
          if (after[f]) {
            identifier = after[f];
            if (f === "first_name" && after.last_name) {
              identifier += ` ${after.last_name}`;
            }
            break;
          }
        }

        return identifier ? `Nama: ${identifier}` : "Data baru ditambahkan";
      }

      if (actionLabel === "Delete" && before) {
        const identification =
          before.deal_name ||
          before.company_name ||
          before.contact_name ||
          before.task_name ||
          before.project_name ||
          before.name ||
          before.title ||
          (before.first_name
            ? `${before.first_name} ${before.last_name || ""}`
            : "");
        return identification ? `Data: ${identification}` : "Record dihapus";
      }

      return null;
    },
    formatDate(dateStr) {
      const dt = new Date(dateStr);
      if (Number.isNaN(dt.getTime())) return "-";

      const datePart = dt.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const timePart = dt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return `${datePart} - ${timePart}`;
    },
    toggleFilterMenu() {
      this.showFilterMenu = !this.showFilterMenu;
    },
    selectRange(value) {
      this.selectedRange = value;
      this.showFilterMenu = false;
    },
    handleClickOutside(event) {
      if (!this.showFilterMenu) return;
      if (
        this.$refs.filterMenuRef &&
        !this.$refs.filterMenuRef.contains(event.target)
      ) {
        this.showFilterMenu = false;
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>
