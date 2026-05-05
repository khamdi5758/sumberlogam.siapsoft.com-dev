<template>
  <div class="mt-4 flex-1 min-h-1 relative">
    <div class="h-full overflow-hidden">
      <DxDataGrid
        ref="dataGridRef"
        :dataSource="dataSource"
        :columnAutoWidth="columnAutoWidth"
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
            :valueFormat="'#,##0'"
            :displayFormat="'{0}'"
            :alignment="'right'"
          />
          <DxTotalItem
            v-for="(summary, index) in avg"
            :key="'avg-' + index"
            :column="typeof summary === 'object' ? summary.column : summary"
            summaryType="avg"
            :valueFormat="'#,##0'"
            :displayFormat="'{0}'"
            :alignment="'right'"
          />

          <DxGroupItem
            v-for="(col, index) in summaries"
            :key="'group-sum-' + index"
            :column="typeof col === 'object' ? col.column : col"
            summary-type="sum"
            :alignByColumn="true"
            :showInGroupFooter="true"
            valueFormat="#,##0"
            displayFormat="{0}"
            :alignment="'right'"
          />

          <DxGroupItem
            v-for="(col, index) in avg"
            :key="'group-avg-' + index"
            :column="typeof col === 'object' ? col.column : col"
            summary-type="avg"
            :alignByColumn="true"
            :showInGroupFooter="true"
            valueFormat="#,##0"
            displayFormat="{0}"
            :alignment="'right'"
          />
        </DxSummary>

        <DxScrolling
          :mode="scrollingMode"
          :showScrollbar="showScrollbar"
          :columnRenderingMode="columnRenderingMode"
          :rowRenderingMode="rowRenderingMode"
          :useNative="false"
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

        <DxGrouping
          :contextMenuEnabled="true"
          expandMode="rowClick"
          :autoExpandAll="autoExpandAll"
        />
        <DxGroupPanel
          :visible="showGroupPanel"
          emptyPanelText="Drag a column header here to group by that column"
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
          <!-- <DxItem
          v-if="showExportButton"
          location="after"
          widget="dxButton"
          :options="exportButtonOptions"
        /> -->
          <!-- <DxItem
          v-if="showFilterButton"
          location="after"
          widget="dxButton"
          :options="filterButtonOptions"
        /> -->
          <DxItem name="columnChooserButton" location="after" />
          <!-- <DxItem
          location="after"
          widget="dxButton"
          :options="filterListButtonOptions"
        /> -->

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
} from "devextreme-vue/data-grid";
import DxCheckBox from "devextreme-vue/check-box";
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
    };
  },

  props: {
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
    // showFilterRow: {
    //   type: Boolean,
    //   default: false,
    // },
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
      default: () => {
        if (typeof window !== "undefined") {
          const activeTab =
            document.querySelector(".active") ||
            document.querySelector('[aria-selected="true"]') ||
            document.querySelector(".selected");
          if (activeTab) {
            return activeTab.textContent?.trim() || "DataGrid";
          }
        }
        return "DataGrid";
      },
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
    // beforeUnmount() {
    //   this.filterListPopupVisible = false;
    // },
    isFocusEnabled() {
      // return false;
      return Array.isArray(this.dataSource) && this.dataSource.length > 0;
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
        // focusStateEnabled: false,
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
            // grid.option("filterRow.visible", this.showFilterRow);
            grid.option("filterRow.visible", this.showFilterRow);
          }
        },
      };
    },

    computedColumns() {
      let cols = [];

      if (this.columns && this.columns.length > 0) {
        // 🔥 Use fixed columns from props if available
        cols = this.columns.map((col) => ({
          ...col,
          visible:
            col.visible !== undefined
              ? col.visible
              : ![...this.disablecol, "id"].includes(col.dataField),
        }));
      } else {
        if (!this.dataSource.length) return [];

        // 🔥 Fallback: Scan all items in the current page to gather all available keys
        const allKeysSet = new Set();
        this.dataSource.forEach((item) => {
          if (item && typeof item === "object") {
            Object.keys(item).forEach((key) => allKeysSet.add(key));
          }
        });

        cols = Array.from(allKeysSet).map((key) => {
          let caption = key;
          if (caption.startsWith("sum") || caption.startsWith("avg")) {
            caption = caption.substring(3);
          }

          return {
            dataField: key,
            caption: caption,
            visible: ![
              ...this.disablecol,
              "keyindex",
              "PageTotal",
              "id",
            ].includes(key),
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
  },

  watch: {
    $route() {
      this.filterListPopupVisible = false;
    },
    dataSource: {
      handler(newVal) {
        // this.dataSource = newVal;
      },
      immediate: true,
    },
    page: {
      handler(newPage) {
        this.tempPageNumber = newPage;
      },
      immediate: true,
    },
    groupFields(e) {
      // console.log(e);
    },
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
    focusGrid() {
      const grid = this.getGridInstance();
      if (!grid) return;

      const element = grid.element();
      if (element) {
        element.setAttribute("tabindex", "0");
        element.focus();
      }
    },
    handlecontentready(e) {
      this.$emit("contentready", e);
      this.$nextTick(() => {
        const grid = e.component || this.getInstance();
        if (grid) {
          this.applyFilterOptionsToGrid();
          setTimeout(() => {
            grid.updateDimensions();
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
      // this.dataSource = [];
      // setTimeout(() => {
      //   this.dataSource = [];
      // }, 0);
      // this.$router.go(0);
    },
    handleOptionChanged(e) {
      // if (e.fullName.startsWith("columns[")) {
      //   const grid = this.getGridInstance();
      //   if (grid) {
      //     const groupedColumns = grid
      //       .getVisibleColumns()
      //       .filter((col) => col.groupIndex !== undefined);
      //     this.isColumnGrouped = groupedColumns.length > 0;

      //     this.$emit("group-changed", {
      //       hasGroups: this.isColumnGrouped,
      //       groupedColumns: groupedColumns,
      //     });
      //   }
      // }

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
      if (this.pageTitle && this.pageTitle !== "DataGrid") {
        return this.pageTitle;
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
            if (tabText && tabText !== "" && !tabText.includes("Ã—")) {
              tabText = tabText.replace(/Ã—/g, "").replace(/\s+/g, " ").trim();
              if (tabText && tabText.length > 0) {
                return tabText;
              }
            }
          }
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
      console.log(this.page);
      this.$emit("prevpage");
    },
    nextPage() {
      this.$emit("nextpage");
    },

    fetchData($a) {
      this.$emit("caridata", $a);
      console.log($a);
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

    onCellPrepared(e) {
      if (e.rowType === "data" && e.column) {
        const value = e.value;
        if (typeof value === "number") {
          e.cellElement.style.textAlign = "right";
          // HAPUS baris ini:
          // e.cellElement.innerText = new Intl.NumberFormat(...).format(value);
        } else {
          e.cellElement.style.textAlign = "left";
        }
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
      console.log("Focused row changed:", e);
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
  },

  mounted() {
    this.$nextTick(() => {
      const gridElement = this.$refs.dataGridRef?.$el;
      if (gridElement) {
        const headerContainer = gridElement.querySelector(
          ".dx-datagrid-headers",
        );
        const headerScrollContainer = gridElement.querySelector(
          ".dx-datagrid-headers .dx-datagrid-scroll-container",
        );

        if (headerContainer) {
          // headerContainer.style.overflowX = "hidden";
        }

        if (headerScrollContainer) {
          // headerScrollContainer.style.overflowX = "hidden";
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

  expose: ["getInstance", "resetGrid", "focusGrid"],
};
</script>

<style scoped>
/* Sembunyikan scrollbar horizontal di header */
/*
:deep(.dx-datagrid-headers) {
  overflow: hidden !important;
}

:deep(.dx-datagrid-headers .dx-datagrid-scroll-container) {
  overflow-x: hidden !important;
}

*/

:deep(.dx-datagrid-header-panel) {
  overflow: hidden !important;
}

/* Sembunyikan scrollbar tapi tetap bisa scroll secara programatik */
:deep(.dx-datagrid-headers)::-webkit-scrollbar {
  display: none !important;
}

/* Hover pada row data */
:deep(.dx-datagrid-rowsview .dx-row.dx-state-hover td) {
  background-color: #acb3b9 !important;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* Hover lebih gelap untuk row alternation (zebra) */
:deep(.dx-datagrid-rowsview .dx-row-alt.dx-state-hover td) {
  background-color: #acb3b9 !important;
}

/* Hover dengan border kiri sebagai indikator */
:deep(.dx-datagrid-rowsview .dx-row.dx-state-hover td:first-child) {
  border-left: 3px solid #1890ff !important;
}

/* Focused row */
:deep(.dx-datagrid-rowsview .dx-row.dx-state-focused td) {
  background-color: #bae0ff !important;
}

/* new style */

:deep(.dx-datagrid) {
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  border: none !important;
  background: #fff;
}

/* Header kolom — style seperti di gambar */
:deep(.dx-datagrid-headers .dx-datagrid-table .dx-header-row td) {
  background-color: #ffffff !important;
  color: #111827 !important;
  font-size: 13px;
  font-weight: 700 !important;
  letter-spacing: 0.02em;
  border-bottom: 1px solid #e5e7eb !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  padding: 12px 16px !important;
}

:deep(.dx-datagrid-headers .dx-datagrid-table .dx-header-row td:hover) {
  /* background-color: #4791db !important; */
  background-color: #acb3b9 !important;
  color: #374151 !important;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

/* Hilangkan border vertikal antar kolom */
:deep(.dx-datagrid-rowsview .dx-row td) {
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: 1px solid #f3f4f6 !important;
  padding: 16px 16px !important;
  vertical-align: middle !important;
  color: #111827;
}

/* Row alternation — matikan warna zebra default DevExtreme */
/* :deep(.dx-datagrid-rowsview .dx-row-alt td) {
  background-color: #ffffff !important;
} */

/* Contact Name — bold seperti di gambar */
:deep(.dx-datagrid-rowsview .dx-row td:nth-child(1)) {
  font-weight: 700;
  color: #111827;
}

/* Hover row */
/* :deep(.dx-datagrid-rowsview .dx-row.dx-state-hover td) {
  background-color: #f9fafb !important;
  cursor: pointer;
  border-left: none !important;
} */

:deep(.dx-datagrid-rowsview .dx-row.dx-state-hover td:first-child) {
  border-left: none !important;
}

/* Focused row */
/* :deep(.dx-datagrid-rowsview .dx-row.dx-state-focused td) {
  background-color: #eff6ff !important;
} */

/* Hilangkan border luar grid */
:deep(.dx-datagrid-borders > .dx-datagrid-headers),
:deep(.dx-datagrid-borders > .dx-datagrid-rowsview),
:deep(.dx-datagrid-borders > .dx-datagrid-total-footer) {
  border-left: none !important;
  border-right: none !important;
}

/* Status badge — mirip di gambar */
:deep(.dx-datagrid-rowsview .status-badge) {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  background-color: #f3f4f6;
  color: #6b7280;
}

/* Toolbar bersih */
:deep(.dx-toolbar) {
  background: transparent !important;
  border: none !important;
  padding: 8px 0 !important;
}

:deep(.dx-datagrid-rowsview) {
  padding-bottom: 16px !important;
}
</style>
