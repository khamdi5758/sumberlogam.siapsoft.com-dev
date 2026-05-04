<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useStore } from "vuex";
import draggable from "vuedraggable";
import Swal from "sweetalert2";
import { alertService } from "@/services/alertService";

// Sub-components
import DealsCardFilter from "./DealsCardFilter.vue";
import DealsCardItem from "./DealsCardItem.vue";

const store = useStore();
const emit = defineEmits([
  "viewDetail",
  "update:currentPage",
  "update:itemsPerPage",
]);

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
});

/**
 * STATE & COMPUTED
 */
const isSidebarCollapsed = computed(
  () => store.getters["settingsfe/isSidebarCollapsed"],
);

const selectedCurrency = ref("IDR");
const isCurrencyOpen = ref(false);
const selectedPipeline = ref("Sales Pipeline");
const isPipelineOpen = ref(false);
const isDragging = ref(false);
const isSyncingStage = ref(false);

const boardMeta = [
  { id: 1, key: "prospect", title: "Prospect" },
  { id: 2, key: "qualified", title: "Qualified" },
  { id: 3, key: "offer", title: "Offer" },
  { id: 4, key: "negotiation", title: "Negotiation" },
  { id: 5, key: "closed", title: "Closed" },
];

const boards = ref([]);

const allDeals = computed(() => store.getters["deals/uiDeals"] || []);

const searchQuery = computed({
  get: () => store.state.deals.searchQuery,
  set: (value) => store.dispatch("deals/setSearchQuery", value),
});

/**
 * LOGIC / NORMALIZATION
 */
const normalizeStage = (rawStage) => {
  let stage = String(rawStage || "prospect")
    .toLowerCase()
    .trim();

  // Handle encoded format "closed:won", "closed:lost", "closed:cancel"
  if (stage.startsWith("closed:")) {
    const [_, status] = stage.split(":");
    if (status === "won") return "closed_won";
    if (status === "lost") return "closed_lost";
    if (status === "cancel") return "closed_cancel";
    return "closed";
  }

  if (stage.includes("prospect") || stage === "new") return "prospect";
  if (stage.includes("qual")) return "qualified";
  if (
    stage.includes("offer") ||
    stage.includes("proposal") ||
    stage.includes("payment")
  )
    return "offer";
  if (stage.includes("negot") || stage.includes("adv")) return "negotiation";

  // Handle short format dari database: closed_los, closed_can, closed_won
  if (
    stage === "closed_los" ||
    stage.includes("lost") ||
    stage.includes("closed_lost")
  )
    return "closed_lost";
  if (
    stage === "closed_can" ||
    stage.includes("cancel") ||
    stage.includes("closed_cancel")
  )
    return "closed_cancel";
  if (
    stage === "closed_won" ||
    stage.includes("won") ||
    stage.includes("closed_won")
  )
    return "closed_won";

  // Jika ada "closed" tapi bukan yang spesifik, treat as generic closed
  if (stage.includes("closed")) return "closed";

  return "prospect";
};

const normalizeDeal = (deal) => ({
  id: deal.id,
  name: deal.name || deal.dealName || deal.deal_name || "Untitled Deal",
  stage: normalizeStage(deal.stage || deal.pipeline),
  jumlah: deal.jumlah || deal.amount_value || deal.amount || "-",
  tertanggal:
    deal.tertanggal ||
    deal.expectedCloseDate ||
    deal.expected_close_date ||
    "-",
  contact: deal.contact || deal.contact_name || "-",
  company: deal.company || deal.company_name || "-",
  updatedAt: deal.updatedAt || deal.updated_at || "-",
  owner: deal.owner || deal.owner_name || "-",
  value: Number(deal.value || deal.amount || 0),
});

const rebuildBoards = (rawDeals) => {
  const grouped = {
    prospect: [],
    qualified: [],
    offer: [],
    negotiation: [],
    closed: [],
  };

  rawDeals.map(normalizeDeal).forEach((deal) => {
    const stage = String(deal.stage || "")
      .toLowerCase()
      .trim();

    // Eksplisit: kalau stage mengandung "closed", masuk ke closed board
    // Ini mencakup closed, closed_won, closed_lost, closed_cancel
    if (stage.includes("closed")) {
      grouped.closed.push(deal);
    }
    // Otherwise check other boards by stage key
    else if (grouped.hasOwnProperty(stage)) {
      grouped[stage].push(deal);
    }
    // Default ke prospect
    else {
      grouped.prospect.push(deal);
    }
  });

  boards.value = boardMeta.map((board) => ({
    ...board,
    items: grouped[board.key] || [],
  }));
};

/**
 * ACTIONS
 */
const deleteDeal = async (deal) => {
  const confirmed = await alertService.confirm(
    "Hapus Deal?",
    "Deal ini akan dihapus secara permanen. Lanjutkan?",
  );

  if (!confirmed) return;

  try {
    await store.dispatch("deals/deleteDeal", deal.id);
    await alertService.success("Deal berhasil dihapus.");
    await store.dispatch("deals/fetchAllDeals").catch(() => {});
  } catch (error) {
    console.error("Delete deal error:", error);
    await alertService.error("Gagal menghapus deal. Coba lagi.");
  }
};

let boardChangeTimeout = null;
const handleBoardChange = async (event, targetBoard) => {
  if (!event || !event.added || !event.added.element || isSyncingStage.value)
    return;

  const movedDeal = event.added.element;
  const previousStage = movedDeal.stage;
  const nextStage = targetBoard.key;

  if (previousStage === nextStage) return;

  let finalStage = nextStage;

  // Jika drag ke "closed" board, minta user pilih status
  if (nextStage === "closed") {
    await Swal.fire({
      title: "Closed Status",
      text: "Pilih status deal yang ditutup:",
      icon: "question",
      html: `
        <div class="flex flex-col gap-2">
          <button id="btn-won" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">✓ Won</button>
          <button id="btn-lost" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">✗ Lost</button>
          <button id="btn-cancel-status" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">⊘ Cancel</button>
        </div>
      `,
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        document.getElementById("btn-won")?.addEventListener("click", () => {
          window.closedChoice = "won";
          Swal.close();
        });
        document.getElementById("btn-lost")?.addEventListener("click", () => {
          window.closedChoice = "lost";
          Swal.close();
        });
        document
          .getElementById("btn-cancel-status")
          ?.addEventListener("click", () => {
            window.closedChoice = "cancel";
            Swal.close();
          });
      },
    });

    if (!window.closedChoice) return;

    const statusMap = {
      won: "closed_won",
      lost: "closed_lost",
      cancel: "closed_cancel",
    };
    finalStage = statusMap[window.closedChoice];
    window.closedChoice = null;
  }

  // Optimistic update
  movedDeal.stage = finalStage;
  isSyncingStage.value = true;

  if (boardChangeTimeout) clearTimeout(boardChangeTimeout);

  boardChangeTimeout = setTimeout(async () => {
    try {
      console.log(
        `[DealCard] Updating deal ${movedDeal.id} to stage: ${finalStage}`,
      );
      await store.dispatch("deals/updateDealStage", {
        dealId: movedDeal.id,
        newStage: finalStage,
      });
      console.log(`[DealCard] Update successful for deal ${movedDeal.id}`);
    } catch (error) {
      console.error("Failed to update deal stage:", error);
      movedDeal.stage = previousStage;
    } finally {
      isSyncingStage.value = false;
    }
  }, 300);
};
const handleViewDetail = (deal) => {
  if (isDragging.value) return;
  emit("viewDetail", deal);
};

/**
 * LIFECYCLE & WATCHERS
 */
onMounted(async () => {
  // Data fetched by parent
});

watch(
  allDeals,
  (deals) => {
    rebuildBoards(deals || []);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  isDragging.value = false;
  isCurrencyOpen.value = false;
  isPipelineOpen.value = false;
});
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-sm h-147 border border-outline flex flex-col overflow-hidden w-full"
  >
    <!-- Top Action Bar (Extracted) -->
    <DealsCardFilter
      v-model:searchQuery="searchQuery"
      :itemsPerPage="itemsPerPage"
      @update:itemsPerPage="(val) => emit('update:itemsPerPage', Number(val))"
      :selectedCurrency="selectedCurrency"
      :selectedPipeline="selectedPipeline"
      :isSidebarCollapsed="isSidebarCollapsed"
      :isCurrencyOpen="isCurrencyOpen"
      :isPipelineOpen="isPipelineOpen"
      @toggleCurrency="isCurrencyOpen = !isCurrencyOpen"
      @togglePipeline="isPipelineOpen = !isPipelineOpen"
      @selectCurrency="
        (curr) => {
          selectedCurrency = curr;
          isCurrencyOpen = false;
        }
      "
      @selectPipeline="
        (pipe) => {
          selectedPipeline = pipe;
          isPipelineOpen = false;
        }
      "
    />

    <!-- Pipeline Boards (Kanban) -->
    <div class="relative h-full w-full overflow-hidden">
      <!-- Scrollable Container -->
      <div class="overflow-x-auto bg-white pt-6 custom-scrollbar w-full h-full">
        <!-- Boards Wrapper -->
        <div class="flex h-full flex-nowrap gap-4 pl-6 pr-6 pb-10">
          <!-- Column Board Item -->
          <article
            v-for="board in boards"
            :key="board.id"
            class="w-72 shrink-0 flex flex-col bg-slate-50 border border-outline rounded-lg relative"
          >
            <!-- Board Header -->
            <header
              class="h-12 bg-white border-b border-outline flex items-center justify-between px-4 rounded-t-lg"
            >
              <h3 class="text-dark-base text-sm font-bold">
                {{ board.title }}
              </h3>
              <div
                class="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-white"
              >
                {{ board.items.length }}
              </div>
            </header>

            <!-- Draggable Area -->
            <draggable
              v-model="board.items"
              group="deals"
              item-key="id"
              class="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar min-h-25"
              @start="isDragging = true"
              @end="isDragging = false"
              @change="(event) => handleBoardChange(event, board)"
            >
              <template #item="{ element }">
                <DealsCardItem
                  :deal="element"
                  :boardTitle="board.title"
                  @viewDetail="handleViewDetail"
                  @delete="deleteDeal"
                />
              </template>
            </draggable>

            <!-- Board Footer with Total Amount -->
            <footer
              class="h-12 bg-white border-t border-outline flex items-center justify-center rounded-b-lg text-[11px] font-bold text-dark-base"
            >
              TOTAL: Rp
              {{
                board.items.reduce((t, i) => t + i.value, 0).toLocaleString()
              }}
            </footer>
          </article>
        </div>

        <!-- Visual Shadows for Scrolling -->
        <div
          class="pointer-events-none absolute top-0 left-0 h-full w-8 bg-linear-to-r from-white/60 to-transparent z-10"
        ></div>
        <div
          class="pointer-events-none absolute top-0 right-0 h-full w-8 bg-linear-to-l from-white/60 to-transparent z-10"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.ghost-card {
  opacity: 0.3;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
}

.chosen-card {
  transform: scale(1.02);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.drag-card {
  opacity: 0.8;
}
</style>
