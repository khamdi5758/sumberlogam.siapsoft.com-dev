<script>
import { mapGetters, mapActions } from "vuex";
import { X, Users, ChevronDown, Check, Search } from "lucide-vue-next";
import { alertService } from "@/services/alertService";

export default {
  name: "AreaUsersModal",

  components: {
    X,
    Users,
    ChevronDown,
    Check,
    Search,
  },

  emits: ["close"],

  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    area: {
      type: Object,
      default: function () {
        return null;
      },
    },
    apiPayload: {
      type: Object,
      default: function () {
        return null;
      },
    },
  },

  data() {
    return {
      editForm: {
        area_name: "",
        parent_id: null,
        selectedMembers: [], // New state for member selection
      },
      isParentDropdownOpen: false,
      parentSearch: "",

      // Member Selection State
      isDropdownOpen: false,
      memberSearch: "",

      dropdownRef: null,
      parentDropdownRef: null,

      // References
      areasList: [],
    };
  },

  computed: {
    ...mapGetters({
      allusersarea: "area/allusersarea",
      allAreas: "area/allAreaUsers",
      users: "users/allUsers", // Map users
    }),
    usersInArea: function () {
      return this.getNormalizedUsers(this.area, this.apiPayload);
    },

    filteredMembers() {
      if (!this.memberSearch) return this.users;
      return (this.users || []).filter(
        (m) =>
          (m.name || "")
            .toLowerCase()
            .includes(this.memberSearch.toLowerCase()) ||
          (m.email || "")
            .toLowerCase()
            .includes(this.memberSearch.toLowerCase()),
      );
    },

    totalUsersLabel: function () {
      if (!this.area) return 0;

      var totalFromApi = Number(this.area.total_users);

      if (!isNaN(totalFromApi) && totalFromApi >= 0) {
        return totalFromApi;
      }

      return this.usersInArea.length;
    },

    filteredParentAreas() {
      const areas = this.allAreas || [];
      const currentId = this.getAreaId(this.area);

      return areas
        .filter((t) => this.getAreaId(t) !== currentId) // Prevent selecting self as parent
        .filter((t) => {
          if (!this.parentSearch) return true;
          return (t.area_name || "")
            .toLowerCase()
            .includes(this.parentSearch.toLowerCase());
        });
    },

    parentName() {
      const parentId = this.editForm.parent_id;
      if (!parentId) return "None";
      const parent = (this.allAreas || []).find(
        (t) => this.getAreaId(t) === String(parentId),
      );
      return parent ? parent.area_name : "Unknown";
    },
  },

  methods: {
    ...mapActions({
      fetchUsersarea: "area/fetchUsersarea",
      saveArea: "area/saveArea",
    }),
    syncSelectedMembers(users) {
      if (Array.isArray(users)) {
        this.editForm.selectedMembers = users
          .map((user) => ({
            id: this.getUserId(user),
            name: user.name || user.username || "Unknown",
            email: user.email || "",
          }))
          .filter((m) => m.id);
      }
    },
    close: function () {
      this.$emit("close");
      this.isDropdownOpen = false;
      this.isParentDropdownOpen = false;
    },

    toComparableId: function (value) {
      if (value === null || value === undefined || value === "") return null;
      return String(value);
    },

    getAreaId: function (area) {
      if (!area) return null;
      const id = area.area_id ?? area.areaid ?? area.id ?? area.id_area;
      return id !== undefined && id !== null ? String(id) : "";
    },

    getUserId: function (user) {
      if (!user) return null;
      const id = user.user_id ?? user.userid ?? user.id ?? user.id_user;
      return id !== undefined && id !== null ? String(id) : "";
    },

    getUsersFromViewRows: function (area, apiPayload) {
      if (!area || typeof area !== "object") return [];

      var currentAreaId = this.getAreaId(area);

      var rowCandidates = [
        apiPayload && apiPayload.areas,
        apiPayload && apiPayload.data && apiPayload.data.areas,
        apiPayload && apiPayload.rows,
        apiPayload && apiPayload.data,
      ];

      for (var i = 0; i < rowCandidates.length; i++) {
        var candidate = rowCandidates[i];

        if (!Array.isArray(candidate)) continue;

        var users = candidate
          .filter(function (row) {
            return row && typeof row === "object";
          })
          .filter(
            function (row) {
              var rowAreaId = this.toComparableId(
                row.area_id || row.areaid || row.id_area,
              );

              if (!currentAreaId || !rowAreaId) return false;

              return rowAreaId === currentAreaId;
            }.bind(this),
          )
          .map(
            function (row, index) {
              var userId = this.toComparableId(
                row.user_id || row.userid || row.id_user || row.id,
              );

              if (!userId) return null;

              var fullName = [row.firstname, row.lastname]
                .filter(function (part) {
                  return typeof part === "string" && part.trim();
                })
                .join(" ")
                .trim();

              var name =
                row.name ||
                row.full_name ||
                row.username ||
                fullName ||
                row.email ||
                "User ID " + userId;

              return {
                id: userId,
                name: name,
                email: row.email || "",
                _order: index,
              };
            }.bind(this),
          )
          .filter(Boolean);

        if (!users.length) continue;

        var uniqueUsers = [];
        var seenIds = {};

        for (var j = 0; j < users.length; j++) {
          var user = users[j];

          if (seenIds[user.id]) continue;

          seenIds[user.id] = true;
          uniqueUsers.push(user);
        }

        return uniqueUsers;
      }

      return [];
    },

    parseUserIds: function (value) {
      if (Array.isArray(value)) {
        return value
          .map(
            function (item) {
              if (typeof item === "object") {
                return this.toComparableId(item.user_id || item.id);
              }
              return this.toComparableId(item);
            }.bind(this),
          )
          .filter(Boolean);
      }

      if (typeof value === "string") {
        return value
          .split(",")
          .map(
            function (item) {
              return this.toComparableId(item.trim());
            }.bind(this),
          )
          .filter(Boolean);
      }

      return [];
    },

    getLinkedUserIds: function (area, apiPayload) {
      if (!area || typeof area !== "object") return new Set();

      var currentAreaId = this.getAreaId(area);

      var relationCandidates = [
        area.user_area,
        area.area_users,
        area.area_user,
        apiPayload && apiPayload.user_area,
        apiPayload && apiPayload.area_users,
        apiPayload && apiPayload.area_user,
        apiPayload && apiPayload.relations,
      ];

      var userIds = new Set();

      for (var i = 0; i < relationCandidates.length; i++) {
        var candidate = relationCandidates[i];

        if (!Array.isArray(candidate)) continue;

        for (var j = 0; j < candidate.length; j++) {
          var row = candidate[j];

          if (!row || typeof row !== "object") continue;

          var relationAreaId = this.toComparableId(
            row.area_id || row.areaid || row.areaId || row.id_area,
          );

          var relationUserId = this.toComparableId(
            row.user_id || row.userid || row.userId || row.id_user || row.id,
          );

          if (!relationUserId) continue;

          if (
            currentAreaId &&
            relationAreaId &&
            relationAreaId !== currentAreaId
          ) {
            continue;
          }

          userIds.add(relationUserId);
        }
      }

      var inlineUserIdCandidates = [
        area.user_ids,
        area.users_id,
        area.member_ids,
        area.members_id,
        area.user_id,
        area.member_id,
      ];

      for (var k = 0; k < inlineUserIdCandidates.length; k++) {
        var candidateIds = this.parseUserIds(inlineUserIdCandidates[k]);

        for (var x = 0; x < candidateIds.length; x++) {
          userIds.add(candidateIds[x]);
        }
      }

      return userIds;
    },

    getNormalizedUsers: function (area, apiPayload) {
      if (!area || typeof area !== "object") return [];

      var usersFromViewRows = this.getUsersFromViewRows(area, apiPayload);

      if (usersFromViewRows.length) return usersFromViewRows;

      var linkedUserIds = this.getLinkedUserIds(area, apiPayload);

      var shouldFilterByLinkedIds = linkedUserIds.size > 0;

      var arrayCandidates = [
        area.users,
        area.members,
        area.user_list,
        area.member_list,
        apiPayload && apiPayload.users,
        apiPayload && apiPayload.members,
        apiPayload && apiPayload.user_list,
        apiPayload && apiPayload.member_list,
      ];

      for (var i = 0; i < arrayCandidates.length; i++) {
        var candidate = arrayCandidates[i];

        if (!Array.isArray(candidate)) continue;

        return candidate
          .map(
            function (item, index) {
              if (typeof item === "string") {
                if (shouldFilterByLinkedIds) return null;

                return { id: index, name: item, email: "" };
              }

              if (!item || typeof item !== "object") return null;

              var userId = this.toComparableId(
                item.id || item.user_id || item.userId,
              );

              if (shouldFilterByLinkedIds) {
                if (!userId || !linkedUserIds.has(userId)) return null;
              }

              var name =
                item.name ||
                item.full_name ||
                item.username ||
                ((item.firstname || "") + " " + (item.lastname || "")).trim() ||
                item.email ||
                "Unknown User";

              return {
                id: userId || index,
                name: name,
                email: item.email || "",
              };
            }.bind(this),
          )
          .filter(Boolean);
      }

      return [];
    },

    selectParent(area) {
      this.editForm.parent_id = this.getAreaId(area);
      this.isParentDropdownOpen = false;
      this.parentSearch = "";
    },

    // Member Selection Methods
    toggleMember(member) {
      const index = this.editForm.selectedMembers.findIndex(
        (m) => String(m.id) === String(member.id),
      );
      if (index === -1) {
        this.editForm.selectedMembers.push({
          id: member.id,
          name: member.name,
          email: member.email,
        });
      } else {
        this.editForm.selectedMembers.splice(index, 1);
      }
    },

    isMemberSelected(id) {
      return this.editForm.selectedMembers.some(
        (m) => String(m.id) === String(id),
      );
    },

    removeMember(id) {
      this.editForm.selectedMembers = this.editForm.selectedMembers.filter(
        (m) => String(m.id) !== String(id),
      );
    },

    async handleUpdate() {
      try {
        const payload = {
          id: this.getAreaId(this.area),
          areaName: this.editForm.area_name,
          parentArea: this.parentName === "None" ? "" : this.parentName,
          selectedMembers: this.editForm.selectedMembers.map((m) => m.id),
        };

        const result = await this.saveArea(payload);

        // After successful update, if we added members, we might need to refresh usersarea
        // But saveArea already dispatches fetchAllAreaUsers.
        // We actually want to refresh the local members list too.
        if (this.editForm.selectedMembers.length > 0) {
          this.fetchUsersarea({ idarea: payload.id });
          this.editForm.selectedMembers = []; // Reset after addition
        }

        alertService.success("Area updated successfully");
      } catch (err) {
        console.error("Failed to update area:", err);
        alertService.error("Failed to update area");
      }
    },

    handleClickOutside(event) {
      if (
        this.$refs.dropdownRef &&
        !this.$refs.dropdownRef.contains(event.target)
      ) {
        this.isDropdownOpen = false;
      }

      if (
        this.$refs.parentDropdownRef &&
        !this.$refs.parentDropdownRef.contains(event.target)
      ) {
        this.isParentDropdownOpen = false;
      }
    },
  },

  watch: {
    area(e, oldE) {
      if (e != null) {
        const areaId = this.getAreaId(e);
        const oldAreaId = this.getAreaId(oldE);

        if (areaId) {
          this.fetchUsersarea({ idarea: areaId });
        }

        // Auto-populate edit form when area changes
        this.editForm.area_name = e.area_name || "";

        // Reset and prepopulate if area ID actually changed
        if (areaId !== oldAreaId) {
          this.editForm.selectedMembers = [];
          // If we already have users in store for this area, prepopulate immediately
          if (Array.isArray(this.allusersarea)) {
            this.syncSelectedMembers(this.allusersarea);
          }
        }

        this.editForm.parent_id =
          e.parent_id || e.parentArea?.id || e.parent_area_id || null;
      }
    },
    allusersarea(e) {
      this.syncSelectedMembers(e);
    },
  },

  mounted() {
    this.$store.dispatch("users/fetchAllusers");
    document.addEventListener("mousedown", this.handleClickOutside);
  },

  beforeUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  },
};
</script>
<template>
  <Transition name="overlay">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-sub-text/80 z-40 transition-all duration-300"
      @click="$emit('close')"
    ></div>
  </Transition>

  <Transition name="slide">
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-screen w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
      @click.stop
    >
      <div
        class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10"
      >
        <h2 class="text-xl font-bold text-dark-base">Area Detail</h2>
        <div class="flex items-center gap-2">
          <button
            @click="close"
            class="p-2 hover:bg-light-base rounded-lg transition-colors"
          >
            <X :size="20" class="text-sub-text" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <div class="border border-outline rounded-lg p-4 space-y-4">
          <h3 class="text-sm font-semibold text-dark-base">Area Info</h3>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-sub-text mb-1">Area Name</p>
              <div>
                <input
                  v-model="editForm.area_name"
                  type="text"
                  class="w-full px-3 py-2 border border-outline rounded-lg text-sm focus:ring-1 focus:ring-sub-text outline-none"
                />
              </div>
            </div>
            <div>
              <p class="text-xs text-sub-text mb-1">Parent Name</p>
              <div class="relative" ref="parentDropdownRef">
                <div
                  @click="isParentDropdownOpen = !isParentDropdownOpen"
                  class="w-full px-3 py-2 border border-outline rounded-lg flex items-center justify-between cursor-pointer bg-white"
                >
                  <span class="text-sm">{{ parentName }}</span>
                  <ChevronDown :size="14" class="text-sub-text" />
                </div>

                <div
                  v-if="isParentDropdownOpen"
                  class="absolute z-50 w-full mt-1 bg-white border border-outline rounded-lg shadow-xl max-h-48 overflow-y-auto"
                >
                  <div class="p-2 border-b border-outline">
                    <div class="relative">
                      <Search
                        :size="12"
                        class="absolute left-2 top-1/2 -translate-y-1/2 text-sub-text"
                      />
                      <input
                        v-model="parentSearch"
                        type="text"
                        placeholder="Search..."
                        class="w-full pl-7 pr-2 py-1 bg-light-base border border-outline rounded text-xs outline-none"
                        @click.stop
                      />
                    </div>
                  </div>
                  <div class="py-1">
                    <div
                      @click="
                        editForm.parent_id = null;
                        isParentDropdownOpen = false;
                      "
                      class="px-4 py-2 hover:bg-light-base cursor-pointer text-xs"
                    >
                      None
                    </div>
                    <div
                      v-for="t in filteredParentAreas"
                      :key="getAreaId(t)"
                      @click="selectParent(t)"
                      class="px-4 py-2 hover:bg-light-base cursor-pointer flex items-center justify-between text-xs"
                    >
                      <span>{{ t.area_name }}</span>
                      <Check
                        v-if="editForm.parent_id === getAreaId(t)"
                        :size="12"
                        class="text-dark-base"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Team Member (Searchable Dropdown) -->
          <div class="relative" ref="dropdownRef">
            <p class="text-xs text-sub-text mb-1">Add Team Member</p>

            <div
              @click="isDropdownOpen = !isDropdownOpen"
              class="w-full px-3 py-2 border border-outline rounded-lg flex flex-wrap gap-2 items-center cursor-pointer min-h-10 bg-white transition focus-within:ring-1 focus-within:ring-sub-text"
            >
              <div
                v-if="editForm.selectedMembers.length === 0"
                class="text-gray-400 text-sm"
              >
                Search and select members
              </div>
              <div
                v-for="member in editForm.selectedMembers"
                :key="member.id"
                class="flex items-center gap-1 bg-light-base px-2 py-1 rounded text-xs font-medium text-dark-base border border-outline"
                @click.stop
              >
                {{ member.name }}
                <X
                  :size="12"
                  class="cursor-pointer hover:text-red"
                  @click="removeMember(member.id)"
                />
              </div>
              <ChevronDown :size="14" class="ml-auto text-sub-text" />
            </div>

            <!-- Dropdown Menu -->
            <div
              v-if="isDropdownOpen"
              class="absolute z-50 w-full mt-1 bg-white border border-outline rounded-lg shadow-xl flex flex-col max-h-64"
            >
              <div class="p-2 border-b border-outline">
                <div class="relative">
                  <Search
                    :size="14"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-sub-text"
                  />
                  <input
                    v-model="memberSearch"
                    type="text"
                    placeholder="Search by name or email"
                    class="w-full pl-9 pr-3 py-2 bg-light-base/50 border border-outline rounded text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
                    @click.stop
                  />
                </div>
              </div>
              <div class="flex-1 overflow-y-auto py-1">
                <div
                  v-for="member in filteredMembers"
                  :key="member.id"
                  @click="toggleMember(member)"
                  class="px-4 py-2 hover:bg-light-base cursor-pointer flex items-center justify-between text-sm transition"
                >
                  <div class="flex flex-col">
                    <span class="font-medium text-dark-base">{{
                      member.name
                    }}</span>
                    <span class="text-xs text-sub-text">{{
                      member.email
                    }}</span>
                  </div>
                  <div
                    v-if="isMemberSelected(member.id)"
                    class="w-5 h-5 bg-dark-base rounded-full flex items-center justify-center"
                  >
                    <Check :size="12" class="text-white" />
                  </div>
                </div>
                <div
                  v-if="filteredMembers.length === 0"
                  class="px-4 py-6 text-center text-sm text-sub-text"
                >
                  No members found
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-sub-text mb-1">Total Users</p>
              <p class="text-sm font-semibold text-dark-base">
                {{ totalUsersLabel }}
              </p>
            </div>
            <button
              @click="handleUpdate"
              class="px-4 py-2 bg-dark-base text-white rounded-lg text-sm font-bold hover:bg-dark-hover transition-colors"
            >
              Update Area
            </button>
          </div>
        </div>

        <div class="border border-outline rounded-lg p-4">
          <div class="flex items-center gap-2 mb-3">
            <Users :size="16" class="text-sub-text" />
            <h3 class="text-sm font-semibold text-dark-base">Users In Area</h3>
          </div>
          <ul v-if="allusersarea" class="space-y-2">
            <li
              v-for="user in allusersarea"
              :key="user.userid"
              class="px-3 py-2 rounded-lg bg-light-base border border-outline"
            >
              <p class="text-sm font-medium text-dark-base">{{ user.name }}</p>
              <p class="text-xs text-sub-text">ID: {{ user.userid }}</p>
              <p v-if="user.email" class="text-xs text-sub-text">
                {{ user.email }}
              </p>
            </li>
          </ul>
          <div
            v-else
            class="text-sm text-sub-text bg-light-base border border-outline rounded-lg px-3 py-2"
          >
            Daftar user tim belum tersedia dari API untuk area ini.
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
