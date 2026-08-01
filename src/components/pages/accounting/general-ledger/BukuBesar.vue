<template>
  <AccountingBase
    title="Buku Besar"
    popupTitle="Buku Tambahan"
    type="bukubesar"
    :dataSource="plData"
    :defaultExpandedKeys="[1]"
    :autoOpenFilter="true"
    :showContentInitially="false"
    submitButtonText="Cetak"
    @filter-change="handleFilterChange"
  />
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import AccountingBase from "../AccountingBase.vue";

defineOptions({
  name: "RegisterBukuBesar",
});

const store = useStore();

const plData = computed(() => store.getters["bukubesar/bukubesarList"] || []);

const handleFilterChange = (filterData) => {
  console.log("Buku Besar Filter Change:", filterData);
  store.dispatch("bukubesar/getBukuBesar", filterData);
};
</script>
