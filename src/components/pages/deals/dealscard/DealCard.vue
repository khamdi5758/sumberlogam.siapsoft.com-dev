<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useStore } from "vuex";
import draggable from "vuedraggable";
import Swal from "sweetalert2";
import { alertService } from "@/services/alertService";
import { useNotifications } from "@/composables/useNotifications";

// Sub-components
import DealsCardFilter from "./DealsCardFilter.vue";
import DealsCardItem from "./DealsCardItem.vue";

const { fetchNotifications } = useNotifications();
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

const storePipelines = computed(
  () => store.getters["deals/getpipelines"] || [],
);

const boardMeta = computed(() => {
  if (!storePipelines.value || storePipelines.value.length === 0) {
    // Fallback static columns while loading
    return [
      { id: 1, key: "new", title: "New" },
      { id: 2, key: "qualified", title: "Qualified" },
      { id: 3, key: "proposal", title: "Proposal" },
      { id: 4, key: "negotiation", title: "Negotiation" },
      { id: 5, key: "closed", title: "Closed" },
    ];
  }

  // Transform store pipelines to board format
  const boards = [];
  const closedItems = [];

  storePipelines.value.forEach((p) => {
    // Support both direct DB fields and normalized label/value
    const name = String(p.pipeline_name || p.label || "").toLowerCase();
    const id = p.id_pipeline || p.value || p.id;

    if (
      name.includes("won") ||
      name.includes("lost") ||
      name.includes("close")
    ) {
      closedItems.push(p);
    } else {
      boards.push({
        id: id,
        key: String(p.pipeline_name || p.label || "")
          .toLowerCase()
          .trim(),
        title: p.pipeline_name || p.label,
      });
    }
  });

  // Consolidate closed items into one column if they exist
  if (closedItems.length > 0) {
    boards.push({
      id: "closed", // special key for consolidated column
      key: "closed",
      title: "Closed",
    });
  }

  return boards;
});

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
  const stage = String(rawStage || "new")
    .toLowerCase()
    .trim();

  // 1. Cek dynamic mapping dari store pipelines jika ada
  const pipelines = storePipelines.value;
  if (pipelines && pipelines.length > 0) {
    const found = pipelines.find(
      (p) =>
        String(p.id_pipeline || p.value || "").toLowerCase() === stage ||
        String(p.pipeline_name || p.label || "")
          .toLowerCase()
          .trim() === stage,
    );
    if (found) {
      // Jika ini won/lost, return key khusus agar dikelompokkan ke "closed"
      const name = String(
        found.pipeline_name || found.label || "",
      ).toLowerCase();
      if (
        name.includes("won") ||
        name.includes("lost") ||
        name.includes("close")
      ) {
        return name.includes("won") ? "close_won" : "close_lost";
      }
      return name.trim();
    }
  }

  // 2. Fallback static mapping
  if (stage === "1" || stage === "new" || stage === "prospect") return "new";
  if (stage === "2" || stage.includes("qual")) return "qualified";
  if (
    stage === "3" ||
    stage.includes("prop") ||
    stage.includes("offer") ||
    stage.includes("payment")
  )
    return "proposal";
  if (stage === "4" || stage.includes("negot") || stage.includes("adv"))
    return "negotiation";
  if (
    stage === "5" ||
    stage === "6" ||
    stage.includes("won") ||
    stage.includes("lost") ||
    stage.includes("close")
  )
    return "closed";

  return "new";
};

const normalizeDeal = (deal) => ({
  id: deal.id,
  name: deal.name || deal.dealName || deal.deal_name || "Untitled Deal",
  stage: normalizeStage(
    deal.stage ||
      deal.pipeline ||
      deal.pipelinenm ||
      deal.id_pipeline ||
      deal.pipeline_id,
  ),
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
  if (isSyncingStage.value) return; // Prevent snap-back during sync

  const currentMeta = boardMeta.value;
  const grouped = {};

  currentMeta.forEach((m) => {
    grouped[m.key] = [];
  });

  const normalized = rawDeals.map(normalizeDeal);
  normalized.forEach((deal) => {
    const stageKey = String(deal.stage || "")
      .toLowerCase()
      .trim();

    // Grouping logic: anything related to closing goes to "closed" column if it exists
    if (
      stageKey === "closed" ||
      stageKey.includes("close") ||
      stageKey.includes("won") ||
      stageKey.includes("lost")
    ) {
      if (grouped.hasOwnProperty("closed")) {
        grouped.closed.push(deal);
      } else {
        const closedCol = currentMeta.find(
          (m) => m.key.includes("close") || m.key.includes("won"),
        );
        if (closedCol) {
          grouped[closedCol.key].push(deal);
        } else {
          grouped[currentMeta[0].key].push(deal);
        }
      }
    } else if (grouped.hasOwnProperty(stageKey)) {
      grouped[stageKey].push(deal);
    } else {
      // Log for debugging why it went to New
      if (stageKey !== (currentMeta[0]?.key || "new")) {
        console.warn(
          `[DealCard] Deal ${deal.id} stage '${stageKey}' not found in boardMeta keys. Defaulting to first column.`,
        );
      }
      const firstKey = currentMeta[0]?.key || "new";
      if (grouped[firstKey]) {
        grouped[firstKey].push(deal);
      }
    }
  });

  boards.value = currentMeta.map((meta) => ({
    ...meta,
    items: grouped[meta.key] || [],
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

  // Cari stage label dari boardMeta untuk ditampilkan di konfirmasi
  const currentStageMeta = boardMeta.value.find((b) => b.key === previousStage);
  const targetStageMeta = boardMeta.value.find((b) => b.key === nextStage);
  const currentStageTitle = currentStageMeta?.title || previousStage;
  const targetStageTitle = targetStageMeta?.title || nextStage;

  // Confirmation dialog untuk stage change
  const confirmResult = await Swal.fire({
    title: "Konfirmasi Perubahan Stage",
    html: `<p>Pindahkan deal <strong>"${movedDeal.name}"</strong></p>
           <p>dari <strong>${currentStageTitle}</strong> ke <strong>${targetStageTitle}</strong>?</p>`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "var(--color-progress-color)",
    cancelButtonColor: "var(--color-red)",
    cancelButtonText: "Batal",
    confirmButtonText: "Ya",
  });

  if (!confirmResult.isConfirmed) {
    // Revert drag jika user batal
    rebuildBoards(allDeals.value);
    return;
  }

  let finalStage = nextStage;

  // Jika drag ke "closed" board, minta user pilih status
  if (nextStage === "closed") {
    await Swal.fire({
      title: "Status Deal Ditutup",
      text: "Pilih status deal yang ditutup:",
      icon: "question",
      html: `
        <div class="flex flex-col gap-2">
          <button id="btn-won" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">✓ Won</button>
          <button id="btn-lost" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">✗ Lost</button>
          <button id="btn-cancel-status" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">⊘ Batal</button>
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

    if (!window.closedChoice || window.closedChoice === "cancel") {
      // Revert drag jika user batal
      rebuildBoards(allDeals.value);
      return;
    }

    const statusMap = {
      won: "close_won",
      lost: "close_lost",
    };
    finalStage = statusMap[window.closedChoice];
    window.closedChoice = null;
  }

  // Optimistic update - IMMEDIATELY set locally
  movedDeal.stage = finalStage;
  isSyncingStage.value = true;

  if (boardChangeTimeout) clearTimeout(boardChangeTimeout);

  boardChangeTimeout = setTimeout(async () => {
    try {
      console.log(
        `[DealCard] Syncing deal ${movedDeal.id} to backend with stage: ${finalStage}`,
      );
      await store.dispatch("deals/updateDealStage", {
        dealId: movedDeal.id,
        newStage: finalStage,
      });

      // ── Refresh Notification jika Deal Won ──
      // Karena backend yang memproses notifikasi, frontend tinggal tarik data terbaru
      if (finalStage.toLowerCase().includes("won")) {
        setTimeout(() => {
          fetchNotifications();
        }, 500); // delay sedikit agar backend selesai menyimpan notif
      }
    } catch (error) {
      console.error("Failed to sync deal stage to backend:", error);
      // Revert local stage on failure
      movedDeal.stage = previousStage;
      rebuildBoards(allDeals.value);
    } finally {
      isSyncingStage.value = false;
    }
  }, 300);
};
const handleViewDetail = (deal) => {
  if (isDragging.value) return;
  emit("viewDetail", deal);
};

const handleStageChange = async (deal, newStage) => {
  try {
    // Sync-lock
    isSyncingStage.value = true;

    // Cari pipeline ID dari store
    const pipelines = store.getters["deals/getpipelines"] || [];
    const searchStr = newStage.toLowerCase().includes("won") ? "won" : "lost";
    const targetPipeline = pipelines.find((p) =>
      String(p.pipeline_name || p.label || "")
        .toLowerCase()
        .includes(searchStr),
    );

    if (!targetPipeline) {
      alertService.error("Pipeline stage not found.");
      return;
    }

    // Optimistic update
    deal.stage = newStage.includes("won") ? "Close Won" : "Close Lost";

    await store.dispatch("deals/updateDealStage", {
      dealId: deal.id,
      newStage: targetPipeline.pipeline_name || targetPipeline.label, // This matches what updateDealStage expects
      stageId: targetPipeline.id_pipeline || targetPipeline.value,
      stageName: targetPipeline.pipeline_name || targetPipeline.label,
    });

    alertService.success(
      `Status updated to ${newStage.includes("won") ? "Won" : "Lost"}`,
    );

    // ── Refresh Notification jika Deal Won ──
    if (newStage.toLowerCase().includes("won")) {
      setTimeout(() => {
        fetchNotifications();
      }, 500);
    }
  } catch (error) {
    console.error("Failed to update stage:", error);
    alertService.error("Failed to update deal status.");
    // Revert local if needed
    rebuildBoards(store.getters["deals/uiDeals"]);
  } finally {
    isSyncingStage.value = false;
    // Final sync with store data
    rebuildBoards(store.getters["deals/uiDeals"]);
  }
};

/**
 * LIFECYCLE & WATCHERS
 */
onMounted(async () => {
  // Pastikan pipeline data sudah ter-fetch agar mapping board meta akurat
  if (
    !store.state.deals.pipelines ||
    store.state.deals.pipelines.length === 0
  ) {
    await store.dispatch("deals/fetchpipelines").catch((err) => {
      console.error("[DealCard] Failed to fetch pipelines:", err);
    });
  }
});

watch(
  [allDeals, boardMeta],
  ([deals]) => {
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
              <h3 class="text-main-text text-sm font-bold">
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
              :list="board.items"
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
                  @stageChange="handleStageChange"
                />
              </template>
            </draggable>

            <!-- Board Footer with Total Amount -->
            <footer
              class="h-12 bg-white border-t border-outline flex items-center justify-center rounded-b-lg text-[11px] font-bold text-main-text"
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
  background: var(--color-outline);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-sub-text);
}

.ghost-card {
  opacity: 0.3;
  background: var(--color-light-base);
  border: 2px dashed var(--color-outline);
}

.chosen-card {
  transform: scale(1.02);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.drag-card {
  opacity: 0.8;
}
</style>
