<template>
  <div :id="id" class="formbrows-container">
    <DxPopup
      :visible="isVisible"
      :show-title="true"
      :width="popupWidth"
      :height="popupHeight"
      :hide-on-outside-click="false"
      :drag-enabled="false"
      :show-close-button="false"
      :full-screen="false"
      title="Pilih Item"
      :position="popupPosition"
      @hiding="handleCancel"
      @shown="onPopupShown"
    >
      <template #content>
        <div class="p-2">
          <DxDataGrid
            id="formbrows"
            ref="myDataGrid"
            :data-source="dataSource"
            :show-borders="true"
            :selection="{ mode: 'single' }"
            :column-auto-width="true"
            :allow-column-resizing="true"
            :allow-column-reordering="true"
            :word-wrap-enabled="true"
            :row-alternation-enabled="true"
            :focused-row-enabled="true"
            :auto-navigate-to-focused-row="true"
            :key-expr="keyField"
            :height="gridHeight"
            @cell-prepared="onCellPrepared"
            @focused-row-changed="onFocusedRowChanged"
            @key-down="onGridKeyDown"
            @content-ready="onContentReady"
            @row-click="handleRowClick"
            @row-dbl-click="handleRowDblClick"
          >
            <DxColumn
              v-for="col in computedColumns"
              :key="col.dataField"
              :data-field="col.dataField"
              :caption="col.caption"
            />
            <DxScrolling mode="virtual" />
            <DxPaging :page-size="0" />
            <DxFilterRow :visible="true" />
            <DxSearchPanel :visible="false" placeholder="Search..." />
          </DxDataGrid>
        </div>
      </template>

      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="cancelButtonOptions"
      />
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="pickButtonOptions"
      />
    </DxPopup>
  </div>

  <!-- <DxPopup
    :visible="isVisible"
    :show-title="true"
    :width="width"
    :height="height"
    :hide-on-outside-click="false"
    :drag-enabled="false"
    :show-close-button="true"
    :title="title"
    @hiding="handleCancel"
    @shown="onPopupShown"
  >
    <template #content>
      <div class="p-2">
        <DxDataGrid
          ref="dataGridRef"
          :data-source="dataSource"
          :show-borders="true"
          :selection="{ mode: 'single' }"
          :column-auto-width="true"
          :allow-column-resizing="true"
          :allow-column-reordering="true"
          :row-alternation-enabled="true"
          :focused-row-enabled="true"
          :auto-navigate-to-focused-row="true"
          :key-expr="keyField"
          height="350"
          @row-dbl-click="handleRowDblClick"
          @row-click="handleRowClick"
          @key-down="onGridKeyDown"
          @content-ready="onContentReady"
        >
          <DxScrolling mode="virtual" />
          <DxPaging :page-size="0" />
          <DxFilterRow :visible="true" />
        </DxDataGrid>
      </div>
    </template>

    <DxToolbarItem
      widget="dxButton"
      toolbar="bottom"
      location="after"
      :options="cancelButtonOptions"
    />
    <DxToolbarItem
      widget="dxButton"
      toolbar="bottom"
      location="after"
      :options="pickButtonOptions"
    />
  </DxPopup> -->
</template>

<script>
/*
  Perbaikan:
  - Jangan meng-import sendiri file ini.
  - Definisikan komponen sebagai const FormBrowseDialog, lalu export default di bawah.
  - Tambahkan static method FormBrowseDialog.show menggunakan createVNode/render.
*/
import { createVNode, render, watch } from "vue";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import {
  DxDataGrid,
  DxColumn,
  DxPaging,
  DxScrolling,
  DxFilterRow,
  DxSearchPanel,
  DxSelection,
} from "devextreme-vue/data-grid";

const FormBrowseDialog = {
  name: "FormBrowseDialog",
  components: {
    DxPopup,
    DxToolbarItem,
    DxDataGrid,
    DxPaging,
    DxScrolling,
    DxFilterRow,
    DxColumn,
    DxSearchPanel,
    DxSelection,
  },
  props: {
    title: { type: String, default: "Pilih Data" },
    dataSource: { type: Array, default: () => [] },
    disablecol: { type: Array, default: () => [] },
    keyField: { type: String, default: "id" },
    width: { type: [Number, String], default: 500 },
    height: { type: [Number, String], default: 500 },
    visible: { type: Boolean, default: true },
    // opsional: kolom, filter, callbacks dsb bisa ditambahkan di sini
  },
  data() {
    return {
      isVisible: this.visible,
      selectedItem: null,
      // tempSelectedItem: null,
      isGridReady: false,
      container: null, // diisi oleh caller untuk cleanup
      windowWidth: window.innerWidth,
    };
  },
  methods: {
    onResize() {
      this.windowWidth = window.innerWidth;
    },
    onCellPrepared(e) {
      if (e.rowType === "header") {
        e.cellElement.style.backgroundColor = "#002e72";
        e.cellElement.style.color = "white";
        e.cellElement.style.textAlign = "center";
        e.cellElement.style.fontWeight = "600";
        e.cellElement.style.fontSize = "12px";
      }
    },

    onFocusedRowChanged(e) {
      if (e.row && e.row.data) {
        this.selectedItem = e.row.data;
        const grid = this.$refs.myDataGrid?.instance;
        if (grid) {
          grid.selectRows([e.row.data[this.valueField]]);
        }
      }
    },
    onSelectionChanged(e) {
      console.log(e);
      this.selectedItem = e.selectedRowsData[0] || null;
    },

    handleRowClick(e) {
      console.log(e.data);
      this.selectedItem = e.data;
    },
    handleRowDblClick(e) {
      this.selectedItem = e.data;
      this.handleOk();
    },
    handleOk() {
      console.log(this.selectedItem);
      if (this._settled) return;
      this._settled = true;
      if (this._resolve) this._resolve(this.selectedItem);
      this.cleanup();
    },
    handleCancel() {
      if (this._settled) return;
      this._settled = true;
      if (this._reject) this._reject("cancelled");
      this.cleanup();
    },
    cleanup() {
      this.isVisible = false;
      this.$nextTick(() => {
        if (this.container) {
          render(null, this.container);
          if (this.container.parentNode)
            this.container.parentNode.removeChild(this.container);
          this.container = null;
        }
      });
    },

    onPopupShown() {
      this.isGridReady = false;

      this.$nextTick(() => {
        setTimeout(() => {
          const grid = this.$refs.myDataGrid?.instance;
          if (grid) {
            grid.refresh().then(() => {
              grid.focus();

              const focusedIndex = grid.option("focusedRowIndex") || 0;
              grid.option("focusedRowIndex", focusedIndex);

              const visibleRows = grid.getVisibleRows();
              if (visibleRows.length > 0) {
                const rowData = visibleRows[focusedIndex].data;
                if (rowData) {
                  this.selectedItem = rowData;
                  grid.selectRows([rowData[this.keyField]]);
                }
              }

              setTimeout(() => grid.focus(), 50);
            });
          }
        }, 150);
      });
    },
    onContentReady(e) {
      if (!this.isGridReady) {
        this.isGridReady = true;
        this.focusGrid();
      }
    },

    focusGrid() {
      this.$nextTick(() => {
        setTimeout(() => {
          const grid = this.$refs.myDataGrid?.instance;
          if (grid && this.dataSource.length > 0) {
            grid.focus();

            const focusedRowKey = grid.option("focusedRowKey");
            if (!focusedRowKey) {
              const firstRowData = grid.getVisibleRows()[0]?.data;
              if (firstRowData) {
                grid.option("focusedRowKey", firstRowData[this.keyField]);
                grid.selectRows([firstRowData[this.keyField]]);
                this.selectedItem = firstRowData;
              }
            }
          }
        }, 200);
      });
    },
    onGridKeyDown(e) {
      const key = e.event?.key;
      if (key === "Enter") {
        setTimeout(() => {
          let item = this.selectedItem;
          if (!item) {
            const grid = e.component;
            const focusedRowIndex = grid.option("focusedRowIndex");
            item = grid.getVisibleRows()[focusedRowIndex]?.data;
          }

          if (item) {
            this.selectedItem = item;
            this.handleOk();
          }
        }, 100);
      }
      if (key === "Escape") {
        this.handleCancel();
      }
    },
  },
  computed: {
    popupPosition() {
      return {
        my: "center",
        at: "center",
        of: this.isMobile ? document.body : window,
      };
    },
    isMobile() {
      return this.windowWidth <= 768;
    },

    popupWidth() {
      return this.isMobile ? "92%" : this.width || 500;
    },

    popupHeight() {
      return this.isMobile ? "85%" : this.height || 500;
    },

    gridHeight() {
      return this.isMobile ? "calc(85vh - 180px)" : 350;
    },
    computedColumns() {
      if (!this.dataSource || !this.dataSource.length) return [];
      const sample = this.dataSource[0];
      // console.log(this.disablecol);
      // 🔥 PASTIKAN ARRAY
      const disableCols = Array.isArray(this.disablecol) ? this.disablecol : [];
      let cols = Object.keys(sample)
        .filter((k) => ![...disableCols].includes(k))
        .map((k) => ({
          dataField: k,
          caption: k,
          alignment: typeof sample[k] === "number" ? "right" : "left",
        }));

      // let cols = Object.keys(this.dataSource[0]).map((key) => {
      //   let caption = key;
      //   return {
      //     dataField: key,
      //     caption: caption,
      //     // visible: key !== "keyindex" && key !== "PageTotal",
      //     visible: ![...this.disablecol].includes(key),
      //   };
      // });

      // return '';
      return cols;
    },

    pickButtonOptions() {
      return {
        stylingMode: "contained",
        text: "Pilih",
        type: "default",
        icon: "check",
        elementAttr: {
          class: "btn-pilih",
          style:
            "background-color: #002f6c ; color: white; border: none; border-radius: 0.5rem; font-size: 12px; font-weight: 500;",
        },
        onClick: this.handleOk,
      };
    },

    cancelButtonOptions() {
      return {
        stylingMode: "contained",
        text: "Batal",
        type: "danger",
        icon: "close",
        elementAttr: {
          class: "btn-batal",
          style:
            "background-color: #d33; color: white; border: none; border-radius: 0.5rem; font-size: 12px; font-weight: 500;",
        },
        onClick: this.handleCancel,
      };
    },
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
};

// Static show method — panggil: await FormBrowseDialog.show({...})
// FormBrowseDialog.show = function (options = {}) {
//   return new Promise((resolve, reject) => {
//     const container = document.createElement("div");
//     document.body.appendChild(container);

//     // buat vnode dan sediakan props
//     const vnode = createVNode(FormBrowseDialog, {
//       ...options,
//       visible: true,
//     });

//     // render vnode ke container
//     render(vnode, container);

//     // setelah mount, set container & resolve/reject ke instance supaya bisa diakses method cleanup
//     // vnode.component mungkin belum tersedia syncronous di beberapa runtime, jadi gunakan setTimeout 0 untuk memastikan
//     setTimeout(() => {
//       const comp = vnode.component && vnode.component.proxy;
//       if (comp) {
//         comp.container = container;
//         comp._settled = false;
//         comp._resolve = (data) => {
//           resolve(data);
//         };
//         comp._reject = (err) => {
//           reject(err);
//         };
//       } else {
//         // fallback: kalau tidak dapat instance, bersihkan dan reject
//         render(null, container);
//         if (container.parentNode) container.parentNode.removeChild(container);
//         reject(new Error("Failed to mount FormBrowseDialog instance"));
//       }
//     }, 0);
//   });
// };
// FormBrowseDialog.show — ganti seluruhnya dengan ini
FormBrowseDialog.show = function (options = {}) {
  // 🔒 Kalau sudah ada instance yang terbuka, jangan buka lagi.
  // Kembalikan promise yang sama supaya caller tetap dapat hasilnya nanti.
  if (FormBrowseDialog._activePromise) {
    console.warn(
      "FormBrowseDialog sudah terbuka, mengabaikan pemanggilan baru.",
    );
    return FormBrowseDialog._activePromise;
  }

  const promise = new Promise((resolve, reject) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const vnode = createVNode(FormBrowseDialog, {
      ...options,
      visible: true,
    });

    render(vnode, container);

    setTimeout(() => {
      const comp = vnode.component && vnode.component.proxy;
      if (comp) {
        comp.container = container;
        comp._settled = false;
        comp._resolve = (data) => {
          FormBrowseDialog._activePromise = null; // 🔓 buka kunci
          resolve(data);
        };
        comp._reject = (err) => {
          FormBrowseDialog._activePromise = null; // 🔓 buka kunci
          reject(err);
        };
      } else {
        FormBrowseDialog._activePromise = null;
        render(null, container);
        if (container.parentNode) container.parentNode.removeChild(container);
        reject(new Error("Failed to mount FormBrowseDialog instance"));
      }
    }, 0);
  });

  FormBrowseDialog._activePromise = promise; // 🔒 kunci sebelum resolve/reject
  return promise;
};

export default FormBrowseDialog;
</script>

<style scoped>
.p-2 {
  padding: 0.5rem;
}

.formbrows-container {
  margin-bottom: 0px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.input-group {
  display: flex;
  align-items: flex-end;
}

:deep(.dx-texteditor-buttons-container .dx-button.dx-button-mode-text:hover),
:deep(.dx-texteditor-buttons-container .dx-button.dx-button-mode-text:focus),
:deep(.dx-texteditor-buttons-container .dx-button.dx-state-focused),
:deep(.dx-texteditor-buttons-container .dx-button.dx-state-hover) {
  background-color: #002f6c !important;
  color: white !important;
}

:deep(.dx-texteditor-buttons-container .dx-button.dx-button-mode-text) {
  margin-right: 0 !important;
  padding-right: 6px !important;
  border-radius: 0 4px 4px 0 !important;
}

:deep(.dx-texteditor) {
  font-size: 12px !important;
  font-family: inherit;
}

:deep(.dx-texteditor-input) {
  font-size: 12px !important;
  font-family: inherit;
  padding: 4px 8px !important;
}

:deep(.dx-texteditor .dx-texteditor-label) {
  font-size: 12px !important;
  font-family: inherit;
  font-weight: 600 !important;
}

:deep(.dx-button) {
  font-size: 12px !important;
  font-family: inherit;
}

:deep(#formbrows .dx-header-row td) {
  border-right: 1px solid #0040a3;
  border-bottom: none;
  padding: 6px 8px !important;
  height: 35px !important;
  vertical-align: middle !important;
  font-family: inherit;
  font-size: 12px !important;
}

:deep(#formbrows .dx-data-row td) {
  padding: 4px 8px;
  font-size: 12px !important;
  font-weight: 600;
  color: #374151;
  border-right: 1px solid #f3f4f6;
  height: 30px !important;
  vertical-align: middle !important;
  font-family: inherit;
}

:deep(#formbrows .dx-data-row.dx-row-focused td),
:deep(#formbrows .dx-data-row.dx-row-focused.dx-row-alt td),
:deep(#formbrows .dx-data-row.dx-row-focused:hover td),
:deep(#formbrows .dx-data-row.dx-row-focused.dx-row-alt:hover td) {
  background-color: #e6ecf6 !important;
  color: #1f2937 !important;
}

:deep(#formbrows .dx-filter-row .dx-editor-cell .dx-texteditor-input) {
  font-size: 12px !important;
  font-family: inherit;
  padding: 2px 6px !important;
}

:deep(.dx-button.btn-pilih),
:deep(.dx-button.btn-batal) {
  transition: all 0.15s ease-in-out !important;
  transform: scale(1) !important;
  font-size: 12px !important;
  font-family: inherit;
}

:deep(.dx-popup-title) {
  font-size: 14px !important;
  font-family: inherit;
  font-weight: 600 !important;
}

/* Mobile fullscreen popup */
:deep(.dx-popup-wrapper.dx-overlay-modal .dx-popup-content) {
  padding: 8px !important;
}

@media (max-width: 768px) {
  :deep(.dx-popup-wrapper .dx-overlay-content) {
    border-radius: 12px !important;
    overflow: hidden;
  }

  :deep(.dx-popup-wrapper .dx-popup-title) {
    font-size: 16px !important;
    padding: 12px 16px !important;
  }

  :deep(.dx-popup-wrapper .dx-toolbar.dx-popup-bottom) {
    padding: 8px 12px !important;
  }

  :deep(.dx-popup-wrapper .dx-popup-bottom .dx-button) {
    min-width: 80px !important;
    height: 38px !important;
    font-size: 13px !important;
  }

  :deep(#formbrows .dx-data-row td) {
    height: 38px !important;
    font-size: 13px !important;
  }

  :deep(#formbrows .dx-header-row td) {
    height: 40px !important;
    font-size: 13px !important;
  }
}
</style>
