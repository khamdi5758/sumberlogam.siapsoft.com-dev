<template>
  <section
    class="bg-white rounded-xl border border-outline shadow-sm overflow-hidden"
  >
    <div class="p-4 border-b border-outline">
      <!-- Top Section: Selects & Buttons -->
      <div class="flex flex-col lg:flex-row lg:items-end gap-4 w-full">
        <!-- LEFT: Selects -->
        <div class="flex flex-col sm:flex-row gap-3 flex-1 min-w-0">
          <!-- Select User -->
          <div class="flex-1 min-w-0 sm:min-w-64">
            <label class="mb-1 block text-sm font-medium text-sub-text">
              Select User:
            </label>
            <select
              v-model="selectedUserEmail"
              class="w-full rounded-lg border border-outline bg-white py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
            >
              <option v-for="email in userOptions" :key="email" :value="email">
                {{ email }}
              </option>
            </select>
          </div>

          <!-- Select Authority Profile -->
          <div class="flex-1 min-w-0 sm:min-w-56">
            <label class="mb-1 block text-sm font-medium text-sub-text">
              Authority Profile:
            </label>
            <select
              v-model="selectedProfile"
              class="w-full rounded-lg border border-outline bg-white py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
            >
              <option
                v-for="profile in authorityProfiles"
                :key="profile"
                :value="profile"
              >
                {{ profile }}
              </option>
            </select>
          </div>

          <!-- Refresh Button -->
          <button
            @click="loadPermissionFromApi"
            :disabled="isLoadingPermission"
            class="h-10 w-10 lg:h-9 lg:w-9 rounded-lg border border-outline bg-white p-2 transition-all hover:bg-light-base active:scale-95 disabled:opacity-50 self-end"
            title="Refresh Data"
          >
            <RefreshCcw
              :size="18"
              :class="{ 'animate-spin': isLoadingPermission }"
              class="text-sub-text"
            />
          </button>
        </div>

        <!-- RIGHT: Save Button -->
        <button
          @click="savePermissionToApi"
          :disabled="isSavingPermission || isLoadingPermission"
          class="rounded-lg bg-dark-base border border-primary bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 w-full lg:w-auto"
        >
          {{ isSavingPermission ? "Saving..." : "Save Changes" }}
        </button>
      </div>
    </div>

    <div class="relative overflow-x-auto">
      <div
        v-if="isLoadingPermission"
        class="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center"
      >
        <div class="flex flex-col items-center gap-3">
          <RefreshCcw :size="32" class="animate-spin text-sub-text" />
          <p class="text-sm font-medium text-sub-text">
            Loading permissions...
          </p>
        </div>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50/50">
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Menu
            </th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Username
            </th>
            <th
              class="px-6 py-4 text-center text-sm font-semibold text-gray-700"
            >
              Access
            </th>
            <th
              class="px-6 py-4 text-center text-sm font-semibold text-gray-700"
            >
              Add
            </th>
            <th
              class="px-6 py-4 text-center text-sm font-semibold text-gray-700"
            >
              Delete
            </th>
            <th
              class="px-6 py-4 text-center text-sm font-semibold text-gray-700"
            >
              Edit
            </th>
            <th
              class="px-6 py-4 text-center text-sm font-semibold text-gray-700"
            >
              Export
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="row in visiblePermissions"
            :key="row.id"
            class="border-b border-gray-100 hover:bg-gray-50 transition"
          >
            <td class="px-6 py-3 text-sm text-gray-800 font-medium">
              <span class="mr-1 text-gray-400">&#9656;</span>{{ row.menu }}
            </td>
            <td class="px-6 py-3 text-sm text-dark-base">
              {{ selectedUserEmail }}
            </td>
            <td class="px-6 py-3 text-center">
              <input
                v-model="row.akses"
                @change="queueAutoSave"
                type="checkbox"
                class="w-4 h-4 text-blue-600 rounded focus:ring-sub-text border-gray-300"
              />
            </td>
            <td class="px-6 py-3 text-center">
              <input
                v-model="row.tambah"
                @change="queueAutoSave"
                type="checkbox"
                class="w-4 h-4 text-blue-600 rounded focus:ring-sub-text border-gray-300"
              />
            </td>
            <td class="px-6 py-3 text-center">
              <input
                v-model="row.hapus"
                @change="queueAutoSave"
                type="checkbox"
                class="w-4 h-4 text-blue-600 rounded focus:ring-sub-text border-gray-300"
              />
            </td>
            <td class="px-6 py-3 text-center">
              <input
                v-model="row.koreksi"
                @change="queueAutoSave"
                type="checkbox"
                class="w-4 h-4 text-blue-600 rounded focus:ring-sub-text border-gray-300"
              />
            </td>
            <td class="px-6 py-3 text-center">
              <input
                v-model="row.export"
                @change="queueAutoSave"
                type="checkbox"
                class="w-4 h-4 text-blue-600 rounded focus:ring-sub-text border-gray-300"
              />
            </td>
          </tr>

          <tr v-if="visiblePermissions.length === 0">
            <td colspan="7" class="px-6 py-20 text-center text-sub-text">
              No permission data available.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
import { mapGetters } from "vuex";
import { RefreshCcw } from "lucide-vue-next";
import api from "@/api";
import { alertService } from "@/services/alertService";

const defaultUsers = [
  "fadlikhamdi@gmail.com",
  "hanan@mail.com",
  "aulia@mail.com",
  "rizky@mail.com",
];

const projectMenus = [
  "Dashboard",
  "Contacts",
  "Companies",
  "Deals",
  "Task",
  "Broadcast",
  "Documents",
  "Users",
  "Settings",
];

export default {
  name: "UserPermission",
  components: {
    RefreshCcw,
  },
  data() {
    return {
      permissionScope: "Otoritas User",
      apiHeaders: { keyfe: "0-opklm," },
      authorityProfiles: ["User Authority 1", "User Authority 2"],
      selectedProfile: "User Authority 1",
      selectedUserEmail: defaultUsers[0],
      isLoadingPermission: false,
      isSavingPermission: false,
      autoSaveTimer: null,
      menuPermissions: [],
      projectMenus,
      defaultUsers,
    };
  },
  computed: {
    ...mapGetters({
      usersList: "users/usersList",
      layoutMenuWeb: "settingsfe/getlayoutmenuweb",
    }),

    userOptions() {
      const users = this.usersList || [];
      const emails = users
        .map((user) => user.email)
        .filter((email) => typeof email === "string" && email.trim() !== "");
      return emails.length > 0 ? [...new Set(emails)] : defaultUsers;
    },

    selectedUsername() {
      const users = this.usersList || [];
      const selectedUser = users.find(
        (user) => user.email === this.selectedUserEmail,
      );
      const fromStore =
        selectedUser?.username ||
        selectedUser?.user_name ||
        selectedUser?.userid ||
        selectedUser?.name;

      if (typeof fromStore === "string" && fromStore.trim() !== "") {
        return fromStore;
      }

      const localPart = String(this.selectedUserEmail || "").split("@")[0];
      return localPart || "";
    },

    dbTopLevelMenus() {
      const dbmenu2 = this.layoutMenuWeb?.dbmenu2 || [];
      const names = dbmenu2
        .filter((item) => item.L0 === "0" && item.HASACCESS === "1")
        .map((item) => item.NamaCaption || item.label || item.pathfile)
        .filter((name) => typeof name === "string" && name.trim() !== "");
      return [...new Set(names)];
    },

    effectiveMenuNames() {
      return this.dbTopLevelMenus.length > 0
        ? this.dbTopLevelMenus
        : projectMenus;
    },

    visiblePermissions() {
      return this.menuPermissions;
    },
  },

  watch: {
    effectiveMenuNames: {
      handler(menuNames) {
        this.syncMenuPermissions(menuNames);
      },
      immediate: true,
    },
    selectedUserEmail() {
      this.loadPermissionFromApi();
    },
    selectedProfile() {
      this.loadPermissionFromApi();
    },
  },

  methods: {
    fallbackIconByMenu(menuName) {
      const name = String(menuName || "").toLowerCase();
      if (name.includes("dashboard")) return "LayoutDashboard";
      if (name.includes("contact")) return "Users";
      if (name.includes("compan")) return "Building2";
      if (name.includes("deal")) return "Briefcase";
      if (name.includes("task")) return "CheckSquare";
      if (name.includes("broadcast") || name.includes("email")) return "Mail";
      if (name.includes("document")) return "FileText";
      if (name.includes("user")) return "UserCircle";
      if (name.includes("setting")) return "Settings";
      return "FileText";
    },

    resolveNonEmptyIcon(row = {}) {
      const direct = String(row.icon || row.ICON || "").trim();
      if (direct) return direct;

      const dbmenu2 = this.layoutMenuWeb?.dbmenu2 || [];
      const caption = String(
        row.caption || row.CAPTION || row.menu || "",
      ).trim();

      if (caption) {
        const matched = dbmenu2.find((item) => {
          const itemCaption = String(
            item?.CAPTION || item?.NamaCaption || item?.caption || "",
          ).trim();
          return itemCaption.toLowerCase() === caption.toLowerCase();
        });

        const fromLayout = String(matched?.icon || matched?.ICON || "").trim();
        if (fromLayout) return fromLayout;
      }

      return this.fallbackIconByMenu(caption);
    },

    buildDefaultPermission(menu, id) {
      return {
        id,
        username: this.selectedUsername,
        menu,
        menuid: null,
        caption: menu,
        name: menu,
        L0: "0",
        Parent: "0",
        pathfile: "",
        icon: this.fallbackIconByMenu(menu),
        accessLevel: 0,
        hasaccess: true,
        akses: true,
        tambah: true,
        hapus: true,
        koreksi: true,
        export: false,
        status: 0,
        flagkrm: null,
        imageIndex: -1,
        l1lama: 0,
        accesslama: 0,
      };
    },

    syncMenuPermissions(menuNames) {
      const previousByMenu = new Map(
        this.menuPermissions.map((row) => [row.menu, row]),
      );

      this.menuPermissions = menuNames.map((menu, index) => {
        const existing = previousByMenu.get(menu);
        return existing
          ? { ...existing, id: index + 1 }
          : this.buildDefaultPermission(menu, index + 1);
      });
    },

    toBool(value, fallback = false) {
      if (typeof value === "boolean") return value;
      if (typeof value === "number") return value === 1;
      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return (
          normalized === "1" || normalized === "true" || normalized === "y"
        );
      }
      return fallback;
    },

    normalizePermissionRows(rawRows) {
      if (!Array.isArray(rawRows)) return [];

      return rawRows
        .map((row, index) => {
          const menuName =
            row.CAPTION ||
            row.menu ||
            row.nama_menu ||
            row.NAMACAPTION ||
            row.NamaCaption ||
            row.caption ||
            row.label ||
            row.pathfile ||
            "";

          if (typeof menuName !== "string" || menuName.trim() === "") {
            return null;
          }

          return {
            id: index + 1,
            username: row.username || row.USERID || this.selectedUsername,
            menuid: row.menuid || row.id_menu || row.id || row.L1 || null,
            menu: row.name || row.NAME || menuName,
            name: row.name || row.NAME || menuName,
            caption: row.CAPTION || row.caption || menuName,
            L0: String(row.L0 ?? row.l0 ?? "0"),
            Parent: String(row.Parent ?? row.parent ?? row.parendId ?? "0"),
            pathfile: row.pathfile || row.PATHFILE || "",
            icon: this.resolveNonEmptyIcon(row),
            accessLevel: Number(row.ACCESS ?? row.access ?? 0),
            hasaccess: this.toBool(row.HASACCESS ?? row.hasaccess, true),
            akses: this.toBool(
              row.HASACCESS ?? row.hasaccess ?? row.akses,
              true,
            ),
            tambah: this.toBool(
              row.tambah ?? row.TAMBAH ?? row.add ?? row.can_add,
              true,
            ),
            hapus: this.toBool(
              row.hapus ?? row.HAPUS ?? row.delete ?? row.can_delete,
              true,
            ),
            koreksi: this.toBool(
              row.koreksi ?? row.KOREKSI ?? row.edit ?? row.can_edit,
              true,
            ),
            export: this.toBool(
              row.export ?? row.EXPORT ?? row.can_export,
              false,
            ),
            status: Number(row.Status ?? row.status ?? 0),
            flagkrm: row.FLAGKRM ?? row.flagkrm ?? null,
            imageIndex: Number(row.ImageIndex ?? row.imageIndex ?? -1),
            l1lama: Number(row.L1lama ?? row.l1lama ?? 0),
            accesslama: Number(
              row.ACCESSlama ??
                row.ACCESSlar ??
                row.accesslama ??
                row.accesslar ??
                0,
            ),
          };
        })
        .filter(Boolean);
    },

    async loadPermissionFromApi() {
      this.isLoadingPermission = true;
      try {
        const response = await api.post(
          "berkas/getflmenu",
          { username: this.selectedUsername },
          { headers: this.apiHeaders },
        );

        const body = response?.data || {};

        // COBA PARSE RESPONSE - ADJUST SESUAI BACKEND
        const rawRows = body.data || body.rows || body.permissions || [];

        const normalizedRows = this.normalizePermissionRows(rawRows);
        if (normalizedRows.length > 0) {
          this.menuPermissions = normalizedRows;
        } else {
          this.syncMenuPermissions(this.effectiveMenuNames);
        }

        // Handle user options from API
        const apiUsers = body.users || body.user_options || [];
        if (Array.isArray(apiUsers) && apiUsers.length > 0) {
          const parsedUsers = apiUsers
            .map((item) => (typeof item === "string" ? item : item?.email))
            .filter(
              (email) => typeof email === "string" && email.trim() !== "",
            );

          if (
            parsedUsers.length > 0 &&
            !parsedUsers.includes(this.selectedUserEmail)
          ) {
            this.selectedUserEmail = parsedUsers[0];
          }
        }

        // Handle profiles from API
        const apiProfiles = body.profiles || body.authority_profiles || [];
        if (Array.isArray(apiProfiles) && apiProfiles.length > 0) {
          const parsedProfiles = apiProfiles
            .map((item) =>
              typeof item === "string" ? item : item?.name || item?.label,
            )
            .filter((name) => typeof name === "string" && name.trim() !== "");

          if (parsedProfiles.length > 0) {
            this.authorityProfiles = [...new Set(parsedProfiles)];
            if (!this.authorityProfiles.includes(this.selectedProfile)) {
              this.selectedProfile = this.authorityProfiles[0];
            }
          }
        }
      } catch (error) {
        console.error("API Error:", error); // Lihat error di console
        this.syncMenuPermissions(this.effectiveMenuNames);
        const status = error?.response?.status;
        const backendMessage =
          error?.response?.data?.message || error?.response?.data?.error || "";
        const message =
          status === 500
            ? `Server error 500 on getflmenu${
                backendMessage ? `: ${backendMessage}` : ""
              }`
            : backendMessage || "Failed to load permission data.";
        alertService.toastError(message);
      } finally {
        this.isLoadingPermission = false;
      }
    },

    async savePermissionToApi(options = {}) {
      const { silent = false } = options;
      this.isSavingPermission = true;
      try {
        const payload = this.menuPermissions.map((row) => ({
          username: this.selectedUserEmail,
          id: String(row.menuid ?? row.id ?? ""),
          akses: row.akses ? 1 : 0,
          tambah: row.tambah ? 1 : 0,
          hapus: row.hapus ? 1 : 0,
          koreksi: row.koreksi ? 1 : 0,
          export: row.export ? 1 : 0,
          L0: String(row.L0 ?? "0"),
          Parent: String(row.Parent ?? "0"),
          CAPTION: row.caption || row.name || row.menu || "",
          icon: this.resolveNonEmptyIcon(row),
          pathfile: row.pathfile || "",
          ACCESS: Number.isFinite(row.accessLevel) ? row.accessLevel : 0,
          HASACCESS: row.akses ? 1 : 0,
          FLAGKRM: row.flagkrm,
          Status: Number.isFinite(row.status) ? row.status : 0,
          ImageIndex: Number.isFinite(row.imageIndex) ? row.imageIndex : -1,
          L1lama: Number.isFinite(row.l1lama) ? row.l1lama : 0,
          ACCESSlama: Number.isFinite(row.accesslama) ? row.accesslama : 0,
        }));

        await api.post("berkas/saveedit", payload, {
          headers: this.apiHeaders,
        });

        if (!silent) {
          alertService.toastSuccess("Permission changes saved successfully.");
        }
      } catch (error) {
        const status = error?.response?.status;
        const backendMessage =
          error?.response?.data?.message || error?.response?.data?.error || "";
        const message =
          status === 500
            ? `Server error 500 on saveedit${
                backendMessage ? `: ${backendMessage}` : ""
              }`
            : backendMessage || "Failed to save permission data.";
        alertService.toastError(message);
      } finally {
        this.isSavingPermission = false;
      }
    },

    queueAutoSave() {
      if (this.isLoadingPermission) return;

      if (this.autoSaveTimer) {
        clearTimeout(this.autoSaveTimer);
      }

      this.autoSaveTimer = setTimeout(() => {
        this.savePermissionToApi({ silent: true });
      }, 200);
    },
  },

  mounted() {
    this.$store.dispatch("users/fetchAllusers").catch(() => {});

    const layout = this.layoutMenuWeb;
    if (!layout?.dbmenu2?.length) {
      this.$store.dispatch("settingsfe/actlayoutwebflmenu").catch(() => {});
    }

    this.loadPermissionFromApi();
  },

  beforeDestroy() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
  },
};
</script>
