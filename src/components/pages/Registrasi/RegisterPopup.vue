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
          <!-- ===== SKEMA PRODUKSI (key sesuai parameter DB) ===== -->

          <!-- 3. Register Produk: tahun + sisa_order -->
          <template v-if="type === 'register'">
            <!-- Tahun -->
            <div
              class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
            >
              <label for="tahun" class="text-[14px] text-slate-700">Tahun</label>
              <input
                id="tahun"
                v-model="localTahun"
                type="number"
                min="1900"
                max="2100"
                class="min-w-0 flex-1 rounded border border-slate-300 bg-transparent px-3 py-1.5 text-[14px] text-slate-900 outline-none"
              />
            </div>
            <!-- Sisa Order -->
            <div
              class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
            >
              <label for="sisa-order" class="text-[14px] text-slate-700"
                >Sisa Order</label
              >
              <select
                id="sisa-order"
                v-model="localSisaOrder"
                class="min-w-0 flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-[14px] text-slate-900 outline-none"
              >
                <option value="">Semua</option>
                <option value="1">Hanya Sisa Order</option>
                <option value="0">Tanpa Sisa Order</option>
              </select>
            </div>
          </template>

          <!-- Skema periode berdampingan: mutsetjadi / mutsetjadirp / mutstock / kartustock / mutstockrp -->
          <template v-else-if="['mutsetjadi', 'mutsetjadirp', 'mutstock', 'kartustock', 'mutstockrp'].includes(type)">
            <!-- Periode: [bulan] [tahun] -->
            <div
              class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
            >
              <label for="periode-bulan" class="text-[14px] text-slate-700"
                >Periode</label
              >
              <div class="flex items-center gap-2">
                <select
                  id="periode-bulan"
                  v-model="localPeriodeBulan"
                  class="min-w-0 flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-[14px] text-slate-900 outline-none"
                >
                  <option v-for="b in 12" :key="b" :value="String(b).padStart(2, '0')">
                    {{ String(b).padStart(2, "0") }}
                  </option>
                </select>
                <input
                  id="periode-tahun"
                  v-model="localPeriodeTahun"
                  type="number"
                  min="1900"
                  max="2100"
                  class="min-w-0 w-24 rounded border border-slate-300 bg-transparent px-3 py-1.5 text-[14px] text-slate-900 outline-none"
                />
              </div>
            </div>
            <!-- Kartu Stock Produksi: Produksi tepat di bawah Periode -->
            <template v-if="type === 'kartustock'">
              <!-- Produksi -->
              <div
                class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
              >
                <label for="produksi-check" class="text-[14px] text-slate-700"
                  >Produksi</label
                >
                <select
                  id="produksi-check"
                  v-model="localProduksi"
                  class="min-w-0 flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-[14px] text-slate-900 outline-none"
                >
                  <option value="1">Ya</option>
                  <option value="0">Tidak</option>
                </select>
              </div>
              <!-- Kode Barang -->
              <div
                class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
              >
                <label for="kode-barang" class="text-[14px] text-slate-700"
                  >Kode Barang</label
                >
                <input
                  id="kode-barang"
                  v-model="localKodeBarang"
                  type="text"
                  placeholder="Kode barang (kosong = semua)"
                  class="min-w-0 flex-1 rounded border border-slate-300 bg-transparent px-3 py-1.5 text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              <!-- JO -->
              <div
                class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
              >
                <label for="jo" class="text-[14px] text-slate-700">JO</label>
                <input
                  id="jo"
                  v-model="localJo"
                  type="text"
                  placeholder="No. JO (kosong = semua)"
                  class="min-w-0 flex-1 rounded border border-slate-300 bg-transparent px-3 py-1.5 text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              <!-- Report -->
              <div
                class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
              >
                <label for="report" class="text-[14px] text-slate-700">Report</label>
                <select
                  id="report"
                  v-model="localReport"
                  class="min-w-0 flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-[14px] text-slate-900 outline-none"
                >
                  <option value="detail">Detail</option>
                  <option value="rekap">Rekap</option>
                </select>
              </div>
            </template>

            <!-- Skema periode lainnya: mutsetjadi / mutsetjadirp / mutstock / mutstockrp -->
            <template v-else>
              <!-- JO (Khusus Mutasi Barang Setengah Jadi & QntRp) -->
              <div
                v-if="['mutsetjadi', 'mutsetjadirp'].includes(type)"
                class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
              >
                <label for="jo" class="text-[14px] text-slate-700">JO</label>
                <input
                  id="jo"
                  v-model="localJo"
                  type="text"
                  placeholder="No. JO (kosong = semua)"
                  class="min-w-0 flex-1 rounded border border-slate-300 bg-transparent px-3 py-1.5 text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              <!-- Produksi -->
              <div
                class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
              >
                <label for="produksi-check" class="text-[14px] text-slate-700"
                  >Produksi</label
                >
                <select
                  id="produksi-check"
                  v-model="localProduksi"
                  class="min-w-0 flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-[14px] text-slate-900 outline-none"
                >
                  <option value="1">Ya</option>
                  <option value="0">Tidak</option>
                </select>
              </div>
              <!-- WIP (Khusus Mutasi Barang Setengah Jadi & QntRp) -->
              <div
                v-if="['mutsetjadi', 'mutsetjadirp'].includes(type)"
                class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
              >
                <label for="wip-check" class="text-[14px] text-slate-700">WIP</label>
                <select
                  id="wip-check"
                  v-model="localWip"
                  class="min-w-0 flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-[14px] text-slate-900 outline-none"
                >
                  <option value="1">Ya</option>
                  <option value="0">Tidak</option>
                </select>
              </div>
            </template>
          </template>

          <!-- Skema dengan rentang tanggal: hasil / mutasi / koreksi / default -->
          <template v-else>
          <!-- Dari Tanggal -->
          <div
            v-if="
              type !== 'stock-serial-rekap' && !type.startsWith('outstanding-')
            "
            class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
          >
            <label for="start-date" class="text-[14px] text-slate-700"
              >Mulai Tanggal</label
            >
            <DxDateBox
              v-model:value="localStartDate"
              type="date"
              display-format="dd-MM-yyyy"
              :use-mask-behavior="true"
              styling-mode="outlined"
            />
            <!-- <div
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
            </div> -->
          </div>

          <!-- Sampai Tanggal -->
          <div
            class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
          >
            <label for="end-date" class="text-[14px] text-slate-700"
              >Sampai Tanggal</label
            >
            <DxDateBox
              v-model:value="localEndDate"
              type="date"
              display-format="dd-MM-yyyy"
              :use-mask-behavior="true"
              styling-mode="outlined"
            />
            <!-- <div
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
            </div> -->
          </div>

          <!-- JO (Khusus Hasil Produksi) -->
          <div
            v-if="type === 'hasil'"
            class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
          >
            <label for="jo-hasil" class="text-[14px] text-slate-700">JO</label>
            <input
              id="jo-hasil"
              v-model="localJo"
              type="text"
              placeholder="No. JO (kosong = semua)"
              class="min-w-0 flex-1 rounded border border-slate-300 bg-transparent px-3 py-1.5 text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <!-- Sisa Order (Khusus Mutasi Produksi) -->
          <div
            v-if="type === 'mutasi'"
            class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
          >
            <label for="sisa-order-mutasi" class="text-[14px] text-slate-700"
              >Sisa Order</label
            >
            <select
              id="sisa-order-mutasi"
              v-model="localSisaOrder"
              class="min-w-0 flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-[14px] text-slate-900 outline-none"
            >
              <option value="">Semua</option>
              <option value="1">Hanya Sisa Order</option>
              <option value="0">Tanpa Sisa Order</option>
            </select>
          </div>

          <!-- Parameter skema: koreksi / tfbarangjadi (Barang Jadi) / pemakaianbahan / tfjo (Transfer JO) / tfoutwip / tfinwip -->
          <template v-if="['koreksi', 'tfbarangjadi', 'pemakaianbahan', 'tfjo', 'tfoutwip', 'tfinwip'].includes(type)">
            <!-- Laporan Per -->
            <div
              class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
            >
              <label for="laporan-per" class="text-[14px] text-slate-700"
                >Laporan Per</label
              >
              <select
                id="laporan-per"
                v-model="localLaporanPer"
                class="min-w-0 flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-[14px] text-slate-900 outline-none"
              >
                <option value="tanggal">Tanggal</option>
                <option value="jo">JO</option>
                <option value="barang">Barang</option>
              </select>
            </div>
            <!-- Rekap / Detail (bukan TransOut BHN & WIP / Transf In WIP) -->
            <div
              v-if="!['tfoutwip', 'tfinwip'].includes(type)"
              class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
            >
              <label for="rekap-detail" class="text-[14px] text-slate-700"
                >Rekap/Detail</label
              >
              <select
                id="rekap-detail"
                v-model="localRekapDetail"
                class="min-w-0 flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-[14px] text-slate-900 outline-none"
              >
                <option value="rekap">Rekap</option>
                <option value="detail">Detail</option>
              </select>
            </div>
            <!-- Status (koreksi / Barang Jadi / Pemakaian Bahan / Transfer JO) -->
            <div
              v-if="['koreksi', 'tfbarangjadi', 'pemakaianbahan', 'tfjo'].includes(type)"
              class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
            >
              <label for="status-koreksi" class="text-[14px] text-slate-700"
                >Status</label
              >
              <select
                id="status-koreksi"
                v-model="localStatus"
                class="min-w-0 flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-[14px] text-slate-900 outline-none"
              >
                <option value="semua">Semua</option>
                <option value="tervalidasi">Tervalidasi</option>
                <option value="belum_validasi">Belum Validasi</option>
              </select>
            </div>
            <!-- Record Tertentu checkbox (kecuali Barang Jadi) -->
            <div
              v-if="type !== 'tfbarangjadi'"
              class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
            >
              <label for="record-tertentu" class="text-[14px] text-slate-700"
                >Record Tertentu</label
              >
              <div class="flex h-[34px] items-center">
                <input
                  id="record-tertentu"
                  v-model="localRecordTertentu"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-[#0f3d7a] accent-[#0f3d7a]"
                />
              </div>
            </div>
          </template>

          <!-- Status (Khusus Outstanding) -->
          <div
            v-if="type.startsWith('outstanding-')"
            class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
          >
            <label for="status-dropdown" class="text-[14px] text-slate-700"
              >Status</label
            >
            <div
              class="flex items-center overflow-hidden rounded border border-slate-300"
            >
              <select
                id="status-dropdown"
                v-model="localStatus"
                class="min-w-0 flex-1 bg-white px-3 py-1.5 text-[14px] text-slate-900 outline-none"
              >
                <option value="belum_diterima">Belum Diterima</option>
                <option value="sudah_diterima">Sudah Diterima</option>
                <option value="gabungan">Gabungan</option>
              </select>
            </div>
          </div>

          <!-- Gudang (tidak dipakai skema Produksi: hasil/mutasi/koreksi) -->
          <div
            v-if="
              type !== 'po' &&
              type !== 'so' &&
              type !== 'creditenote' &&
              type !== 'stock-serial' &&
              type !== 'hasil' &&
              type !== 'mutasi' &&
              type !== 'koreksi' &&
              type !== 'tfbarangjadi' &&
              type !== 'pemakaianbahan' &&
              type !== 'tfjo' &&
              type !== 'tfoutwip' &&
              type !== 'tfinwip' &&
              !type.startsWith('outstanding-')
            "
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
                @keydown="handleGudangKeydown"
                @input="gudangBackspaceCount = 0"
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
          

          <!-- Status (Khusus barang serial rekap) -->
          <div
            v-if="type === 'stock-serial-rekap'"
            class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
          >
            <label for="status-dropdown" class="text-[14px] text-slate-700"
              >Status</label
            >
            <div
              class="flex items-center overflow-hidden rounded border border-slate-300"
            >
              <select
                id="status-dropdown"
                v-model="localStatus"
                class="min-w-0 flex-1 bg-white px-3 py-1.5 text-[14px] text-slate-900 outline-none"
              >
                <option value="Per_Serial">Per Serial</option>
                <option value="Rekap">Rekap</option>
                <option value="Per_Perkiraan">Per Perkiraan</option>
              </select>
            </div>
          </div>
          </template>
          <!-- ===== END SKEMA PRODUKSI ===== -->
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
import { DxDateBox } from "devextreme-vue/date-box";

export default {
  name: "RegisterFilterPopup",
  components: { CalendarDays, X, DxDateBox },
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: "Filter" },
    type: { type: String, default: "default" },
    initialStartDate: { type: String, default: "" },
    initialEndDate: { type: String, default: "" },
    initialGudang: { type: String, default: "" },
    initialStatus: { type: String, default: "gabungan" },
    storeModule: { type: String, default: "registerbeli" },
  },
  data() {
    const now = new Date();
    return {
      localStartDate: this.initialStartDate,
      localEndDate: this.initialEndDate,
      localGudang: this.initialGudang,
      localStatus: this.initialStatus,
      // Parameter skema Produksi
      localJo: "",
      localSisaOrder: "",
      localTahun: String(now.getFullYear()),
      localPeriodeBulan: String(now.getMonth() + 1).padStart(2, "0"),
      localPeriodeTahun: String(now.getFullYear()),
      localProduksi: "1",
      localWip: "1",
      localLaporanPer: "tanggal",
      localRekapDetail: "detail",
      localRecordTertentu: false,
      localKodeBarang: "",
      localReport: "detail",
      gudangList: [],
      gudangLabel: "",
      isDialogOpen: false,
      gudangBackspaceCount: 0,
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
        this.localStatus = this.initialStatus;
        this.updateGudangLabel();
      }
    },
    type: {
      handler(newType) {
        // Default status untuk skema koreksi-like memakai status sendiri
        if (["koreksi", "tfbarangjadi", "pemakaianbahan", "tfjo"].includes(newType)) {
          this.localStatus = "semua";
        }
      },
      immediate: true,
    },
  },
  methods: {
    handleGudangKeydown(e) {
      if (e.key !== "Backspace" && e.key !== "Delete") return;

      // Kalau teks masih ada isinya, biarkan hapus normal & reset counter
      if (this.gudangLabel && this.gudangLabel.length > 0) {
        this.gudangBackspaceCount = 0;
        return;
      }

      // Teks sudah kosong -> hitung penekanan backspace/delete berturut-turut
      this.gudangBackspaceCount++;

      if (this.gudangBackspaceCount >= 2) {
        this.localGudang = "";
        this.gudangLabel = "";
        this.gudangBackspaceCount = 0;
      }
    },
    updateGudangLabel() {
      const found = this.gudangList.find(
        (item) => item.id === this.localGudang,
      );
      if (found) {
        this.gudangLabel =
          found.nama || found.ket || found.NamaGudang || found.label;
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
          endDate: this.localEndDate,
        });

        const data = response.data?.datafrbrowse || [];

        const selected = await FormBrowseDialog.show({
          title: "Pilih Gudang",
          dataSource: data,
          keyField: "id", // Bisa disesuaikan dengan key dari backend (misal "kodegdg")
          disablecol: response.data?.disablecol || ["id", "ket"],
        });

        if (selected) {
          // Simpan ke gudangList agar terdeteksi oleh method updateGudangLabel()
          if (!this.gudangList.find((g) => g.id === selected.id)) {
            this.gudangList.push(selected);
          }
          this.localGudang =
            selected.id ||
            selected.kodegdg ||
            selected.KodeGdg ||
            selected.kode;
          this.gudangLabel =
            selected.NamaGudang ||
            selected.nama ||
            selected.ket ||
            selected.label;
        }
      } catch (err) {
        if (err !== "cancelled") {
          console.error("Error form browse:", err);
        }
      }
    },
    applyFilter() {
      // action: "Go" — tombol submit selalu memetakan ke action Go
      const base = {
        startDate: this.localStartDate,
        endDate: this.localEndDate,
        gudang: this.localGudang,
        status: this.localStatus,
        action: "Go",
      };

      // 1. Hasil Produksi: dari_tanggal, sd_tanggal, jo
      if (this.type === "hasil") {
        base.jo = this.localJo || "";
      }

      // 2. Mutasi Produk: dari_tanggal, sd_tanggal, sisa_order
      if (this.type === "mutasi") {
        base.sisa_order = this.localSisaOrder;
      }

      // 3. Register Produk: tahun, sisa_order
      if (this.type === "register") {
        base.tahun = this.localTahun;
        base.sisa_order = this.localSisaOrder;
      }

      // 4/8/9/10. Koreksi / Barang Jadi / Pemakaian Bahan / Transfer JO
      if (["koreksi", "tfbarangjadi", "pemakaianbahan", "tfjo"].includes(this.type)) {
        base.laporan_per = this.localLaporanPer;
        base.rekap_detail = this.localRekapDetail;
        if (this.type !== "tfbarangjadi") {
          base.record_tertentu = this.localRecordTertentu;
        }
      }

      // 11/12. TransOut BHN & WIP / Transf In WIP: laporan_per + record_tertentu
      if (["tfoutwip", "tfinwip"].includes(this.type)) {
        base.laporan_per = this.localLaporanPer;
        base.record_tertentu = this.localRecordTertentu;
      }

      // 5/6/7/8/14. Skema periode: mutsetjadi / mutsetjadirp / mutstock / kartustock / mutstockrp
      if (["mutsetjadi", "mutsetjadirp", "mutstock", "kartustock", "mutstockrp"].includes(this.type)) {
        base.periode = `${this.localPeriodeBulan} ${this.localPeriodeTahun}`;
        base.periode_bulan = this.localPeriodeBulan;
        base.periode_tahun = this.localPeriodeTahun;
        base.produksi = this.localProduksi;
        if (["mutsetjadi", "mutsetjadirp", "kartustock"].includes(this.type)) {
          base.jo = this.localJo || "";
        }
        if (["mutsetjadi", "mutsetjadirp"].includes(this.type)) {
          base.wip = this.localWip;
        }
        if (this.type === "kartustock") {
          base.kode_barang = this.localKodeBarang || "";
          base.report = this.localReport;
        }
      }

      this.$emit("apply", base);
      // Popup akan ditutup oleh parent via @apply
    },
  },
};
</script>
