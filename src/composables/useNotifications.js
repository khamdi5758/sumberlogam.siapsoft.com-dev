import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/api'

// ─── Singleton state ───────────────────────────────────────────────
const notifications = ref([])
const toasts        = ref([])
let   pollInterval  = null
let   listenerCount = 0

// ─── sessionStorage helpers ────────────────────────────────────────
const STORAGE_KEY = 'notif_shown_ids'

function getSortTime(obj) {
  if (obj?.created_at) {
    const time = new Date(String(obj.created_at).replace(' ', 'T')).getTime();
    if (!isNaN(time)) return time;
  }
  return obj?.id || 0;
}

function sortNotifications(list) {
  return (list || []).slice().sort((a, b) => {
    const readA = a?.is_read == 1 ? 1 : 0
    const readB = b?.is_read == 1 ? 1 : 0
    
    if (readA !== readB) {
      return readA - readB // Unread (0) comes before Read (1)
    }

    const ta = getSortTime(a)
    const tb = getSortTime(b)
    return tb - ta
  })
}

function loadShownIds() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveShownIds(set) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
  } catch {
    // ignore jika storage penuh / tidak tersedia
  }
}

// Load saat module pertama kali dijalankan — tahan F5
const shownIds = loadShownIds()

// ──────────────────────────────────────────────────────────────────
export function useNotifications() {

  const unreadCount = computed(() =>
    notifications.value.filter(n => n.is_read == 0).length
  )

  // ── Fetch & deteksi notif baru ──────────────────────────────────
  async function fetchNotifications() {
    try {
      const res  = await api.get('notifications', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      const data = res.data?.data ?? res.data ?? []

      // Deteksi notif baru berdasarkan ID (bukan bandingkan count)
      const newOnes = data.filter(n => n.is_read == 0 && !shownIds.has(n.id))

      notifications.value = sortNotifications(data)

      // Tampilkan toast & simpan ID agar tidak muncul lagi setelah F5
      if (newOnes.length) {
        newOnes.forEach(n => {
          shownIds.add(n.id)
          addToast(n.title ?? n.message ?? 'Notifikasi baru')
        })
        saveShownIds(shownIds)
      }
    } catch (e) {
      console.error('[useNotifications] Gagal fetch:', e)
    }
  }

  // ── Mark satu notif sebagai sudah dibaca ────────────────────────
  async function markRead(id) {
    try {
      await api.patch(`notifications/${id}/read`)
      const n = notifications.value.find(x => x.id === id)
      if (n) n.is_read = 1
      notifications.value = sortNotifications(notifications.value)
    } catch (e) {
      console.error('[useNotifications] Gagal mark read:', e)
    }
  }

  // ── Mark semua notif sebagai sudah dibaca ───────────────────────
  async function markAllRead() {
  try {
    await api.patch('notifications/markallread')
    notifications.value.forEach(n => {
      if (n.is_read == 0) n.is_read = 1
    })
    notifications.value = sortNotifications(notifications.value)
    // Reset shownIds agar notif baru berikutnya bisa muncul toast lagi
    shownIds.clear()
    sessionStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('[useNotifications] Gagal mark all read:', e)
  }
}

  // ── Toast ───────────────────────────────────────────────────────
  function addToast(message) {
    const id = Date.now() + Math.random() // hindari collision jika muncul bersamaan
    toasts.value.push({ id, message })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 4000)
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  // ── Lifecycle: satu interval untuk semua komponen ───────────────
  onMounted(() => {
    listenerCount++
    if (listenerCount === 1) {
      fetchNotifications()
      pollInterval = setInterval(fetchNotifications, 30_000)
    }
  })

  onUnmounted(() => {
    listenerCount--
    if (listenerCount === 0 && pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  })

  // ── Public API ──────────────────────────────────────────────────
  return {
    notifications,
    unreadCount,
    toasts,
    markRead,
    markAllRead,
    addToast,
    removeToast,
    fetchNotifications,
  }
}