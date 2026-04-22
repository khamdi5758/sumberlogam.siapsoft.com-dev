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
  },


  emits: ["add-note", "add-doc", "edit", "delete"],

  computed: {
    ...mapGetters({
      historyDisplay: "history/history",
    }),
    displayItems() {
      // Prioritize store history if we have noteable identifiers, else fallback to items prop
      if (this.noteableType && this.noteableId) {
        return this.historyDisplay || [];
      }
      return this.items;
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
        console.warn("fetchHistory skipped: missing type or id", { type: this.noteableType, id: this.noteableId });
        return;
      }

      console.log("Fetching history for:", { type: this.noteableType, id: this.noteableId });
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
        class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-outline rounded-xl text-sm font-semibold text-dark-base hover:bg-light-base hover:border-dark-base/20 transition-all duration-200 shadow-sm"
      >
        <Plus :size="18" class="text-dark-base" />
        Tambah Notes
      </button>
    </div>

    <!-- Timeline Container -->
    <div class="relative flex-1">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-base mb-3"></div>
        <p class="text-sm text-sub-text">Memuat histori...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!items || items.length === 0" class="flex flex-col items-center justify-center py-20 text-center px-10">
        <div class="w-16 h-16 bg-light-base rounded-full flex items-center justify-center mb-4">
          <MessageSquare :size="32" class="text-outline" />
        </div>
        <h3 class="text-base font-semibold text-dark-base">Belum ada histori</h3>
        <p class="text-sm text-sub-text mt-1">
          Mulailah dengan menambahkan catatan atau dokumen untuk melacak aktivitas.
        </p>
      </div>

      <!-- Timeline List -->
      <div v-else class="relative pl-12 space-y-10 pr-2 pb-10">
        <!-- Vertical Line -->
        <div class="absolute left-[13px] top-2 bottom-6 w-[0.5px] bg-outline/60"></div>

        <div v-for="(item, index) in displayItems" :key="index" class="relative">

          <!-- Dot -->
          <div 
            class="absolute -left-[41px] top-1.5 w-3.5 h-3.5 rounded-full bg-points border-2 border-white shadow-sm z-10"
          ></div>

          <!-- Content Card -->
          <div class="bg-white border border-outline rounded-xl p-6 pt-4 shadow-sm hover:shadow-md transition-all duration-300 group relative">
            <div class="flex items-start justify-between mb-3">
              <div>
                <p 
                  class="text-[10px] font-bold uppercase tracking-widest mb-1.5 px-2 py-0.5 rounded inline-block"
                  :class="item.type === 'note' ? 'bg-progress-color/10 text-progress-color' : 'bg-deffered-color/10 text-deffered-color'"
                >
                  {{ item.type === 'note' ? 'Note' : 'Document' }}
                </p>
                <p class="text-[12px] text-sub-text font-medium flex items-center gap-1.5">
                  {{ getFormattedDate(item.timestamp || item.created_at) }}
                </p>
              </div>
              
              <!-- Actions -->
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button 
                  type="button"
                  @click="$emit('edit', { item, index })" 
                  class="p-1.5 hover:bg-light-base rounded-lg text-sub-text hover:text-dark-base transition-colors"
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
              <h4 v-if="item.title" class="text-base font-bold text-dark-base leading-tight">
                {{ item.title }}
              </h4>
              <div 
                class="text-[14px] text-dark-base/90 leading-relaxed prose prose-sm max-w-none break-words"
                v-html="item.notes || item.body || item.content || item.description"
              ></div>
            </div>

            <!-- Attachments Preview -->
            <div v-if="item.photos && item.photos.length" class="mt-5 flex flex-wrap gap-3">
              <div 
                v-for="(photo, pi) in item.photos" 
                :key="pi" 
                class="w-16 h-16 rounded-lg border border-outline overflow-hidden shadow-sm hover:scale-105 transition-transform duration-200 cursor-zoom-in"
              >
                <img :src="photo.src || photo" class="w-full h-full object-cover" />
              </div>
            </div>

            <!-- Docs Preview -->
            <div v-if="item.files && item.files.length" class="mt-5 space-y-2">
               <div 
                 v-for="(file, fi) in item.files" 
                 :key="fi"
                 class="flex items-center gap-3 p-3 bg-light-base rounded-xl border border-outline text-[13px] text-dark-base hover:bg-outline/20 transition-colors cursor-pointer group/file"
               >
                 <div class="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center group-hover/file:bg-white transition-colors">
                   <FileText :size="16" class="text-deffered-color" />
                 </div>
                 <span class="flex-1 font-medium truncate">{{ file.name || 'document' }}</span>
                 <ExternalLink :size="14" class="text-sub-text" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose :deep(p) { margin: 0; }
.prose :deep(ul), .prose :deep(ol) { margin-top: 0.5rem; margin-bottom: 0.5rem; }
</style>
