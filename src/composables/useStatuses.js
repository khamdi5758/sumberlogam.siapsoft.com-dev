import { ref, onMounted } from "vue";
import api from "@/api";
import { useCookies } from "vue3-cookies";

const { cookies } = useCookies();

// Singleton: cache statuses globally untuk hindari repeated API calls
let cachedStatuses = null;
let statusesPromise = null;

export function useStatuses() {
  const statuses = ref([]);
  const statusesLoading = ref(false);
  const statusesError = ref(null);

  const fetchStatuses = async () => {
    // Jika sudah pernah di-fetch, gunakan cache
    if (cachedStatuses !== null) {
      statuses.value = cachedStatuses;
      return cachedStatuses;
    }

    // Jika sedang di-fetch, tunggu sampai selesai (prevent duplicate requests)
    if (statusesPromise) {
      const result = await statusesPromise;
      statuses.value = result;
      return result;
    }

    if (!api || !api.get) {
      console.warn("API module not ready, using fallback statuses");
      const fallback = [
        { id: 1, name: "Competitor" },
        { id: 2, name: "Customer" },
        { id: 3, name: "Ex Customer" },
        { id: 4, name: "Lead" },
        { id: 5, name: "Opportunity" },
        { id: 6, name: "Partner" },
        { id: 7, name: "Qualified" },
      ];
      cachedStatuses = fallback;
      statuses.value = fallback;
      return fallback;
    }

    statusesLoading.value = true;
    statusesError.value = null;

    // Simpan promise untuk prevent race condition
    statusesPromise = (async () => {
      try {
        const response = await api.get("statuses", {
          headers: {
            Authorization: "Bearer " + cookies.get("token"),
          },
        });
        let data = response.data || [];

        // Normalize object/array to standard {id, name} objects
        if (Array.isArray(data)) {
          data = data.map((item) => ({
            ...item,
            id: item.id_status || item.id || item.value,
            name: item.status_name || item.name || item.label || item.status,
            table_code: item.table_code || item.tableCode || item.table || "",
          }));
        } else if (data && typeof data === "object") {
          data = Object.entries(data).map(([key, val]) => {
            if (typeof val === "object" && val !== null) {
              return {
                ...val,
                id: val.id_status || val.id || key,
                name: val.status_name || val.name || val.label || key,
                table_code: val.table_code || val.tableCode || val.table || "",
              };
            }
            return { id: key, name: val, table_code: "" };
          });
        }

        cachedStatuses = data;
        statuses.value = data;
        console.log("✅ Statuses loaded and normalized:", data);
        return data;
      } catch (error) {
        console.error("❌ Failed to fetch statuses:", error);
        statusesError.value = error.message;
        // Fallback ke hardcoded jika API fail
        const fallback = [
          { id: 1, name: "Competitor" },
          { id: 2, name: "Customer" },
          { id: 3, name: "Ex Customer" },
          { id: 4, name: "Lead" },
          { id: 5, name: "Opportunity" },
          { id: 6, name: "Partner" },
          { id: 7, name: "Qualified" },
        ];
        cachedStatuses = fallback;
        statuses.value = fallback;
        return fallback;
      } finally {
        statusesLoading.value = false;
        statusesPromise = null;
      }
    })();

    return await statusesPromise;
  };

  const getStatusName = (id) => {
    if (!id) return "-";
    const status = statuses.value.find((s) => s.id == id);
    return status ? status.name : "-";
  };

  return {
    statuses,
    statusesLoading,
    statusesError,
    fetchStatuses,
    getStatusName,
  };
}
