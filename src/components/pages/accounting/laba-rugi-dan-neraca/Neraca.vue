<template>
  <AccountingBase
    title="Neraca"
    popupTitle="Neraca"
    type="neraca"
    :dataSource="plData"
    :defaultExpandedKeys="[1, 2]"
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
  name: "RegisterNeraca",
});

const store = useStore();

// Map data source reactively to Vuex store state
const plData = computed(() => store.getters["neraca/neracaList"] || []);

const handleFilterChange = (filterData) => {
  console.log("Neraca Filter Change:", filterData);
  store.dispatch("neraca/getNeraca", filterData);
};
</script>
