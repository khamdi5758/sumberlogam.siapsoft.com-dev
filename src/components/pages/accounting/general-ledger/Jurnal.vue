<template>
  <AccountingBase
    title="Laporan Jurnal"
    type="jurnal"
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
  name: "AccountingJurnal",
});

const store = useStore();

const plData = computed(() => store.getters["jurnal/jurnalList"] || []);

const handleFilterChange = (filterData) => {
  console.log("Jurnal Filter Change:", filterData);
  store.dispatch("jurnal/getJurnal", filterData);
};
</script>
