<script>
import {
  Plus,
  FileText,
  StickyNote,
  Pencil,
  Trash2,
  ExternalLink,
  MessageSquare,
} from "lucide-vue-next";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "HistoryDetail",

  components: {
    Plus,
    FileText,
    StickyNote,
    Pencil,
    Trash2,
    ExternalLink,
    MessageSquare,
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
    isNoteDrawerOpen: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["add-note", "add-doc", "edit", "delete"],

  computed: {
    ...mapGetters({
      historyDisplay: "history/history",
    }),
    displayItems() {
      // Use mapped store history if identifiers exist, else use items prop
      const source =
        this.noteableType && this.noteableId
          ? this.historyDisplay || []
          : this.items || [];

      return source.map((item) => {
        // Robust mapping for database fields
        const isNote =
          item.notes !== undefined ||
          item.body !== undefined ||
          item.content !== undefined;
        return {
          ...item,
          type: item.type || (isNote ? "note" : "doc"),
          body:
            item.notes || item.body || item.content || item.description || "",
          timestamp: item.created_at || item.timestamp || null,
        };
      });
    },
  },

  watch: {
    noteableId: {
      handler(newVal) {
        if (newVal && this.noteableType) {
          this.fetchHistory();
        }
      },
      immediate: true,
    },
  },

  mounted() {
    if (this.noteableId && this.noteableType) {
      this.fetchHistory();
    }
  },

  methods: {
    ...mapActions({
      acthistory: "history/acthistory",
    }),
    async fetchHistory() {
      if (!this.noteableType || !this.noteableId) {
        console.warn("fetchHistory skipped: missing type or id", {
          type: this.noteableType,
          id: this.noteableId,
        });
        return;
      }

      console.log("Fetching history for:", {
        type: this.noteableType,
        id: this.noteableId,
      });
      try {
        await this.acthistory({
          noteable_type: this.noteableType,
          noteable_id: this.noteableId,
        });
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    },
    getIcon(type) {
      if (type === "note") return "StickyNote";
      if (type === "doc") return "FileText";
      return "MessageSquare";
    },
    getIconColor(type) {
      if (type === "note") return "text-progress-color";
      if (type === "doc") return "text-deffered-color";
      return "text-sub-text";
    },
    getFormattedDate(date) {
      if (!date) return "Now";
      const d = new Date(date);
      return d.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    closeNoteDrawer() {
      this.isNoteDrawerOpen = false;
    },
    openNoteDrawer() {
      this.isNoteDrawerOpen = true;
    },
    saveNoteFromDrawer() {
      // if (!this.tempNoteData.body && this.tempNoteData.photos.length === 0) {
      //   alertService.toastWarn("Note masih kosong");
      //   return;
      // }
      const isUpdate = !!this.tempNoteData.idnote;

      const item = {
        noteable_type: this.noteableType || "CM",
        noteable_id: this.noteableId,
        // id:
        ...this.tempNoteData,
        choice: isUpdate ? "U" : "I",
      };
      const formData = this.buildFormDatanote(item);
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      this.saveNote(formData)
        .then(() => {
          alertService.success("Catatan berhasil disimpan");
          this.isNoteDrawerOpen = false;
          // Refresh history list
          this.acthistory({
            noteable_type: this.noteableType || "CM",
            noteable_id: this.noteableId,
          });
        })
        .catch((err) => {
          alertService.error(
            err.response?.data?.message ||
              err.message ||
              "Gagal menyimpan catatan",
          );
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
        @click="$emit('add-note')"
        class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-outline rounded-xl text-sm font-semibold text-main-text hover:bg-light-base hover:border-dark-base/20 transition-all duration-200 shadow-sm"
      >
        <Plus :size="18" class="text-main-text" />
        Tambah Notes
      </button>
    </div>

    <!-- Timeline Container -->
    <div class="relative flex-1">
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
        v-else-if="!displayItems || displayItems.length === 0"
        class="flex flex-col items-center justify-center py-20 text-center px-10"
      >
        <div
          class="w-16 h-16 bg-light-base rounded-full flex items-center justify-center mb-4"
        >
          <MessageSquare :size="32" class="text-outline" />
        </div>
        <h3 class="text-base font-semibold text-main-text">
          Belum ada histori
        </h3>
        <p class="text-sm text-sub-text mt-1">
          Mulailah dengan menambahkan catatan atau dokumen untuk melacak
          aktivitas.
        </p>
      </div>

      <!-- Timeline List -->
      <div v-else class="relative pl-12 space-y-10 pr-2 pb-10">
        <!-- Vertical Line -->
        <div
          class="absolute left-[13px] top-2 bottom-6 w-[0.5px] bg-outline/60"
        ></div>

        <div
          v-for="(item, index) in displayItems"
          :key="index"
          class="relative"
        >
          <!-- Dot -->
          <div
            class="absolute -left-[41px] top-1.5 w-3.5 h-3.5 rounded-full bg-points border-2 border-white shadow-sm z-10"
          ></div>

          <!-- Content Card -->
          <div
            class="bg-white border border-outline rounded-xl p-6 pt-4 shadow-sm hover:shadow-md transition-all duration-300 group relative"
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
                <p
                  class="text-[12px] text-sub-text font-medium flex items-center gap-1.5"
                >
                  {{ getFormattedDate(item.timestamp || item.created_at) }}
                </p>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  @click="$emit('edit', { item, index })"
                  class="p-1.5 hover:bg-light-base rounded-lg text-sub-text hover:text-main-text transition-colors"
                  title="Edit"
                >
                  <Pencil :size="14" />
                </button>
                <button
                  type="button"
                  @click="$emit('delete', index)"
                  class="p-1.5 hover:bg-light-base rounded-lg text-sub-text hover:text-red transition-colors"
                  title="Hapus"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>

            <!-- Content Area -->
            <div class="space-y-4">
              <h4
                v-if="item.title"
                class="text-base font-bold text-main-text leading-tight"
              >
                {{ item.title }}
              </h4>
              <div
                class="text-[14px] text-main-text/90 leading-relaxed prose prose-sm max-w-none break-words"
                v-html="
                  item.notes || item.body || item.content || item.description
                "
              ></div>
            </div>

            <!-- Attachments Preview -->
            <div
              v-if="item.photos && item.photos.length"
              class="mt-5 flex flex-wrap gap-3"
            >
              <div
                v-for="(photo, pi) in item.photos"
                :key="pi"
                class="w-16 h-16 rounded-lg border border-outline overflow-hidden shadow-sm hover:scale-105 transition-transform duration-200 cursor-zoom-in"
              >
                <img
                  :src="photo.src || photo"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>

            <!-- Docs Preview -->
            <div v-if="item.files && item.files.length" class="mt-5 space-y-2">
              <div
                v-for="(file, fi) in item.files"
                :key="fi"
                class="flex items-center gap-3 p-3 bg-light-base rounded-xl border border-outline text-[13px] text-main-text hover:bg-outline/20 transition-colors cursor-pointer group/file"
              >
                <div
                  class="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center group-hover/file:bg-white transition-colors"
                >
                  <FileText :size="16" class="text-deffered-color" />
                </div>
                <span class="flex-1 font-medium truncate">{{
                  file.name || "document"
                }}</span>
                <ExternalLink :size="14" class="text-sub-text" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Note Drawer POPUP -->
  <Transition name="slide">
    <div v-if="isNoteDrawerOpen" class="fixed inset-0 z-60">
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
            class="p-2 hover:bg-light-base rounded-lg transition-colors"
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
</style>
