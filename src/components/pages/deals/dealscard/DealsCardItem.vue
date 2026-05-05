<script setup>
import { defineProps, defineEmits } from "vue";
import { ChevronDown } from "lucide-vue-next";

const props = defineProps({
  deal: {
    type: Object,
    required: true,
  },
  boardTitle: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["viewDetail", "delete", "stageChange"]);

const stageClass = (stage) => {
  const s = String(stage || "")
    .toLowerCase()
    .trim();

  if (s === "new" || s === "prospect")
    return "bg-slate-100 text-slate-700";
  if (s === "qualified")
    return "bg-blue-100 text-blue-700";
  if (s === "proposal" || s === "offer")
    return "bg-indigo-100 text-indigo-700";
  if (s === "negotiation")
    return "bg-yellow-100 text-yellow-700";
  if (s === "close_won" || s === "won" || s.includes("won"))
    return "bg-emerald-100 text-emerald-700";
  if (s === "close_lost" || s === "lost" || s.includes("lost"))
    return "bg-red-100 text-red-700";

  return "bg-slate-100 text-slate-700";
};

const handleDelete = (e) => {
  e.stopPropagation();
  emit("delete", props.deal, e);
};
</script>

<template>
  <div
    class="bg-white p-4 rounded shadow-sm border border-gray-200 cursor-move hover:border-blue-500 transition relative group"
    @click="emit('viewDetail', deal)"
  >
    <!-- Delete Button -->
    <button
      @click="handleDelete"
      class="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
      title="Hapus deal"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M19 7L5 7M10 11V17M14 11V17M9 7V4H15V7M6 7H18L17 20H7L6 7Z"
        />
      </svg>
    </button>

    <p class="text-sm font-medium text-gray-800 truncate pr-6">
      {{ deal.name }}
    </p>

    <div class="mt-2">
      <!-- Jika closed, tampilkan dropdown untuk pilih Won/Lost -->
      <template v-if="deal.stage.toLowerCase().includes('won') || deal.stage.toLowerCase().includes('lost')">
        <div class="relative inline-flex items-center">
          <select
            :value="deal.stage.toLowerCase().includes('won') ? 'close_won' : 'close_lost'"
            @change="(e) => emit('stageChange', deal, e.target.value)"
            @click.stop
            class="pl-2 pr-5 py-0.5 rounded-full text-[11px] font-bold outline-none cursor-pointer appearance-none border-none transition-all"
            :class="deal.stage.toLowerCase().includes('won') 
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
              : 'bg-red-100 text-red-700 hover:bg-red-200'"
          >
            <option value="close_won">Won</option>
            <option value="close_lost">Lost</option>
          </select>
          <ChevronDown 
            class="absolute right-1.5 pointer-events-none" 
            :size="10" 
            :class="deal.stage.toLowerCase().includes('won') ? 'text-emerald-700' : 'text-red-700'"
          />
        </div>
      </template>
      
      <!-- Selain itu, tampilkan badge biasa -->
      <span
        v-else
        class="px-2 py-0.5 rounded-full text-[11px] font-bold capitalize"
        :class="stageClass(deal.stage)"
      >
        {{ boardTitle }}
      </span>
    </div>

    <p class="text-xs text-gray-500 mt-2">
      {{ deal.jumlah }} / {{ deal.tertanggal }}
    </p>

    <p class="text-xs text-gray-500 mt-1 truncate">
      {{ deal.contact }} - {{ deal.company }}
    </p>

    <div class="mt-2 pt-2 border-t border-gray-50 space-y-1">
      <p class="text-[10px] text-gray-400">Updated: {{ deal.updatedAt }}</p>
      <p class="text-[10px] text-gray-400">Owner: {{ deal.owner }}</p>
    </div>
  </div>
</template>
