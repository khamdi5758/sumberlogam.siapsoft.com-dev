<!-- src/components/pages/Produksi/ProduksiBase.vue -->
<template>
  <div class="produksi-container">
    <!-- Loading overlay -->
    <div
      v-if="isLoading"
      class="fixed inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] z-50"
    >
      <div class="rounded-xl bg-white/80 p-4 shadow-lg backdrop-blur-sm">
        <div
          class="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"
        ></div>
      </div>
    </div>

    <!-- Report View using ReportGridBuilder -->
    <!--
      Jangan render report grid saat popup filter terbuka.
      Store "produksi" dipakai bersama oleh seluruh anak menu Produksi,
      sehingga halaman yang baru dibuka bisa menampilkan data milik
      halaman Produksi sebelumnya di belakang popup. Dengan menyembunyikan
      grid selama popup terbuka, background di belakang popup menjadi blank.
    -->
    <ReportGridBuilder
      v-show="!showFilter"
      ref="gridBuilderRef"
      :dataSource="gridDataSource"
      :keyExpr="keyfield"
      :companyName="companyName"
      :companyAddress="companyAddress"
      :companyPhone="companyPhone"
      :reportTitle="title"
      :periodLabel="formatDateRange"
      :userName="userName"
      :storageKey="`report-${storageKey}`"
      :fileName="fileName"
      :mergeColumns="mergeColumns"
      :sumcolom="sumcolom"
      :avgcolom="avgcolom"
      :spFooterText="spFooterText"
    >
      <!-- Forward custom columns slot if provided by parent -->
      <template v-if="$slots.columns" #columns>
        <slot name="columns"></slot>
      </template>

      <!-- Inject Filter button to the toolbar -->
      <template #extra-tools>
        <button
          class="rb-btn rb-btn--filter"
          title="Filter Data"
          @click="openFilter"
        >
          <i class="filter-ico">&#9906;</i> Filter
        </button>
      </template>
    </ReportGridBuilder>

    <!-- Filter Popup -->
    <RegisterFilterPopup
      v-if="showFilter"
      :visible="showFilter"
      :title="title"
      :type="type"
      :initialStartDate="filterData.startDate"
      :initialEndDate="filterData.endDate"
      :initialGudang="filterData.gudang"
      :initialStatus="filterData.status"
      :storeModule="storeModule"
      :fullScreen="isMobile"
      :width="isMobile ? '100%' : '600px'"
      @apply="handleApplyFilter"
      @close="handleClosePopup"
    />
  </div>
</template>

<script>
import ReportGridBuilder from "@/components/pages/Registrasi/ReportGridBuilder.vue";
import RegisterFilterPopup from "@/components/pages/Registrasi/RegisterPopup.vue";

const PRODUKSI_PAGE_CACHE = "__produksiPageCache";

export default {
  name: "ProduksiBase",
  components: {
    ReportGridBuilder,
    RegisterFilterPopup,
  },
  props: {
    title: { type: String, required: true },
    type: { type: String, required: true },
    endpoint: { type: String, required: true },
    storeModule: { type: String, default: "produksi" },
    loadAction: { type: String, default: "getProduksi" },
    userName: { type: String, default: "admin" },
    dataSource: { type: Array, default: () => [] },
    storageKey: { type: String, required: true },
    fileName: { type: String, required: true },
    mergeColumns: { type: Array, default: () => [] }
  },
  data() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const lastDay = new Date(y, today.getMonth() + 1, 0).getDate();

    return {
      showFilter: false,
      filterData: {
        startDate: `${y}-${m}-01`,
        endDate: `${y}-${m}-${String(lastDay).padStart(2, "0")}`,
        gudang: "",
        status: "gabungan",
        // Parameter skema Produksi
        jo: "",
        sisa_order: "",
        tahun: String(y),
        periode_bulan: m,
        periode_tahun: String(y),
        produksi: "1",
        wip: "1",
        laporan_per: "tanggal",
        rekap_detail: "detail",
        record_tertentu: false,
        kode_barang: "",
        report: "detail",
        action: "Go",
      },
      isMobile: false,
      // Snapshot data milik instance ini. Store "produksi" dipakai bersama
      // oleh seluruh anak menu Produksi, sehingga instance yang diaktifkan
      // kembali oleh keep-alive harus memakai datanya sendiri, bukan data
      // milik halaman lain yang terakhir dimuat ke store.
      localData: null,
      localKeyfield: "",
      localPerusahaan: null,
      localSumcolom: [],
      localAvgcolom: [],
      localSqlQuery: "",
      hasLoaded: false,
    };
  },
  created() {
    this._myRoutePath = this.$route.path;
    window[PRODUKSI_PAGE_CACHE] = window[PRODUKSI_PAGE_CACHE] || {};

    const cachedPage = window[PRODUKSI_PAGE_CACHE][this.storageKey];
    if (cachedPage) {
      this.restorePageSnapshot(cachedPage);
      window.__produksiVisited = window.__produksiVisited || {};
      window.__produksiVisited[this.storageKey] = true;
      return;
    }

    // Popup initialization HANYA untuk pembukaan PERTAMA menu ini.
    // Sentinel per-menu (storageKey unik per anak menu: "produksi-hasil",
    // "produksi-mutasi", dst.). Begitu pernah dibuka, selanjutnya tidak
    // pernah tampil lagi — bahkan jika instance dibuat ulang karena
    // keep-alive miss. Sentinel dibersihkan hanya saat tab-nya DITUTUP.
    window.__produksiVisited = window.__produksiVisited || {};
    if (!window.__produksiVisited[this.storageKey]) {
      // Instance BARU untuk tab BARU. Bersihkan store shared agar data
      // halaman lain tidak terbawa, lalu buka popup filter dengan
      // background blank.
      window.__produksiVisited[this.storageKey] = true;
      this.$store.commit(`${this.storeModule}/clearProduksi`);
      this.showFilter = true;
    } else if (!this.hasLoaded) {
      this.loadData();
    }
  },
  activated() {
    // Instance LAMA diaktifkan kembali dari cache keep-alive (mis. klik
    // tab Hasil Produksi yang sudah pernah load). JANGAN reset state:
    // biarkan snapshot lokal + hasLoaded tetap, sehingga tampilan sama
    // seperti terakhir kali (data tetap ada, popup tidak muncul lagi).
  },
  unmounted() {
    // Bersihkan sentinel HANYA jika tab untuk path ini BENAR-BENAR sudah
    // ditutup (di-silang), bukan sekadar di-deactivate keep-alive. Jika
    // tab masih ada, biarkan sentinel agar popup tidak muncul lagi saat
    // instance dibuat ulang nanti.
    const activeTabs = this.$store.getters["tabs/getTabs"] || [];
    const isTabStillOpen = activeTabs.some(
      (path) => String(path).toLowerCase() === this._myRoutePath.toLowerCase(),
    );
    if (
      !isTabStillOpen &&
      window.__produksiVisited &&
      window.__produksiVisited[this.storageKey]
    ) {
      delete window.__produksiVisited[this.storageKey];
      delete window[PRODUKSI_PAGE_CACHE][this.storageKey];
    }
  },
  mounted() {
    this.checkMobile();
    window.addEventListener("resize", this.checkMobile);
  },
  beforeUnmount() {
    this.savePageSnapshot();
    window.removeEventListener("resize", this.checkMobile);
  },
  computed: {
    spFooterText() {
      if (this.hasLoaded) return this.localSqlQuery;
      return this.$store.getters[`${this.storeModule}/ketsp`] || "";
    },
    formatDateRange() {
      const options = { day: "numeric", month: "short", year: "numeric" };
      const start = this.filterData.startDate
        ? new Date(this.filterData.startDate)
        : new Date();
      const end = this.filterData.endDate
        ? new Date(this.filterData.endDate)
        : new Date();
      return `${start.toLocaleDateString("id-ID", options)} - ${end.toLocaleDateString("id-ID", options)}`;
    },
    gridDataSource() {
      const data =
        this.dataSource && this.dataSource.length > 0
          ? this.dataSource
          : this.produksiList;
      if (!Array.isArray(data)) return [];
      return data.map((item) => {
        if (!item || typeof item !== "object") return item;
        const newItem = { ...item };

        // Helper to get case-insensitive value from item
        const getVal = (possibleKeys) => {
          for (const key of possibleKeys) {
            if (key in item && item[key] !== undefined && item[key] !== null) {
              return item[key];
            }
          }
          return undefined;
        };

        // Standardize common fields
        const noBukti = getVal(["NoBukti", "nobukti", "No_Bukti"]);
        const tanggal = getVal(["Tanggal", "tanggal", "Tgl", "tgl"]);
        const kodeBrg = getVal(["Kodebrg", "KodeBrg", "kodebrg", "Kode_Brg"]);
        const namaBrg = getVal(["NamaBrg", "namabrg", "Nama_Brg"]);
        const satuan = getVal(["Satuan", "satuan"]);
        const qnt = getVal(["Qnt", "qnt", "Qty", "qty", "Jumlah", "jumlah"]);
        const harga = getVal(["Harga", "harga"]);
        const diskon = getVal(["Diskon", "diskon"]);
        const jumlah = getVal(["Jumlah", "jumlah", "Total", "total"]);

        // Remove any non-standard keys to prevent duplicate columns in the grid
        const keysToDelete = [
          "nobukti",
          "tanggal",
          "tgl",
          "kodebrg",
          "namabrg",
          "satuan",
          "qnt",
          "Qty",
          "qty",
          "harga",
          "diskon",
          "jumlah",
          "total",
        ];
        keysToDelete.forEach((k) => {
          if (k in newItem) delete newItem[k];
        });

        // Set standard keys
        if (noBukti !== undefined) newItem.NoBukti = noBukti;
        if (tanggal !== undefined) newItem.Tanggal = tanggal;

        // Standardize product code to both casing variants
        if (kodeBrg !== undefined) {
          newItem.Kodebrg = kodeBrg;
          newItem.KodeBrg = kodeBrg;
        }

        if (namaBrg !== undefined) newItem.NamaBrg = namaBrg;
        if (satuan !== undefined) newItem.Satuan = satuan;

        const numericQnt = Number(qnt);
        const numericHarga = Number(harga !== undefined ? harga : 0);
        const numericDiskon = Number(diskon !== undefined ? diskon : 0);

        if (qnt !== undefined) newItem.Qnt = numericQnt;
        if (harga !== undefined) newItem.Harga = numericHarga;
        if (diskon !== undefined) newItem.Diskon = numericDiskon;

        // Calculate Jumlah (amount) if not provided
        if (jumlah !== undefined) {
          newItem.Jumlah = Number(jumlah);
        } else if (harga !== undefined) {
          const computedJumlah = numericQnt * (numericHarga - numericDiskon);
          newItem.Jumlah = computedJumlah;
        }

        return newItem;
      });
    },
    produksiList() {
      // Jika instance ini sudah pernah memuat data, gunakan snapshot lokalnya
      // (state terakhir milik halaman ini). Jika belum, fallback ke store.
      if (this.hasLoaded) return this.localData || [];
      return this.$store.getters[`${this.storeModule}/produksiList`] || [];
    },
    keyfield() {
      if (this.hasLoaded) return this.localKeyfield || "Id";
      return this.$store.getters[`${this.storeModule}/keyfield`] || "Id";
    },
    isLoading() {
      return this.$store.getters[`${this.storeModule}/isLoading`] || false;
    },
    perusahaan() {
      if (this.hasLoaded) return this.localPerusahaan;
      return this.$store.getters[`${this.storeModule}/perusahaan`] || null;
    },
    companyName() {
      return this.perusahaan?.namaperusahaan || "PT SIAP INTEGRASI";
    },
    companyAddress() {
      if (!this.perusahaan) return "";
      const a1 = this.perusahaan.alamat1 || "";
      const a2 = this.perusahaan.alamat2 || "";
      return [a1, a2].filter(Boolean).join(" ");
    },
    companyPhone() {
      return this.perusahaan?.telpon || "";
    },
    sumcolom() {
      if (this.hasLoaded) return this.localSumcolom;
      return this.$store.getters[`${this.storeModule}/sumcolom`] || [];
    },
    avgcolom() {
      if (this.hasLoaded) return this.localAvgcolom;
      return this.$store.getters[`${this.storeModule}/avgcolom`] || [];
    },
  },
  methods: {
    savePageSnapshot() {
      if (!this.hasLoaded) return;

      window[PRODUKSI_PAGE_CACHE] = window[PRODUKSI_PAGE_CACHE] || {};
      window[PRODUKSI_PAGE_CACHE][this.storageKey] = {
        localData: this.localData,
        localKeyfield: this.localKeyfield,
        localPerusahaan: this.localPerusahaan,
        localSumcolom: this.localSumcolom,
        localAvgcolom: this.localAvgcolom,
        localSqlQuery: this.localSqlQuery,
        filterData: { ...this.filterData },
      };
    },
    restorePageSnapshot(snapshot) {
      this.localData = snapshot.localData || [];
      this.localKeyfield = snapshot.localKeyfield || "Id";
      this.localPerusahaan = snapshot.localPerusahaan || null;
      this.localSumcolom = snapshot.localSumcolom || [];
      this.localAvgcolom = snapshot.localAvgcolom || [];
      this.localSqlQuery = snapshot.localSqlQuery || "";
      this.filterData = { ...this.filterData, ...(snapshot.filterData || {}) };
      this.hasLoaded = true;
    },
    formatDateForSp(date, isEnd = false) {
      if (!date) return null;
      const d = new Date(date);
      const time = isEnd ? "23:59:59" : "00:00:00";
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${time}`;
    },
    defaultBuildPayload(data) {
      const payload = { action: "Go" };

      // 3. Register Produk: tahun + sisa_order (tanpa rentang tanggal)
      if (this.type === "register") {
        payload.tahun = data.tahun || "";
        payload.sisa_order = data.sisa_order || "";
        return payload;
      }

      // 5/6/7/8/14. Skema periode: mutsetjadi / mutsetjadirp / mutstock / kartustock / mutstockrp
      if (
        [
          "mutsetjadi",
          "mutsetjadirp",
          "mutstock",
          "kartustock",
          "mutstockrp",
        ].includes(this.type)
      ) {
        const bulan = data.periode_bulan || "";
        const tahun = data.periode_tahun || "";
        payload.periode = `${bulan} ${tahun}`;
        payload.periode_bulan = bulan;
        payload.periode_tahun = tahun;
        payload.produksi = data.produksi || "1";
        if (["mutsetjadi", "mutsetjadirp", "kartustock"].includes(this.type)) {
          payload.jo = data.jo || "";
        }
        if (["mutsetjadi", "mutsetjadirp"].includes(this.type)) {
          payload.wip = data.wip || "1";
        }
        if (this.type === "kartustock") {
          payload.kode_barang = data.kode_barang || "";
          payload.report = data.report || "detail";
        }
        return payload;
      }

      // Skema rentang tanggal (dari_tanggal / sd_tanggal)
      payload.dari_tanggal = this.formatDateForSp(data.startDate, false);
      payload.sd_tanggal = this.formatDateForSp(data.endDate, true);
      // Kompatibilitas SP lama
      payload.mulaitgl = payload.dari_tanggal;
      payload.sampaitgl = payload.sd_tanggal;

      // 1. Hasil Produksi
      if (this.type === "hasil") {
        payload.jo = data.jo || "";
      }

      // 2. Mutasi Produk
      if (this.type === "mutasi") {
        payload.sisa_order = data.sisa_order || "";
      }

      // 4/8/9/10. Koreksi Produksi / Barang Jadi / Pemakaian Bahan / Transfer JO
      if (
        ["koreksi", "tfbarangjadi", "pemakaianbahan", "tfjo"].includes(
          this.type,
        )
      ) {
        payload.laporan_per = data.laporan_per || "tanggal";
        payload.rekap_detail = data.rekap_detail || "detail";
        payload.status = data.status || "semua";
        if (this.type !== "tfbarangjadi") {
          payload.record_tertentu =
            data.record_tertentu === true || data.record_tertentu === "1";
        }
      }

      // 11/12. TransOut BHN & WIP / Transf In WIP
      if (["tfoutwip", "tfinwip"].includes(this.type)) {
        payload.laporan_per = data.laporan_per || "tanggal";
        payload.record_tertentu =
          data.record_tertentu === true || data.record_tertentu === "1";
      }

      return payload;
    },
    loadData() {
      const payload = this.defaultBuildPayload(this.filterData);
      const actionName = `${this.storeModule}/${this.loadAction}`;

      if (!this.$store._actions[actionName]) {
        console.warn(`Action ${actionName} not found, skipping loadData`);
        return Promise.resolve();
      }

      return this.$store
        .dispatch(actionName, {
          endpoint: this.endpoint,
          payload: payload,
        })
        .then((res) => {
          this.localData =
            this.$store.getters[`${this.storeModule}/produksiList`] || [];
          this.localKeyfield =
            this.$store.getters[`${this.storeModule}/keyfield`] || "Id";
          this.localPerusahaan =
            this.$store.getters[`${this.storeModule}/perusahaan`] || null;
          this.localSumcolom =
            this.$store.getters[`${this.storeModule}/sumcolom`] || []; // ← tambahkan
          this.localAvgcolom =
            this.$store.getters[`${this.storeModule}/avgcolom`] || []; // ← tambahkan
          this.localSqlQuery =
            this.$store.getters[`${this.storeModule}/ketsp`] || "";
          this.hasLoaded = true;
          return res;
        })
        .catch((err) => {
          console.error("Error loading data:", err);
        });
    },
    handleApplyFilter(formData) {
      this.showFilter = false;
      this.filterData = formData || {};
      this.loadData();
    },
    handleClosePopup() {
      this.showFilter = false;
    },
    openFilter() {
      this.showFilter = true;
    },
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
    },
  },
  watch:{
    spFooterText(e){
      console.log(e);
    }
  }
};
</script>

<style scoped>
.produksi-container {
  min-height: 100vh;
  background-color: #f1f5f9;
  padding: 20px;
}

/* Custom button styles to match ReportGridBuilder theme */
.rb-btn--filter {
  background-color: var(--layout-sidebar-accent) !important;
  color: var(--layout-sidebar-bg) !important;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 4px;
  padding: 0 12px;
  height: 20px;
  border: 1px solid var(--layout-sidebar-accent);
  transition: all 0.2s ease;
}

.rb-btn--filter:hover {
  background-color: #ffffff !important;
  border-color: #ffffff;
  color: var(--layout-sidebar-bg) !important;
  transform: translateY(-1px);
}

.rb-btn--filter:focus-visible {
  outline: 2px solid var(--layout-sidebar-accent);
  outline-offset: 2px;
}

.rb-btn--filter:active {
  transform: scale(0.97);
}
</style>
