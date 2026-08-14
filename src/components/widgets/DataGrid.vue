<template>
  <div class="mt-4 flex-1 min-h-1 relative flex flex-col">
    <div
      class="h-full overflow-auto"
      :class="isMobile ? '' : 'overflow-x-auto'"
    >
      <DxDataGrid
        ref="dataGridRef"
        :dataSource="dataSource"
        :columnAutoWidth="columnAutoWidth"
        :columnMinWidth="isMobile ? 100 : undefined"
        :allowColumnResizing="allowColumnResizing"
        :allowColumnReordering="allowColumnReordering"
        :showBorders="showBorders"
        :keyExpr="keyExpr"
        :focusedRowEnabled="isFocusEnabled"
        :focusedRowKey="focusedRowKey"
        :selectedRowKeys="selectedRowKeys"
        :height="height"
        :rowAlternationEnabled="rowAlternationEnabled"
        :hoverStateEnabled="hoverStateEnabled"
        :wordWrapEnabled="wordwrap"
        :columnHidingEnabled="columnHidingEnabled"
        @exporting="onExporting"
        @rowRemoving="handleRowRemoving"
        @optionChanged="handleOptionChanged"
        @cellPrepared="onCellPrepared"
        @rowPrepared="onRowPrepared"
        @content-ready="handlecontentready"
        @selection-changed="(e) => $emit('selection-changed', e)"
        @onRowClick="handleFocusedRowChanged"
        @rowDblClick="handleFocusedRowChanged"
        @contextMenuPreparing="onContextMenuPreparing"
      >
        <!-- @focusedRowChanged="handleFocusedRowChanged" -->
        <DxColumn
          v-for="col in computedColumns"
          :key="col.dataField || col.caption"
          :data-field="col.dataField"
          :caption="col.caption"
          :visible="col.visible"
          :width="col.width"
          :alignment="col.alignment"
          :cell-template="col.cellTemplate"
          :format="col.format"
          :data-type="col.dataType"
          :fixed="col.fixed"
          :fixed-position="col.fixedPosition"
        />

        <DxColumnChooser
          :enabled="false"
          mode="select"
          :position="{
            my: 'right top',
            at: 'right bottom',
            of: '.dx-datagrid-column-chooser-button',
            offset: '0 5',
          }"
        />

        <DxSummary v-if="summaries.length || avg.length">
          <DxTotalItem
            v-for="(summary, index) in summaries"
            :key="'sum-' + index"
            :column="typeof summary === 'object' ? summary.column : summary"
            summaryType="sum"
            :customizeText="
              (e) =>
                formatSummary(
                  e,
                  typeof summary === 'object' ? summary.column : summary,
                )
            "
            :alignment="'right'"
          />
          <DxTotalItem
            v-for="(summary, index) in avg"
            :key="'avg-' + index"
            :column="typeof summary === 'object' ? summary.column : summary"
            summaryType="avg"
            :customizeText="
              (e) =>
                formatSummary(
                  e,
                  typeof summary === 'object' ? summary.column : summary,
                )
            "
            :alignment="'right'"
          />

          <DxGroupItem
            v-for="(col, index) in summaries"
            :key="'group-sum-' + index"
            :column="typeof col === 'object' ? col.column : col"
            summary-type="sum"
            :alignByColumn="true"
            :showInGroupFooter="true"
            :customizeText="
              (e) =>
                formatSummary(e, typeof col === 'object' ? col.column : col)
            "
            :alignment="'right'"
          />

          <DxGroupItem
            v-for="(col, index) in avg"
            :key="'group-avg-' + index"
            :column="typeof col === 'object' ? col.column : col"
            summary-type="avg"
            :alignByColumn="true"
            :showInGroupFooter="true"
            :customizeText="
              (e) =>
                formatSummary(e, typeof col === 'object' ? col.column : col)
            "
            :alignment="'right'"
          />
        </DxSummary>

        <DxScrolling
          :mode="scrollingMode"
          :showScrollbar="showScrollbar"
          :columnRenderingMode="columnRenderingMode"
          :rowRenderingMode="rowRenderingMode"
          :useNative="useNativeScrolling"
        />
        <DxExport :enabled="false" :allowExportSelectedData="false" />
        <DxPaging v-if="useBuiltInPager" :pageSize="pageSize" />
        <DxPaging v-else :enabled="false" />
        <DxPager
          v-if="showPager && useBuiltInPager"
          :visible="true"
          :allowedPageSizes="allowedPageSizes"
          :showPageSizeSelector="showPageSizeSelector"
          :showNavigationButtons="showNavigationButtons"
        />
        <DxPager v-else :visible="false" />
        <DxHeaderFilter :visible="true" />
        <DxSelection
          v-if="showSelection"
          :mode="selectionMode"
          :selectAllMode="selectAllMode"
          :showCheckBoxesMode="showCheckBoxesMode"
        />
        <DxSearchPanel
          v-if="filterSettings.showSearchPanel"
          :visible="true"
          :width="searchPanelWidth"
          :placeholder="searchPlaceholder"
        />

        <DxEditing
          :allowUpdating="allowUpdating"
          :allowDeleting="allowDeleting"
          :allowAdding="allowAdding"
        />

        <DxRowDragging
          :allowReordering="false"
          :showDragIcons="false"
          :onReorder="onRowReorder"
        />
        <DxColumnFixing :enabled="false" />
        <DxHeaderFilter :visible="filterSettings.showHeaderFilter" />
        <DxFilterPanel :visible="showFilterPanel" />
        <DxFilterBuilderPopup :position="filterBuilderPopupPosition" />

        <DxGrouping
          :contextMenuEnabled="true"
          expandMode="rowClick"
          :autoExpandAll="autoExpandAll"
        />
        <DxGroupPanel
          :visible="showGroupPanel"
          emptyPanelText="Drag a column header here to group by that column"
        />

        <DxMasterDetail
          v-if="masterDetailEnabled"
          :enabled="true"
          template="masterDetailTemplate"
        />

        <DxToolbar v-if="showToolbar">
          <DxItem location="before" template="headerToolbarTemplate" />
          <DxItem name="groupPanel" location="before" />
          <DxItem
            location="before"
            v-if="isColumnGrouped"
            template="checkboxExpandTemplate"
          />
          <DxItem
            v-if="showAddButton"
            location="after"
            widget="dxButton"
            :options="addButtonOptions"
          />
          <DxItem
            v-if="showPrintButton"
            location="after"
            widget="dxButton"
            :options="printButtonOptions"
          />

          <!-- <DxItem location="after" widget="dxButton" :options="{
          icon: 'revert',  // bisa juga pakai 'refresh' tapi beda warna/icon biar jelas
          hint: 'Reset Grid',
          elementAttr: { class: 'reset-button' },
          onClick: resetGrid,
        }" /> -->
          <DxItem
            v-if="showRefreshButton"
            location="after"
            widget="dxButton"
            :options="refreshButtonOptions"
          />
          <DxItem
            v-if="showExportButton"
            location="after"
            widget="dxButton"
            :options="exportButtonOptions"
          />
          <!-- <DxItem
          v-if="showFilterButton"
          location="after"
          widget="dxButton"
          :options="filterButtonOptions"
        /> -->
          <DxItem name="columnChooserButton" location="after" />
          <DxItem
            location="after"
            widget="dxButton"
            :options="filterListButtonOptions"
          />

          <DxItem
            v-for="(item, index) in customToolbarItems"
            :key="`custom-${index}`"
            :location="item.location || 'after'"
            :widget="item.widget"
            :options="item.options"
          />
          <DxItem v-if="showSearchPanel" name="searchPanel" location="after" />
          <DxItem
            v-if="customsearch"
            location="after"
            widget="dxTextBox"
            :options="customSearchOptions"
          />
        </DxToolbar>

        <template #headerToolbarTemplate>
          <slot name="header-toolbar"></slot>
        </template>

        <template
          v-if="masterDetailEnabled"
          #masterDetailTemplate="{ data: masterRow }"
        >
          <slot name="master-detail" :data="masterRow"></slot>
        </template>

        <template #checkboxExpandTemplate>
          <DxCheckBox
            id="autoExpand"
            @valueChanged="handleExpandAllChange"
            v-model="autoExpandAll"
            text="Expand All Groups"
            :elementAttr="{ class: 'expand-all-checkbox' }"
          />
        </template>

        <template
          #action-cell-template="{ data: templateOptions }"
          v-if="showActionColumn"
        >
          <div class="flex gap-2 justify-center items-center">
            <button
              v-if="showEditAction"
              @click.stop.prevent="handleEdit(templateOptions)"
              class="inline-flex items-center justify-center w-8 h-8 text-blue-500 hover:text-blue-700 transition-colors duration-200"
              :title="editActionTitle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              v-if="showDeleteAction"
              @click.stop.prevent="handleDelete(templateOptions)"
              class="inline-flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 transition-colors duration-200"
              :title="deleteActionTitle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16"
                />
              </svg>
            </button>
            <button
              v-for="(action, index) in customActions"
              :key="`action-${index}`"
              @click.stop.prevent="action.handler(templateOptions)"
              :class="
                action.class ||
                'inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 transition-colors duration-200'
              "
              :title="action.title"
            >
              <component
                :is="action.icon"
                v-if="typeof action.icon === 'object'"
                class="w-4 h-4"
              />
              <div
                v-else-if="typeof action.icon === 'string'"
                v-html="action.icon"
                class="w-4 h-4"
              ></div>
            </button>
          </div>
        </template>

        <template
          v-for="template in customCellTemplates"
          :key="template.name"
          v-slot:[template.name]="templateData"
        >
          <component
            :is="template.component"
            :data="templateData"
            v-bind="template.props"
          />
        </template>

        <slot />
      </DxDataGrid>
      <DxPopup
        :visible="filterListPopupVisible"
        :show-title="true"
        title="Filter List"
        :width="260"
        :height="undefined"
        :shading="false"
        :position="{
          my: 'right top',
          at: 'right bottom',
          of: '.filter-list-button',
          offset: '0 5',
        }"
        :onHidden="
          () => {
            filterListPopupVisible = false;
          }
        "
      >
        <template #contentTemplate>
          <div class="p-4 space-y-4">
            <div class="flex justify-between items-center">
              <div>Search Panel</div>
              <DxCheckBox
                :value="filterSettings.showSearchPanel"
                @valueChanged="() => toggleFilterOption('showSearchPanel')"
              />
            </div>

            <div class="flex justify-between items-center">
              <div>Filter Row</div>
              <DxCheckBox
                :value="filterSettings.showFilterRow"
                @valueChanged="() => toggleFilterOption('showFilterRow')"
              />
            </div>

            <div class="flex justify-between items-center">
              <div>Header Filter</div>
              <DxCheckBox
                :value="filterSettings.showHeaderFilter"
                @valueChanged="() => toggleFilterOption('showHeaderFilter')"
              />
            </div>
          </div>
        </template>
      </DxPopup>
    </div>
    <div class="sp-footer-hidden">
      {{ spFooterText }}
    </div>

    <!-- Context Menu untuk klik kanan (custom, lebih reliable) -->
    <Teleport to="body">
      <!-- Overlay untuk tutup context menu saat klik di luar -->
      <div
        v-if="contextMenuVisible"
        class="context-menu-overlay"
        @click="contextMenuVisible = false"
        @contextmenu.prevent="contextMenuVisible = false"
      ></div>
      
      <!-- Context Menu -->
      <div
        v-if="contextMenuVisible"
        class="datagrid-context-menu"
        :style="{
          left: contextMenuPosition.x + 'px',
          top: contextMenuPosition.y + 'px',
        }"
        @click.stop
        @contextmenu.stop
      >
        <div
          v-for="item in contextMenuItems"
          :key="item.action"
          class="context-menu-item"
          :class="{ 'disabled': item.disabled }"
          @click.stop="handleMenuItemClick(item)"
        >
          <span class="context-menu-icon">
            <Copy v-if="item.action === 'copy'" :size="15" :stroke-width="2" />
            <MoveHorizontal v-else-if="item.action === 'autoFit'" :size="15" :stroke-width="2" />
            <Columns3 v-else-if="item.action === 'columnChooser'" :size="15" :stroke-width="2" />
          </span>
          <span class="context-menu-text">{{ item.text }}</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import {
  DxDataGrid,
  DxFilterRow,
  DxSelection,
  DxSearchPanel,
  DxEditing,
  DxPager,
  DxPaging,
  DxToolbar,
  DxItem,
  DxScrolling,
  DxColumn,
  DxColumnFixing,
  DxExport,
  DxHeaderFilter,
  DxSummary,
  DxTotalItem,
  DxRowDragging,
  DxGrouping,
  DxGroupPanel,
  DxGroupItem,
  DxColumnChooser,
  DxPosition,
  DxMasterDetail,
  DxFilterPanel,
  DxFilterBuilderPopup,
} from "devextreme-vue/data-grid";
import DxCheckBox from "devextreme-vue/check-box";
import { Copy, MoveHorizontal, Columns3 } from "lucide-vue-next";
import { Workbook } from "exceljs";
import { exportDataGrid } from "devextreme/excel_exporter";
import { saveAs } from "file-saver-es";
import debounce from "lodash.debounce";
import DxPopup from "devextreme-vue/popup";

export default {
  name: "DataGrid",
  components: {
    DxDataGrid,
    DxFilterRow,
    DxSelection,
    DxSearchPanel,
    DxEditing,
    DxPager,
    DxPaging,
    DxToolbar,
    DxItem,
    DxScrolling,
    DxColumn,
    DxColumnFixing,
    DxExport,
    DxHeaderFilter,
    DxSummary,
    DxTotalItem,
    DxRowDragging,
    DxGrouping,
    DxGroupPanel,
    DxGroupItem,
    DxCheckBox,
    DxColumnChooser,
    DxPopup,
    DxMasterDetail,
    DxFilterPanel,
    DxFilterBuilderPopup,
    Copy,
    MoveHorizontal,
    Columns3,
  },
  data() {
    return {
      searchValue: "",
      dataGridRef: null,
      focusedRowKey: null,
      // dataSource: [],
      tempPageNumber: this.page,
      isExporting: false,
      autoExpandAll: true,
      isColumnGrouped: false,
      showFilterRow: false,
      filterListPopupVisible: false,
      filterSettings: {
        showSearchPanel: false,
        showFilterRow: false,
        showHeaderFilter: false,
      },
      // 🔥 Tracking lebar layar untuk deteksi mobile (dipakai untuk swipe & toolbar responsif)
      windowWidth: typeof window !== "undefined" ? window.innerWidth : 1024,
      filterBuilderPopupPosition: {
        of: typeof window !== "undefined" ? window : undefined,
        at: "center",
        my: "center",
        offset: { y: 10 },
      },
      // Context menu state
      contextMenuVisible: false,
      contextMenuPosition: { x: 0, y: 0 },
      contextMenuCellData: null,
    };
  },

  props: {
    spFooterText: {
      type: String,
      default: "",
    },
    useBuiltInPager: {
      type: Boolean,
      default: false,
    },

    groupFields: {
      type: Array,
      default: () => [],
    },

    summaries: {
      type: Array,
      default: () => [],
    },

    avg: {
      type: Array,
      default: () => [],
    },

    disablecol: {
      type: Array,
      default: () => [],
    },

    dataSource: {
      type: Array,
      required: true,
    },

    keyExpr: {
      type: String,
      default: "",
    },

    columns: {
      type: Array,
      default: [],
    },

    height: {
      type: String,
      default: "calc(100vh - 220px)",
    },
    wordwrap: {
      type: Boolean,
      default: false,
    },
    columnAutoWidth: {
      type: Boolean,
      default: true,
    },
    allowColumnResizing: {
      type: Boolean,
      default: true,
    },
    allowColumnReordering: {
      type: Boolean,
      default: true,
    },
    showBorders: {
      type: Boolean,
      default: true,
    },
    focusedRowEnabled: {
      type: Boolean,
      default: true,
    },
    rowAlternationEnabled: {
      type: Boolean,
      default: true,
    },
    hoverStateEnabled: {
      type: Boolean,
      default: true,
    },

    scrollingMode: {
      type: String,
      default: "standard",
    },
    showScrollbar: {
      type: String,
      default: "always",
    },
    columnRenderingMode: {
      type: String,
      default: "standard",
    },
    rowRenderingMode: {
      type: String,
      default: "standard",
    },
    showFilterPanel: {
      type: Boolean,
      default: false,
    },
    showToolbar: {
      type: Boolean,
      default: false,
    },
    showAddButton: {
      type: Boolean,
      default: true,
    },
    showPrintButton: {
      type: Boolean,
      default: true,
    },

    showRefreshButton: {
      type: Boolean,
      default: false,
    },
    showExportButton: {
      type: Boolean,
      default: true,
    },
    customToolbarItems: {
      type: Array,
      default: () => [],
    },
    showSearchPanel: {
      type: Boolean,
      default: true,
    },
    customsearch: {
      type: Boolean,
      default: false,
    },
    searchPanelWidth: {
      type: Number,
      default: 150,
    },
    searchPlaceholder: {
      type: String,
      default: "Cari data...",
    },
    showPager: {
      type: Boolean,
      default: true,
    },
    pageSize: {
      type: Number,
      default: 0,
    },
    allowedPageSizes: {
      type: Array,
      default: () => [5, 10, "all"],
    },
    showPageSizeSelector: {
      type: Boolean,
      default: true,
    },
    showNavigationButtons: {
      type: Boolean,
      default: true,
    },
    showFilterRow: {
      type: Boolean,
      default: false,
    },
    showFilterButton: {
      type: Boolean,
      default: true,
    },
    allowUpdating: {
      type: Boolean,
      default: false,
    },
    allowDeleting: {
      type: Boolean,
      default: false,
    },
    allowAdding: {
      type: Boolean,
      default: false,
    },
    showActionColumn: {
      type: Boolean,
      default: true,
    },
    actionColumnWidth: {
      type: Number,
      default: 110,
    },
    actionColumnPosition: {
      type: String,
      default: "right",
      validator: (value) => ["left", "right"].includes(value),
    },
    pinActionColumnRight: {
      type: Boolean,
      default: false,
    },
    showEditAction: {
      type: Boolean,
      default: true,
    },
    showDeleteAction: {
      type: Boolean,
      default: true,
    },
    editActionTitle: {
      type: String,
      default: "Edit Data",
    },
    deleteActionTitle: {
      type: String,
      default: "Hapus Data",
    },
    customActions: {
      type: Array,
      default: () => [],
    },

    customCellTemplates: {
      type: Array,
      default: () => [],
    },

    isRefreshing: {
      type: Boolean,
      default: false,
    },

    addButtonText: {
      type: String,
    },
    onAddButtonEscape: {
      type: Function,
      default: null,
    },
    refreshButtonText: {
      type: String,
    },
    exportButtonText: {
      type: String,
    },

    pageTitle: {
      type: String,
      default: "DataGrid",
    },
    columnHidingEnabled: {
      type: Boolean,
      default: false,
    },
    page: {
      type: Number,
      default: 1,
    },
    maxPage: {
      type: Number,
      default: 1,
    },

    showGroupPanel: {
      type: Boolean,
      default: false,
    },
    allowGrouping: {
      type: Boolean,
      default: true,
    },
    masterDetailEnabled: {
      type: Boolean,
      default: false,
    },
    selectedRowKeys: {
      type: Array,
      default: () => [],
    },
    showSelection: {
      type: Boolean,
      default: false,
    },
    selectionMode: {
      type: String,
      default: "multiple",
    },
    selectAllMode: {
      type: String,
      default: "allPages",
    },
    showCheckBoxesMode: {
      type: String,
      default: "always",
    },
  },

  computed: {
    isFocusEnabled() {
      return Array.isArray(this.dataSource) && this.dataSource.length > 0;
    },

    // 🔥 Deteksi mobile berdasarkan lebar layar
    isMobile() {
      return this.windowWidth < 768;
    },

    // 🔥 Native scroll di mobile (smooth untuk swipe jari), custom scroll di desktop
    useNativeScrolling() {
      return this.isMobile;
    },

    customSearchOptions() {
      return {
        placeholder: "Cari ...",
        mode: "text",
        showClearButton: true,
        value: this.searchValue,
        valueChangeEvent: "input",
        onValueChanged: (e) => {
          this.searchValue = e.value;
          this.fetchData(e.value);
        },
        onInitialized: (e) => {
          if (this.searchValue) {
            this.$nextTick(() => {
              e.component.focus();
            });
          }
        },
      };
    },

    addButtonOptions() {
      return {
        icon: "plus",
        type: "default",
        stylingMode: "contained",
        text: this.addButtonText,
        hint: "Tambah Data",
        elementAttr: { class: "add-button", id: "btnAddData" },
        onClick: () => this.$emit("add-click"),

        onKeyDown: (e) => {
          const key = e?.event?.key || e?.key;

          if (
            key === "Escape" &&
            typeof this.onAddButtonEscape === "function"
          ) {
            e?.event?.preventDefault?.();
            this.onAddButtonEscape();
          }
        },
      };
    },

    refreshButtonOptions() {
      return {
        icon: "refresh",
        type: "default",
        stylingMode: "contained",
        text: this.refreshButtonText,
        hint: "Muat ulang data",
        elementAttr: { class: "refresh-button" },
        onClick: () => this.$emit("refresh-click"),
      };
    },

    exportButtonOptions() {
      return {
        icon: "export",
        type: "default",
        stylingMode: "contained",
        text: this.exportButtonText,
        hint: "Ekspor ke Excel",
        elementAttr: { class: "export-button" },
        disabled: this.isExporting || !this.dataSource.length,
        onClick: () => {
          this.exportToExcel();
        },
      };
    },

    printButtonOptions() {
      return {
        icon: "print",
        type: "default",
        stylingMode: "contained",
        hint: "Print Data",
        elementAttr: { class: "print-button" },
        disabled: !this.dataSource.length,
        onClick: () => {
          if (!this.dataSource.length) return;
          this.$emit("print-click");
        },
      };
    },

    filterListButtonOptions() {
      return {
        icon: "fields",
        type: "default",
        stylingMode: "contained",
        hint: "Filter List",
        elementAttr: { class: "filter-list-button" },
        onClick: debounce(
          () => {
            if (!this.filterListPopupVisible) {
              this.filterListPopupVisible = true;
            }
          },
          150,
          { leading: true, trailing: false },
        ),
      };
    },

    filterButtonOptions() {
      return {
        icon: "rowfield",
        type: "default",
        stylingMode: "contained",
        text: "",
        hint: "Toggle Filter Row",
        elementAttr: { class: "filter-button" },
        onClick: () => {
          this.showFilterRow = !this.showFilterRow;
          const grid = this.getGridInstance();
          if (grid) {
            grid.option("filterRow.visible", this.showFilterRow);
          }
        },
      };
    },

    // 🔥 Kolom-kolom hasil olahan: deteksi prefix "dec" (desimal), "sum"/"avg" (dibulatkan)
    computedColumns() {
      let cols = [];

      if (this.columns && this.columns.length > 0) {
        cols = this.columns.map((col) => {
          const dataField = col.dataField || "";
          const normalizedKey = dataField
            .toString()
            .toLowerCase()
            .replace(/[\s_]/g, "");
          const colAlignment = this.getColumnAlignment(col);

          // 🔥 Deteksi prefix berlapis ("sum"+"dec", "avg"+"dec", dll)
          const meta = this.parseFieldMeta(dataField);
          const decimals =
            col.decimals !== undefined ? col.decimals : meta.decimals;
          const caption =
            col.caption !== undefined ? col.caption : meta.caption;

          return {
            ...col,
            caption,
            decimals,
            alignment: colAlignment,
            visible:
              col.visible !== undefined
                ? col.visible
                : ![...this.disablecol, "id"].includes(col.dataField) &&
                  !["keyindex", "pagetotal"].includes(normalizedKey),
          };
        });
      } else {
        if (!this.dataSource.length) return [];

        const allKeysSet = new Set();
        this.dataSource.forEach((item) => {
          if (item && typeof item === "object") {
            Object.keys(item).forEach((key) => allKeysSet.add(key));
          }
        });

        cols = Array.from(allKeysSet).map((key) => {
          // 🔥 Deteksi prefix berlapis ("sum"+"dec", "avg"+"dec", dll)
          const meta = this.parseFieldMeta(key);
          const caption = meta.caption;
          const decimals = meta.decimals;

          const normalizedKey = (key || "")
            .toString()
            .toLowerCase()
            .replace(/[\s_]/g, "");
          const colAlignment = this.getColumnAlignment({ dataField: key });

          return {
            dataField: key,
            caption: caption,
            decimals,
            alignment: colAlignment,
            visible:
              ![...this.disablecol].includes(key) &&
              !["keyindex", "pagetotal", "id"].includes(normalizedKey),
          };
        });
      }

      if (this.showActionColumn) {
        const actionColumn = {
          caption: "Actions",
          width: this.actionColumnWidth,
          allowSorting: false,
          allowFiltering: false,
          allowReordering: false,
          alignment: "center",
          cellTemplate: "action-cell-template",
          fixed: this.pinActionColumnRight,
          fixedPosition: this.pinActionColumnRight ? "right" : undefined,
        };

        if (this.actionColumnPosition === "left") {
          cols.unshift(actionColumn);
        } else {
          cols.push(actionColumn);
        }
      }

      if (this.groupFields && this.groupFields.length > 0) {
        cols.forEach((col) => {
          delete col.groupIndex;
          delete col.sortOrder;
        });

        this.groupFields.forEach((field, index) => {
          const target = cols.find((c) => c.dataField === field);
          if (target) {
            target.groupIndex = index;
            target.sortOrder = "asc";
            target.groupExpanded = false;
          }
        });
      }

      return cols;
    },

    // 🔥 Lookup cepat dataField -> jumlah desimal, dipakai di onCellPrepared & formatSummary
    columnDecimalsMap() {
      const map = {};
      this.computedColumns.forEach((col) => {
        if (col.dataField) {
          map[col.dataField] = col.decimals ?? 0;
        }
      });
      return map;
    },

    // Context menu items untuk klik kanan
    contextMenuItems() {
      const cellValue = this.contextMenuCellData?.value;
      const displayValue = cellValue !== null && cellValue !== undefined 
        ? String(cellValue).substring(0, 30) + (String(cellValue).length > 30 ? "..." : "")
        : "";

      return [
        {
          text: `Salin: "${displayValue}"`,
          action: "copy",
          disabled: cellValue === null || cellValue === undefined,
        },
        {
          text: "Ukuran Kolom Otomatis",
          action: "autoFit",
        },
        {
          text: "Pemilih Kolom",
          action: "columnChooser",
        },
      ];
    },
  },

  watch: {
    $route() {
      this.filterListPopupVisible = false;
    },
    dataSource: {
      handler(newVal) {},
      immediate: true,
    },
    page: {
      handler(newPage) {
        this.tempPageNumber = newPage;
      },
      immediate: true,
    },
    groupFields(e) {},
  },

  emits: [
    "add-click",
    "refresh-click",
    "edit-click",
    "delete-click",
    "row-removing",
    "option-changed",
    "focused-row-changed",
    "nextpage",
    "prevpage",
    "gotoPage",
    "caridata",
    "export-start",
    "export-complete",
    "export-error",
    "group-changed",
    "contentready",
  ],

  methods: {
    // 🔥 Strip prefix berlapis dari nama field: "sum", "avg", "dec" bisa muncul
    // dalam kombinasi & urutan apa pun (mis. "sumdecPersen_QEkor", "decavgFoo").
    // Kalau prefix "dec" pernah ketemu di salah satu lapisan, kolom dianggap desimal.
    parseFieldMeta(key) {
      let caption = (key || "").toString();
      let hasDec = false;
      let stripped = true;

      while (stripped) {
        stripped = false;
        if (caption.startsWith("dec")) {
          hasDec = true;
          caption = caption.substring(3);
          stripped = true;
        } else if (caption.startsWith("sum") || caption.startsWith("avg")) {
          caption = caption.substring(3);
          stripped = true;
        }
      }

      return { caption, decimals: hasDec ? 2 : 0 };
    },
    focusGrid() {
      const grid = this.getGridInstance();
      if (!grid) return;

      const element = grid.element();
      if (element) {
        element.setAttribute("tabindex", "0");
        element.focus();
      }
    },
    isNumericLike(value) {
      if (value === null || value === undefined || value === "") return false;
      if (typeof value === "number") return !isNaN(value);
      if (typeof value !== "string") return false;

      const trimmed = value.trim();
      if (!trimmed) return false;

      if (/[a-zA-Z]/.test(trimmed)) return false;

      const clean = trimmed.replace(/[\s\u00A0\u202F]/g, "");
      if (!clean || clean === "-" || clean === ".") return false;

      if (/^0[0-9]/.test(clean)) return false;

      const hasDot = clean.includes(".");
      const hasComma = clean.includes(",");
      const normalized =
        hasDot && hasComma
          ? clean.replace(/\./g, "").replace(/,/g, ".")
          : hasComma
            ? clean.replace(/,/g, "")
            : clean;

      return !isNaN(normalized);
    },
    getColumnAlignment(column) {
      if (column?.alignment) return column.alignment;
      if (column?.dataType === "number") return "right";

      const field = column?.dataField;
      if (!field) return "left";

      const sample = this.dataSource?.find((item) => {
        const value = item?.[field];
        return value !== null && value !== undefined && value !== "";
      })?.[field];

      return this.isNumericLike(sample) ? "right" : "left";
    },

    // 🔥 columnName di-pass eksplisit dari template supaya tau desimal kolom mana yang dipakai
    formatSummary(e, columnName) {
      if (e.value === null || e.value === undefined) return "";
      const val = Number(e.value);
      if (isNaN(val)) return e.value;

      const decimals = this.columnDecimalsMap[columnName] ?? 0;
      return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      }).format(val);
    },

    handlecontentready(e) {
      this.$emit("contentready", e);
      this.$nextTick(() => {
        const grid = e.component || this.getInstance();
        if (grid) {
          this.applyFilterOptionsToGrid();
          setTimeout(() => {
            grid.updateDimensions();
            if (!this.isMobile) {
              this.autoFitGridWidth(grid);
            }
          }, 100);
        }
      });
    },
    applyFilterOptionsToGrid() {
      const grid = this.getGridInstance();
      if (!grid) return;

      grid.option("searchPanel.visible", this.filterSettings.showSearchPanel);
      grid.option("filterRow.visible", this.filterSettings.showFilterRow);
      grid.option("headerFilter.visible", this.filterSettings.showHeaderFilter);

      setTimeout(() => {
        try {
          grid.updateDimensions();
        } catch (e) {}
      }, 50);
    },

    toggleFilterOption(key) {
      this.filterSettings[key] = !this.filterSettings[key];
      this.applyFilterOptionsToGrid();
    },

    getInstance() {
      return this.$refs.dataGridRef.instance;
    },
    resetGrid() {
      const grid = this.$refs.dataGridRef.instance;

      if (grid) {
        grid.clearFilter();
        grid.clearSorting();
        grid.clearGrouping();
        grid.searchByText("");
        grid.state(null);
      }
    },
    handleOptionChanged(e) {
      this.$emit("option-changed", e);
    },

    handleExpandAllChange(e) {
      const grid = this.getGridInstance();
      if (grid) {
        if (e.value) {
          grid.expandAll();
        } else {
          grid.collapseAll();
        }
      }
    },

    async exportToExcel() {
      if (this.isExporting) return;

      try {
        this.isExporting = true;
        this.$emit("export-start");

        const grid = this.getGridInstance();
        if (!grid) {
          throw new Error("Grid instance not found");
        }
        if (!this.dataSource || this.dataSource.length === 0) {
          throw new Error("Tidak ada data untuk diexport");
        }
        let pageName = this.getPageName();

        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet(pageName);
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        const timestamp = `${year}-${month}-${day} at ${hours}.${minutes}.${seconds}`;
        const fileName = `${pageName} ${timestamp}.xlsx`;

        await exportDataGrid({
          component: grid,
          worksheet: worksheet,
          autoFilterEnabled: true,
        });

        const buffer = await workbook.xlsx.writeBuffer();

        saveAs(
          new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
          fileName,
        );

        this.$emit("export-complete", fileName);
        console.log(`Export berhasil: ${fileName}`);
      } catch (error) {
        console.error("Error during export:", error);
        this.$emit("export-error", error);
        if (
          window.DevExpress &&
          window.DevExpress.ui &&
          window.DevExpress.ui.notify
        ) {
          window.DevExpress.ui.notify(
            `Export gagal: ${error.message}`,
            "error",
            3000,
          );
        } else {
          alert(`Export gagal: ${error.message}`);
        }
      } finally {
        this.isExporting = false;
      }
    },

    getPageName() {
      // 1. Prioritas: title dari meta route (paling reliable, reactive)
      if (this.$route?.meta?.title) {
        return this.$route.meta.title;
      }

      // 2. Fallback: nama route
      if (this.$route?.name) {
        return this.$route.name;
      }

      try {
        const activeTabSelectors = [
          ".active:not(.dx-state-disabled)",
          '[aria-selected="true"]',
          ".selected",
          ".tab-active",
          ".is-active",
          ".nav-tabs .nav-link.active",
          ".nav-item.active .nav-link",
          'button[aria-selected="true"]',
        ];

        for (const selector of activeTabSelectors) {
          const activeTab = document.querySelector(selector);
          if (activeTab) {
            let tabText = activeTab.textContent?.trim();
            if (tabText && tabText !== "" && !tabText.includes("×")) {
              tabText = tabText.replace(/×/g, "").replace(/\s+/g, " ").trim();
              if (tabText && tabText.length > 0) {
                return tabText;
              }
            }
          }
        }

        if (this.pageTitle && this.pageTitle !== "DataGrid") {
          return this.pageTitle;
        }

        const titleSelectors = [
          "h1",
          ".page-title",
          ".breadcrumb-item.active",
          ".content-header h1",
          ".main-title",
        ];

        for (const selector of titleSelectors) {
          const titleElement = document.querySelector(selector);
          if (titleElement) {
            const titleText = titleElement.textContent?.trim();
            if (titleText && titleText.length > 0) {
              return titleText;
            }
          }
        }

        const pathName = window.location.pathname;
        const pathSegments = pathName
          .split("/")
          .filter((segment) => segment.length > 0);
        if (pathSegments.length > 0) {
          const lastSegment = pathSegments[pathSegments.length - 1];
          return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
        }
      } catch (error) {
        console.log("Error getting page name:", error);
      }
      return "DataGrid";
    },

    onGridInit(e) {
      if (this.showActionColumn == true) {
        e.component.addColumn({
          caption: "Actions",
          width: this.actionColumnWidth,
          allowSorting: false,
          allowFiltering: false,
          allowReordering: false,
          alignment: "center",
          cellTemplate: "action-cell-template",
        });
      }
    },

    prevPage() {
      this.$emit("prevpage");
    },
    nextPage() {
      this.$emit("nextpage");
    },

    fetchData($a) {
      this.$emit("caridata", $a);
    },

    goToPage() {
      const targetPage = Number(this.tempPageNumber);
      if (!targetPage || targetPage < 1 || targetPage > this.maxPage) {
        this.tempPageNumber = this.page;
        return;
      }
      this.$emit("gotoPage", targetPage);
    },

    startPageEdit() {
      this.tempPageNumber = this.page;
      this.isEditingPage = true;
    },
    cancelPageEdit() {
      this.isEditingPage = false;
      this.tempPageNumber = this.page;
    },
    async onExporting(e) {
      e.cancel = true;
      await this.exportToExcel();
    },

    // 🔥 Format angka per-cell sesuai jumlah desimal kolomnya (dari columnDecimalsMap)
    onCellPrepared(e) {
      if (e.rowType === "data" && e.column) {
        const alignment = e.column.alignment || "left";
        e.cellElement.style.textAlign = alignment;

        if (typeof e.value === "number") {
          const decimals = this.columnDecimalsMap[e.column.dataField] ?? 0;
          e.cellElement.innerText = new Intl.NumberFormat("id-ID", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }).format(e.value);
        }
      }

      if (e.rowType === "header" && e.column) {
        const alignment = e.column.alignment || "left";
        e.cellElement.style.textAlign = alignment;
      }
    },

    onRowReorder(e) {
      const draggedItem = this.dataSource.splice(e.fromIndex, 1)[0];
      this.dataSource.splice(e.toIndex, 0, draggedItem);

      e.component.refresh();

      this.$emit("row-reordered", this.dataSource);
    },

    onRowPrepared(e) {
      if (e.rowType === "data" && e.data) {
        if (e.data.isParent) {
          e.rowElement.style.backgroundColor = "#f0f8ff";
          e.rowElement.style.fontWeight = "bold";
        } else if (e.data.level > 0) {
          e.rowElement.style.backgroundColor = "#fafafa";
          e.rowElement.style.paddingLeft = "20px";
        }
      }
    },

    handleRowRemoving(e) {
      this.$emit("row-removing", e);
    },
    handleFocusedRowChanged(e) {
      this.focusedRowKey = e.row ? e.row.key : null;
      this.$emit("focused-row-changed", e);
    },
    handleEdit(templateOptions) {
      this.$emit("edit-click", templateOptions);
    },
    handleDelete(templateOptions) {
      this.$emit("delete-click", templateOptions);
    },
    getGridInstance() {
      return this.$refs.dataGridRef?.instance;
    },
    navigateToRow(key) {
      const grid = this.getGridInstance();
      if (grid && key) {
        setTimeout(() => {
          try {
            grid.option("focusedRowKey", key);
            const rowIndex = grid.getRowIndexByKey(key);
            if (rowIndex >= 0) {
              grid.navigateToRow(key);
            }
            this.focusedRowKey = key;
          } catch (error) {
            console.log("Error navigating to row:", error);
          }
        }, 500);
      }
    },
    refreshGrid() {
      const grid = this.getGridInstance();
      if (grid) {
        grid.refresh();
      }
    },
    clearSelection() {
      const grid = this.getGridInstance();
      if (grid) {
        grid.clearSelection();
      }
    },
    getSelectedRowsData() {
      const grid = this.getGridInstance();
      return grid ? grid.getSelectedRowsData() : [];
    },

    // 🔥 Update lebar layar saat resize (dipakai untuk isMobile / useNativeScrolling)
    handleWindowResize() {
      this.windowWidth = window.innerWidth;
    },

    autoFitGridWidth(grid) {
      const gridElement = this.$refs.dataGridRef?.$el;
      if (!gridElement) return;

      const headerTable = gridElement.querySelector(
        ".dx-datagrid-headers table",
      );
      if (!headerTable) return;

      // Hitung total lebar asli dari semua <col> di header (sudah auto-fit oleh DevExtreme)
      const cols = headerTable.querySelectorAll("colgroup col");
      let totalWidth = 0;
      cols.forEach((col) => {
        totalWidth += col.offsetWidth || 0;
      });

      const scrollableEl = gridElement.querySelector(".dx-datagrid-rowsview");
      const containerWidth = gridElement.parentElement?.clientWidth || 0;

      if (totalWidth > 0 && totalWidth < containerWidth) {
        // Konten lebih kecil dari container -> jangan biarkan grid stretch full width
        gridElement.style.width = totalWidth + "px";
      } else {
        // Konten lebih besar -> biarkan full width + scroll horizontal
        gridElement.style.width = "100%";
      }
    },

    // 🔥 Handle klik kanan pada cell datagrid
    onContextMenuPreparing(e) {
      // Hanya tampilkan context menu untuk data row (bukan header/footer)
      if (e.row?.rowType !== "data") {
        e.items = []; // Kosongkan items = tidak tampilkan context menu
        return;
      }

      // Simpan data cell yang diklik
      // 🔥 CATATAN: event contextMenuPreparing TIDAK menyediakan e.value,
      // jadi nilai cell diambil dari row.data berdasarkan dataField kolomnya
      const dataField = e.column?.dataField;
      let cellValue;

      if (dataField) {
        cellValue = e.row?.data?.[dataField];
      } else {
        // Fallback untuk kolom tanpa dataField (mis. kolom Actions): ambil teks dari DOM
        cellValue = e.targetElement?.textContent?.trim();
      }

      this.contextMenuCellData = {
        value: cellValue,
        column: e.column,
        row: e.row,
        data: e.row?.data,
      };

      // Set posisi context menu berdasarkan posisi klik mouse
      if (e.event) {
        // Ambil koordinat mouse dari event
        const mouseEvent = e.event.originalEvent || e.event;
        const x = mouseEvent.clientX || mouseEvent.pageX || 0;
        const y = mouseEvent.clientY || mouseEvent.pageY || 0;
        
        // Pastikan context menu tidak keluar dari viewport
        const menuWidth = 220; // perkiraan lebar menu
        const menuHeight = 120; // perkiraan tinggi menu (3 items)
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let posX = x + 2;
        let posY = y + 2;
        
        // Adjust kalau melebihi viewport kanan
        if (posX + menuWidth > viewportWidth) {
          posX = viewportWidth - menuWidth - 10;
        }
        
        // Adjust kalau melebihi viewport bawah
        if (posY + menuHeight > viewportHeight) {
          posY = viewportHeight - menuHeight - 10;
        }
        
        this.contextMenuPosition = { x: posX, y: posY };
      }

      // Kosongkan items bawaan DevExtreme (kita pakai custom)
      e.items = [];

      // Tampilkan context menu custom
      this.contextMenuVisible = true;
    },

    // Handle klik item di context menu
    handleMenuItemClick(item) {
      // Jangan lakukan apa-apa kalau item disabled
      if (item?.disabled) return;
      
      const action = item?.action;
      if (!action) return;

      // Jalankan action
      switch (action) {
        case "copy":
          this.copyCellValue();
          break;
        case "autoFit":
          this.autoFitColumn();
          break;
        case "columnChooser":
          this.showColumnChooser();
          break;
      }

      // Sembunyikan context menu setelah klik
      this.contextMenuVisible = false;
    },

    // Salin isi cell ke clipboard
    async copyCellValue() {
      const value = this.contextMenuCellData?.value;
      if (value === null || value === undefined) return;

      try {
        await navigator.clipboard.writeText(String(value));
        this.showCopyNotification();
      } catch (err) {
        // Fallback untuk browser lama
        const textArea = document.createElement("textarea");
        textArea.value = String(value);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        this.showCopyNotification();
      }
    },

    // Auto-fit kolom yang diklik
    autoFitColumn() {
      const grid = this.getGridInstance();
      const column = this.contextMenuCellData?.column;
      if (!grid || !column?.dataField) return;

      // Gunakan method autoFitColumn dari DevExtreme
      grid.autoFitColumn(column.dataField);
    },

    // Tampilkan column chooser
    showColumnChooser() {
      const grid = this.getGridInstance();
      if (!grid) return;

      grid.showColumnChooser();
    },

    // Notifikasi copy berhasil
    showCopyNotification() {
      if (window.DevExpress?.ui?.notify) {
        window.DevExpress.ui.notify(
          "Disalin ke clipboard!",
          "success",
          1500
        );
      }
    },
  },

  mounted() {
    window.addEventListener("resize", this.handleWindowResize);

    this.$nextTick(() => {
      const gridElement = this.$refs.dataGridRef?.$el;
      if (gridElement) {
        const headerContainer = gridElement.querySelector(
          ".dx-datagrid-headers",
        );
        const headerScrollContainer = gridElement.querySelector(
          ".dx-datagrid-headers .dx-datagrid-scroll-container",
        );

        if (headerScrollContainer) {
          headerScrollContainer.addEventListener("scroll", (e) => {
            e.target.scrollLeft = 0;
          });
        }

        const headerElements = gridElement.querySelectorAll(
          ".dx-datagrid-headers, .dx-datagrid-headers *",
        );
        headerElements.forEach((el) => {
          el.addEventListener(
            "wheel",
            (e) => {
              if (e.deltaX !== 0) {
                e.preventDefault();
                e.stopPropagation();
              }
            },
            { passive: false },
          );
        });
      }
    });
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
  },

  expose: ["getInstance", "resetGrid", "focusGrid"],
};
</script>

<style scoped>
:deep(.dx-datagrid-header-panel) {
  overflow: hidden !important;
}

:deep(.dx-datagrid-headers)::-webkit-scrollbar {
  display: none !important;
}

:deep(.dx-datagrid-rowsview .dx-row.dx-state-hover td) {
  background-color: #acb3b9 !important;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

:deep(.dx-datagrid-rowsview .dx-row-alt.dx-state-hover td) {
  background-color: #acb3b9 !important;
}

:deep(.dx-datagrid-rowsview .dx-row.dx-state-hover td:first-child) {
  border-left: 3px solid #1890ff !important;
}

:deep(.dx-datagrid-rowsview .dx-row.dx-state-focused td) {
  background-color: #acb3b9 !important;
}

:deep(.dx-datagrid) {
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  border: none !important;
  background: #fff;
}

:deep(.dx-datagrid-headers .dx-datagrid-table .dx-header-row td) {
  background-color: #ffffff !important;
  color: #111827 !important;
  font-size: 13px;
  font-weight: 700 !important;
  letter-spacing: 0.02em;
  border-bottom: 1px solid var(--color-cool-grey-bg) !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  padding: 12px 16px !important;
}

:deep(.dx-datagrid-headers .dx-datagrid-table .dx-header-row td:hover) {
  background-color: #acb3b9 !important;
  color: #374151 !important;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

:deep(.dx-datagrid-rowsview .dx-row td) {
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: 1px solid #f3f4f6 !important;
  padding: 16px 16px !important;
  vertical-align: middle !important;
  color: #111827;
}

/* Row alternation (zebra) */
:deep(.dx-datagrid-rowsview .dx-row.dx-data-row) td {
  background-color: #ffffff;
}

:deep(.dx-datagrid-rowsview .dx-row-alt.dx-data-row) td {
  background-color: #ebebf4 !important;
}

:deep(.dx-datagrid-rowsview .dx-row td:nth-child(1)) {
  font-weight: 700;
  color: #111827;
}

:deep(.dx-datagrid-rowsview .dx-row.dx-state-hover td:first-child) {
  border-left: none !important;
}

:deep(.dx-datagrid-rowsview .dx-data-row td) {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}

:deep(.dx-datagrid-rowsview .dx-selection.dx-row:not(.dx-row-focused) > td),
:deep(
  .dx-datagrid-rowsview .dx-selection.dx-row:not(.dx-row-focused):hover > td
),
:deep(.dx-datagrid-rowsview .dx-row-focused.dx-data-row > td) {
  background-color: #acb3b9 !important;
  color: white !important;
}

:deep(.dx-datagrid-borders > .dx-datagrid-headers),
:deep(.dx-datagrid-borders > .dx-datagrid-rowsview),
:deep(.dx-datagrid-borders > .dx-datagrid-total-footer) {
  border-left: none !important;
  border-right: none !important;
}

:deep(.dx-datagrid-total-footer .dx-row td),
:deep(.dx-datagrid-group-footer .dx-row td) {
  padding-left: 16px !important;
  padding-right: 16px !important;
  text-align: right !important;
}

:deep(.dx-datagrid-rowsview .status-badge) {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  background-color: #f3f4f6;
  color: #6b7280;
}

/* Toolbar DevExtreme - samakan ukuran dengan toolbar custom app */
:deep(.dx-toolbar) {
  min-height: 32px !important;
}

:deep(.dx-toolbar-items-container) {
  height: 32px !important;
}

:deep(.dx-toolbar .dx-button) {
  height: 28px !important;
  min-width: 28px !important;
}

:deep(.dx-toolbar .dx-button .dx-icon) {
  font-size: 14px !important;
  width: 14px !important;
  height: 14px !important;
}

:deep(.dx-toolbar .dx-button-content) {
  padding: 4px 6px !important;
}

/* 🔥 Aktifkan swipe horizontal & vertikal yang mulus di mobile */
@media (max-width: 767px) {
  :deep(.dx-datagrid-rowsview),
  :deep(.dx-datagrid-content),
  :deep(.dx-scrollable-container) {
    touch-action: pan-x pan-y !important;
    -webkit-overflow-scrolling: touch !important;
  }
}

/* Lebih ramping lagi khusus mobile */
@media (max-width: 640px) {
  :deep(.dx-toolbar) {
    min-height: 28px !important;
  }

  :deep(.dx-toolbar-items-container) {
    height: 28px !important;
  }

  :deep(.dx-toolbar .dx-button) {
    height: 24px !important;
    min-width: 24px !important;
  }

  :deep(.dx-toolbar .dx-button .dx-icon) {
    font-size: 12px !important;
    width: 12px !important;
    height: 12px !important;
  }

  :deep(.dx-toolbar .dx-button-content) {
    padding: 2px 4px !important;
  }

  :deep(.dx-toolbar-item) {
    margin-right: 2px !important;
  }
}

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
}

.sp-footer-hidden::selection {
  color: #111827;
  background: #ffe58f;
}

.sp-footer-hidden::-moz-selection {
  color: #111827;
  background: #ffe58f;
}

/* 🔥 Context Menu Styling */
.datagrid-context-menu {
  position: fixed;
  z-index: 99999;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  padding: 4px 0;
  min-width: 200px;
  font-family: "Montserrat", sans-serif;
  font-size: 13px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  color: #374151;
}

.context-menu-item:hover {
  background-color: #f3f4f6;
}

.context-menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.context-menu-item.disabled:hover {
  background-color: transparent;
}

.context-menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  color: #6b7280;
  flex-shrink: 0;
}

.context-menu-item:hover .context-menu-icon {
  color: #374151;
}

.context-menu-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99998;
  background: transparent;
}
</style>