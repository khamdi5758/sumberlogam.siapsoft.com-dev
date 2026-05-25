<!-- <script setup>
import { ref } from "vue";
import { X, ChevronDown } from "lucide-vue-next";
import { useStore } from "vuex";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "submit"]);
const store = useStore();

// Options
const teamOptions = [
  { value: "", label: "Select Team" },
  { value: "management", label: "Management" },
  { value: "marketing", label: "Marketing" },
  { value: "design", label: "Design" },
  { value: "finance", label: "Finance" },
  { value: "development", label: "Development" },
  { value: "support", label: "Support" },
];

const staffLevelOptions = [
  { value: "", label: "Select Staff Level" },
  { value: "ExcecutiveLevel", label: "Excecutive Level" },
  { value: "DirectorLevel", label: "Director Level" },
  { value: "ManagerLevel", label: "Manager Level" },
  { value: "Staff", label: "Staff" },
  { value: "Other", label: "Other" },
];

const roleOptions = [
  { value: "", label: "Select Role" },
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "marketing", label: "Marketing" },
];

// Form data - aligned with backend
const formData = ref({
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
});

const isSaving = ref(false);
const errorMsg = ref("");
const successMsg = ref("");

const handleClose = () => {
  emit("close");
};

const handleSubmit = async () => {
  isSaving.value = true;
  errorMsg.value = "";
  successMsg.value = "";

  // Set name before submitting
  formData.value.name =
    `${formData.value.firstname} ${formData.value.lastname}`.trim();

  try {
    const apiBaseUrl =
      import.meta.env.VITE_APP_API_URL || import.meta.env.BACKEND_APP_API_URL;
    const response = await fetch(`${apiBaseUrl}/api/userscrm/input`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${store.state.auth.token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(formData.value),
    });

    if (response.ok) {
      successMsg.value = "User created successfully!";
      emit("submit", formData.value);

      // Reset form on success
      handleReset();

      // Close after a short delay
      setTimeout(() => {
        handleClose();
      }, 1500);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create user");
    }
  } catch (err) {
    console.error("Create user error:", err);
    errorMsg.value = err.message || "Failed to connect to server.";
  } finally {
    isSaving.value = false;
  }
};

const handleReset = () => {
  formData.value = {
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
  };
  errorMsg.value = "";
  successMsg.value = "";
};
</script> -->

<script>
import { X, ChevronDown, Eye, EyeOff } from "lucide-vue-next";
import { mapState, mapActions } from "vuex";
import { alertService } from "@/services/alertService";

export default {
  name: "UserFormModal",

  emits: ["close", "submit"],
  components: {
    X,
    ChevronDown,
    Eye,
    EyeOff,
  },

  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      // Options
      teamOptions: [
        { value: "", label: "Select Team" },
        { value: "management", label: "Management" },
        { value: "marketing", label: "Marketing" },
        { value: "design", label: "Design" },
        { value: "finance", label: "Finance" },
        { value: "development", label: "Development" },
        { value: "support", label: "Support" },
      ],

      staffLevelOptions: [
        { value: "", label: "Select Staff Level" },
        { value: "ExcecutiveLevel", label: "Excecutive Level" },
        { value: "DirectorLevel", label: "Director Level" },
        { value: "ManagerLevel", label: "Manager Level" },
        { value: "Staff", label: "Staff" },
        { value: "Other", label: "Other" },
      ],

      roleOptions: [
        { value: "", label: "Select Role" },
        { value: "SA", label: "Super Admin" },
        { value: "AD", label: "Admin" },
        { value: "AC", label: "Accounting" },
        { value: "SL", label: "Sales" },
        { value: "PM", label: "Project Manager" },
        { value: "PS", label: "Pelaksana" },
      ],

      formData: this.getUserFormDefaults(this.user),

      isSaving: false,
      errorMsg: "",
      successMsg: "",
      canClose: false,
      showPassword: false,
    };
  },

  computed: {
    ...mapState({
      token: (state) => state.auth.token,
    }),
  },

  watch: {
    user: {
      handler(newUser) {
        this.formData = this.getUserFormDefaults(newUser);
      },
      immediate: true,
    },
    isOpen(val) {
      if (val) {
        // Prevent accidental close on double-click by adding a small delay
        setTimeout(() => {
          this.canClose = true;
        }, 300);
      } else {
        this.canClose = false;
      }
    },
  },

  methods: {
    ...mapActions({
      insertUser: "users/insertuser",
      updateUser: "users/updateuser",
      deleteUser: "users/deleteuser",
    }),

    getUserFormDefaults(user = null) {
      return {
        name: user?.name || "",
        firstname: user?.firstname || "",
        lastname: user?.lastname || "",
        no_handphone: user?.no_handphone || user?.telephone || "",
        nik: user?.nik || "",
        email: user?.email || "",
        password: "", // Jangan tampilkan password lama
        primaryteam: user?.primaryteam || user?.team || "",
        secondaryteam: user?.secondaryteam || "",
        stafflevel: user?.stafflevel || "",
        role: user?.role || "",
      };
    },

    handleClose() {
      // Small guard to prevent accidental closure on very fast clicks/double-clicks
      if (this.canClose || !this.isOpen) {
        this.$emit("close");
      }
    },

    async handleSubmit() {
      this.isSaving = true;
      this.errorMsg = "";
      this.successMsg = "";
      // Set name before submitting
      this.formData.name =
        `${this.formData.firstname} ${this.formData.lastname}`.trim();

      try {
        if (this.user?.id) {
          const updateFormData = { ...this.formData };
          if (!updateFormData.password) {
            delete updateFormData.password;
          }

          await this.updateUser({
            keyedit: this.user.id,
            formdata: updateFormData,
          });
          this.successMsg = "User berhasil diperbarui!";
          await alertService.success("User berhasil diperbarui!");
        } else {
          await this.insertUser(this.formData);
          this.successMsg = "User berhasil ditambahkan!";
          await alertService.success("User berhasil ditambahkan!");
        }

        this.$emit("submit", this.formData);
        this.handleReset();
        this.handleClose();
      } catch (err) {
        console.error("Error saving user:", err);
        this.errorMsg =
          err?.response?.data?.message || err.message || "Failed to save user.";
      } finally {
        this.isSaving = false;
      }
    },

    async handleDelete() {
      if (!this.user?.id || this.isSaving) return;

      const confirmDelete = await alertService.confirm(
        "User ini akan dihapus permanen. Lanjutkan?",
        "Hapus User?",
      );

      if (!confirmDelete) return;

      this.isSaving = true;
      this.errorMsg = "";
      this.successMsg = "";

      try {
        await this.deleteUser(this.user.id);
        this.successMsg = "User berhasil dihapus!";
        await alertService.success("User berhasil dihapus!");
        this.$emit("submit", { deletedId: this.user.id });
        this.handleClose();
      } catch (err) {
        console.error("Error deleting user:", err);
        this.errorMsg =
          err?.response?.data?.message ||
          err.message ||
          "Failed to delete user.";
      } finally {
        this.isSaving = false;
      }
    },

    handleReset() {
      this.formData = this.getUserFormDefaults(this.user);

      this.errorMsg = "";
      this.successMsg = "";
    },
  },
};
</script>

<template>
  <!-- Overlay Background -->
  <Transition name="overlay">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-sub-text/80 z-40 transition-all duration-300"
      @click="handleClose"
    ></div>
  </Transition>

  <!-- Form Slide Panel -->
  <Transition name="slide">
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-screen w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        <h2 class="text-xl font-bold text-main-text">
          {{ user ? "User Details" : "Add User" }}
        </h2>
        <button
          @click="handleClose"
          class="p-2 hover:bg-light-base rounded-lg transition-colors"
        >
          <X :size="20" class="text-sub-text" />
        </button>
      </div>

      <!-- Form Content (Scrollable) -->
      <div class="flex-1 overflow-y-auto relative form-content-mobile">
        <!-- Loading overlay during save -->
        <div
          v-if="isSaving"
          class="absolute inset-0 bg-white/50 z-20 flex items-center justify-center"
        >
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-950"
          ></div>
        </div>

        <form
          @submit.prevent="handleSubmit"
          id="addUserForm"
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
          <!-- Name Section -->
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

          <!-- Telephone & NIK -->
          <div class="grid grid-cols-2 gap-4">
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
                class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                required
              />
            </div>
            <!-- <div>
              <label class="block text-sm font-medium text-main-text mb-2">
                Password
              </label>
              <input
                v-model="formData.password"
                type="password"
                placeholder="Password"
                class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                :required="!user || !user.id"
              />
            </div> -->
            <div class="relative w-full">
              <label class="block text-sm font-medium text-main-text mb-2">
                Password
              </label>
              <div class="relative">
                <input
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Password"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm pr-10"
                  :required="!user || !user.id"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
                  :disabled="isLoading"
                >
                  <Eye v-if="showPassword" class="w-5 h-5 text-blue-950" />
                  <EyeOff v-else class="w-5 h-5 text-blue-950" />
                </button>
              </div>

              <!-- tombol mata -->
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
                  class="w-full px-3 py-2 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-main-text bg-white appearance-none cursor-pointer"
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
                  class="w-full px-3 py-2 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-main-text bg-white appearance-none cursor-pointer"
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
                  class="w-full px-3 py-2 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-main-text bg-white appearance-none cursor-pointer"
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
                  class="w-full px-3 py-2 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-main-text bg-white appearance-none cursor-pointer"
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
                  :size="16"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none"
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer Actions (Sticky) -->
      <div
        class="bg-white flex items-center justify-between px-6 py-4 border-t border-outline shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] footer-mobile"
      >
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="handleReset"
            class="text-sm text-red font-medium hover:underline"
          >
            Reset
          </button>
          <button
            v-if="user && user.id"
            type="button"
            @click="handleDelete"
            :disabled="isSaving"
            class="px-4 py-2 border border-red text-red rounded-lg hover:bg-red hover:text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        </div>
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
            form="addUserForm"
            :disabled="isSaving"
            class="px-6 py-2 bg-dark-base text-white rounded-lg hover:bg-dark-hover transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <div
              v-if="isSaving"
              class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"
            ></div>
            {{ isSaving ? "Submitting..." : "Submit" }}
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

/* Remove Browser Autofill Blue Background */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:active,
select:-webkit-autofill,
select:-webkit-autofill:hover,
select:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px var(--color-white) inset !important;
  -webkit-text-fill-color: var(--color-main-text) !important;
  transition: background-color 5000s ease-in-out 0s;
}

/* Preserve focus ring on autofilled inputs */
input:-webkit-autofill:focus,
select:-webkit-autofill:focus {
  -webkit-box-shadow:
    0 0 0 30px var(--color-white) inset,
    0 0 0 1px var(--color-sub-text) !important;
  -webkit-text-fill-color: var(--color-main-text) !important;
}

/* Mobile Responsive - Footer Sticky/Fixed Behavior */
@media (max-width: 768px) {
  /* Make form content scrollable with padding for footer */
  .form-content-mobile {
    padding-bottom: 110px; /* Reserve space for fixed footer */
  }

  /* Make footer fixed at bottom on mobile */
  .footer-mobile {
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    width: 100%;
    max-width: 100vw;
    z-index: 50;
    border-top: 1px solid;
    border-radius: 0;
  }
}

/* Desktop - Keep original behavior */
@media (min-width: 769px) {
  .form-content-mobile {
    padding-bottom: 0;
  }

  .footer-mobile {
    position: static;
    width: 100%;
    z-index: auto;
  }
}
</style>
