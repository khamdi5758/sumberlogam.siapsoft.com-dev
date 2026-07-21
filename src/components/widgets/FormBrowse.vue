<template>
  <div class="formbrows-container formbrowse-global">
    <div class="form-field">
      <div class="input-group" :class="{ 'mobile-layout': isMobile }">
        <DxTextBox
          ref="textBoxRef"
          v-model:value="valtext"
          :label="label"
          mode="text"
          label-mode="floating"
          :width="isMobile ? '100%' : width"
          :height="height"
          :read-only="false"
          :show-clear-button="false"
          @input="handletextboxonchange"
          @focus-in="handlefocusin"
          @focus-out="handleFocusOut"
          @key-down="handleTextBoxKeyDown"
          :buttons="[
            {
              name: 'clear',
              location: 'after',
              options: {
                icon: 'clear',
                stylingMode: 'text',
                visible: !!selectedItem,
                onClick: handleClearClick,
              },
            },
            {
              name: 'browse',
              location: 'after',
              options: {
                text: '...',
                stylingMode: 'text',
                visible: showBrowse,
                onClick: handleEnterKey,
              },
            },
          ]"
        />
        <p
          v-if="selectedItem && selectedItem.ket && showket"
          class="text-sm text-black ml-2"
          :class="{ 'ket-below': isMobile, 'ket-beside': !isMobile }"
        >
          {{ selectedItem.ket }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { DxTextBox } from "devextreme-vue/text-box";

export default {
  name: "FormBrowse",
  components: { DxTextBox },
  props: {
    label: { type: String, default: "Pilih Data" },
    dataSource: { type: Array, default: () => [] },
    keyField: { type: String, default: "id" },
    displayField: { type: String, default: "ket" },
    width: { type: Number, default: 300 },
    height: { type: Number, default: 40 },
    modelValue: { type: Object, default: null },
    dialogTitle: { type: String, default: "" },
    showBrowse: { type: Boolean, default: true },
    showket: { type: Boolean, default: true },
  },
  emits: [
    "update:modelValue",
    "modelValue",
    "valuechange",
    "valtext",
    "keydown",
    "focus-out",
    "focus-in",
    "enterkey",
    "enterNext",
    "cleardata",
  ],
  data() {
    return {
      selectedItem: this.modelValue,
      valtext: "",
      windowWidth: window.innerWidth,
    };
  },

  computed: {
    isMobile() {
      return this.windowWidth <= 768;
    },
    displayText() {
      this.valtext = this.selectedItem[this.keyField];
      return this.selectedItem
        ? this.selectedItem[this.displayField] || ""
        : "";
    },
  },

  watch: {
    modelValue: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.selectedItem = newVal;
          this.valtext = newVal.id;
          this.$emit("valtext", this.valtext);
          console.log("Ada data baru:", newVal);
        } else {
          console.log("Data kosong");
        }
      },
      immediate: true,
      deep: true,
    },
    valtext() {
      this.$emit("valtext", this.valtext);
    },
    selectedItem(e) {
      console.log(e);
    },
  },

  methods: {
    onResize() {
      this.windowWidth = window.innerWidth;
    },
    handleClearClick() {
      this.clearData();
    },
    handleEnterKey(e) {
      this.$emit("enterkey", e);
    },
    handletextboxonchange(e) {
      this.valtext = e.event?.target?.value || "";
    },

    handlefocusin(e) {
      this.$emit("focus-in", e);
    },

    handleFocusOut(e) {
      this.$emit("focus-out", e);
    },

    // ⬇️ Hapus semua data yang tersimpan di FormBrowse ini
    clearData() {
      this.selectedItem = null;
      this.valtext = "";

      // reset nilai langsung di instance DxTextBox
      const dxTextBox = this.$refs.textBoxRef?.instance;
      if (dxTextBox) {
        dxTextBox.option("value", "");
      }

      // kabari parent kalau data sudah dikosongkan
      this.$emit("update:modelValue", null);
      this.$emit("modelValue", null);
      this.$emit("valuechange", null);
      this.$emit("valtext", "");
      this.$emit("cleardata");
    },

    handleTextBoxKeyDown(e) {
      this.$emit("keydown", e);

      const key = e.event?.key;

      if ((key === "Delete" || key === "Delete") && this.selectedItem) {
        e.event.preventDefault();
        this.clearData();
        return;
      }

      if (key === "Backspace") {
        if (!this.valtext && this.selectedItem) {
          this._backspaceCount = (this._backspaceCount || 0) + 1;
          if (this._backspaceCount >= 2) {
            this._backspaceCount = 0;
            e.event.preventDefault();
            this.clearData();
            return;
          }
        } else {
          this._backspaceCount = 0;
        }
      } else {
        this._backspaceCount = 0;
      }

      if (key === "Enter") {
        e.event.preventDefault();
        this.$emit("enterNext", e);
      }
    },

    focus() {
      this.$nextTick(() => {
        const dxTextBox = this.$refs.textBoxRef?.instance;
        if (dxTextBox) {
          dxTextBox.focus();
        } else {
          const input = this.$el.querySelector("input");
          if (input) input.focus();
        }
      });
    },
  },

  mounted() {
    window.addEventListener("resize", this.onResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
};
</script>

<style scoped>
.formbrows-container {
  margin-bottom: 0px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.input-group {
  display: flex;
  align-items: flex-start;
  min-width: 0;
}

.input-group :deep(.dx-texteditor) {
  flex-shrink: 0;
}

.input-group p {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0 0 0 8px;
  font-size: 0.875rem;
  color: #000;
  white-space: normal;
  word-break: break-word;
  line-height: 1.3;
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
  align-items: flex-start;
  min-width: 0;
}

/* Desktop: keterangan di samping */
.input-group.ket-beside,
.input-group:not(.mobile-layout) {
  flex-direction: row;
  align-items: center;
}

/* Mobile: keterangan di bawah */
.input-group.mobile-layout {
  flex-direction: column;
  align-items: flex-start;
}

.input-group :deep(.dx-texteditor) {
  flex-shrink: 0;
}

/* Keterangan samping (desktop) */
.ket-text.ket-beside {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0 0 0 8px;
  font-size: 0.875rem;
  color: #000;
  white-space: normal;
  word-break: break-word;
  line-height: 1.3;
}

/* Keterangan bawah (mobile) */
.ket-text.ket-below {
  margin: 4px 0 0 0;
  font-size: 0.8rem;
  color: #374151;
  white-space: normal;
  word-break: break-word;
  line-height: 1.4;
  padding: 4px 8px;
  background-color: #f3f4f6;
  border-radius: 4px;
  width: 100%;
}
</style>
