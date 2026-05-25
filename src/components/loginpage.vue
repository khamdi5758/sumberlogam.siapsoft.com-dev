<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-6">
    <!-- Card Container -->
    <div
      class="w-full max-w-6xl bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden grid lg:grid-cols-2"
    >
      <!-- LEFT SIDE -->
      <div
        class="hidden lg:flex flex-col justify-center items-center text-center p-12 bg-white border-r border-gray-100"
      >
        <h1 class="text-5xl font-extrabold text-blue-950 mb-6 tracking-tight">
          CRM MG26
        </h1>

        <p class="text-slate-500 text-lg leading-relaxed max-w-md">
          Deliver better customer experiences with organized, efficient CRM
          management.
        </p>

        <!-- Illustration -->
        <img
          src="/public/login.svg"
          alt="illustration"
          class="w-80 mt-10 drop-shadow-md"
        />
      </div>

      <!-- RIGHT SIDE -->
      <div class="p-10 lg:p-16 flex flex-col justify-center bg-white">
        <div class="mb-4">
          <p class="text-slate-500 text-lg mb-1">
            Start Building Better Workflows
          </p>
          <h2 class="text-4xl font-bold text-gray-800 mb-8">
            Log In to CRM MG26
          </h2>
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2"
        >
          <AlertCircle :size="18" />
          {{ errorMessage }}
        </div>

        <form @submit.prevent="submit">
          <!-- Email -->
          <label class="text-gray-800 font-semibold mb-2 block">Email</label>
          <div class="relative mb-6 group">
            <input
              v-model="form.email"
              type="email"
              placeholder="Enter your email"
              class="w-full h-14 px-4 pr-12 rounded-xl border border-blue-950/20 focus:border-blue-950 focus:outline-none focus:ring-4 focus:ring-blue-950/5 transition-all"
              :disabled="isLoading"
            />
            <span
              class="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 group-focus-within:opacity-100 transition-opacity"
            >
              <Mail class="w-5 h-5 text-blue-950" />
            </span>
          </div>

          <!-- Password -->
          <label class="text-gray-800 font-semibold mb-2 block">Password</label>
          <div class="relative mb-8 group">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              class="w-full h-14 px-4 pr-12 rounded-xl border border-blue-950/20 focus:border-blue-950 focus:outline-none focus:ring-4 focus:ring-blue-950/5 transition-all"
              :disabled="isLoading"
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

          <!-- Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full h-14 bg-blue-950 text-white rounded-xl font-bold text-lg hover:bg-blue-900 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-blue-950/20"
          >
            <template v-if="isLoading">
              <span
                class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full font-bold"
              ></span>
              <span>Memproses...</span>
            </template>
            <template v-else>
              <span>Log In</span>
              <ArrowRight :size="20" />
            </template>
          </button>
        </form>

        <!-- Sign Up -->
        <p class="text-center text-slate-500 mt-10 font-medium">
          Don’t have any account?
          <span
            class="text-blue-950 font-bold cursor-pointer hover:underline underline-offset-4 decoration-2"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { Mail, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-vue-next";
import { mapGetters, mapActions } from "vuex";
import { alertService } from "@/services/alertService";
export default {
  name: "Login",

  components: {
    Mail,
    Eye,
    EyeOff,
    AlertCircle,
    ArrowRight,
    alertService,
  },

  data() {
    return {
      form: { email: "", password: "", remember: false },
      email: "",
      password: "",
      showPassword: false,
      isLoading: false,
      errorMessage: "",
    };
  },

  methods: {
    // async submit() {
    //   this.errorMessage = "";

    //   if (!this.email.trim() || !this.password.trim()) {
    //     this.errorMessage = "Email dan password wajib diisi!";
    //     return;
    //   }

    //   this.isLoading = true;

    //   try {
    //     // 1. Auth sign in
    //     await this.$store.dispatch("auth/authsignin", {
    //       email: this.email,
    //       password: this.password
    //     });

    //     // 2. Clear tabs and menu settings
    //     this.$store.dispatch("tabs/clearTabs");
    //     this.$store.dispatch("settingsfe/clearmenuuser");

    //     // 3. Fetch layout/menu configuration
    //     const data = await this.$store.dispatch("settingsfe/actlayoutweb");

    //     // 4. Handle navigation based on defaults
    //     if (data && data.dbmenu2 && data.dbmenu2.length > 0) {
    //       const defaultPath =
    //         data.dbmenu2[0].pathfiledefault || data.dbmenu2[0].pathfile;

    //       // Filter default menu item to open in tabs
    //       const filter = data.dbmenu2.filter(
    //         (t) => t.pathfile === defaultPath
    //       );

    //       if (filter.length > 0) {
    //         this.$store.dispatch("tabs/handleOpenTab", filter[0]);
    //       }

    //       this.$router.push(defaultPath);
    //     } else {
    //       this.$router.push("/crmAdmin");
    //     }
    //   } catch (err) {
    //     console.error("Login gagal:", err);
    //     this.errorMessage = err.message || "Email atau password salah";
    //   } finally {
    //     this.isLoading = false;
    //   }
    // }

    ...mapActions({
      handleOpenTabs: "tabs/handleOpenTabflmenu",
      actlayoutweb: "settingsfe/actlayoutwebflmenu",
      authsignin: "auth/authsignin",
    }),

    async submit() {
      this.errorMessage = "";

      if (!this.form.email.trim() || !this.form.password.trim()) {
        alertService.validationError("Email dan password wajib diisi!");
        return;
      }

      this.isLoading = true;

      try {
        await this.$store.dispatch("auth/authsignin", this.form);
        this.$store.dispatch("tabs/clearTabsflmenu");
        this.$store.dispatch("settingsfe/clearmenuuser");
        const data = await this.actlayoutweb();
        let filter = data.dbmenu2.filter(
          (t) => t.pathfile == data.dbmenu2[0].pathfiledefault,
        );

        this.handleOpenTabs(filter[0]);
      } catch (err) {
        console.error("Login gagal:", err);
        alertService.loginError("Email atau password salah");
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 30px var(--color-white) inset !important;
  -webkit-text-fill-color: var(--color-main-text) !important;
}
</style>
