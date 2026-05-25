<script>
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  Camera,
  Mic,
  FileText,
} from "lucide-vue-next";
import imageCompression from "browser-image-compression";

export default {
  name: "NotesEditor",

  components: { ChevronDown, ChevronRight, MapPin, Camera, Mic, FileText },

  props: {
    // v-model dari parent untuk seluruh data notes
    noteData: {
      type: Object,
      default: () => ({
        idnote: null,
        body: "",
        gps_address: null,
        latitude: null,
        longitude: null,
        photos: [],
        audioBlob: null,
        visibility: "0",
      }),
    },
    // Props identitas parent record (untuk dikirim ke Laravel)
    noteableId: {
      type: [Number, String],
      default: null,
    },
    noteableType: {
      type: String,
      default: "App\\Models\\Company",
    },
    title: {
      type: String,
      default: "Notes",
    },
    defaultOpen: {
      type: Boolean,
      default: true,
    },
  },

  emits: ["update:noteData"],

  data() {
    return {
      showNotes: this.defaultOpen,

      // State internal editor
      gpsAddress: null,
      coords: { lat: null, lng: null },
      photos: [], // langsung array of File
      documents: [], // { id, name, file, url }
      isDragging: false,
      photoPreviews: [], // pisahkan untuk preview
      audioBlob: null, // Blob hasil rekaman

      // Recording state
      isRecording: false,
      recSeconds: 0,
      recInterval: null,
      mediaRecorder: null,
      audioChunks: [],
      visibility: 0,
      // Audio playback preview
      audioPreviewUrl: null,

      // GPS loading state
      gpsLoading: false,
    };
  },

  computed: {
    currentIcon() {
      return this.showNotes ? ChevronDown : ChevronRight;
    },
    recTime() {
      const m = Math.floor(this.recSeconds / 60);
      const s = this.recSeconds % 60;
      return `${m}:${s.toString().padStart(2, "0")}`;
    },
  },

  mounted() {
    // Hydrate dari noteData prop jika ada (mode edit record existing)
    if (this.noteData.body && this.$refs.editor) {
      this.$refs.editor.innerHTML = this.noteData.body;
    }
    if (this.noteData.gps_address) {
      this.gpsAddress = this.noteData.gps_address;
      this.coords = {
        lat: this.noteData.latitude,
        lng: this.noteData.longitude,
      };

      // Jika alamat masih berupa koordinat (misal: "Lat, Long"), coba terjemahkan ke alamat asli
      const coordRegex = /^-?\d+\.\d+,\s*-?\d+\.\d+$/;
      if (
        coordRegex.test(this.gpsAddress) &&
        this.coords.lat &&
        this.coords.lng
      ) {
        this.reverseGeocode(this.coords.lat, this.coords.lng);
      }
    }
    if (Array.isArray(this.noteData.photos)) {
      // Hydrate preview foto jika dari server (URL string)
      this.photos = this.noteData.photos.map((p) =>
        typeof p === "string" ? { id: Math.random(), src: p, file: null } : p,
      );
    }

    if (Array.isArray(this.noteData.documents)) {
      this.documents = this.noteData.documents.map((d) => {
        if (typeof d === "string") {
          const url = d;
          let filename = url.split("/").pop();
          // Bersihkan prefix timestamp dan uniqid (misal: 1776844654_69e87f6e317cb_)
          filename = filename.replace(/^\d+_[^_]+_/, "");
          return { id: Math.random(), name: filename, url: url, file: null };
        }
        return d;
      });
    }

    if (this.noteData.visibility) {
      this.visibility = this.noteData.visibility;
    }

    window.addEventListener("dragover", (e) => e.preventDefault());
    window.addEventListener("drop", (e) => e.preventDefault());
  },

  methods: {
    // ─── EMIT ke parent ───────────────────────────────────────────────────────
    emitData() {
      this.$emit("update:noteData", {
        body: this.$refs.editor?.innerHTML ?? "",
        gps_address: this.gpsAddress,
        latitude: this.coords.lat,
        longitude: this.coords.lng,
        photos: this.photos, // array { id, src, file }
        documents: this.documents,
        audioBlob: this.audioBlob, // Blob | null
        visibility: this.visibility,
        idnote: this.noteData.idnote,
      });
    },

    async handleDroppedFiles(files) {
      for (const file of files) {
        try {
          // IMAGE
          if (file.type.startsWith("image/")) {
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1024,
              useWebWorker: true,
              fileType: "image/webp",
            };
            const compressedBlob = await imageCompression(file, options);
            const compressedFile = new File(
              [compressedBlob],
              file.name, // 🔥 ini kuncinya
              { type: compressedBlob.type },
            );
            const previewUrl = URL.createObjectURL(compressedFile);

            this.photos.push({
              id: Date.now() + Math.random(),
              src: previewUrl,
              file: compressedFile,
            });
          }

          // DOCUMENT
          else {
            if (file.size > 10 * 1024 * 1024) {
              alert("File terlalu besar (max 10MB)");
              continue;
            }

            const url = URL.createObjectURL(file);

            this.documents.push({
              id: Date.now() + Math.random(),
              name: file.name,
              file: file,
              url: url,
            });
          }
        } catch (err) {
          console.error("Drop error:", err);
        }
      }

      this.emitData();
    },

    onDragOver(e) {
      e.preventDefault();
      this.isDragging = true;
    },

    onDragLeave(e) {
      e.preventDefault();
      this.isDragging = false;
    },

    async onDrop(e) {
      e.preventDefault();
      this.isDragging = false;

      const files = Array.from(e.dataTransfer.files);

      if (!files.length) return;

      await this.handleDroppedFiles(files);
    },

    triggerDocument() {
      this.$refs.documentInput.click();
    },

    onDocumentSelected(event) {
      const files = Array.from(event.target.files);

      for (const file of files) {
        try {
          // Validasi size (optional)
          if (file.size > 10 * 1024 * 1024) {
            alert("File terlalu besar (max 10MB)");
            continue;
          }

          const url = URL.createObjectURL(file);

          this.documents.push({
            id: Date.now() + Math.random(),
            name: file.name,
            file: file,
            url: url,
          });
        } catch (err) {
          console.error("Document error:", err);
        }
      }

      this.emitData();
      event.target.value = "";
    },

    removeDocument(index) {
      const doc = this.documents[index];

      if (doc?.url) {
        URL.revokeObjectURL(doc.url); // penting biar gak memory leak
      }

      this.documents.splice(index, 1);
      this.emitData();
    },

    // ─── TOOLBAR ──────────────────────────────────────────────────────────────
    execCmd(cmd, val = null) {
      document.execCommand(cmd, false, val);
      this.$refs.editor.focus();
    },
    applyFormat(event) {
      const val = event.target.value;
      if (val) this.execCmd("formatBlock", val);
      event.target.value = "";
    },
    insertLink() {
      const url = prompt("Masukkan URL:");
      if (url) this.execCmd("createLink", url);
    },
    onEditorInput() {
      this.emitData();
    },

    // ─── GPS ──────────────────────────────────────────────────────────────────
    async reverseGeocode(lat, lng) {
      this.gpsLoading = true;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        );
        const data = await res.json();
        this.gpsAddress =
          data.display_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      } catch {
        this.gpsAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      } finally {
        this.gpsLoading = false;
        this.emitData();
      }
    },
    addGPS() {
      if (!navigator.geolocation) {
        alert("Browser tidak mendukung Geolocation.");
        return;
      }
      this.gpsLoading = true;
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          this.coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          await this.reverseGeocode(this.coords.lat, this.coords.lng);
        },
        (err) => {
          this.gpsLoading = false;
          alert("Gagal mendapatkan lokasi: " + err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    },

    removeGPS() {
      this.gpsAddress = null;
      this.coords = { lat: null, lng: null };
      this.emitData();
    },
    // ─── PHOTO ────────────────────────────────────────────────────────────────
    triggerPhoto() {
      this.$refs.photoInput.click();
    },
    // onPhotoSelected(event) {
    //   const files = Array.from(event.target.files);
    //   files.forEach((file) => {
    //     const reader = new FileReader();
    //     reader.onload = (e) => {
    //       this.photos.push({
    //         id:   Date.now() + Math.random(),
    //         src:  e.target.result, // base64 untuk preview thumbnail
    //         file: file,            // File object asli untuk upload ke Laravel
    //       });
    //       this.emitData();
    //     };
    //     reader.readAsDataURL(file);
    //   });
    //   event.target.value = "";
    // },
    // async onPhotoSelected(event) {
    //   const files = Array.from(event.target.files);

    //   for (const file of files) {
    //     try {
    //       // validasi size awal (opsional)
    //       if (file.size > 10 * 1024 * 1024) {
    //         alert("File terlalu besar (max 10MB)");
    //         continue;
    //       }

    //       // options compression
    //       const options = {
    //         maxSizeMB: 1, // max 1MB
    //         maxWidthOrHeight: 1024, // resize max 1024px
    //         useWebWorker: true, // biar gak nge-lag UI
    //         fileType: "image/webp",
    //       };

    //       // compress
    //       const compressedFile = await imageCompression(file, options);

    //       // preview
    //       const previewUrl = URL.createObjectURL(compressedFile);

    //       this.photos.push({
    //         id: Date.now() + Math.random(),
    //         src: previewUrl, // preview hasil compress
    //         file: compressedFile, // file hasil compress
    //       });

    //       this.emitData();
    //     } catch (error) {
    //       console.error("Compress error:", error);
    //       alert("Gagal compress gambar");
    //     }
    //   }

    //   event.target.value = "";
    // },

    async onPhotoSelected(event) {
      const files = Array.from(event.target.files);

      for (const file of files) {
        try {
          if (file.size > 10 * 1024 * 1024) {
            alert("File terlalu besar (max 10MB)");
            continue;
          }

          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
            fileType: "image/webp",
          };

          const compressedBlob = await imageCompression(file, options);

          const compressedFile = new File(
            [compressedBlob],
            file.name, // 🔥 ini kuncinya
            { type: compressedBlob.type },
          );

          // ✅ Generate preview URL immediately and store consistently
          const previewUrl = URL.createObjectURL(compressedFile);

          this.photos.push({
            id: Date.now() + Math.random(),
            src: previewUrl,
            file: compressedFile,
          });
        } catch (error) {
          console.error("Compress error:", error);
        }
      }

      this.emitData();
      event.target.value = "";
    },

    getPreview(photo) {
      if (!photo) return "";

      // Jika string URL (dari server)
      if (typeof photo === "string") return photo;

      // Jika objek { id, src, file }
      if (photo.src) return photo.src;

      // Fallback untuk File/Blob langsung (meskipun sekarang sudah di-handle di onPhotoSelected)
      if (photo instanceof Blob) {
        if (!photo._preview) {
          photo._preview = URL.createObjectURL(photo);
        }
        return photo._preview;
      }

      return "";
    },

    removePhoto(index) {
      const photo = this.photos[index];

      // ✅ Bersihkan URL object agar tidak memory leak
      if (photo?.src && photo.src.startsWith("blob:")) {
        URL.revokeObjectURL(photo.src);
      }

      this.photos.splice(index, 1);
      this.emitData();
    },

    // ─── RECORDING ────────────────────────────────────────────────────────────
    async toggleRecording() {
      if (this.isRecording) {
        this.stopRecording();
      } else {
        await this.startRecording();
      }
    },
    async startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        this.audioChunks = [];
        this.mediaRecorder = new MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) this.audioChunks.push(e.data);
        };

        this.mediaRecorder.onstop = () => {
          // Buat Blob dari semua audio chunks
          this.audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
          // Buat URL object untuk preview player
          if (this.audioPreviewUrl) URL.revokeObjectURL(this.audioPreviewUrl);
          this.audioPreviewUrl = URL.createObjectURL(this.audioBlob);
          // Hentikan semua track stream mikrofon
          stream.getTracks().forEach((t) => t.stop());
          this.emitData();
        };

        this.mediaRecorder.start();
        this.isRecording = true;
        this.recSeconds = 0;
        this.recInterval = setInterval(() => this.recSeconds++, 1000);
      } catch (err) {
        alert("Gagal mengakses mikrofon: " + err.message);
      }
    },
    stopRecording() {
      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.stop();
      }
      this.isRecording = false;
      clearInterval(this.recInterval);
      this.recInterval = null;
    },
    removeAudio() {
      this.audioBlob = null;
      if (this.audioPreviewUrl) {
        URL.revokeObjectURL(this.audioPreviewUrl);
        this.audioPreviewUrl = null;
      }
      this.recSeconds = 0;
      this.emitData();
    },
  },

  beforeUnmount() {
    // Bersihkan resource saat komponen dihancurkan
    if (this.recInterval) clearInterval(this.recInterval);
    if (this.audioPreviewUrl) URL.revokeObjectURL(this.audioPreviewUrl);
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }

    // this.photos.forEach((file) => {
    //   if (file._preview) {
    //     URL.revokeObjectURL(file._preview);
    //   }
    // });
  },
};
</script>

<template>
  <div class="mb-5">
    <!-- ── EDITOR CARD ── -->
    <div class="border border-outline rounded-lg overflow-hidden">
      <!-- ── TOOLBAR ── -->
      <div
        class="flex items-center justify-between gap-1 px-3 py-2 border-b border-outline bg-light-base flex-wrap"
      >
        <div class="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            class="btn-toolbar"
            @click="execCmd('undo')"
            title="Undo"
          >
            ↩
          </button>
          <button
            type="button"
            class="btn-toolbar"
            @click="execCmd('redo')"
            title="Redo"
          >
            ↪
          </button>
          <span class="divider">|</span>

          <select class="select-toolbar" @change="applyFormat">
            <option value="">Formats</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="p">Paragraph</option>
          </select>
          <span class="divider">|</span>

          <button
            type="button"
            class="btn-toolbar font-bold"
            @click="execCmd('bold')"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            class="btn-toolbar italic"
            @click="execCmd('italic')"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            class="btn-toolbar underline"
            @click="execCmd('underline')"
            title="Underline"
          >
            U
          </button>
          <span class="divider">|</span>

          <button
            type="button"
            class="btn-toolbar"
            @click="insertLink"
            title="Insert Link"
          >
            🔗
          </button>
          <button
            type="button"
            class="btn-toolbar"
            @click="execCmd('removeFormat')"
            title="Remove Format"
          >
            ✕
          </button>
          <span class="divider">|</span>

          <!-- Alignment -->
          <button
            type="button"
            class="btn-toolbar"
            @click="execCmd('justifyLeft')"
            title="Rata Kiri"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="15" y2="12" />
              <line x1="3" y1="18" x2="18" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            class="btn-toolbar"
            @click="execCmd('justifyCenter')"
            title="Tengah"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="6" y1="12" x2="18" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            class="btn-toolbar"
            @click="execCmd('justifyRight')"
            title="Rata Kanan"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="9" y1="12" x2="21" y2="12" />
              <line x1="6" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span class="divider">|</span>

          <!-- Lists -->
          <button
            type="button"
            class="btn-toolbar"
            @click="execCmd('insertUnorderedList')"
            title="Bullet List"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="9" y1="6" x2="20" y2="6" />
              <line x1="9" y1="12" x2="20" y2="12" />
              <line x1="9" y1="18" x2="20" y2="18" />
              <circle cx="4" cy="6" r="1.5" fill="currentColor" />
              <circle cx="4" cy="12" r="1.5" fill="currentColor" />
              <circle cx="4" cy="18" r="1.5" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            class="btn-toolbar"
            @click="execCmd('insertOrderedList')"
            title="Numbered List"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="10" y1="6" x2="21" y2="6" />
              <line x1="10" y1="12" x2="21" y2="12" />
              <line x1="10" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        <!-- Visibility Dropdown -->
        <div class="flex items-center gap-2">
          <select
            v-model="visibility"
            @change="emitData"
            class="select-toolbar min-w-25"
          >
            <option :value="0">Public</option>
            <option :value="1">Internal</option>
            <option :value="2">Private</option>
          </select>
        </div>
      </div>

      <!-- ── CONTENTEDITABLE EDITOR ── -->
      <div
        ref="editor"
        contenteditable="true"
        class="editor-content w-full px-4 py-3 text-sm text-sub-text"
        :class="{ 'drag-active': isDragging }"
        data-placeholder="Tulis catatan..."
        @input="onEditorInput"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
      ></div>

      <!-- ── GPS LOADING ── -->
      <div
        v-if="gpsLoading"
        class="flex items-center gap-2 px-4 py-2 border-t border-outline text-sm text-gray-400"
      >
        <svg
          class="animate-spin"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
        Mendapatkan lokasi...
      </div>

      <!-- ── GPS ATTACHMENT ── -->
      <div
        v-else-if="gpsAddress"
        class="flex items-center gap-2 px-4 py-2 border-t border-outline text-sm"
      >
        <MapPin :size="14" class="text-blue-500 shrink-0" />
        <span class="flex-1 text-blue-600 truncate">{{ gpsAddress }}</span>
        <button
          type="button"
          @click="removeGPS"
          class="ml-2 text-red-400 hover:text-red-600 text-xs font-bold"
          title="Hapus lokasi"
        >
          ✕
        </button>
      </div>

      <!-- ── PHOTO PREVIEWS ── -->
      <!-- <div
        v-if="photos.length"
        class="flex gap-2 flex-wrap px-4 py-3 border-t border-outline"
      >
        <div
          v-for="photo in photos"
          :key="photo.id"
          class="relative w-16 h-16 rounded-lg overflow-hidden border border-outline group"
        >
          <img
            :src="photo.src"
            class="w-full h-full object-cover"
            :alt="photo.file?.name ?? 'foto'"
          />
          <button
            type="button"
            @click="removePhoto(photo.id)"
            class="photo-remove-btn"
            title="Hapus foto"
          >
            ✕
          </button>
        </div>
      </div> -->

      <div
        v-if="photos.length"
        class="flex gap-2 flex-wrap px-4 py-3 border-t border-outline"
      >
        <div
          v-for="(file, index) in photos"
          :key="index"
          class="relative w-16 h-16 rounded-lg overflow-hidden border border-outline group"
        >
          <img :src="getPreview(file)" class="w-full h-full object-cover" />

          <button
            type="button"
            @click="removePhoto(index)"
            class="photo-remove-btn"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- ── DOCUMENT LIST ── -->
      <div
        v-if="documents.length"
        class="flex flex-col gap-2 px-4 py-3 border-t border-outline"
      >
        <div
          v-for="(doc, index) in documents"
          :key="doc.id"
          class="flex items-center gap-2 text-sm border rounded px-2 py-1"
        >
          <FileText :size="14" class="text-blue-500 shrink-0" />
          <a
            :href="doc.url"
            target="_blank"
            class="flex-1 truncate text-blue-600 hover:underline"
          >
            {{ doc.name }}
          </a>

          <button
            type="button"
            @click="removeDocument(index)"
            class="text-red-500 text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- ── AUDIO PREVIEW (setelah rekaman selesai) ── -->
      <div
        v-if="audioPreviewUrl && !isRecording"
        class="flex items-center gap-3 px-4 py-2 border-t border-outline"
      >
        <Mic :size="14" class="text-blue-500 shrink-0" />
        <audio
          :src="audioPreviewUrl"
          controls
          class="h-8 flex-1"
          style="min-width: 0"
        ></audio>
        <button
          type="button"
          @click="removeAudio"
          class="text-red-400 hover:text-red-600 text-xs font-bold ml-2 shrink-0"
          title="Hapus rekaman"
        >
          ✕
        </button>
      </div>

      <!-- ── RECORDING INDICATOR (saat sedang merekam) ── -->
      <div
        v-if="isRecording"
        class="flex items-center gap-3 px-4 py-2 border-t border-outline bg-red-50"
      >
        <span class="recording-dot"></span>
        <span class="text-sm text-red-600 font-medium"
          >Merekam... {{ recTime }}</span
        >
        <button
          type="button"
          @click="stopRecording"
          class="ml-auto text-xs text-red-600 border border-red-300 rounded px-2 py-1 hover:bg-red-100"
        >
          ■ Stop
        </button>
      </div>

      <!-- ── FOOTER ACTIONS ── -->
      <div
        class="flex items-center gap-5 px-4 py-2 border-t border-outline bg-light-base"
      >
        <button
          type="button"
          class="action-btn"
          :disabled="gpsLoading"
          @click="addGPS"
        >
          <MapPin :size="14" />
          {{ gpsAddress ? "Perbarui Lokasi" : "Tambah GPS Location" }}
        </button>

        <button type="button" class="action-btn" @click="triggerPhoto">
          <Camera :size="14" />
          Tambah Foto
          <span v-if="photos.length" class="badge">{{ photos.length }}</span>
        </button>
        <input
          ref="photoInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="onPhotoSelected"
        />

        <button type="button" class="action-btn" @click="triggerDocument">
          <FileText :size="14" />
          Tambah Dokumen
          <span v-if="documents.length" class="badge">{{
            documents.length
          }}</span>
        </button>

        <input
          ref="documentInput"
          type="file"
          multiple
          class="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
          @change="onDocumentSelected"
        />

        <button
          type="button"
          class="action-btn"
          :class="{ 'recording-active': isRecording }"
          @click="toggleRecording"
        >
          <Mic :size="14" />
          {{ isRecording ? "Stop Rekaman" : "Mulai Merekam" }}
        </button>

        <div class="px-4 py-2 border-t border-outline flex items-center gap-2">
          <label class="text-sm text-gray-600">Visibility:</label>

          <select
            v-model="visibility"
            @change="emitData"
            class="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="0">Public</option>
            <option value="1">Internal</option>
            <option value="2">Private</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Contenteditable placeholder ── */
.drag-active {
  background: var(--color-pipeline);
  border: 2px dashed var(--color-outline);
}

.editor-content {
  min-height: 120px;
  line-height: 1.6;
  outline: none;
}
.editor-content:empty::before {
  content: attr(data-placeholder);
  color: var(--color-sub-text);
  pointer-events: none;
}

/* ── Recording dot animation ── */
.recording-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-red);
  flex-shrink: 0;
  animation: blink 1s ease-in-out infinite;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
}

/* ── Toolbar buttons ── */
.btn-toolbar {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 13px;
  color: var(--color-dark-base);
  line-height: 1;
  transition: background 0.15s;
  display: inline-flex;
  align-items: center;
}
.btn-toolbar:hover {
  background: var(--color-cool-grey-bg);
}
.btn-toolbar:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.select-toolbar {
  border: 1px solid var(--color-outline);
  border-radius: 4px;
  padding: 3px 6px;
  font-size: 12px;
  color: var(--color-dark-base);
  background: var(--color-white);
  cursor: pointer;
}

.divider {
  color: var(--color-outline);
  font-size: 12px;
  user-select: none;
}

/* ── Footer action buttons ── */
.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--color-dark-base);
  padding: 4px 0;
  transition: color 0.15s;
  white-space: nowrap;
}
.action-btn:hover {
  color: var(--color-progress-color);
}
.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.action-btn.recording-active {
  color: var(--color-red);
}

/* ── Badge jumlah foto ── */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-progress-color);
  color: var(--color-white);
  font-size: 10px;
  line-height: 1;
}

/* ── Tombol hapus foto (muncul saat hover) ── */
.photo-remove-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--color-red);
  color: var(--color-white);
  border: none;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
  line-height: 1;
}
.group:hover .photo-remove-btn {
  opacity: 1;
}

/* ── GPS loading spin ── */
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
