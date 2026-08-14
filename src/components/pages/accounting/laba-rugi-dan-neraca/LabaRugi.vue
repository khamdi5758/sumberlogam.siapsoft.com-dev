<template>
  <AccountingBase
    title="Laba Rugi"
    popupTitle="Laba Rugi"
    type="labarugi"
    :dataSource="plData"
    :defaultExpandedKeys="[1, 2, 4]"
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
  name: "RegisterLabaRugi",
});

const store = useStore();

// Map data source reactively to Vuex store state
const plData = computed(() => store.getters["labarugi/labarugiList"] || []);

const handleFilterChange = (filterData) => {
  console.log("PL Filter Change:", filterData);
  store.dispatch("labarugi/getLabarugi", filterData);
};
</script>
