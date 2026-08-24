<template>
  <AccountingBase
    title="Neraca Lajur"
    popupTitle="Neraca Lajur"
    type="neracalajur"
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
  name: "AccountingNeracaLajur",
});

const store = useStore();

// Map data source reactively to Vuex store state
const plData = computed(() => store.getters["neracalajur/neracalajurList"] || []);

const handleFilterChange = (filterData) => {
  console.log("Neraca Lajur Filter Change:", filterData);
  store.dispatch("neracalajur/getNeracalajur", filterData);
};
</script>
