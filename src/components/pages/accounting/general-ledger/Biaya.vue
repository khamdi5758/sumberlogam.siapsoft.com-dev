<template>
  <AccountingBase
    title="Biaya"
    type="biaya"
    :dataSource="plData"
    :defaultExpandedKeys="[1]"
    :autoOpenFilter="true"
    :showContentInitially="false"
    submitButtonText="Go"
    @filter-change="handleFilterChange"
  />
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import AccountingBase from "../AccountingBase.vue";

defineOptions({
  name: "RegisterBiaya",
});

const store = useStore();

const plData = computed(() => store.getters["biaya/biayaList"] || []);

const handleFilterChange = (filterData) => {
  console.log("Biaya Filter Change:", filterData);
  store.dispatch("biaya/getBiaya", filterData);
};
</script>
