<script>
import {
  Plus,
  X,
  FileText,
  StickyNote,
  Pencil,
  Trash2,
  ExternalLink,
  MessageSquare,
} from "lucide-vue-next";
import { mapActions, mapGetters } from "vuex";
import { alertService } from "@/services/alertService";
import NotesEditor from "@/components/widgets/NotesEditor.vue";

export default {
  name: "HistoryDetail2",

  components: {
    Plus,
    X,
    FileText,
    StickyNote,
    Pencil,
    Trash2,
    ExternalLink,
    MessageSquare,
    NotesEditor,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    noteableType: {
      type: String,
      default: null,
    },
    noteableId: {
      type: [String, Number],
      default: null,
    },
  },

  emits: ["add-note", "add-doc", "edit", "delete"],

  data() {
    return {
      // ─── Note Drawer State (pindah dari parent) ───────────────────
      isNoteDrawerOpen: false,
      editingItemIndex: null,
      tempNoteData: {
        idnote: null,
        body: "",
        gps_address: null,
        latitude: null,
        longitude: null,
        photos: [],
        documents: [],
        audioBlob: null,
        visibility: 0,
      },
    };
  },

  computed: {
    ...mapGetters({
      historyDisplay: "history/history",
    }),

    displayItems() {
      const source =
        this.noteableType && this.noteableId
          ? this.historyDisplay || []
          : this.items || [];

      return source.map((item) => ({
        ...item,
        type: item.type || "note",
        body: item.notes || item.body || item.content || item.description || "",
        timestamp: item.created_at || item.timestamp || null,
      }));
    },

    isApiMode() {
      return !!(this.noteableType && this.noteableId);
    },
  },

  watch: {
    noteableId: {
      immediate: true,
      handler(val) {
        if (val && this.noteableType) {
          this.fetchHistory();
        }
      },
    },
  },

  methods: {
    ...mapActions({
      acthistory: "history/acthistory",
      saveNote: "history/saveNote",
    }),

    // ─── FETCH ───────────────────────────────────────────────────────
    async fetchHistory() {
      if (!this.noteableType || !this.noteableId) return;
      try {
        await this.acthistory({
          noteable_type: this.noteableType,
          noteable_id: this.noteableId,
        });
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    },

    // ─── NOTE DRAWER ─────────────────────────────────────────────────
    openNoteDrawer(editData = null, index = null) {
      if (editData) {
        this.tempNoteData = { ...editData };
        this.editingItemIndex = index;
      } else {
        this.tempNoteData = {
          idnote: null,
          body: "",
          gps_address: null,
          latitude: null,
          longitude: null,
          photos: [],
          documents: [],
          audioBlob: null,
          visibility: 0,
        };
        this.editingItemIndex = null;
      }
      this.isNoteDrawerOpen = true;
    },

    closeNoteDrawer() {
      this.isNoteDrawerOpen = false;
      this.editingItemIndex = null;
    },

    // ─── SAVE NOTE ───────────────────────────────────────────────────
    async saveNoteFromDrawer() {
      const isUpdate = !!this.tempNoteData.idnote;

      const payload = {
        noteable_type: this.noteableType,
        noteable_id: this.noteableId,
        ...this.tempNoteData,
        choice: isUpdate ? "U" : "I",
      };

      const formData = this.buildFormDataNote(payload);

      try {
        await this.saveNote(formData);
        alertService.success("Catatan berhasil disimpan");
        this.closeNoteDrawer();
        await this.fetchHistory();
      } catch (err) {
        alertService.error(
          err.response?.data?.message ||
            err.message ||
            "Gagal menyimpan catatan",
        );
      }
    },

    buildFormDataNote(data) {
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
      fd.append("idnote", data.idnote ?? "");

      // Photos
      (data.photos || []).forEach((p) => {
        if (p.file) {
          fd.append("photos[]", p.file);
        } else if (typeof p.src === "string") {
          existing.push({
            name: p.src.split("/").pop(),
            path: p.src,
            type: "photo",
          });
        }
      });

      // Documents
      (data.documents || []).forEach((d) => {
        if (d.file instanceof File) {
          fd.append("documents[]", d.file);
        } else if (d.url) {
          existing.push({ name: d.name, path: d.url, type: "document" });
        }
      });

      if (existing.length > 0) {
        fd.append("existing_attachments", JSON.stringify(existing));
      }

      return fd;
    },

    // ─── EDIT ────────────────────────────────────────────────────────
    handleEdit(item, index) {
      if (item.type === "note") {
        // Parse attachments
        let attachments = [];
        try {
          if (typeof item.attachment === "string" && item.attachment !== "") {
            attachments = JSON.parse(item.attachment);
          } else if (Array.isArray(item.attachment)) {
            attachments = item.attachment;
          }
        } catch (e) {
          console.error("Failed to parse attachments:", e);
        }

        const editData = {
          idnote: item.id,
          body: item.notes || item.body || "",
          latitude: item.lat,
          longitude: item.lang,
          gps_address:
            item.lat && item.lang ? `${item.lat}, ${item.lang}` : null,
          photos: attachments
            .filter((a) => a.type === "photo" || a.typefile === "photo")
            .map((a) => ({ src: a.path || a.fileurl })),
          documents: attachments
            .filter((a) => a.type === "document" || a.typefile === "document")
            .map((a) => ({
              id: Math.random(),
              name: a.name || (a.path || a.fileurl).split("/").pop(),
              url: a.path || a.fileurl,
              file: null,
            })),
          visibility: item.visibility || "0",
        };

        // Buka drawer langsung di sini (tidak emit ke parent)
        this.openNoteDrawer(editData, index);
      } else {
        // Untuk doc, tetap emit ke parent
        this.$emit("edit", { item, index });
      }
    },

    // ─── DELETE ──────────────────────────────────────────────────────
    async handleDelete(index) {
      const item = this.displayItems[index];
      if (!item) return;

      const result = await alertService.confirm(
        "Apakah Anda yakin ingin menghapus catatan ini?",
        "Hapus Histori",
        {
          confirmButtonText: "Ya, hapus",
          cancelButtonText: "Kembali",
        },
      );

      if (!result) return;

      // Mode API — hapus via server
      if (this.isApiMode && item.id) {
        const formData = new FormData();
        formData.append("choice", "D");
        formData.append("idnote", item.id);
        formData.append("noteable_type", this.noteableType);
        formData.append("noteable_id", this.noteableId);

        try {
          await this.saveNote(formData);
          alertService.success("Catatan berhasil dihapus");
          await this.fetchHistory();
        } catch (err) {
          alertService.error(
            err.response?.data?.message ||
              err.message ||
              "Gagal menghapus catatan",
          );
        }
        return;
      }

      // Mode lokal — emit ke parent
      this.$emit("delete", index);
    },

    // ─── HELPERS ─────────────────────────────────────────────────────
    getFormattedDate(date) {
      if (!date) return "Now";
      return new Date(date).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>

<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Header Buttons -->
    <div class="flex items-center gap-3 mb-8">
      <button
        type="button"
        @click="openNoteDrawer()"
        class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-outline rounded-xl text-sm font-semibold text-main-text hover:bg-light-base hover:border-dark-base/20 transition-all duration-200 shadow-sm"
      >
        <Plus :size="18" class="text-main-text" />
        Tambah Notes
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center py-12"
    >
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-base mb-3"
      ></div>
      <p class="text-sm text-sub-text">Memuat histori...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!displayItems.length"
      class="flex flex-col items-center justify-center py-20 text-center px-10"
    >
      <div
        class="w-16 h-16 bg-light-base rounded-full flex items-center justify-center mb-4"
      >
        <MessageSquare :size="32" class="text-outline" />
      </div>
      <h3 class="text-base font-semibold text-main-text">Belum ada histori</h3>
      <p class="text-sm text-sub-text mt-1">
        Mulailah dengan menambahkan catatan untuk melacak aktivitas.
      </p>
    </div>

    <!-- Timeline List -->
    <div v-else class="relative pl-12 space-y-10 pr-2 pb-10">
      <div
        class="absolute left-[13px] top-2 bottom-6 w-[0.5px] bg-outline/60"
      ></div>

      <div v-for="(item, index) in displayItems" :key="index" class="relative">
        <!-- Dot -->
        <div
          class="absolute -left-[41px] top-1.5 w-3.5 h-3.5 rounded-full bg-points border-2 border-white shadow-sm z-10"
        ></div>

        <!-- Card -->
        <div
          class="bg-white border border-outline rounded-xl p-6 pt-4 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <p
                class="text-[10px] font-bold uppercase tracking-widest mb-1.5 px-2 py-0.5 rounded inline-block"
                :class="
                  item.type === 'note'
                    ? 'bg-progress-color/10 text-progress-color'
                    : 'bg-deffered-color/10 text-deffered-color'
                "
              >
                {{ item.type === "note" ? "Note" : "Document" }}
              </p>
              <p class="text-[12px] text-sub-text font-medium">
                {{ getFormattedDate(item.timestamp || item.created_at) }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1">
              <button
                type="button"
                @click="handleEdit(item, index)"
                class="p-1.5 hover:bg-light-base rounded-lg text-sub-text hover:text-main-text transition-colors"
              >
                <Pencil :size="14" />
              </button>
              <button
                type="button"
                @click="handleDelete(index)"
                class="p-1.5 hover:bg-light-base rounded-lg text-sub-text hover:text-red transition-colors"
              >
                <Trash2 :size="14" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div
            class="text-[14px] text-main-text/90 leading-relaxed prose prose-sm max-w-none break-words"
            v-html="item.body"
          ></div>

          <!-- Photos -->
          <div v-if="item.photos?.length" class="mt-5 flex flex-wrap gap-3">
            <div
              v-for="(photo, pi) in item.photos"
              :key="pi"
              class="w-16 h-16 rounded-lg border border-outline overflow-hidden shadow-sm"
            >
              <img
                :src="photo.src || photo"
                class="w-full h-full object-cover"
              />
            </div>
          </div>

          <!-- Files -->
          <div v-if="item.files?.length" class="mt-5 space-y-2">
            <div
              v-for="(file, fi) in item.files"
              :key="fi"
              class="flex items-center gap-3 p-3 bg-light-base rounded-xl border border-outline text-[13px]"
            >
              <FileText :size="16" class="text-deffered-color" />
              <span class="flex-1 truncate font-medium">{{
                file.name || "document"
              }}</span>
              <ExternalLink :size="14" class="text-sub-text" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Note Drawer -->
  <Transition name="slide">
    <div v-if="isNoteDrawerOpen" class="fixed inset-0 z-[60]">
      <div class="absolute inset-0 bg-black/40" @click="closeNoteDrawer"></div>
      <div
        class="absolute top-0 right-0 h-screen w-full max-w-2xl bg-white shadow-2xl flex flex-col"
        @click.stop
      >
        <div
          class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10"
        >
          <h2 class="text-xl font-bold text-main-text">
            {{ editingItemIndex !== null ? "Edit Note" : "Tambah Note" }}
          </h2>
          <button
            @click="closeNoteDrawer"
            class="p-2 hover:bg-light-base rounded-lg"
          >
            <X :size="20" class="text-sub-text" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <NotesEditor v-model:note-data="tempNoteData" />
        </div>

        <div
          class="bg-white px-6 py-4 border-t border-outline flex justify-end gap-3"
        >
          <button
            @click="closeNoteDrawer"
            class="px-6 py-2 border border-outline rounded-lg text-sm font-medium hover:bg-light-base"
          >
            Cancel
          </button>
          <button
            @click="saveNoteFromDrawer"
            class="px-6 py-2 bg-dark-base text-white rounded-lg text-sm font-medium hover:bg-dark-hover"
          >
            Simpan Ke Histori
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.prose :deep(p) {
  margin: 0;
}
.prose :deep(ul),
.prose :deep(ol) {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
