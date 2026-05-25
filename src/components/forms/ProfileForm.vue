<script>
import { X, ChevronDown } from "lucide-vue-next";
import { mapGetters, mapActions, mapState } from "vuex";

export default {
  name: "ProfileForm",

  components: {
    X,
    ChevronDown,
  },

  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["close", "submit"],

  data() {
    return {
      formData: {
        id: "",
        name: "",
        firstname: "",
        lastname: "",
        no_handphone: "",
        nik: "",
        email: "",
        password: "",
        primaryteam: "",
        secondaryteam: "",
        stafflevel: "",
        role: "",
      },
      isLoadingLocal: false,
      isSaving: false,
      errorMsg: "",
      successMsg: "",

      // Options
      teamOptions: [
        { value: "", label: "Name Team" },
        { value: "management", label: "Management" },
        { value: "marketing", label: "Marketing" },
        { value: "design", label: "Design" },
        { value: "finance", label: "Finance" },
        { value: "development", label: "Development" },
        { value: "support", label: "Support" },
      ],
      staffLevelOptions: [
        { value: "", label: "Staff Level" },
        { value: "executive", label: "Executive Level" },
        { value: "director", label: "Director Level" },
        { value: "manager", label: "Manager Level" },
        { value: "staff", label: "Staff" },
        { value: "other", label: "Other" },
      ],
      roleOptions: [
        { value: "", label: "Role" },
        { value: "super_admin", label: "Super Admin" },
        { value: "admin", label: "Admin" },
        { value: "manager", label: "Manager" },
        { value: "marketing", label: "Marketing" },
      ],
    };
  },

  computed: {
    ...mapState({
      authStoreUser: (state) => state.auth.user,
    }),
    ...mapGetters({
      users: "users/allUsers",
      usersignin: "users/usersignin",
    }),

    isAdmin() {
      // Use usersignin as the source of truth for current logged in user
      const role = this.usersignin?.role?.toLowerCase();
      return role === "admin" || role === "super_admin";
    },

    isLoading() {
      return this.isLoadingLocal;
    },
  },

  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.fetchProfileData();
      }
    },
  },

  methods: {
    ...mapActions({
      fetchAllUsersAction: "users/fetchAllusers",
      saveProfileStore: "users/saveUserProfile",
    }),

    fetchProfileData() {
      this.isLoadingLocal = true;
      this.errorMsg = "";
      this.successMsg = "";

      this.fetchAllUsersAction()
        .then(() => {
          // Local data population logic (finding self in the users all list)
          // Using usersignin from the users store as primary identity
          const currentEmail = this.usersignin?.email;
          const userRecord =
            this.users.find((u) => u.email === currentEmail) ||
            this.usersignin ||
            {};

          console.log("Senior Style - Calculated User Record:", userRecord);

          this.formData = {
            id: userRecord.id || this.usersignin?.id || "",
            name:
              userRecord.name ||
              userRecord.firstname + " " + userRecord.lastname ||
              "",
            firstname:
              userRecord.firstname ||
              this.usersignin?.firstname ||
              this.usersignin?.first_name ||
              "",
            lastname:
              userRecord.lastname ||
              this.usersignin?.lastname ||
              this.usersignin?.last_name ||
              "",
            no_handphone:
              userRecord.no_handphone ||
              userRecord.Telephone ||
              this.usersignin?.no_handphone ||
              this.usersignin?.Telephone ||
              "",
            nik: userRecord.nik || this.usersignin?.nik || "",
            email: userRecord.email || this.usersignin?.email || "",
            password: "",
            primaryteam:
              userRecord.primaryteam ||
              this.usersignin?.primaryteam ||
              this.usersignin?.primary_team ||
              "",
            secondaryteam:
              userRecord.secondaryteam || this.usersignin?.secondaryteam || "",
            stafflevel:
              userRecord.stafflevel ||
              this.usersignin?.stafflevel ||
              this.usersignin?.staff_level ||
              "",
            role: userRecord.role || this.usersignin?.role || "",
          };
        })
        .catch((err) => {
          console.error("Profile fetch error:", err);
          this.errorMsg = "Failed to load profile data from server.";
        })
        .finally(() => {
          this.isLoadingLocal = false;
        });
    },

    handleClose() {
      this.$emit("close");
    },

    handleSubmit() {
      this.isSaving = true;
      this.errorMsg = "";
      this.successMsg = "";

      // Update name before submitting
      this.formData.name =
        `${this.formData.firstname} ${this.formData.lastname}`.trim();

      // Calling Senior Style Action (hitting userscrm/input POST)
      this.saveProfileStore(this.formData)
        .then(() => {
          this.successMsg = "Profile updated successfully!";
          // Close after a short delay
          setTimeout(() => {
            this.handleClose();
          }, 1500);
        })
        .catch((err) => {
          console.error("Profile update error:", err);
          this.errorMsg = err.message || "Failed to save profile changes.";
        })
        .finally(() => {
          this.isSaving = false;
        });
    },

    handleReset() {
      this.fetchProfileData();
    },
  },
};
</script>

<template>
  <!-- Overlay Background -->
  <Transition name="overlay">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-sub-text/80 z-60 transition-all duration-300"
      @click="handleClose"
    ></div>
  </Transition>

  <!-- Form Slide Panel -->
  <Transition name="slide">
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-screen w-full max-w-2xl bg-white shadow-2xl z-70 flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10 shadow-sm"
      >
        <h2 class="text-xl font-bold text-main-text">My Profile</h2>
        <button
          @click="handleClose"
          class="p-2 hover:bg-light-base rounded-lg transition-colors"
        >
          <X :size="20" class="text-sub-text" />
        </button>
      </div>

      <!-- Form Content (Scrollable) -->
      <div class="flex-1 overflow-y-auto relative">
        <!-- Loading State -->
        <div
          v-if="isLoading"
          class="absolute inset-0 bg-white/50 z-20 flex items-center justify-center"
        >
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-950"
          ></div>
        </div>

        <form
          @submit.prevent="handleSubmit"
          id="profileForm"
          class="p-6 space-y-6"
        >
          <!-- Error Message -->
          <div
            v-if="errorMsg"
            class="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 italic"
          >
            {{ errorMsg }}
          </div>

          <!-- Success Message -->
          <div
            v-if="successMsg"
            class="p-3 bg-green-50 text-green-600 text-xs rounded-lg border border-green-100 font-medium"
          >
            {{ successMsg }}
          </div>

          <!-- Names -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-main-text mb-2">
                First Name
              </label>
              <input
                v-model="formData.firstname"
                type="text"
                placeholder="First Name"
                class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-main-text mb-2">
                Last Name
              </label>
              <input
                v-model="formData.lastname"
                type="text"
                placeholder="Last Name"
                class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                required
              />
            </div>
          </div>

          <!-- NIK & Telephone -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-main-text mb-2">
                NIK
              </label>
              <input
                v-model="formData.nik"
                type="text"
                placeholder="NIK"
                class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-main-text mb-2">
                Telephone
              </label>
              <input
                v-model="formData.no_handphone"
                type="text"
                placeholder="Telephone"
                class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                required
              />
            </div>
          </div>

          <!-- Email & Password -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-main-text mb-2">
                Email Address
              </label>
              <input
                v-model="formData.email"
                type="email"
                placeholder="youremail@gmail.com"
                :disabled="!isAdmin"
                class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm transition-all shadow-sm"
                :class="{
                  'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200':
                    !isAdmin,
                }"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-main-text mb-2">
                Update Password
              </label>
              <input
                v-model="formData.password"
                type="password"
                placeholder="Leave blank to keep current"
                class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm transition-all shadow-sm"
                :placeholder="isSaving ? 'Updating...' : 'Update Password'"
              />
            </div>
          </div>

          <!-- Primary & Secondary Team -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-main-text mb-2">
                Primary Team
              </label>
              <div class="relative">
                <select
                  v-model="formData.primaryteam"
                  :disabled="!isAdmin"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm transition-all shadow-sm appearance-none"
                  :class="{
                    'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200':
                      !isAdmin,
                    'text-main-text bg-white pr-10 cursor-pointer': isAdmin,
                  }"
                  required
                >
                  <option
                    v-for="option in teamOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <ChevronDown
                  v-if="isAdmin"
                  :size="16"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-main-text mb-2">
                Secondary Team
              </label>
              <div class="relative">
                <select
                  v-model="formData.secondaryteam"
                  :disabled="!isAdmin"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm transition-all shadow-sm appearance-none"
                  :class="{
                    'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200':
                      !isAdmin,
                    'text-main-text bg-white pr-10 cursor-pointer': isAdmin,
                  }"
                >
                  <option
                    v-for="option in teamOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <ChevronDown
                  v-if="isAdmin"
                  :size="16"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none"
                />
              </div>
            </div>
          </div>

          <!-- Staff Level & Role -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-main-text mb-2">
                Staff Level
              </label>
              <div class="relative">
                <select
                  v-model="formData.stafflevel"
                  :disabled="!isAdmin"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm transition-all shadow-sm appearance-none"
                  :class="{
                    'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200':
                      !isAdmin,
                    'text-main-text bg-white pr-10 cursor-pointer': isAdmin,
                  }"
                  required
                >
                  <option
                    v-for="option in staffLevelOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <ChevronDown
                  v-if="isAdmin"
                  :size="16"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-main-text mb-2">
                Role
              </label>
              <div class="relative">
                <select
                  v-model="formData.role"
                  :disabled="!isAdmin"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm transition-all shadow-sm appearance-none"
                  :class="{
                    'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200':
                      !isAdmin,
                    'text-main-text bg-white pr-10 cursor-pointer': isAdmin,
                  }"
                  required
                >
                  <option
                    v-for="option in roleOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <ChevronDown
                  v-if="isAdmin"
                  :size="16"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none"
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer Actions -->
      <div
        class="bg-white flex items-center justify-between px-6 py-4 border-t border-outline shadow-sm"
      >
        <button
          type="button"
          @click="handleReset"
          class="text-sm text-red-500 font-medium hover:underline"
        >
          Reset to Original
        </button>
        <div class="flex gap-3">
          <button
            type="button"
            @click="handleClose"
            class="px-6 py-2 border border-outline rounded-lg text-sub-text hover:bg-light-base transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="profileForm"
            :disabled="isSaving"
            class="px-8 py-2 bg-blue-950 text-white rounded-lg hover:bg-opacity-90 transition-all text-sm font-semibold shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <div
              v-if="isSaving"
              class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"
            ></div>
            {{ isSaving ? "Saving..." : "Save Changes" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Overlay Animation */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Slide Animation */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* Chrome/Safari focus fix */
input:focus,
select:focus {
  border-color: #1e3a8a !important; /* blue-950 */
}
</style>
