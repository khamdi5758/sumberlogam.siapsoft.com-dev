<template>
  <!--
    Wrapper bernama untuk parent route /app/produksi.

    maindashboard.vue membungkus router-view level-1 dengan <keep-alive
    :include="nametabs">. Komponen yang dirender di level-1 untuk seluruh
    halaman Produksi adalah wrapper ini (name "Produksi"), sedangkan
    `nametabs` berisi name route anak (HasilProduksi, RegisterProduksi, dst.),
    sehingga cache level-1 tidak pernah cocok untuk halaman Produksi.

    Karena itu keep-alive untuk halaman Produksi diletakkan di dalam wrapper
    ini, pada nested router-view. Anak route Produksi memakai pola satu
    komponen per route dan nama komponen === nama route (HasilProduksi,
    MutasiProduksi, dst.), sehingga :include="nametabs" cocok persis dengan
    mekanisme keep-alive level-1 milik modul lain:

    - Sidebar → menu yang tab-nya BELUM ada  → name belum ada di nametabs →
      instance BARU dibuat → popup initialization tampil (background blank).
    - Klik top tab yang SUDAH ada            → name ada di nametabs →
      instance di-restore dari cache → state terakhir tampil apa adanya,
      TANPA popup, TANPA blank, TANPA reload.

    :key="route.fullPath" membuat cache terpisah per path (satu tab per menu),
    sama seperti keep-alive level-1 di maindashboard.vue.
  -->
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="nametabs">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </router-view>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Produksi",
  computed: {
    ...mapGetters({
      nametabs: "tabs/getNameTabs",
    }),
  },
};
</script>
