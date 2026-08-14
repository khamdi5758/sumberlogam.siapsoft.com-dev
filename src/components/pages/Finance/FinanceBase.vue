<template>
  <div class="pl-report-container">
    <!-- Header -->
    <div class="header-section">
      <div>
        <h2 class="report-title">{{ title }}</h2>
        <p class="report-subtitle">
          Periode: {{ formatDateRange }} | Cabang: Pusat
        </p>
      </div>
      <div class="action-buttons">
        <DxButton
          icon="exportpdf"
          text="Export PDF"
          type="default"
          styling-mode="outlined"
          @click="exportToPDF"
        />
        <DxButton
          icon="print"
          text="Print"
          type="default"
          @click="printReport"
        />
        <DxButton
          icon="filter"
          text="Filter"
          type="default"
          @click="openFilter"
        />
      </div>
    </div>

    <!-- Tabel -->
    <div v-if="hasBeenFiltered" class="card-box">
      <!-- Tabel khusus untuk Bank Harian (1 kolom Penerimaan Giro saja) -->
      <div v-if="isBankHarianType" class="bankharian-wrapper">
        <DxDataGrid
          :data-source="bankHarianDataSource"
          :show-borders="true"
          :show-row-lines="true"
          :show-column-lines="true"
          :row-alternation-enabled="false"
          :hover-state-enabled="true"
          :column-auto-width="false"
          :word-wrap-enabled="false"
          no-data-text="Tidak ada data untuk periode ini"
          class="bankharian-grid"
        >
          <DxColumn
            caption="No"
            :width="50"
            alignment="center"
            :allow-sorting="false"
            cell-template="noTemplate"
          />
          <DxColumn
            data-field="tgl"
            caption="Tgl"
            :width="55"
            alignment="center"
          />
          <DxColumn
            data-field="NoBukti"
            caption="No Bukti"
            :width="160"
            alignment="left"
          />
          <DxColumn
            data-field="Keterangan"
            caption="Keterangan"
            :min-width="250"
            alignment="left"
          />
          <DxColumn
            data-field="lawan"
            caption="Perkiraan"
            :width="90"
            alignment="center"
          />
          <DxColumn caption="Penerimaan" alignment="center">
            <DxColumn
              data-field="DebetGiro"
              caption="Giro"
              :width="120"
              alignment="right"
              cell-template="penerimaanGiroTemplate"
            />
            <DxColumn
              data-field="DebetCash"
              caption="Cash"
              :width="120"
              alignment="right"
              cell-template="penerimaanCashTemplate"
            />
          </DxColumn>
          <DxColumn caption="Pengeluaran" alignment="center">
            <DxColumn
              data-field="KreditGiro"
              caption="Giro"
              :width="120"
              alignment="right"
              cell-template="pengeluaranGiroTemplate"
            />
            <DxColumn
              data-field="KreditCash"
              caption="Cash"
              :width="120"
              alignment="right"
              cell-template="pengeluaranCashTemplate"
            />
          </DxColumn>

          <template #noTemplate="{ data }">
            <span>{{ data.rowIndex + 1 }}</span>
          </template>
          <template #penerimaanGiroTemplate="{ data }">
            <span>{{ formatNumber(data.data.DebetGiro) }}</span>
          </template>
          <template #penerimaanCashTemplate="{ data }">
            <span>{{ formatNumber(data.data.DebetCash || 0) }}</span>
          </template>
          <template #pengeluaranGiroTemplate="{ data }">
            <span>{{ formatNumber(data.data.KreditGiro || 0) }}</span>
          </template>
          <template #pengeluaranCashTemplate="{ data }">
            <span>{{ formatNumber(data.data.KreditCash || 0) }}</span>
          </template>

          <DxScrolling mode="standard" :use-native="true" />
          <DxPaging :enabled="false" />
        </DxDataGrid>

        <!-- Summary untuk bank harian -->
        <div v-if="bankHarianDataSource.length > 0" class="bankharian-summary-wrapper">
          <!-- Kolom kiri: Rincian -->
          <table class="bankharian-table bankharian-rincian-table">
            <colgroup>
              <col />
              <col style="width: 150px" />
            </colgroup>
            <tbody>
              <tr>
                <td class="col-label">Uang Tunai</td>
                <td class="col-num">{{ formatNumber(bankHarianUangTunai) }}</td>
              </tr>
              <tr>
                <td class="col-label">CHGB</td>
                <td class="col-num">{{ formatNumber(bankHarianCHGB) }}</td>
              </tr>
              <tr>
                <td class="col-label">Bon Sementara</td>
                <td class="col-num">{{ formatNumber(bankHarianBonSementara) }}</td>
              </tr>
              <tr>
                <td class="col-label">Sisa Keuangan</td>
                <td class="col-num">{{ formatNumber(bankHarianSisaKeuangan) }}</td>
              </tr>
              <tr>
                <td class="col-label">Saldo Kasir</td>
                <td class="col-num">{{ formatNumber(bankHarianSaldoKasir) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Kolom kanan: Summary -->
          <table class="bankharian-table bankharian-summary-table">
            <colgroup>
              <col />
              <col style="width: 120px" />
              <col style="width: 120px" />
              <col style="width: 120px" />
              <col style="width: 120px" />
            </colgroup>
            <tbody>
              <tr class="row-subtotal-line">
                <td class="col-label">SubTotal</td>
                <td class="col-num">{{ formatNumber(bankHarianSubtotal) }}</td>
                <td class="col-num">{{ formatNumber(bankHarianSubtotalCash) }}</td>
                <td class="col-num">{{ formatNumber(bankHarianSubtotalKeluarGiro) }}</td>
                <td class="col-num">{{ formatNumber(bankHarianSubtotalKeluarCash) }}</td>
              </tr>
              <tr>
                <td class="col-label">S. Awal</td>
                <td colspan="2" class="col-num">{{ formatNumber(bankHarianSaldoAwal) }}</td>
                <td colspan="2" class="col-num"></td>
              </tr>
              <tr>
                <td class="col-label">S. Akhir</td>
                <td colspan="2" class="col-num"></td>
                <td colspan="2" class="col-num">{{ formatNumber(bankHarianSaldoAkhir) }}</td>
              </tr>
              <tr class="row-total-line">
                <td class="col-label">Total</td>
                <td colspan="2" class="col-num">{{ formatNumber(bankHarianSaldoAwal) }}</td>
                <td colspan="2" class="col-num">{{ formatNumber(bankHarianSaldoAkhir) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tabel khusus untuk Kas Bank (kasharian) -->
      <div v-else-if="isKasBankType" class="kasbank-table-wrapper">
        <DxDataGrid
          :data-source="kasBankDataSource"
          :show-borders="true"
          :show-row-lines="true"
          :show-column-lines="true"
          :row-alternation-enabled="false"
          :hover-state-enabled="true"
          :column-auto-width="false"
          :word-wrap-enabled="false"
          no-data-text="Tidak ada data untuk periode ini"
          class="kasbank-grid"
        >
          <DxColumn
            caption="No"
            :width="50"
            alignment="center"
            :allow-sorting="false"
            cell-template="noTemplate"
          />
          <DxColumn
            data-field="tgl"
            caption="Tgl"
            :width="55"
            alignment="center"
          />
          <DxColumn
            data-field="NoBukti"
            caption="No Bukti"
            :width="150"
            alignment="left"
          />
          <DxColumn
            data-field="Keterangan"
            caption="Keterangan"
            :min-width="200"
            alignment="left"
          />
          <DxColumn
            data-field="lawan"
            caption="Perkiraan"
            :width="90"
            alignment="center"
          />
          <DxColumn caption="Penerimaan" alignment="center">
            <DxColumn
              data-field="DebetGiro"
              caption="Giro"
              :width="130"
              alignment="right"
              cell-template="numGiroTerimaTemplate"
            />
            <DxColumn
              data-field="DebetCash"
              caption="Cash"
              :width="130"
              alignment="right"
              cell-template="numCashTerimaTemplate"
            />
          </DxColumn>
          <DxColumn caption="Pengeluaran" alignment="center">
            <DxColumn
              data-field="KreditGiro"
              caption="Giro"
              :width="130"
              alignment="right"
              cell-template="numGiroKeluarTemplate"
            />
            <DxColumn
              data-field="KreditCash"
              caption="Cash"
              :width="130"
              alignment="right"
              cell-template="numCashKeluarTemplate"
            />
          </DxColumn>

          <template #noTemplate="{ data }">
            <span>{{ data.rowIndex + 1 }}</span>
          </template>
          <template #numGiroTerimaTemplate="{ data }">
            <span>{{ formatNumber(data.data.DebetGiro) }}</span>
          </template>
          <template #numCashTerimaTemplate="{ data }">
            <span>{{ formatNumber(data.data.DebetCash) }}</span>
          </template>
          <template #numGiroKeluarTemplate="{ data }">
            <span>{{ formatNumber(data.data.KreditGiro) }}</span>
          </template>
          <template #numCashKeluarTemplate="{ data }">
            <span>{{ formatNumber(data.data.KreditCash) }}</span>
          </template>

          <DxScrolling mode="standard" :use-native="true" />
          <DxPaging :enabled="false" />
        </DxDataGrid>

        <!-- Summary: tabel dengan lebar kolom sama persis dengan grid -->
        <table
          v-if="kasBankDataSource.length > 0"
          class="kasbank-table kasbank-summary-table"
        >
          <colgroup>
            <col style="width: 50px" />
            <col style="width: 55px" />
            <col style="width: 150px" />
            <col />
            <col style="width: 90px" />
            <col style="width: 130px" />
            <col style="width: 130px" />
            <col style="width: 130px" />
            <col style="width: 130px" />
          </colgroup>
          <tbody>
            <tr class="row-subtotal-line">
              <td colspan="5" class="col-label">SubTotal</td>
              <td class="col-num">{{ formatNumber(totalPenerimaanGiro) }}</td>
              <td class="col-num">{{ formatNumber(totalPenerimaanCash) }}</td>
              <td class="col-num">{{ formatNumber(totalPengeluaranGiro) }}</td>
              <td class="col-num">{{ formatNumber(totalPengeluaranCash) }}</td>
            </tr>
            <tr>
              <td colspan="5" class="col-label">S. Awal</td>
              <td colspan="2" class="col-num">{{ formatNumber(saldoAwal) }}</td>
              <td colspan="2" class="col-num"></td>
            </tr>
            <tr>
              <td colspan="5" class="col-label">S. Akhir</td>
              <td colspan="2" class="col-num"></td>
              <td colspan="2" class="col-num">{{ formatNumber(saldoAkhir) }}</td>
            </tr>
            <tr class="row-total-line">
              <td colspan="5" class="col-label">Total</td>
              <td colspan="2" class="col-num">{{ formatNumber(totalPenerimaan) }}</td>
              <td colspan="2" class="col-num">{{ formatNumber(totalPengeluaran) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tabel khusus untuk Arus Kas (DxDataGrid) -->
      <div v-else-if="isArusKasType" class="aruskas-wrapper">
        <DxDataGrid
          :data-source="arusKasGridData"
          :show-borders="true"
          :show-row-lines="true"
          :show-column-lines="true"
          :row-alternation-enabled="false"
          :hover-state-enabled="true"
          :column-auto-width="false"
          :word-wrap-enabled="false"
          no-data-text="Tidak ada data untuk periode ini"
          class="aruskas-grid"
          @row-prepared="onArusKasRowPrepared"
          @context-menu-preparing="onArusKasContextMenu"
        >
          <DxColumn
            data-field="keterangan"
            caption="Keterangan"
            :min-width="300"
            alignment="left"
            cell-template="ketTemplate"
          />
          <DxColumn
            data-field="jumlah"
            caption="Jumlah"
            :width="180"
            alignment="right"
            cell-template="jmlTemplate"
          />

          <template #ketTemplate="{ data }">
            <span :class="arusKasRowClass(data.data)">
              {{ data.data.keterangan }}
            </span>
          </template>
          <template #jmlTemplate="{ data }">
            <span :class="arusKasRowClass(data.data)">
              {{ data.data._rowType === 'section' ? '' : formatCurrencyArusKas(data.data.jumlah) }}
            </span>
          </template>

          <DxScrolling mode="standard" :use-native="true" />
          <DxPaging :enabled="false" />
        </DxDataGrid>
      </div>

      <!-- Tabel khusus untuk Rekap Kas Bank -->
      <div v-else-if="isRekapKasBankType" class="rekapkasbank-wrapper">
        <DxDataGrid
          :data-source="rekapKasBankDataSource"
          :show-borders="true"
          :show-row-lines="true"
          :show-column-lines="true"
          :row-alternation-enabled="false"
          :hover-state-enabled="true"
          :column-auto-width="false"
          :word-wrap-enabled="false"
          no-data-text="Tidak ada data untuk periode ini"
          class="rekapkasbank-grid"
        >
          <DxColumn
            caption="No"
            :width="50"
            alignment="center"
            :allow-sorting="false"
            cell-template="noTemplate"
          />
          <DxColumn
            data-field="tgl"
            caption="Tgl"
            :width="55"
            alignment="center"
          />
          <DxColumn
            data-field="NoBukti"
            caption="No Bukti"
            :width="150"
            alignment="left"
          />
          <DxColumn
            data-field="Keterangan"
            caption="Keterangan"
            :min-width="200"
            alignment="left"
          />
          <DxColumn
            data-field="lawan"
            caption="Perkiraan"
            :width="90"
            alignment="center"
          />
          <DxColumn caption="Penerimaan" alignment="center">
            <DxColumn
              data-field="debetGiro"
              caption="Giro"
              :width="120"
              alignment="right"
              cell-template="terimaGiroTemplate"
            />
            <DxColumn
              data-field="debetCash"
              caption="Cash"
              :width="120"
              alignment="right"
              cell-template="terimaCashTemplate"
            />
          </DxColumn>
          <DxColumn caption="Pengeluaran" alignment="center">
            <DxColumn
              data-field="kreditGiro"
              caption="Giro"
              :width="120"
              alignment="right"
              cell-template="keluarGiroTemplate"
            />
            <DxColumn
              data-field="kreditCash"
              caption="Cash"
              :width="120"
              alignment="right"
              cell-template="keluarCashTemplate"
            />
          </DxColumn>

          <template #noTemplate="{ data }">
            <span>{{ data.rowIndex + 1 }}</span>
          </template>
          <template #terimaGiroTemplate="{ data }">
            <span>{{ formatNumber(data.data.debetGiro) }}</span>
          </template>
          <template #terimaCashTemplate="{ data }">
            <span>{{ formatNumber(data.data.debetCash) }}</span>
          </template>
          <template #keluarGiroTemplate="{ data }">
            <span>{{ formatNumber(data.data.kreditGiro) }}</span>
          </template>
          <template #keluarCashTemplate="{ data }">
            <span>{{ formatNumber(data.data.kreditCash) }}</span>
          </template>

          <DxScrolling mode="standard" :use-native="true" />
          <DxPaging :enabled="false" />
        </DxDataGrid>

        <!-- Summary untuk rekap kas bank -->
        <table
          v-if="rekapKasBankDataSource.length > 0"
          class="rekapkasbank-table rekapkasbank-summary-table"
        >
          <colgroup>
            <col style="width: 50px" />
            <col style="width: 55px" />
            <col style="width: 150px" />
            <col />
            <col style="width: 90px" />
            <col style="width: 120px" />
            <col style="width: 120px" />
            <col style="width: 120px" />
            <col style="width: 120px" />
          </colgroup>
          <tbody>
            <tr class="row-subtotal-line">
              <td colspan="5" class="col-label">SubTotal</td>
              <td class="col-num">{{ formatNumber(rekapTotalPenerimaanGiro) }}</td>
              <td class="col-num">{{ formatNumber(rekapTotalPenerimaanCash) }}</td>
              <td class="col-num">{{ formatNumber(rekapTotalPengeluaranGiro) }}</td>
              <td class="col-num">{{ formatNumber(rekapTotalPengeluaranCash) }}</td>
            </tr>
            <tr>
              <td colspan="5" class="col-label">S. Awal</td>
              <td colspan="2" class="col-num">{{ formatNumber(rekapSaldoAwal) }}</td>
              <td colspan="2" class="col-num"></td>
            </tr>
            <tr>
              <td colspan="5" class="col-label">S. Akhir</td>
              <td colspan="2" class="col-num"></td>
              <td colspan="2" class="col-num">{{ formatNumber(rekapSaldoAkhir) }}</td>
            </tr>
            <tr class="row-total-line">
              <td colspan="5" class="col-label">Total</td>
              <td colspan="2" class="col-num">{{ formatNumber(rekapTotalPenerimaan) }}</td>
              <td colspan="2" class="col-num">{{ formatNumber(rekapTotalPengeluaran) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Tabel Rekapitulasi Saldo Awal / Saldo Akhir -->
        <div v-if="rekapKasBankDataSource.length > 0" class="rekapitulasi-saldo-wrapper">
          <h3 class="rekapitulasi-title">REKAPITULASI SALDO AWAL / SALDO AKHIR</h3>
          <p class="rekapitulasi-periode">Periode : {{ formatDateRange }}</p>
          <table class="rekapitulasi-table">
            <thead>
              <tr>
                <th class="col-keterangan">Keterangan</th>
                <th class="col-num">Saldo Awal (IDR)</th>
                <th class="col-num">Saldo Awal (Non IDR)</th>
                <th class="col-num">Saldo Akhir (IDR)</th>
                <th class="col-num">Saldo Akhir (Non IDR)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in rekapitulasiSaldoList" :key="'rekap-' + idx">
                <td class="col-keterangan">{{ item.keterangan }}</td>
                <td class="col-num">{{ formatNumber(item.saldoAwalIDR) }}</td>
                <td class="col-num">{{ formatNumber(item.saldoAwalNonIDR) }}</td>
                <td class="col-num">{{ formatNumber(item.saldoAkhirIDR) }}</td>
                <td class="col-num">{{ formatNumber(item.saldoAkhirNonIDR) }}</td>
              </tr>
              <tr class="row-total-line">
                <td class="col-keterangan"></td>
                <td class="col-num">{{ formatNumber(rekapTotalSaldoAwalIDR) }}</td>
                <td class="col-num">{{ formatNumber(rekapTotalSaldoAwalNonIDR) }}</td>
                <td class="col-num">{{ formatNumber(rekapTotalSaldoAkhirIDR) }}</td>
                <td class="col-num">{{ formatNumber(rekapTotalSaldoAkhirNonIDR) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tabel default (TreeList) untuk tipe lainnya -->
      <DxTreeList
        v-else
        id="profit-loss-tree"
        :data-source="treeDataSource"
        key-expr="id"
        parent-id-expr="parentId"
        root-value="__root__"
        :show-row-lines="true"
        :show-borders="false"
        :column-auto-width="true"
        :expanded-row-keys="expandedKeys"
        @row-expanded="onRowExpanded"
        @row-collapsed="onRowCollapsed"
      >
        <DxColumn
          data-field="accountName"
          caption="Keterangan"
          cell-template="nameTemplate"
        />
        <DxColumn
          data-field="amount"
          caption="Bulan Ini"
          alignment="right"
          width="150"
          cell-template="amountBulanIniTemplate"
        />
        <DxColumn
          data-field="amountBulanLalu"
          caption="Bulan Lalu"
          alignment="right"
          width="150"
          cell-template="amountBulanLaluTemplate"
        />
        <DxColumn
          caption="S/d Bulan Ini"
          alignment="right"
          width="150"
          cell-template="amountTotalTemplate"
        />

        <template #nameTemplate="{ data }">
          <span :class="getRowClass(data.data)">
            {{ data.data.accountName }}
          </span>
        </template>
        <template #amountBulanIniTemplate="{ data }">
          <span :class="getRowClass(data.data)">
            {{
              shouldShowAmount(data.data)
                ? formatCurrency(data.data.amount || 0)
                : ""
            }}
          </span>
        </template>
        <template #amountBulanLaluTemplate="{ data }">
          <span :class="getRowClass(data.data)">
            {{
              shouldShowAmount(data.data)
                ? formatCurrency(data.data.amountBulanLalu || 0)
                : ""
            }}
          </span>
        </template>
        <template #amountTotalTemplate="{ data }">
          <span :class="getRowClass(data.data)">
            {{
              shouldShowAmount(data.data)
                ? formatCurrency(
                    (data.data.amount || 0) + (data.data.amountBulanLalu || 0),
                  )
                : ""
            }}
          </span>
        </template>
        <DxScrolling mode="standard" />
      </DxTreeList>
    </div>

    <!-- Popup Filter -->
    <FinancePopup
      ref="popupRef"
      :title="popupTitle || title"
      :type="type"
      :submit-button-text="submitButtonText"
      :perkiraan-mode="perkiraanMode"
      :perkiraan-browse-code="perkiraanBrowseCode"
      @on-filter-apply="handleFilterApply"
    />

    <div class="sp-footer-hidden">
      {{ spFooterText }}
    </div>

    <!-- Context Menu Copy untuk Arus Kas -->
    <Teleport to="body">
      <div
        v-if="aruskasContextMenuVisible"
        class="aruskas-context-overlay"
        @click="aruskasContextMenuVisible = false"
        @contextmenu.prevent="aruskasContextMenuVisible = false"
      ></div>
      <div
        v-if="aruskasContextMenuVisible"
        class="aruskas-context-menu"
        :style="{ left: aruskasContextMenuPos.x + 'px', top: aruskasContextMenuPos.y + 'px' }"
        @click.stop
        @contextmenu.stop
      >
        <div class="aruskas-context-item" @click="copyArusKasCell">
          <span>Salin: "{{ aruskasContextMenuValue }}"</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import {
  DxTreeList,
  DxColumn,
  DxScrolling,
} from "devextreme-vue/tree-list";
import {
  DxDataGrid,
  DxColumn as DxGridColumn,
  DxScrolling as DxGridScrolling,
  DxPaging,
} from "devextreme-vue/data-grid";
import DxButton from "devextreme-vue/button";
import FinancePopup from "./FinancePopup.vue";

const props = defineProps({
  title: { type: String, required: true },
  popupTitle: { type: String, default: "" },
  type: { type: String, required: true },
  dataSource: { type: Array, required: true },
  defaultExpandedKeys: { type: Array, default: () => [] },
  autoOpenFilter: { type: Boolean, default: false },
  showContentInitially: { type: Boolean, default: true },
  submitButtonText: { type: String, default: "Go" },
  perkiraanBrowseCode: { type: String, default: "" },
  // Prop mode perkiraan
  perkiraanMode: {
    type: String,
    default: "range", // 'range' atau 'single'
    validator: (val) => ["range", "single"].includes(val),
  },
});

const emit = defineEmits(["filter-change"]);

const store = useStore();
const route = useRoute();
const myRoutePath = route.path;

window.__accountingVisited = window.__accountingVisited || {};
const isVisited = !!window.__accountingVisited[props.type];

const popupRef = ref(null);
const startDate = ref(
  new Date(new Date().getFullYear(), new Date().getMonth(), 1),
);
const endDate = ref(new Date());

const expandedKeys = ref([...props.defaultExpandedKeys]);
const hasBeenFiltered = ref(props.showContentInitially || isVisited);

// Computed untuk cek apakah tipe adalah kas bank (kasharian)
const isKasBankType = computed(() => {
  return props.type === "kasharian";
});

// Computed untuk cek apakah tipe adalah bank harian
const isBankHarianType = computed(() => {
  return props.type === "bankharian";
});

// Computed untuk cek apakah tipe adalah rekap kas bank
const isRekapKasBankType = computed(() => {
  return props.type === "rekapkasbank";
});

// Debug: log ketika bankharian aktif
if (isBankHarianType.value) {
  console.log("[BankHarian] Mode aktif, data count:", props.dataSource?.length || 0);
  if (props.dataSource && props.dataSource.length > 0) {
    console.log("[BankHarian] Sample row:", props.dataSource[0]);
  }
}

// Computed untuk data source bank harian (transform tanggal)
const bankHarianDataSource = computed(() => {
  if (!isBankHarianType.value) return [];
  return props.dataSource.map((row) => {
    let tgl = "";
    if (row.tanggal) {
      const dateObj = new Date(row.tanggal);
      tgl = String(dateObj.getDate()).padStart(2, "0");
    }
    // Fallback untuk kolom Perkiraan: lawan, atau Perkiraan, atau kode perkiraan lain
    const perkiraanLawan = row.lawan || row.Perkiraan || row.perkiraan || row.Lawan || "";
    return {
      ...row,
      tgl,
      lawan: perkiraanLawan,
    };
  });
});

// Summary bank harian
const bankHarianSubtotal = computed(() => {
  return bankHarianDataSource.value.reduce((sum, row) => sum + (row.DebetGiro || 0), 0);
});

const bankHarianSubtotalCash = computed(() => {
  return bankHarianDataSource.value.reduce((sum, row) => sum + (row.DebetCash || 0), 0);
});

const bankHarianSubtotalKeluarGiro = computed(() => {
  return bankHarianDataSource.value.reduce((sum, row) => sum + (row.KreditGiro || 0), 0);
});

const bankHarianSubtotalKeluarCash = computed(() => {
  return bankHarianDataSource.value.reduce((sum, row) => sum + (row.KreditCash || 0), 0);
});

const bankHarianSaldoAwal = computed(() => {
  if (bankHarianDataSource.value.length > 0) {
    return bankHarianDataSource.value[0].SaldoAwal || 0;
  }
  return 0;
});

const bankHarianSaldoAkhir = computed(() => {
  return bankHarianSaldoAwal.value + bankHarianSubtotal.value + bankHarianSubtotalCash.value - bankHarianSubtotalKeluarGiro.value - bankHarianSubtotalKeluarCash.value;
});

const bankHarianTotal = computed(() => {
  return bankHarianSaldoAwal.value + bankHarianSubtotal.value + bankHarianSubtotalCash.value - bankHarianSubtotalKeluarGiro.value - bankHarianSubtotalKeluarCash.value;
});

// ===== REKAP KAS BANK =====
// Computed untuk data source rekap kas bank (transform tanggal)
const rekapKasBankDataSource = computed(() => {
  if (!isRekapKasBankType.value) return [];
  return props.dataSource.map((row) => {
    let tgl = "";
    if (row.tanggal) {
      const dateObj = new Date(row.tanggal);
      tgl = String(dateObj.getDate()).padStart(2, "0");
    }
    // Fallback untuk kolom Perkiraan
    const perkiraanLawan = row.lawan || row.Perkiraan || row.perkiraan || row.Lawan || "";
    // Normalisasi field debet/kredit (bisa camelCase atau lowercase)
    return {
      ...row,
      tgl,
      lawan: perkiraanLawan,
      debetGiro: row.debetGiro ?? row.DebetGiro ?? 0,
      debetCash: row.debetCash ?? row.DebetCash ?? 0,
      kreditGiro: row.kreditGiro ?? row.KreditGiro ?? 0,
      kreditCash: row.kreditCash ?? row.KreditCash ?? 0,
    };
  });
});

// Summary rekap kas bank
const rekapTotalPenerimaanGiro = computed(() => {
  return rekapKasBankDataSource.value.reduce((sum, row) => sum + (row.debetGiro || 0), 0);
});

const rekapTotalPenerimaanCash = computed(() => {
  return rekapKasBankDataSource.value.reduce((sum, row) => sum + (row.debetCash || 0), 0);
});

const rekapTotalPengeluaranGiro = computed(() => {
  return rekapKasBankDataSource.value.reduce((sum, row) => sum + (row.kreditGiro || 0), 0);
});

const rekapTotalPengeluaranCash = computed(() => {
  return rekapKasBankDataSource.value.reduce((sum, row) => sum + (row.kreditCash || 0), 0);
});

const rekapSaldoAwal = computed(() => {
  if (rekapKasBankDataSource.value.length > 0) {
    return rekapKasBankDataSource.value[0].SaldoAwal || 0;
  }
  return 0;
});

const rekapSaldoAkhir = computed(() => {
  return rekapSaldoAwal.value + rekapTotalPenerimaanGiro.value + rekapTotalPenerimaanCash.value - rekapTotalPengeluaranGiro.value - rekapTotalPengeluaranCash.value;
});

const rekapTotalPenerimaan = computed(() => {
  return rekapSaldoAwal.value + rekapTotalPenerimaanGiro.value + rekapTotalPenerimaanCash.value;
});

const rekapTotalPengeluaran = computed(() => {
  return rekapSaldoAwal.value + rekapTotalPengeluaranGiro.value + rekapTotalPengeluaranCash.value;
});

// Rekapitulasi Saldo (group by NamaPerkiraan/Perkiraan)
const rekapitulasiSaldoList = computed(() => {
  if (!rekapKasBankDataSource.value.length) return [];

  const grouped = {};
  for (const row of rekapKasBankDataSource.value) {
    const key = row.NamaPerkiraan || row.Perkiraan || row.nama_perkiraan || "Lainnya";
    if (!grouped[key]) {
      grouped[key] = {
        keterangan: key,
        saldoAwalIDR: 0,
        saldoAwalNonIDR: 0,
        saldoAkhirIDR: 0,
        saldoAkhirNonIDR: 0,
      };
    }
    // Akumulasi saldo (dari field saldo atau dihitung)
    const saldo = row.saldo ?? row.Saldo ?? 0;
    const valas = row.Valas || row.valas || "IDR";
    if (valas === "IDR") {
      grouped[key].saldoAkhirIDR += saldo;
    } else {
      grouped[key].saldoAkhirNonIDR += saldo;
    }
  }

  return Object.values(grouped);
});

const rekapTotalSaldoAwalIDR = computed(() => {
  return rekapitulasiSaldoList.value.reduce((sum, item) => sum + (item.saldoAwalIDR || 0), 0);
});

const rekapTotalSaldoAwalNonIDR = computed(() => {
  return rekapitulasiSaldoList.value.reduce((sum, item) => sum + (item.saldoAwalNonIDR || 0), 0);
});

const rekapTotalSaldoAkhirIDR = computed(() => {
  return rekapitulasiSaldoList.value.reduce((sum, item) => sum + (item.saldoAkhirIDR || 0), 0);
});

const rekapTotalSaldoAkhirNonIDR = computed(() => {
  return rekapitulasiSaldoList.value.reduce((sum, item) => sum + (item.saldoAkhirNonIDR || 0), 0);
});

// Rincian tambahan bank harian (dari field backend atau dihitung)
const bankHarianUangTunai = computed(() => {
  if (bankHarianDataSource.value.length > 0) {
    return bankHarianDataSource.value[0].UangTunai ?? bankHarianDataSource.value[0].uangtunai ?? bankHarianSaldoAkhir.value;
  }
  return 0;
});

const bankHarianCHGB = computed(() => {
  if (bankHarianDataSource.value.length > 0) {
    return bankHarianDataSource.value[0].CHGB ?? bankHarianDataSource.value[0].chgb ?? 0;
  }
  return 0;
});

const bankHarianBonSementara = computed(() => {
  if (bankHarianDataSource.value.length > 0) {
    return bankHarianDataSource.value[0].BonSementara ?? bankHarianDataSource.value[0].bonsementara ?? 0;
  }
  return 0;
});

const bankHarianSisaKeuangan = computed(() => {
  if (bankHarianDataSource.value.length > 0) {
    return bankHarianDataSource.value[0].SisaKeuangan ?? bankHarianDataSource.value[0].sisakeuangan ?? bankHarianSaldoAkhir.value;
  }
  return 0;
});

const bankHarianSaldoKasir = computed(() => {
  if (bankHarianDataSource.value.length > 0) {
    return bankHarianDataSource.value[0].SaldoKasir ?? bankHarianDataSource.value[0].saldokasir ?? bankHarianSaldoAkhir.value;
  }
  return 0;
});

// Computed untuk data source kas bank (transform tanggal)
const kasBankDataSource = computed(() => {
  if (!isKasBankType.value) return [];
  return props.dataSource.map((row) => {
    // Ambil hari dari tanggal (contoh: "2026-07-14" -> "14")
    let tgl = "";
    if (row.tanggal) {
      const dateObj = new Date(row.tanggal);
      tgl = String(dateObj.getDate()).padStart(2, "0");
    }
    return {
      ...row,
      tgl,
    };
  });
});

// Computed untuk summary kas bank
const totalPenerimaanGiro = computed(() => {
  return kasBankDataSource.value.reduce((sum, row) => sum + (row.DebetGiro || 0), 0);
});

const totalPenerimaanCash = computed(() => {
  return kasBankDataSource.value.reduce((sum, row) => sum + (row.DebetCash || 0), 0);
});

const totalPengeluaranGiro = computed(() => {
  return kasBankDataSource.value.reduce((sum, row) => sum + (row.KreditGiro || 0), 0);
});

const totalPengeluaranCash = computed(() => {
  return kasBankDataSource.value.reduce((sum, row) => sum + (row.KreditCash || 0), 0);
});

const saldoAwal = computed(() => {
  if (kasBankDataSource.value.length > 0) {
    return kasBankDataSource.value[0].SaldoAwal || 0;
  }
  return 0;
});

const saldoAkhir = computed(() => {
  return saldoAwal.value + totalPenerimaanGiro.value + totalPenerimaanCash.value - totalPengeluaranGiro.value - totalPengeluaranCash.value;
});

const totalPenerimaan = computed(() => {
  return saldoAwal.value + totalPenerimaanGiro.value + totalPenerimaanCash.value;
});

const totalPengeluaran = computed(() => {
  return saldoAwal.value + totalPengeluaranGiro.value + totalPengeluaranCash.value;
});

// Format number untuk kas bank (dengan desimal 2)
const formatNumber = (value) => {
  if (value === null || value === undefined) return "0,00";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// ===== ARUS KAS =====
const isArusKasType = computed(() => props.type === "aruskas");

// Parse data arus kas berdasarkan field "Laporan" dari API
const parseArusKasData = computed(() => {
  if (!isArusKasType.value || !props.dataSource || props.dataSource.length === 0) {
    return { saldoAwal: [], penerimaan: [], pengeluaran: [], saldoAkhir: [] };
  }

  const result = { saldoAwal: [], penerimaan: [], pengeluaran: [], saldoAkhir: [] };

  for (let i = 0; i < props.dataSource.length; i++) {
    const row = props.dataSource[i];

    // Ambil field dari response API (struktur dbCashFlow via sp_webreportaruskas)
    const laporan = String(row.Laporan || row.laporan || "").toLowerCase().trim();
    const keterangan = String(row.keterangan || row.Keterangan || "").trim();
    const nilai = parseFloat(row.Nilai ?? row.nilai ?? row.jumlah ?? row.Jumlah ?? 0) || 0;
    const prioritas = parseInt(row.Prioritas ?? row.prioritas ?? -1);

    // Skip baris kosong
    if (!keterangan) continue;

    // Klasifikasi berdasarkan field "Laporan" atau "Prioritas"
    if (laporan === "saldo awal" || prioritas === 0) {
      result.saldoAwal.push({ keterangan, jumlah: nilai });
    } else if (laporan === "penerimaan" || prioritas === 1) {
      result.penerimaan.push({ keterangan, jumlah: nilai });
    } else if (laporan === "pengeluaran" || prioritas === 2) {
      result.pengeluaran.push({ keterangan, jumlah: Math.abs(nilai) });
    } else if (laporan === "saldo akhir" || prioritas === 3) {
      result.saldoAkhir.push({ keterangan, jumlah: nilai });
    }
  }

  return result;
});

const arusKasSaldoAwal = computed(() => parseArusKasData.value.saldoAwal);
const arusKasPenerimaan = computed(() => parseArusKasData.value.penerimaan);
const arusKasPengeluaran = computed(() => parseArusKasData.value.pengeluaran);
const arusKasSaldoAkhir = computed(() => parseArusKasData.value.saldoAkhir);

// Debug: tampilkan struktur data di console
if (isArusKasType.value && props.dataSource && props.dataSource.length > 0) {
  console.log("[ArusKas] Sample data:", props.dataSource.slice(0, 3));
  console.log("[ArusKas] Parsed:", {
    saldoAwal: arusKasSaldoAwal.value.length,
    penerimaan: arusKasPenerimaan.value.length,
    pengeluaran: arusKasPengeluaran.value.length,
    saldoAkhir: arusKasSaldoAkhir.value.length,
  });
}

const totalSaldoAwal = computed(() => arusKasSaldoAwal.value.reduce((sum, item) => sum + (item.jumlah || 0), 0));
const totalPenerimaanArusKas = computed(() => arusKasPenerimaan.value.reduce((sum, item) => sum + (item.jumlah || 0), 0));
const totalPengeluaranArusKas = computed(() => arusKasPengeluaran.value.reduce((sum, item) => sum + (item.jumlah || 0), 0));
const totalSaldoAkhir = computed(() => arusKasSaldoAkhir.value.reduce((sum, item) => sum + (item.jumlah || 0), 0));
const grandTotalArusKas = computed(() => totalSaldoAwal.value + totalPenerimaanArusKas.value - totalPengeluaranArusKas.value);

// Flat data source untuk DxDataGrid arus kas (section headers + detail + subtotal + grandtotal)
const arusKasGridData = computed(() => {
  if (!isArusKasType.value) return [];
  const rows = [];
  const addSection = (label) => rows.push({ _rowType: "section", keterangan: label, jumlah: null });
  const addDetail = (item) => rows.push({ _rowType: "detail", keterangan: item.keterangan, jumlah: item.jumlah });
  const addSubtotal = (total) => rows.push({ _rowType: "subtotal", keterangan: "", jumlah: total });

  addSection("Saldo Awal");
  arusKasSaldoAwal.value.forEach(addDetail);
  addSubtotal(totalSaldoAwal.value);

  addSection("Penerimaan");
  arusKasPenerimaan.value.forEach(addDetail);
  addSubtotal(totalPenerimaanArusKas.value);

  addSection("Pengeluaran");
  arusKasPengeluaran.value.forEach(addDetail);
  addSubtotal(totalPengeluaranArusKas.value);

  addSection("Saldo Akhir");
  arusKasSaldoAkhir.value.forEach(addDetail);
  addSubtotal(totalSaldoAkhir.value);

  rows.push({ _rowType: "grandtotal", keterangan: "", jumlah: grandTotalArusKas.value });

  return rows;
});

// CSS class per row type untuk styling DxDataGrid
const arusKasRowClass = (rowData) => {
  const type = rowData?._rowType || "detail";
  return `aruskas-row-${type}`;
};

// Row prepared event untuk background per tipe baris
const onArusKasRowPrepared = (e) => {
  if (e.rowType !== "data") return;
  const type = e.data?._rowType;
  if (!type) return;
  if (type === "section") {
    e.rowElement.style.backgroundColor = "#f3f4f6";
    e.rowElement.style.fontWeight = "600";
  } else if (type === "subtotal") {
    e.rowElement.style.backgroundColor = "#fafbfc";
    e.rowElement.style.borderTop = "1px solid #d1d5db";
  } else if (type === "grandtotal") {
    e.rowElement.style.backgroundColor = "#f3f4f6";
    e.rowElement.style.fontWeight = "600";
    e.rowElement.style.borderTop = "1px solid #d1d5db";
    e.rowElement.style.borderBottom = "2px solid #9ca3af";
  }
};

// ===== Context Menu Copy untuk Arus Kas =====
const aruskasContextMenuVisible = ref(false);
const aruskasContextMenuPos = ref({ x: 0, y: 0 });
const aruskasContextMenuValue = ref("");

const onArusKasContextMenu = (e) => {
  // Hanya tampilkan untuk data row
  if (e.row?.rowType !== "data") {
    e.items = [];
    return;
  }

  // Ambil nilai cell yang diklik
  const dataField = e.column?.dataField;
  let cellValue;
  if (dataField) {
    cellValue = e.row?.data?.[dataField];
  } else {
    cellValue = e.targetElement?.textContent?.trim();
  }

  // Skip kalau section header (tidak ada nilai untuk disalin)
  if (e.row?.data?._rowType === "section") {
    e.items = [];
    return;
  }

  // Simpan nilai untuk ditampilkan di menu
  const displayVal = cellValue !== null && cellValue !== undefined ? String(cellValue) : "";
  aruskasContextMenuValue.value = displayVal.length > 30 ? displayVal.substring(0, 30) + "..." : displayVal;

  // Set posisi menu
  if (e.event) {
    const mouseEvent = e.event.originalEvent || e.event;
    const x = mouseEvent.clientX || mouseEvent.pageX || 0;
    const y = mouseEvent.clientY || mouseEvent.pageY || 0;
    const menuWidth = 220;
    const menuHeight = 50;
    let posX = x + 2;
    let posY = y + 2;
    if (posX + menuWidth > window.innerWidth) posX = window.innerWidth - menuWidth - 10;
    if (posY + menuHeight > window.innerHeight) posY = window.innerHeight - menuHeight - 10;
    aruskasContextMenuPos.value = { x: posX, y: posY };
  }

  // Kosongkan items bawaan DevExtreme, pakai custom
  e.items = [];
  aruskasContextMenuVisible.value = true;
};

const copyArusKasCell = async () => {
  const value = aruskasContextMenuValue.value;
  if (!value) { aruskasContextMenuVisible.value = false; return; }
  try {
    await navigator.clipboard.writeText(value);
  } catch (err) {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
  aruskasContextMenuVisible.value = false;
};

// Format currency untuk arus kas (dengan kurung untuk negatif)
const formatCurrencyArusKas = (value) => {
  if (value === null || value === undefined) return "-";
  if (value === 0) return "-";
  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  return value < 0 ? `(${formatted})` : formatted;
};

const treeDataSource = computed(() =>
  props.dataSource.map((row, index) => {
    const accountName = [
      row.accountName,
      row.NamaPerkiraan,
      row.Keterangan,
      row.keterangan2,
      row.Perkiraan,
      row.NoBukti,
      row.Periode,
    ].find((value) => value !== null && value !== undefined && value !== "");

    return {
      ...row,
      id: row.id ?? row.keyindex ?? `finance-row-${index}`,
      parentId: row.parentId ?? "__root__",
      accountName: accountName ?? `Baris ${index + 1}`,
      amount: row.amount ?? row.saldo ?? row.SaldoAwal ?? 0,
      amountBulanLalu: row.amountBulanLalu ?? 0,
      type: row.type ?? "detail",
    };
  }),
);

const moduleNameMap = {
  kasharian: "kasharian",
  bankharian: "bankharian",
  rekapkasbank: "rekapkasbank",
  aruskas: "kasbankaruskas",
};

const spFooterText = computed(() => {
  if (!props.type) return "";
  const moduleName = moduleNameMap[props.type] || props.type;
  try {
    return store.getters[`${moduleName}/ketsp`] || "";
  } catch (e) {
    return "";
  }
});

const formatDateRange = computed(() => {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return `${startDate.value.toLocaleDateString("id-ID", options)} - ${endDate.value.toLocaleDateString("id-ID", options)}`;
});

const onRowExpanded = (e) => {
  if (!expandedKeys.value.includes(e.key)) {
    expandedKeys.value.push(e.key);
  }
};
const onRowCollapsed = (e) => {
  expandedKeys.value = expandedKeys.value.filter((key) => key !== e.key);
};

const shouldShowAmount = (rowData) => {
  if (rowData.parentId === 0) {
    const isExpanded = expandedKeys.value.includes(rowData.id);
    return !isExpanded;
  }
  return true;
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "";
  if (value === 0) return "-";
  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
  }).format(Math.abs(value));
  return value < 0 ? `(${formatted})` : formatted;
};

const getRowClass = (rowData) => {
  switch (rowData.type) {
    case "header":
      return "row-header";
    case "subtotal":
      return "row-subtotal";
    case "grandtotal":
      return "row-grandtotal";
    case "netprofit":
      return "row-netprofit";
    default:
      return "row-detail";
  }
};

const exportToPDF = () => window.print();
const printReport = () => window.print();
const openFilter = () => popupRef.value?.open();

const handleFilterApply = (filterData) => {
  startDate.value = filterData.startDate;
  endDate.value = filterData.endDate;
  hasBeenFiltered.value = true;
  emit("filter-change", filterData);
};

onMounted(() => {
  if (props.autoOpenFilter && !window.__accountingVisited[props.type]) {
    openFilter();
    window.__accountingVisited[props.type] = true;
  }
});

onUnmounted(() => {
  const activeTabs = store.getters["tabs/getTabs"] || [];
  const isTabStillOpen = activeTabs.some(
    (path) => path.toLowerCase() === myRoutePath.toLowerCase(),
  );
  if (!isTabStillOpen && window.__accountingVisited?.[props.type]) {
    delete window.__accountingVisited[props.type];
  }
});
</script>

<style scoped>
/* (sama seperti sebelumnya, tidak diubah) */
.pl-report-container {
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.report-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1d20;
}
.report-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #6c757d;
}
.action-buttons {
  display: flex;
  gap: 12px;
}
.card-box {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid #eaedf1;
}
:deep(.dx-treelist-borders > .dx-treelist-headers) {
  border-bottom: 2px solid #dee2e6;
}
:deep(.dx-treelist-text-content) {
  font-size: 14px;
  color: #495057;
}
.row-header {
  font-weight: 700;
  color: #343a40;
  text-transform: uppercase;
  font-size: 13px;
  letter-spacing: 0.5px;
}
.row-detail {
  font-weight: 400;
  color: #495057;
}
.row-subtotal {
  font-weight: 600;
  color: #212529;
  border-top: 1px solid #ced4da;
  padding-top: 8px;
  display: inline-block;
  width: 100%;
}
.row-grandtotal {
  font-weight: 700;
  color: #1a1d20;
  background-color: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  display: inline-block;
  width: 100%;
}
.row-netprofit {
  font-weight: 800;
  color: #0f5132;
  background-color: #d1e7dd;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 16px;
  display: inline-block;
  width: 100%;
  border-bottom: 4px double #0f5132;
}

/* SP Debug Overlay - Hidden until selected */
.sp-footer-hidden {
  flex-shrink: 0;
  width: 100%;
  height: 10px;
  line-height: 10px;
  padding: 0 8px;
  font-size: 11px;
  color: transparent;
  background: transparent;
  user-select: text;
  -webkit-user-select: text;
  cursor: text;
  text-align: right;
  box-sizing: border-box;
  margin-top: 12px;
}

.sp-footer-hidden::selection {
  color: #111827;
  background: #ffe58f;
}

.sp-footer-hidden::-moz-selection {
  color: #111827;
  background: #ffe58f;
}

/* ===== Kas Bank - DevExtreme grid, styling clean & minimal ===== */
.kasbank-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

/* --- DxDataGrid: samakan look dengan tabel clean --- */
.kasbank-grid {
  font-size: 13px;
  color: #4b5563;
  border: 1px solid #f1f3f5;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

/* Header grid */
.kasbank-grid :deep(.dx-datagrid-headers) {
  background-color: #fafbfc;
  color: #6b7280;
  font-weight: 600;
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e5e7eb;
}

.kasbank-grid :deep(.dx-datagrid-headers .dx-header-row td) {
  background-color: #fafbfc;
  border-color: #f1f3f5;
  padding: 9px 12px;
  vertical-align: middle;
}

/* Group header (Penerimaan / Pengeluaran) */
.kasbank-grid :deep(.dx-datagrid-headers .dx-header-row:first-child td[colspan]) {
  background-color: #f3f4f6;
  color: #4b5563;
  border-bottom: 1px solid #e5e7eb;
}

/* Body grid */
.kasbank-grid :deep(.dx-datagrid-rowsview .dx-row td) {
  border-color: #f1f3f5;
  padding: 9px 12px;
  vertical-align: middle;
}

.kasbank-grid :deep(.dx-datagrid-rowsview .dx-data-row) {
  border-bottom: 1px solid #f3f4f6;
}

.kasbank-grid :deep(.dx-datagrid-rowsview .dx-data-row:hover td) {
  background-color: #f9fafb;
}

/* Angka di grid: tabular nums biar rapi */
.kasbank-grid :deep(.dx-datagrid-rowsview td) {
  font-variant-numeric: tabular-nums;
}

/* Empty state */
.kasbank-grid :deep(.dx-datagrid-nodata) {
  color: #9ca3af;
  font-style: italic;
  font-size: 13px;
  padding: 28px 12px;
}

/* --- Summary table: lebar kolom sama dengan grid --- */
.kasbank-summary-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 13px;
  color: #4b5563;
  border: 1px solid #f1f3f5;
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.kasbank-summary-table td {
  border: 1px solid #f1f3f5;
  border-top: none;
  padding: 9px 12px;
  vertical-align: middle;
  background-color: #fafbfc;
  font-weight: 500;
  color: #374151;
}

.kasbank-summary-table .col-label {
  text-align: right;
  font-weight: 500;
  color: #374151;
}

.kasbank-summary-table .col-num {
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.kasbank-summary-table .row-subtotal-line td {
  background-color: #f3f4f6;
  border-top: 1px solid #d1d5db;
}

.kasbank-summary-table .row-total-line td {
  background-color: #f3f4f6;
  font-weight: 600;
  color: #111827;
  border-top: 1px solid #d1d5db;
  border-bottom: 2px solid #9ca3af;
}

/* ===== ARUS KAS - DxDataGrid ===== */
.aruskas-wrapper {
  width: 100%;
  overflow-x: auto;
}

/* Section header (Saldo Awal, Penerimaan, dll) */
.aruskas-row-section {
  font-weight: 600;
  font-size: 12px;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* Detail rows */
.aruskas-row-detail {
  font-weight: 400;
  padding-left: 8px;
}

/* Subtotal row */
.aruskas-row-subtotal {
  font-weight: 500;
  color: #374151;
}

/* Grand total row */
.aruskas-row-grandtotal {
  font-weight: 600;
  color: #111827;
}

/* Context menu copy arus kas */
.aruskas-context-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
}

.aruskas-context-menu {
  position: fixed;
  z-index: 9999;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px 0;
  min-width: 200px;
}

.aruskas-context-item {
  padding: 8px 16px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.aruskas-context-item:hover {
  background-color: #f3f4f6;
}

/* ===== BANK HARIAN - Clean & Minimal (konsisten dengan kas bank) ===== */
.bankharian-wrapper {
  width: 100%;
  overflow-x: auto;
}

/* Grid bank harian - styling sama dengan kas bank */
.bankharian-grid {
  font-size: 13px;
  color: #4b5563;
  border: 1px solid #f1f3f5;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.bankharian-grid :deep(.dx-datagrid-headers) {
  background-color: #fafbfc;
  color: #6b7280;
  font-weight: 600;
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e5e7eb;
}

.bankharian-grid :deep(.dx-datagrid-headers .dx-header-row td) {
  background-color: #fafbfc;
  border-color: #f1f3f5;
  padding: 9px 12px;
  vertical-align: middle;
}

.bankharian-grid :deep(.dx-datagrid-rowsview .dx-row td) {
  border-color: #f1f3f5;
  padding: 9px 12px;
  vertical-align: middle;
}

.bankharian-grid :deep(.dx-datagrid-rowsview .dx-data-row) {
  border-bottom: 1px solid #f3f4f6;
}

.bankharian-grid :deep(.dx-datagrid-rowsview .dx-data-row:hover td) {
  background-color: #f9fafb;
}

.bankharian-grid :deep(.dx-datagrid-rowsview td) {
  font-variant-numeric: tabular-nums;
}

.bankharian-grid :deep(.dx-datagrid-nodata) {
  color: #9ca3af;
  font-style: italic;
  font-size: 13px;
  padding: 28px 12px;
}

/* Summary table bank harian */
.bankharian-summary-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 13px;
  color: #4b5563;
  border: 1px solid #f1f3f5;
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.bankharian-summary-table td {
  border: 1px solid #f1f3f5;
  border-top: none;
  padding: 9px 12px;
  vertical-align: middle;
  background-color: #fafbfc;
  font-weight: 500;
  color: #374151;
}

.bankharian-summary-table .col-label {
  text-align: left;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.bankharian-summary-table .col-num {
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.bankharian-summary-table .row-subtotal-line td {
  background-color: #f3f4f6;
  border-top: 1px solid #d1d5db;
}

.bankharian-summary-table .row-total-line td {
  background-color: #f3f4f6;
  font-weight: 600;
  color: #111827;
  border-top: 1px solid #d1d5db;
  border-bottom: 2px solid #9ca3af;
}

/* Layout 2 kolom: rincian kiri, summary kanan (sejajar tabel atas) */
.bankharian-summary-wrapper {
  display: flex;
  gap: 0;
  align-items: stretch;
  border: 1px solid #f1f3f5;
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

/* Tabel rincian kiri - mengisi ruang kosong */
.bankharian-rincian-table {
  flex: 1;
  min-width: 0;
  border-collapse: collapse;
  font-size: 13px;
  color: #4b5563;
  border-right: 2px solid #e5e7eb;
}

.bankharian-rincian-table td {
  border: 1px solid #f1f3f5;
  border-top: none;
  border-left: none;
  padding: 9px 12px;
  vertical-align: middle;
  background-color: #fafbfc;
  font-weight: 500;
  color: #374151;
}

.bankharian-rincian-table tr:last-child td {
  border-bottom: none;
}

.bankharian-rincian-table .col-label {
  text-align: left;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.bankharian-rincian-table .col-num {
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  width: 150px;
}

/* Tabel summary kanan - fixed width, sejajar dengan kolom Penerimaan Giro */
.bankharian-summary-table {
  flex: 0 0 auto;
  width: auto;
  border: none;
  border-radius: 0;
}

/* ===== REKAP KAS BANK - Clean & Minimal (konsisten dengan kas bank) ===== */
.rekapkasbank-wrapper {
  width: 100%;
  overflow-x: auto;
}

.rekapkasbank-grid {
  font-size: 13px;
  color: #4b5563;
  border: 1px solid #f1f3f5;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.rekapkasbank-grid :deep(.dx-datagrid-headers) {
  background-color: #fafbfc;
  color: #6b7280;
  font-weight: 600;
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e5e7eb;
}

.rekapkasbank-grid :deep(.dx-datagrid-headers .dx-header-row td) {
  background-color: #fafbfc;
  border-color: #f1f3f5;
  padding: 9px 12px;
  vertical-align: middle;
}

.rekapkasbank-grid :deep(.dx-datagrid-headers .dx-header-row:first-child td[colspan]) {
  background-color: #f3f4f6;
  color: #4b5563;
  border-bottom: 1px solid #e5e7eb;
}

.rekapkasbank-grid :deep(.dx-datagrid-rowsview .dx-row td) {
  border-color: #f1f3f5;
  padding: 9px 12px;
  vertical-align: middle;
}

.rekapkasbank-grid :deep(.dx-datagrid-rowsview .dx-data-row) {
  border-bottom: 1px solid #f3f4f6;
}

.rekapkasbank-grid :deep(.dx-datagrid-rowsview .dx-data-row:hover td) {
  background-color: #f9fafb;
}

.rekapkasbank-grid :deep(.dx-datagrid-rowsview td) {
  font-variant-numeric: tabular-nums;
}

.rekapkasbank-grid :deep(.dx-datagrid-nodata) {
  color: #9ca3af;
  font-style: italic;
  font-size: 13px;
  padding: 28px 12px;
}

/* Summary table rekap kas bank */
.rekapkasbank-summary-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 13px;
  color: #4b5563;
  border: 1px solid #f1f3f5;
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.rekapkasbank-summary-table td {
  border: 1px solid #f1f3f5;
  border-top: none;
  padding: 9px 12px;
  vertical-align: middle;
  background-color: #fafbfc;
  font-weight: 500;
  color: #374151;
}

.rekapkasbank-summary-table .col-label {
  text-align: right;
  font-weight: 500;
  color: #374151;
}

.rekapkasbank-summary-table .col-num {
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.rekapkasbank-summary-table .row-subtotal-line td {
  background-color: #f3f4f6;
  border-top: 1px solid #d1d5db;
}

.rekapkasbank-summary-table .row-total-line td {
  background-color: #f3f4f6;
  font-weight: 600;
  color: #111827;
  border-top: 1px solid #d1d5db;
  border-bottom: 2px solid #9ca3af;
}

/* Rekapitulasi Saldo */
.rekapitulasi-saldo-wrapper {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 2px solid #e5e7eb;
}

.rekapitulasi-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1a1d20;
  text-transform: uppercase;
}

.rekapitulasi-periode {
  margin: 0 0 16px 0;
  font-size: 12px;
  color: #6c757d;
}

.rekapitulasi-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: #4b5563;
  border: 1px solid #f1f3f5;
  border-radius: 8px;
  overflow: hidden;
}

.rekapitulasi-table th,
.rekapitulasi-table td {
  border: 1px solid #f1f3f5;
  padding: 9px 12px;
  vertical-align: middle;
}

.rekapitulasi-table thead th {
  background-color: #fafbfc;
  font-weight: 600;
  font-size: 11.5px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e5e7eb;
}

.rekapitulasi-table .col-keterangan {
  text-align: left;
}

.rekapitulasi-table .col-num {
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.rekapitulasi-table .row-total-line td {
  background-color: #f3f4f6;
  font-weight: 600;
  color: #111827;
  border-top: 1px solid #d1d5db;
  border-bottom: 2px solid #9ca3af;
}
</style>
