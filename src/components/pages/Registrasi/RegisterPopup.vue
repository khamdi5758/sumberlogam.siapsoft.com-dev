<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    @click.self="$emit('close')"
  >
    <section
      class="w-full max-w-[380px] rounded-xl bg-white p-5 shadow-2xl"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`register-${type}-title`"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between border-b border-slate-200 pb-3"
      >
        <h1
          :id="`register-${type}-title`"
          class="text-[18px] font-semibold text-slate-900"
        >
          {{ title }}
        </h1>
        <button
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Tutup"
          @click="$emit('close')"
        >
          <X :size="16" />
        </button>
      </div>

      <!-- Form -->
      <div class="pt-4">
        <div class="space-y-4">
          <!-- Mulai Tanggal -->
          <div
            class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
          >
            <label for="start-date" class="text-[14px] text-slate-700"
              >Mulai Tanggal</label
            >
            <div
              class="flex items-center overflow-hidden rounded border border-slate-300"
            >
              <input
                id="start-date"
                :value="localStartDate"
                @input="localStartDate = $event.target.value"
                type="date"
                class="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-[14px] text-slate-900 outline-none"
              />
              <button
                type="button"
                class="flex items-center justify-center border-l border-slate-300 bg-white px-3 py-1.5 text-slate-600"
                @click="focusDateInput('start')"
              >
                <CalendarDays :size="14" />
              </button>
            </div>
          </div>

          <!-- Sampai Tanggal -->
          <div
            class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
          >
            <label for="end-date" class="text-[14px] text-slate-700"
              >Sampai Tanggal</label
            >
            <div
              class="flex items-center overflow-hidden rounded border border-slate-300"
            >
              <input
                id="end-date"
                :value="localEndDate"
                @input="localEndDate = $event.target.value"
                type="date"
                class="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-[14px] text-slate-900 outline-none"
              />
              <button
                type="button"
                class="flex items-center justify-center border-l border-slate-300 bg-white px-3 py-1.5 text-slate-600"
                @click="focusDateInput('end')"
              >
                <CalendarDays :size="14" />
              </button>
            </div>
          </div>

          <!-- Gudang -->
          <div
            v-if="type !== 'po' && type !== 'so'"
            class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
          >
            <label for="warehouse" class="text-[14px] text-slate-700"
              >Gudang</label
            >
            <div class="flex items-center rounded border border-slate-300">
              <input
                id="warehouse"
                v-model="gudangLabel"
                type="text"
                placeholder="Pilih gudang (ketik untuk mencari)"
                class="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
                @keyup.enter="openWarehousePicker"
              />
              <button
                type="button"
                class="flex items-center justify-center border-l border-slate-300 bg-white px-3 py-1.5 text-[17px] leading-none text-slate-600 hover:bg-slate-50"
                @click="openWarehousePicker"
              >
                …
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tombol -->
      <div class="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          class="min-w-[80px] rounded-lg bg-[#e12b2b] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#c61f1f] active:translate-y-px"
          @click="$emit('close')"
        >
          Batal
        </button>
        <button
          ref="goButton"
          type="button"
          class="min-w-[80px] rounded-lg bg-[#0f3d7a] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0b2f5f] active:translate-y-px"
          @click="applyFilter"
        >
          Go
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import { CalendarDays, X } from "lucide-vue-next";
import api from "@/api";
import FormBrowseDialog from "@/components/widgets/FormBrowseDialog.vue";

export default {
  name: "RegisterFilterPopup",
  components: { CalendarDays, X },
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: "Filter" },
    type: { type: String, default: "default" },
    initialStartDate: { type: String, default: "" },
    initialEndDate: { type: String, default: "" },
    initialGudang: { type: String, default: "" },
    storeModule: { type: String, default: "registerbeli" },
  },
  data() {
    return {
      localStartDate: this.initialStartDate,
      localEndDate: this.initialEndDate,
      localGudang: this.initialGudang,
      gudangList: [],
      gudangLabel: "",
      isDialogOpen: false,
    };
  },
  computed: {
    getGudangList() {
      return this.$store.getters[`${this.storeModule}/gudangList`] || [];
    },
  },
  watch: {
    getGudangList: {
      handler(list) {
        this.gudangList = list || [];
        this.updateGudangLabel();
      },
      immediate: true,
    },
    localGudang() {
      this.updateGudangLabel();
    },
    visible(val) {
      if (val) {
        // reset ke nilai awal saat popup dibuka
        this.localStartDate = this.initialStartDate;
        this.localEndDate = this.initialEndDate;
        this.localGudang = this.initialGudang;
        this.updateGudangLabel();
      }
    },
  },
  methods: {
    updateGudangLabel() {
      const found = this.gudangList.find(
        (item) => item.id === this.localGudang,
      );
      if (found) {
        this.gudangLabel = found.nama || found.ket || found.NamaGudang || found.label;
      }
    },
    focusDateInput(which) {
      const id = which === "start" ? "start-date" : "end-date";
      const input = document.getElementById(id);
      if (input?.showPicker) input.showPicker();
      else input?.focus();
    },
    async openWarehousePicker() {
      try {
        const cari = this.gudangLabel || "";
        // Request ke backend menggunakan parameter dari Controller Formbrowse
        const response = await api.getbydata("formbrowse", {
          kode: 8, // 8 = Gudang sesuai sp_webfrbrowse
          cari: cari,
          startDate: this.localStartDate,
          endDate: this.localEndDate
        });
        
        const data = response.data?.datafrbrowse || [];
        
        const selected = await FormBrowseDialog.show({
          title: "Pilih Gudang",
          dataSource: data,
          keyField: "id", // Bisa disesuaikan dengan key dari backend (misal "kodegdg")
          disablecol: response.data?.disablecol || ["id", "ket"]
        });
        
        if (selected) {
          // Simpan ke gudangList agar terdeteksi oleh method updateGudangLabel()
          if (!this.gudangList.find((g) => g.id === selected.id)) {
            this.gudangList.push(selected);
          }
          this.localGudang = selected.id || selected.kodegdg || selected.KodeGdg || selected.kode;
          this.gudangLabel = selected.NamaGudang || selected.nama || selected.ket || selected.label;
        }
      } catch (err) {
        if (err !== "cancelled") {
          console.error("Error form browse:", err);
        }
      }
    },
    applyFilter() {
      this.$emit("apply", {
        startDate: this.localStartDate,
        endDate: this.localEndDate,
        gudang: this.localGudang,
      });
      // Popup akan ditutup oleh parent via @apply
    },
  },
};
</script>
