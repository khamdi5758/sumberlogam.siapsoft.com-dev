<template>
  <AccountingBase
    title="Mutasi"
    type="mutasi"
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
  name: "AccountingMutasi",
});

const store = useStore();

const plData = computed(() => store.getters["mutasi/mutasiList"] || []);

const handleFilterChange = (filterData) => {
  console.log("Mutasi Filter Change:", filterData);
  store.dispatch("mutasi/getMutasi", filterData);
};
</script>
