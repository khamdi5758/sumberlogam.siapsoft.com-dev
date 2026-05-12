<template>
  <Transition name="overlay">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-sub-text/80 transition-all duration-300"
      @click="handleClose"
    ></div>
  </Transition>

  <Transition name="slide-project">
    <div
      v-if="isOpen"
      class="fixed right-0 top-0 z-50 flex h-screen w-full flex-col bg-white shadow-2xl sm:max-w-2xl"
      @click.stop
    >
      <!-- Header sticky di atas -->
      <div
        class="sticky top-0 z-10 flex items-center justify-between border-b border-outline bg-white px-6 py-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        <div class="flex items-center gap-2">
          <h2 class="text-xl font-bold text-dark-base">
            {{ isEditMode ? "Edit Project" : "Add Project" }}
          </h2>
        </div>
        <button
          type="button"
          @click="handleClose"
          class="rounded-lg p-2 transition-colors hover:bg-light-base"
        >
          <X :size="20" class="text-sub-text" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-outline bg-white px-6">
        <button
          type="button"
          @click="activeTab = 'master'"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            activeTab === 'master'
              ? 'border-dark-base text-dark-base'
              : 'border-transparent text-sub-text hover:text-dark-base',
          ]"
        >
          Master
        </button>
        <!-- Tab Tasks & Notes hanya muncul jika edit mode atau sudah sukses simpan pertama kali, dan BUKAN dibuka dari deals -->
        <template v-if="(isEditMode || showTabsAfterSave) && fromPage !== 'deals'">
          <button
            type="button"
            @click="activeTab = 'tasks'"
            :class="[
              'px-4 py-2 text-sm font-medium border-b-2 transition',
              activeTab === 'tasks'
                ? 'border-dark-base text-dark-base'
                : 'border-transparent text-sub-text hover:text-dark-base',
            ]"
          >
            Tasks
          </button>
          <button
            type="button"
            @click="activeTab = 'notes'"
            :class="[
              'px-4 py-2 text-sm font-medium border-b-2 transition',
              activeTab === 'notes'
                ? 'border-dark-base text-dark-base'
                : 'border-transparent text-sub-text hover:text-dark-base',
            ]"
          >
            Notes
          </button>
        </template>
      </div>

      <!-- Area konten yang bisa di-scroll -->
      <div class="flex-1 overflow-y-auto form-content-mobile">
        <form
          v-show="activeTab === 'master'"
          id="projectForm"
          @submit.prevent="handleSubmit"
          class="space-y-5 p-6"
        >
          <div>
            <label class="mb-2 block text-sm font-medium text-dark-base">
              Project Name <span class="text-red-600">*</span>
            </label>
            <input
              v-model="formData.project_name"
              type="text"
              placeholder="Ex. Project Alpha"
              class="w-full rounded-lg border border-outline px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
              required
            />
          </div>

          <div :class="['grid grid-cols-1 gap-4', fromPage === 'deals' ? '' : 'sm:grid-cols-2']">
            <div v-if="fromPage !== 'deals'">
              <label class="mb-2 block text-sm font-medium text-dark-base">
                Deal <span class="text-red-600">*</span>
              </label>
              <div class="v-select-container">
                <v-select
                  v-model="formData.deal_id"
                  :options="dealOptions"
                  :reduce="(option) => option.value"
                  label="label"
                  placeholder="Select Deal"
                  class="custom-v-select"
                />
              </div>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-dark-base">
                Leader <span class="text-red-600">*</span>
              </label>
              <div class="v-select-container">
                <v-select
                  v-model="formData.leader_id"
                  :options="leaderOptions"
                  :reduce="(option) => option.value"
                  label="label"
                  placeholder="Select Leader"
                  class="custom-v-select"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-dark-base"
              >Description</label
            >
            <textarea
              v-model="formData.description"
              rows="4"
              placeholder="Project description"
              class="w-full resize-none rounded-lg border border-outline px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
            ></textarea>
          </div>

          <div>
            <LocationSelector v-model="locationData" />
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm font-medium text-dark-base">
                Location
              </label>
              <input
                v-model="formData.location"
                type="text"
                placeholder="Ex. -6.200000, 106.816666"
                class="w-full rounded-lg border border-outline px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-dark-base">
                Project Status <span class="text-red-600">*</span>
              </label>
              <div class="v-select-container">
                <v-select
                  v-model="formData.status_id"
                  :options="projectStatusOptions"
                  :reduce="(option) => option.value"
                  label="label"
                  placeholder="Select Project Status"
                  class="custom-v-select"
                />
              </div>
            </div>
          </div>
        </form>

        <div
          v-show="activeTab === 'tasks'"
          class="p-6 h-full flex flex-col"
        >
          <!-- Tambah Task Button -->
          <div class="flex items-center gap-3 mb-6">
            <button
              type="button"
              @click="openTaskDrawer()"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-outline rounded-xl text-sm font-semibold text-dark-base hover:bg-light-base hover:border-dark-base/20 transition-all duration-200 shadow-sm"
            >
              <Plus :size="18" class="text-dark-base" />
              Tambah Task
            </button>
          </div>

          <!-- Task History -->
          <div
            v-if="historyitems.filter((i) => i.type === 'task').length === 0"
            class="flex flex-col items-center justify-center py-12 text-center"
          >
            <div
              class="w-12 h-12 bg-light-base rounded-full flex items-center justify-center mb-3"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="text-outline"
              >
                <polyline points="9 11 12 14 22 4" />
                <path
                  d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-dark-base">
              Belum ada task
            </h3>
            <p class="text-sm text-sub-text mt-1">
              Mulai dengan membuat task baru untuk proyek ini
            </p>
          </div>
          <div v-else class="space-y-3 overflow-y-auto pb-10">
            <div
              v-for="(item, index) in allHistory.filter(
                (i) => i.type === 'task',
              )"
              :key="index"
              class="border border-outline rounded-lg p-4 hover:shadow-sm transition-all"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <h4 class="font-semibold text-dark-base">
                    {{ item.name || item.body }}
                  </h4>
                  <p class="text-xs text-sub-text mt-1">
                    {{
                      item.timestamp
                        ? new Date(item.timestamp).toLocaleString()
                        : "Baru"
                    }}
                  </p>
                </div>
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    @click="
                      handleHistoryEdit({
                        item,
                        index: allHistory.indexOf(item),
                      })
                    "
                    class="p-1 hover:bg-light-base rounded text-sub-text hover:text-dark-base"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    @click="handleHistoryDelete(allHistory.indexOf(item))"
                    class="p-1 hover:bg-light-base rounded text-sub-text hover:text-red"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <p v-if="item.content" class="text-sm text-dark-base/80 mb-2">
                {{ item.content }}
              </p>
              <div class="flex gap-2 text-xs">
                <span
                  v-if="item.status"
                  class="px-2 py-1 bg-light-base rounded text-dark-base"
                  >{{ item.status }}</span
                >
                <span
                  v-if="item.priority"
                  class="px-2 py-1 bg-light-base rounded text-dark-base"
                  >{{ item.priority }}</span
                >
                <span
                  v-if="item.dueDate"
                  class="px-2 py-1 bg-light-base rounded text-dark-base"
                  >{{ item.dueDate }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <div
          v-show="activeTab === 'notes'"
          class="p-6 h-full flex flex-col"
        >
          <HistoryDetail
            :items="allHistory.filter((i) => i.type === 'note')"
            @add-note="openNoteDrawer()"
            @edit="handleHistoryEdit"
            @delete="handleHistoryDelete"
          />
        </div>
      </div>

      <!-- Footer sticky di bawah (tidak ikut scroll) -->
      <div
        class="sticky bottom-0 border-t border-outline bg-white px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] footer-mobile"
      >
        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="handleClose"
            class="rounded-lg border border-outline px-6 py-2 text-sm font-medium text-sub-text transition-colors hover:bg-light-base"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleSubmit"
            :disabled="isSubmitting"
            class="rounded-lg bg-dark-base px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-dark-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ isEditMode ? "Update Project" : "Save Project" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ======================= NOTES DRAWER DENGAN OVERLAY KHUSUS ======================= -->
  <transition name="overlay">
    <div
      v-if="isNoteDrawerOpen"
      class="fixed inset-0 bg-black/50 z-55"
      @click="isNoteDrawerOpen = false"
    ></div>
  </transition>

  <transition name="slide">
    <div
      v-if="isNoteDrawerOpen"
      class="fixed top-0 right-0 h-screen w-full max-w-2xl bg-white shadow-2xl z-60 flex flex-col"
      @click.stop
    >
      <div
        class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10"
      >
        <h2 class="text-xl font-bold text-dark-base">
          {{ editingItemIndex !== null ? "Edit Note" : "Tambah Note" }}
        </h2>
        <button
          @click="isNoteDrawerOpen = false"
          class="p-2 hover:bg-light-base rounded-lg transition-colors"
        >
          <X :size="20" class="text-sub-text" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <NotesSection v-model:note-data="tempNoteData" />
      </div>

      <div
        class="bg-white px-6 py-4 border-t border-outline flex justify-end gap-3"
      >
        <button
          @click="isNoteDrawerOpen = false"
          class="px-6 py-2 border border-outline rounded-lg text-sm font-medium hover:bg-light-base"
        >
          Cancel
        </button>
        <button
          @click="saveNoteFromDrawer"
          class="px-6 py-2 bg-dark-base text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-dark-hover"
        >
          Simpan
        </button>
      </div>
    </div>
  </transition>

    <!-- Create Task Form Overlay -->
    <CreateTaskForm
      :isOpen="showCreateTaskForm"
      :initialData="selectedTaskDetail"
      :hideProjectField="true"
      :hideNotesTab="true"
      @close="closeCreateTaskForm"
      @submit="handleTaskSubmit"
    />
</template>

<script>
import { ChevronDown, X, Plus, Calendar, Save } from "lucide-vue-next";
import api from "@/api";
import { useCookies } from "vue3-cookies";
import { alertService } from "@/services/alertService";
import LocationSelector from "./component/LocationSelector.vue";
import NotesSection from "@/components/widgets/NotesEditor.vue";
import HistoryDetail from "@/components/widgets/historydetail.vue";
import { mapActions, mapGetters } from "vuex";
import CreateTaskForm from "@/components/forms/CreateTaskForm.vue";

const { cookies } = useCookies();

export default {
  name: "CreateProjectForm",
  components: {
    LocationSelector,
    NotesSection,
    HistoryDetail,
    ChevronDown,
    X,
    Plus,
    Calendar,
    Save,
    CreateTaskForm,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    initialData: {
      type: Object,
      default: null,
    },
    fromPage: {
      type: String,
      default: "projects", // 'projects' or 'deals'
    },
  },
  data() {
    return {
      isSubmitting: false,
      activeTab: "master",
      showTabsAfterSave: false,
      statuses: [],
      isNoteDrawerOpen: false,
      showCreateTaskForm: false,
      selectedTaskDetail: null,
      isTaskDrawerOpen: false,
      editingItemIndex: null,
      historyitems: [],
      tempNoteData: {
        body: "",
        gps_address: null,
        latitude: null,
        longitude: null,
        photos: [],
        audioBlob: null,
      },
      tempTaskData: {
        name: "",
        content: "",
        dueDate: "",
        time: "",
        status: "",
        priority: "",
      },
      locationData: {
        address: "",
        country: "",
        province: "",
        city: "",
        kecamatan: "",
        kelurahan: "",
        pos_code: "",
      },
      formData: {
        id: null,
        project_name: "",
        deal_id: "",
        leader_id: "",
        description: "",
        location: "",
        kd_kelurahan: "",
        project_status: "",
        status_id: "",
        created_at: "",
        created_by: "",
        task: {
          name: "",
          content: "",
          dueDate: "",
          time: "",
          status: "",
          priority: "",
        },
        noteData: {
          body: "",
          gps_address: null,
          latitude: null,
          longitude: null,
          photos: [],
          audioBlob: null,
        },
      },
    };
  },
  computed: {
    isEditMode() {
      // Benar-benar cek apakah ada ID project di initialData atau formData
      return !!(
        (this.initialData &&
          (this.initialData.id ||
            this.initialData.project_id ||
            this.initialData.id_project)) ||
        this.formData.id
      );
    },
    currentUser() {
      return (
        this.$store.getters["users/usersignin"] ||
        this.$store.state.auth?.user ||
        null
      );
    },
    currentUserLabel() {
      const user = this.currentUser;
      if (!user) return "";

      const fullName = [
        user.first_name || user.firstname,
        user.last_name || user.lastname,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      return user.name || user.username || fullName || String(user.id || "");
    },
    ...mapGetters("tasks", ["allStatuses", "allPriorities"]),
    currentUserId() {
      const user = this.currentUser;
      return user?.id || user?.user_id || user?.userid || "";
    },
    dealOptions() {
      const deals = this.$store.state.project.deals || [];
      return deals.map((deal) => ({
        value: deal.id_deals ?? deal.id ?? deal.deal_id ?? "",
        label: deal.deal_name || deal.name || deal.title || "Unknown",
      }));
    },
    leaderOptions() {
      const users = this.$store.state.project.leaders || [];
      return users.map((user) => ({
        value: user.value ?? user.id_user ?? user.id ?? "",
        label: user.label || "Unknown",
      }));
    },
    projectStatusOptions() {
      const statuses = this.$store.state.project.statuses || [];
      return statuses.map((s) => ({
        value: s.value ?? s.id_status ?? s.id ?? "",
        label: s.label || "Unknown",
      }));
    },
    // Gabungkan history dari store dan lokal
    historyFromStore() {
      return this.$store.getters["history/history"] || [];
    },
    allHistory() {
      // Prioritaskan historyitems (lokal) jika ada isinya, karena ini hasil fetch spesifik project
      if (this.historyitems && this.historyitems.length > 0) {
        return this.historyitems.map((h) => {
          const isNote = h.notes !== undefined || h.idnote !== undefined || h.type === 'note';
          return {
            ...h,
            type: h.type || (isNote ? "note" : "task"),
            body: h.notes || h.body || h.task_name || h.name || "",
            content: h.desktask || h.content || "",
            timestamp: h.created_at || h.update_at || h.timestamp,
          };
        });
      }
      
      // Fallback ke history dari store global
      return this.historyFromStore.map((h) => {
        const isNote = h.notes !== undefined || h.idnote !== undefined || h.type === 'note';
        return {
          ...h,
          type: h.type || (isNote ? "note" : "task"),
          body: h.notes || h.body || h.task_name || h.name || "",
          content: h.desktask || h.content || "",
          timestamp: h.created_at || h.update_at || h.timestamp,
        };
      });
    },
  },
  watch: {
    locationData: {
      deep: true,
      handler() {
        this.formData.kd_kelurahan = this.locationData.kelurahan || "";
      },
    },
    isOpen(isOpen) {
      if (isOpen) {
        // Bersihkan error di store setiap kali drawer dibuka agar pesan merah di background hilang
        this.$store.commit("project/SET_ERROR", null);

        // Segera isi data jika sudah ada untuk menghindari input kosong di awal
        if (this.initialData) {
          this.setFormData(this.initialData);
        } else {
          this.resetForm();
          this.showTabsAfterSave = false;
        }
        this.activeTab = "master";

        Promise.allSettled([
          this.$store.dispatch("users/getusersignin"),
          this.$store.dispatch("project/fetchLeaders"),
          this.$store.dispatch("project/fetchDeals"),
          this.$store.dispatch("project/fetchStatuses"),
        ]).finally(() => {
          this.applyDefaultCreator();
        });
      }
    },
    initialData: {
      immediate: false,
      handler(nextValue) {
        if (!this.isOpen) return;
        if (nextValue) {
          this.setFormData(nextValue);
          this.applyDefaultCreator();
        } else {
          this.resetForm();
          this.applyDefaultCreator();
        }
        this.activeTab = "master";
      },
    },
  },
  mounted() {
    Promise.allSettled([
      this.$store.dispatch("users/getusersignin"),
      this.$store.dispatch("users/fetchAllusers"),
      this.$store.dispatch("deals/fetchAllDeals"),
      this.fetchStatuses(),
    ]).finally(this.applyDefaultCreator);

    // Escape key listener untuk nutup drawer
    window.addEventListener("keydown", this.handleEscKey);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.handleEscKey);
  },
  methods: {
    ...mapActions({
      saveNote: "history/saveNote",
      acthistory: "history/acthistory",
      deleteTask: "tasks/deleteTask",
    }),

    handleEscKey(e) {
      if (e.key === "Escape") {
        if (this.isNoteDrawerOpen) {
          this.isNoteDrawerOpen = false;
        } else if (this.isTaskDrawerOpen) {
          this.isTaskDrawerOpen = false;
        }
      }
    },
    async fetchStatuses() {
      try {
        const response = await api.get("statuses", {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });
        let rawData = response.data?.data || response.data;
        if (!Array.isArray(rawData)) rawData = [];
        this.statuses = rawData.map((item) => ({
          id: item.id_status ?? item.id,
          name: item.status_name ?? item.name,
          table_code: item.table_code ?? item.tableCode,
        }));
        console.log(
          "Statuses loaded, PR only:",
          this.statuses.filter((s) => s.table_code === "PR"),
        );
      } catch (error) {
        console.error("Failed to fetch statuses", error);
        this.statuses = [];
      }
    },

    buildFormDatanote(data) {
      const fd = new FormData();
      const existing = [];

      fd.append("noteable_type", data.noteable_type);
      fd.append("noteable_id", data.noteable_id);
      fd.append("body", data.body || "");
      fd.append("gps_address", data.gps_address || "");
      fd.append("latitude", data.latitude || "");
      fd.append("longitude", data.longitude || "");
      fd.append("visibility", data.visibility ?? 0);
      fd.append("choice", data.choice || "I");
      fd.append("idnote", data.idnote ?? null);

      (data.photos || []).forEach((p) => {
        if (p.file) {
          fd.append("photos[]", p.file);
        } else if (typeof p.src === "string") {
          existing.push({
            type: "photo",
            src: p.src,
          });
        }
      });

      (data.documents || []).forEach((d) => {
        if (d.file instanceof File) {
          fd.append("documents[]", d.file);
        } else if (d.url) {
          existing.push({
            type: "document",
            url: d.url,
          });
        }
      });

      if (existing.length > 0) {
        fd.append("existing_attachments", JSON.stringify(existing));
      }

      return fd;
    },
    applyDefaultCreator() {
      if (!this.formData.created_by && this.currentUserId) {
        this.formData.created_by = this.currentUserId;
      }
      if (!this.formData.created_by && this.currentUserLabel) {
        this.formData.created_by = this.currentUserLabel;
      }
    },
    setFormData(data) {
      if (!data) return;

      // Panggil history dari BE jika ada ID
      const pid = data.id ?? data.project_id ?? data.id_project;
      if (pid) {
        this.acthistory({
          noteable_type: "PR",
          noteable_id: pid,
        });
      }

      // Update secara spesifik untuk menjaga reactivity
      this.formData.id = pid || null;
      this.formData.project_name =
        data.project_name ||
        data.project_title ||
        data["Project Name"] ||
        data.title ||
        data.name ||
        data.label ||
        data.project?.project_name ||
        this.formData.project_name || 
        "";
      this.formData.deal_id = data.deal_id ?? data.deal ?? data.id_deals ?? "";
      this.formData.leader_id =
        data.leader_id ??
        data.id_leader ??
        data.assignee_id ??
        data.id_user ??
        "";
      this.formData.description = data.description || data.project_content || "";
      this.formData.location = data.location || "";
      this.formData.kd_kelurahan = data.kd_kelurahan || data.kelurahan || "";
      this.formData.project_status =
        data.project_status || data.status || data.stage || "";
      this.formData.status_id = data.status_id || data.id_status || "";
      this.formData.created_at = data.created_at || new Date().toISOString();
      this.formData.created_by =
        data.created_by || this.currentUserId || this.currentUserLabel || "";
      this.formData.task = {
        name: data.task_name || data.task?.name || "",
        content: data.desktask || data.task?.content || "",
        dueDate: data.due_date || data.task?.dueDate || "",
        time: data.task_time || data.task?.time || "",
        status: data.statustask || data.task?.status || "",
        priority: data.prioritytask || data.task?.priority || "",
      };
      this.formData.noteData = {
        body: data.note || data.notes || data.noteData?.body || "",
        gps_address: data.noteData?.gps_address || null,
        latitude: data.noteData?.latitude || null,
        longitude: data.noteData?.longitude || null,
        photos: Array.isArray(data.noteData?.photos) ? data.noteData.photos : [],
      };
      this.formData.noteData.audioBlob = data.noteData?.audioBlob || null;

      // If we are coming from deals page and it's a new project, 
      // ensure deal_id is set from initialData if formData.deal_id is empty
      if (this.fromPage === 'deals' && !this.formData.deal_id && data.deal_id) {
        this.formData.deal_id = data.deal_id;
      }

      // Workaround: If leader_id is missing but leader_name exists, try to find ID from options
      if (!this.formData.leader_id && data.leader_name) {
        const found = this.leaderOptions.find(
          (opt) => opt.label?.toLowerCase() === data.leader_name.toLowerCase(),
        );
        if (found) this.formData.leader_id = found.value;
      }

      // Workaround: If status_id is missing but status_name exists, try to find ID from options
      if (!this.formData.status_id && data.status_name) {
        const found = this.projectStatusOptions.find(
          (opt) => opt.label?.toLowerCase() === data.status_name.toLowerCase(),
        );
        if (found) this.formData.status_id = found.value;
      }

      // MAP HISTORY (Notes & Tasks)
      let historyItems = [];

      const getBody = (item) => {
        return (
          item.notes || item.body || item.description || item.content || ""
        );
      };

      // Process Notes
      let rawNotes = data.notes || data.note;
      if (typeof rawNotes === "string" && rawNotes.startsWith("[")) {
        try {
          rawNotes = JSON.parse(rawNotes);
        } catch (e) {}
      }

      if (Array.isArray(rawNotes)) {
        rawNotes.forEach((n) => {
          let location = { address: null, latitude: null, longitude: null };
          try {
            if (n.location) {
              location =
                typeof n.location === "string"
                  ? JSON.parse(n.location)
                  : n.location;
            }
          } catch (e) {}

          historyItems.push({
            type: "note",
            id: n.id,
            timestamp: n.created_at || n.update_at,
            body: getBody(n),
            gps_address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            photos: n.photos || [],
          });
        });
      } else if (rawNotes && typeof rawNotes === "string") {
        historyItems.push({
          type: "note",
          body: rawNotes,
          timestamp: data.created_at || data.updated_at,
        });
      }

      // Process Tasks
      let rawTasks = data.tasks || data.task_list;
      if (typeof rawTasks === "string" && rawTasks.startsWith("[")) {
        try {
          rawTasks = JSON.parse(rawTasks);
        } catch (e) {}
      }

      if (Array.isArray(rawTasks)) {
        rawTasks.forEach((t) => {
          historyItems.push({
            type: "task",
            id: t.id || t.task_id || t.taskId,
            timestamp: t.created_at || t.update_at,
            body: t.task_name || t.name || "",
            content: t.desktask || t.content || t.description || "",
            status: t.status_name || t.statustask || t.status || t.status_id || "",
            priority: t.priority_name || t.prioritytask || t.priority || "",
            dueDate: t.due_date || t.dueDate || "",
            time: t.task_time || t.time || "",
          });
        });
      }

      this.historyitems = historyItems.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0);
        const dateB = new Date(b.timestamp || 0);
        return dateB - dateA;
      });

      this.locationData = {
        address: data.address || "",
        country: data.country || "",
        province: data.province || "",
        city: data.city || "",
        kecamatan: data.kecamatan || "",
        kelurahan: data.kd_kelurahan || data.kelurahan || "",
        pos_code: data.pos_code || "",
      };
    },
    resetForm() {
      const now = new Date().toISOString();

      this.formData = {
        id: null,
        project_name: "",
        deal_id: (this.fromPage === 'deals' && this.initialData) 
          ? (this.initialData.deal_id || this.initialData.id_deals || this.initialData.id || "")
          : "",
        leader_id: "",
        description: "",
        location: "",
        kd_kelurahan: "",
        project_status: "",
        created_at: now,
        created_by: this.currentUserId || this.currentUserLabel || "",
        task: {
          name: "",
          content: "",
          dueDate: "",
          time: "",
          status: "",
          priority: "",
        },
        noteData: {
          body: "",
          gps_address: null,
          latitude: null,
          longitude: null,
          photos: [],
          audioBlob: null,
        },
      };
      this.historyitems = [];

      this.locationData = {
        address: "",
        country: "",
        province: "",
        city: "",
        kecamatan: "",
        kelurahan: "",
        pos_code: "",
      };
    },
    handleReset() {
      this.resetForm();
    },
    handleClose() {
      if (!this.isSubmitting) {
        this.handleReset();
        this.activeTab = "master";
        this.historyitems = [];
        this.isNoteDrawerOpen = false;
        this.isTaskDrawerOpen = false;
        this.$emit("close");
      }
    },
    openNoteDrawer(editData = null, index = null) {
      if (editData) {
        this.tempNoteData = { ...editData };
        this.editingItemIndex = index;
      } else {
        this.tempNoteData = {
          body: "",
          gps_address: null,
          latitude: null,
          longitude: null,
          photos: [],
          audioBlob: null,
        };
        this.editingItemIndex = null;
      }
      this.isNoteDrawerOpen = true;
    },
    openTaskDrawer(task = null) {
      if (task) {
        this.selectedTaskDetail = { ...task };
      } else {
        // Jika task baru, otomatis pasang project_id dari project ini
        this.selectedTaskDetail = {
          project_id: this.formData.id || this.formData.project_id || null,
        };
      }
      this.showCreateTaskForm = true;
    },
    saveNoteFromDrawer() {
      if (
        !this.tempNoteData.body &&
        (this.tempNoteData.photos || []).length === 0
      ) {
        alertService.toastWarn("Catatan masih kosong");
        return;
      }

      const isUpdate = !!this.tempNoteData.idnote;

      const item = {
        noteable_type: "PR",
        noteable_id: this.formData.id || this.formData.project_id || null,
        ...this.tempNoteData,
        choice: isUpdate ? "U" : "I",
      };

      const formData = this.buildFormDatanote(item);

      this.saveNote(formData)
        .then(() => {
          alertService.toastSuccess("Catatan berhasil disimpan", 3000);
          this.isNoteDrawerOpen = false;
          this.editingItemIndex = null;
          this.tempNoteData = {
            body: "",
            gps_address: null,
            latitude: null,
            longitude: null,
            photos: [],
            audioBlob: null,
          };
          if (item.noteable_id) {
            this.acthistory({
              noteable_type: "PR",
              noteable_id: item.noteable_id,
            });
          }
        })
        .catch((err) => {
          alertService.toastError(
            err.response?.data?.message ||
              err.message ||
              "Gagal menyimpan catatan",
            3000,
          );
        });
    },
    closeCreateTaskForm() {
      this.showCreateTaskForm = false;
      this.selectedTaskDetail = null;
    },
    async handleTaskSubmit(result) {
      if (result && this.formData.id) {
        // Optimistic update: Manually inject the task into history if it's new
        const savedTask = result.input || result.param || result;
        const isUpdate = !!(savedTask.id || savedTask.task_id);
        
        // Find labels from store with robust matching
        const statusObj = this.allStatuses.find(s => 
          String(s.value || s.id) === String(savedTask.status_id || savedTask.status)
        );
        const priorityObj = this.allPriorities.find(p => 
          String(p.value || p.id) === String(savedTask.priority || savedTask.prioritytask)
        );

        const mappedData = {
          status: statusObj ? (statusObj.label || statusObj.status_name) : "Baru",
          priority: priorityObj ? (priorityObj.label || priorityObj.priority_name) : "Normal",
          dueDate: savedTask.due_date,
          name: savedTask.task_name,
          body: savedTask.task_name,
          timestamp: new Date().toISOString()
        };

        if (!isUpdate) {
          // It's a new task, push to local history immediately
          const newTaskItem = {
            ...savedTask,
            ...mappedData,
            type: "task",
            id: savedTask.id || result.result?.[0]?.id || Date.now(),
          };
          this.historyitems.unshift(newTaskItem);
        } else {
          // It's an update, find and update local history
          const taskId = String(savedTask.id || savedTask.task_id);
          const index = this.historyitems.findIndex(item => 
            item.type === "task" && String(item.id || item.id_task) === taskId
          );
          if (index !== -1) {
            this.historyitems.splice(index, 1, {
              ...this.historyitems[index],
              ...mappedData
            });
          }
        }

        // Still refresh from BE to get official labels and IDs
        await this.fetchProjectHistory();
      }
    },
    async fetchProjectHistory() {
      if (!this.formData.id) return;
      try {
        const response = await this.$store.dispatch(
          "projects/fetchProjectById",
          this.formData.id
        );
        if (response) {
          this.setFormData(response);
        }
      } catch (error) {
        console.error("Failed to fetch project history:", error);
      }
    },
    handleHistoryEdit({ item, index }) {
      if (item.type === "note") {
        this.openNoteDrawer(item, index);
      } else if (item.type === "task") {
        this.openTaskDrawer(item);
      }
    },
    async handleHistoryDelete(index) {
      const item = this.allHistory[index];
      if (!item) return;

      const isConfirmed = await alertService.confirm(
        `Apakah Anda yakin ingin menghapus ${item.type === "task" ? "task" : "note"} ini?`,
        "Konfirmasi Hapus",
        {
          confirmButtonText: "Ya, Hapus",
          cancelButtonText: "Kembali",
        },
      );

      if (isConfirmed) {
        if (item.type === "task") {
          try {
            const taskId = item.id || item.task_id || item.id_task;
            if (taskId) {
              await this.deleteTask(taskId);
              alertService.toastSuccess("Task berhasil dihapus");
            }
          } catch (error) {
            console.error("Failed to delete task:", error);
            alertService.toastError("Gagal menghapus task");
            return;
          }
        }

        // Cari index asli di historyitems untuk di splice
        const itemId = item.id || item.id_task || item.task_id || item.idnote;
        const localIndex = this.historyitems.findIndex((h) => {
          const hId = h.id || h.id_task || h.task_id || h.idnote;
          return String(hId) === String(itemId);
        });

        if (localIndex !== -1) {
          this.historyitems.splice(localIndex, 1);
        }

        // Selalu refresh dari store untuk sinkronisasi final
        this.fetchProjectHistory();
        alertService.toastInfo("Item dihapus dari histori");
      }
    },
    async handleSubmit() {
      if (this.isSubmitting) return;

      // Bersihkan error lama di store agar pesan merah di background hilang
      this.$store.commit("project/SET_ERROR", null);

      const projectName = String(this.formData.project_name || "").trim();
      if (!projectName) {
        await alertService.error("Nama Project wajib diisi.");
        return;
      }
      if (!this.formData.deal_id) {
        // Jika dari deals page, coba ambil deal_id dari initialData sebagai fallback
        const dealIdFallback = this.initialData?.deal_id || 
                             this.initialData?.id_deals || 
                             this.initialData?.id_deal || 
                             this.initialData?.id;

        if (this.fromPage === 'deals' && dealIdFallback) {
          this.formData.deal_id = dealIdFallback;
        } else {
          await alertService.error("Deal wajib dipilih.");
          return;
        }
      }
      if (!this.formData.leader_id) {
        await alertService.error("Leader wajib dipilih.");
        return;
      }
      if (!this.formData.status_id) {
        await alertService.error("Project status wajib dipilih.");
        return;
      }
      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      try {
        const payload = {
          ...(this.formData.id ? { id: this.formData.id } : {}),
          project_name: this.formData.project_name.trim(),
          deal_id: this.formData.deal_id,
          leader_id: this.formData.leader_id,
          description: this.formData.description.trim(),
          address: this.locationData.address?.trim() || "",
          kd_kelurahan:
            this.locationData.kelurahan || this.formData.kd_kelurahan || "",
          location:
            this.formData.location.trim() || JSON.stringify(this.locationData),
          locationData: { ...this.locationData },
          status_id: this.formData.status_id,
          created_at: this.formData.created_at || new Date().toISOString(),
          created_by:
            this.formData.created_by ||
            this.currentUserId ||
            this.currentUserLabel ||
            "",
          task: { ...this.formData.task },
          noteData: { ...this.formData.noteData },
          historyitems: this.historyitems.map((item) => ({ ...item })),
        };

        let response;
        if (this.isEditMode) {
          response = await this.$store.dispatch("project/updateProject", {
            id: this.formData.id,
            formData: payload,
          });
          alertService.toastSuccess("Project updated successfully");
        } else {
          response = await this.$store.dispatch("project/createProject", payload);
          alertService.toastSuccess("Project created successfully");

          // Ambil ID baru dari response backend (mencakup berbagai kemungkinan struktur response)
          const newId =
            response?.id ||
            response?.result?.id ||
            response?.param?.id ||
            response?.data?.id ||
            response?.project_id ||
            response?.data?.project_id ||
            (Array.isArray(response?.result) && response.result[0]?.id) ||
            (Array.isArray(response?.data) && response.data[0]?.id);

          if (newId) {
            this.formData.id = newId;
          }
        }

        // Handle UI flow based on context
        if (this.fromPage === "projects") {
          if (!this.isEditMode) {
            this.showTabsAfterSave = true;
            this.activeTab = "tasks";
          } else {
            // Refresh history/detail jika perlu
            this.fetchProjectHistory();
          }
          this.$emit("submit", response || payload);
        } else {
          // Jika dari deals atau context lain, tutup dan emit
          this.$emit("submit", response || payload);
          this.resetForm();
          this.$emit("close");
        }
      } catch (error) {
        console.error("Submit error:", error);
        alertService.error("Gagal menyimpan project.");
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
.slide-project-enter-active,
.slide-project-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-project-enter-from,
.slide-project-leave-to {
  transform: translateX(100%);
}

/* Overlay Animation */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Slide Animation untuk drawer */
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

/* Custom V-Select Styles */
:deep(.custom-v-select) {
  --vs-font-size: 0.875rem;
  --vs-line-height: 1.25rem;
  --vs-border-radius: 0.5rem;
  --vs-border-color: #e2e8f0; /* border-outline color */
  --vs-border-width: 1px;
  --vs-dropdown-max-height: 250px;
}

:deep(.custom-v-select .vs__dropdown-toggle) {
  padding: 2px 0 6px 0;
  border: 1px solid #e2e8f0;
}

:deep(.custom-v-select .vs__search::placeholder) {
  color: #94a3b8;
}

:deep(.custom-v-select .vs__actions) {
  padding: 4px 10px 0 3px;
}

:deep(.custom-v-select .vs__selected) {
  margin-top: 6px;
}

.v-select-container {
  width: 100%;
}
</style>
