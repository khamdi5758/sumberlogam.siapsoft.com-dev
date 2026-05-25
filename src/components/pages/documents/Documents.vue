<script setup>
import { ref } from "vue";
import { FileText, LayoutTemplate, Code2, RefreshCcw } from "lucide-vue-next";
import DocumentList from "./DocumentList.vue";
import DocumentsTemplate from "./DocumentsTemplate.vue";
import DocumentsShortCode from "./DocumentsShortCode.vue";

const activeTab = ref("list"); // 'list' | 'template' | 'shortcode'

const menuItems = [
  { key: "list", label: "Document List", icon: FileText },
  { key: "template", label: "Template", icon: LayoutTemplate },
  { key: "shortcode", label: "Short Code", icon: Code2 },
];
</script>

<template>
  <!-- Main Layout Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
    <!-- Secondary Sidebar -->
    <div class="bg-white rounded-xl shadow-sm border border-outline h-fit">
      <div class="bg-light-base/50 px-5 py-3 border-b border-outline">
        <h3 class="font-bold text-main-text uppercase text-xs">
          Documents Menu
        </h3>
      </div>
      <nav class="p-2 space-y-1">
        <button
          v-for="item in menuItems"
          :key="item.key"
          @click="activeTab = item.key"
          class="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition"
          :class="[
            activeTab === item.key
              ? 'bg-gray-50/80 text-main-text border-outline/50 shadow-sm font-semibold'
              : 'hover:bg-gray-50/50 text-sub-text',
          ]"
        >
          <component :is="item.icon" :size="18" />
          <span class="text-sm">{{ item.label }}</span>
        </button>
      </nav>
      <div class="p-4 bg-light-base/30 border-t border-outline">
        <p class="text-xs text-sub-text">Internal note...</p>
        <span class="text-sm text-sub-text" v-if="activeTab === 'list'">
          6 Total Documents. Click on a document to view details, edit, or
          manage its settings.
        </span>
        <span class="text-sm text-sub-text" v-if="activeTab === 'template'">
          Input the template for your document, you can use dynamic variables to
          populate data.
        </span>
        <span class="text-sm text-sub-text" v-if="activeTab === 'shortcode'">
          Use the shortcode to embed the document form in your website or
          application.
        </span>
      </div>
    </div>

    <!-- Content Area -->
    <div class="min-w-0">
      <DocumentList v-if="activeTab === 'list'" />
      <DocumentsTemplate v-else-if="activeTab === 'template'" />
      <DocumentsShortCode v-else-if="activeTab === 'shortcode'" />
    </div>
  </div>
</template>
