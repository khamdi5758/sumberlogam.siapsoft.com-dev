<template>
  <AccountingBase
    title="Aktiva Tetap"
    popupTitle="Aktiva"
    type="aktivatetap"
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
  name: "AccountingAktivaTetap",
});

const store = useStore();

const plData = computed(() => store.getters["aktivatetap/aktivaTetapList"] || []);

const handleFilterChange = (filterData) => {
  console.log("Aktiva Tetap Filter Change:", filterData);
  store.dispatch("aktivatetap/getAktivaTetap", filterData);
};
</script>
