<template>
  <div>
    <!-- Popup utama -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <section
        class="w-full max-w-[380px] rounded-xl bg-white p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-po-title"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between border-b border-slate-200 pb-3"
        >
          <h1
            id="register-po-title"
            class="text-[18px] font-semibold text-slate-900"
          >
            Register PO
          </h1>
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup"
            @click="handleCancel"
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
              <label for="start-date" class="text-[14px] text-slate-700">
                Mulai Tanggal
              </label>
              <div
                class="flex items-center overflow-hidden rounded border border-slate-300"
              >
                <input
                  id="start-date"
                  v-model="form.startDate"
                  type="date"
                  class="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-[14px] text-slate-900 outline-none"
                />
                <button
                  type="button"
                  class="flex items-center justify-center border-l border-slate-300 bg-white px-3 py-1.5 text-slate-600"
                  aria-label="Pilih tanggal mulai"
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
              <label for="end-date" class="text-[14px] text-slate-700">
                Sampai Tanggal
              </label>
              <div
                class="flex items-center overflow-hidden rounded border border-slate-300"
              >
                <input
                  id="end-date"
                  v-model="form.endDate"
                  type="date"
                  class="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-[14px] text-slate-900 outline-none"
                />
                <button
                  type="button"
                  class="flex items-center justify-center border-l border-slate-300 bg-white px-3 py-1.5 text-slate-600"
                  aria-label="Pilih tanggal selesai"
                  @click="focusDateInput('end')"
                >
                  <CalendarDays :size="14" />
                </button>
              </div>
            </div>

            <!-- Gudang -->
            <div
              class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
            >
              <label for="warehouse" class="text-[14px] text-slate-700">
                Gudang
              </label>
              <div
                class="flex items-center overflow-hidden rounded border border-slate-300"
              >
                <input
                  id="warehouse"
                  :value="warehouseLabel"
                  type="text"
                  readonly
                  placeholder="Pilih gudang"
                  class="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  class="flex items-center justify-center border-l border-slate-300 bg-white px-3 py-1.5 text-[17px] leading-none text-slate-600"
                  aria-label="Pilih gudang"
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
            @click="handleCancel"
          >
            Batal
          </button>
          <button
            type="button"
            class="min-w-[80px] rounded-lg bg-[#0f3d7a] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0b2f5f] active:translate-y-px"
            @click="handleSubmit"
          >
            Go
          </button>
        </div>
      </section>
    </div>

    <!-- Dialog Pilih Gudang -->
    <div
      v-if="showWarehouseDialog"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      @click.self="closeWarehouseDialog"
    >
      <div
        class="w-full max-w-md rounded-lg bg-white p-4 shadow-xl"
        @click.stop
      >
        <div class="flex items-center justify-between border-b pb-2">
          <h2 class="text-lg font-semibold">Pilih Gudang</h2>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-700"
            @click="closeWarehouseDialog"
          >
            <X :size="20" />
          </button>
        </div>
        <div class="mt-3">
          <input
            v-model="warehouseSearch"
            type="text"
            placeholder="Cari gudang..."
            class="w-full rounded border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
            @keydown.enter.prevent="selectFirstWarehouse"
          />
        </div>
        <div class="mt-3 max-h-60 overflow-y-auto">
          <ul
            v-if="filteredWarehouses.length"
            class="divide-y divide-slate-100"
          >
            <li
              v-for="wh in filteredWarehouses"
              :key="wh.value"
              class="cursor-pointer px-2 py-2 text-sm hover:bg-slate-50"
              @click="selectWarehouse(wh)"
            >
              {{ wh.label }}
            </li>
          </ul>
          <p v-else class="py-4 text-center text-sm text-slate-500">
            Tidak ada data
          </p>
        </div>
        <div class="mt-4 flex justify-end gap-2 border-t pt-3">
          <button
            type="button"
            class="rounded bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            @click="closeWarehouseDialog"
          >
            Batal
          </button>
          <button
            type="button"
            class="rounded bg-blue-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-800"
            @click="selectFirstWarehouse"
          >
            Pilih
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { CalendarDays, Printer, X } from "lucide-vue-next";

export default {
  name: "RegisPo",
  components: {
    CalendarDays,
    Printer,
    X,
  },
  data() {
    return {
      isOpen: true,
      showWarehouseDialog: false,
      warehouseSearch: "",
      form: {
        startDate: "2026-04-01",
        endDate: "2026-04-30",
        warehouse: "", // akan berisi value (misal "utama")
      },
      warehouses: [
        { label: "Gudang Utama", value: "utama" },
        { label: "Gudang Produksi", value: "produksi" },
        { label: "Gudang Distribusi", value: "distribusi" },
      ],
    };
  },
  computed: {
    warehouseLabel() {
      const found = this.warehouses.find(
        (w) => w.value === this.form.warehouse,
      );
      return found ? found.label : "";
    },
    filteredWarehouses() {
      const q = this.warehouseSearch.toLowerCase().trim();
      if (!q) return this.warehouses;
      return this.warehouses.filter((w) => w.label.toLowerCase().includes(q));
    },
  },
  mounted() {
    this.isOpen = this.$route?.query?.openPopup !== "0";
  },
  methods: {
    focusDateInput(which) {
      const input = document.getElementById(
        which === "start" ? "start-date" : "end-date",
      );
      if (input?.showPicker) {
        input.showPicker();
        return;
      }
      input?.focus();
    },

    openWarehousePicker() {
      this.warehouseSearch = "";
      this.showWarehouseDialog = true;
    },

    closeWarehouseDialog() {
      this.showWarehouseDialog = false;
    },

    selectWarehouse(wh) {
      this.form.warehouse = wh.value;
      this.closeWarehouseDialog();
    },

    selectFirstWarehouse() {
      if (this.filteredWarehouses.length) {
        this.selectWarehouse(this.filteredWarehouses[0]);
      }
    },

    handleCancel() {
      this.$router.back();
    },

    handleSubmit() {
      // Di sini Anda bisa mengirim data filter ke parent atau store
      // Misal emit event atau redirect dengan query
      this.isOpen = false;
    },
  },
};
</script>
