import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/api'

// ─── Singleton state ───────────────────────────────────────────────
const notifications = ref([])
const toasts        = ref([])
let   pollInterval  = null
let   listenerCount = 0

// ─── sessionStorage helpers ────────────────────────────────────────
const STORAGE_KEY = 'notif_shown_ids'

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
    notifications.value.filter(n => !n.read_at).length
  )

  // ── Fetch & deteksi notif baru ──────────────────────────────────
  async function fetchNotifications() {
    try {
      const res  = await api.get('notifications')
      const data = res.data?.data ?? res.data ?? []

      // Deteksi notif baru berdasarkan ID (bukan bandingkan count)
      const newOnes = data.filter(n => !n.read_at && !shownIds.has(n.id))

      notifications.value = data

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
      if (n) n.read_at = new Date().toISOString()
    } catch (e) {
      console.error('[useNotifications] Gagal mark read:', e)
    }
  }

  // ── Mark semua notif sebagai sudah dibaca ───────────────────────
  async function markAllRead() {
    try {
      await api.patch('notifications/markallread')
      notifications.value.forEach(n => {
        if (!n.read_at) n.read_at = new Date().toISOString()
      })
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