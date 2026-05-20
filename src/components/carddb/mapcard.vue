<template>
  <div class="map-card">
    <div class="card-header">
      <h4>{{ title }}</h4>
      <p v-if="locations.length === 0" class="text-muted">
        Tidak ada data lokasi
      </p>
    </div>
    <div class="card-body">
      <div
        ref="mapContainer"
        class="map-area"
        :style="{ height: mapHeight + 'px' }"
      ></div>
    </div>
  </div>
</template>

<script>
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

export default {
  name: "MapCard",
  props: {
    // Daftar perusahaan: setiap item harus punya lat, lng, name, dll.
    locations: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: "Peta Persebaran Perusahaan",
    },
    mapHeight: {
      type: Number,
      default: 400,
    },
  },
  data() {
    return {
      map: null,
      clusterer: null,
      markers: [],
      isLoading: false,
    };
  },
  watch: {
    locations: {
      deep: true,
      handler() {
        this.refreshMarkers();
      },
    },
  },
  async mounted() {
    await this.initMap();
  },
  beforeDestroy() {
    if (this.clusterer) {
      this.clusterer.clearMarkers();
    }
    if (this.map) {
      google.maps.event.clearInstanceListeners(this.map);
    }
  },
  methods: {
    async initMap() {
      if (this.isLoading) return;
      this.isLoading = true;

      try {
        // 1. Muat Google Maps API pakai functional API dari js-api-loader v2.x
        const apiKey =
          import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY ||
          process.env.VUE_APP_GOOGLE_MAPS_API_KEY;
        if (!window.__googleMapsLoaderOptionsSet) {
          setOptions({
            apiKey: apiKey,
            key: apiKey,
            version: "weekly",
          });
          window.__googleMapsLoaderOptionsSet = true;
        }

        await Promise.all([
          importLibrary("maps"),
          importLibrary("places"),
          importLibrary("marker"),
        ]);

        // 2. Tentukan titik tengah peta (default Surabaya)
        let center = { lat: -7.2575, lng: 112.7521 }; // default Surabaya
        if (
          this.locations.length === 1 &&
          this.locations[0].lat &&
          this.locations[0].lng
        ) {
          center = { lat: this.locations[0].lat, lng: this.locations[0].lng };
        }

        // 3. Buat peta
        this.map = new google.maps.Map(this.$refs.mapContainer, {
          center: center,
          zoom: 12,
          mapId: "YOUR_MAP_ID", // opsional
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        // 4. Buat clusterer (pengelompok marker)
        this.clusterer = new MarkerClusterer({
          map: this.map,
          markers: [],
        });

        // 5. Tambahkan semua marker
        this.addMarkers();

        // 6. Jika ada lebih dari 1 marker, atur batas peta agar semua terlihat
        if (this.markers.length > 1) {
          const bounds = new google.maps.LatLngBounds();
          this.markers.forEach((marker) => bounds.extend(marker.getPosition()));
          this.map.fitBounds(bounds);
        }
      } catch (error) {
        console.error("Gagal memuat Google Maps:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // Membuat satu marker beserta info window
    createMarker(location) {
      const contentString = `
        <div style="min-width: 220px; max-width: 300px; font-size: 13px; line-height: 1.5; font-family: sans-serif;">
          <strong style="font-size: 14px;">${this.escapeHtml(location.name || "Perusahaan")}</strong><br/>
          ${location.address ? `<strong>📍 Alamat:</strong> ${this.escapeHtml(location.address)}<br/>` : ""}
          ${location.contact ? `<strong>👤 Kontak:</strong> ${this.escapeHtml(location.contact)}<br/>` : ""}
          ${location.phone ? `<strong>📞 Telepon:</strong> ${this.escapeHtml(location.phone)}<br/>` : ""}
          ${location.email ? `<strong>✉️ Email:</strong> ${this.escapeHtml(location.email)}<br/>` : ""}
          ${location.deals ? `<strong>📊 Jumlah Deal:</strong> ${location.deals}<br/>` : ""}
          ${location.dealsValue ? `<strong>💰 Nilai Deal:</strong> ${this.formatCurrency(location.dealsValue)}<br/>` : ""}
        </div>
      `;

      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: this.map,
        title: location.name,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: contentString,
        ariaLabel: location.name,
      });

      marker.addListener("click", () => {
        infoWindow.close();
        infoWindow.open(this.map, marker);
      });

      return marker;
    },

    // Menambahkan semua marker ke clusterer
    addMarkers() {
      if (!this.map || !this.clusterer) return;

      // Hapus semua marker lama
      this.clusterer.clearMarkers();
      this.markers = [];

      this.locations.forEach((location) => {
        if (
          location &&
          typeof location.lat === "number" &&
          typeof location.lng === "number"
        ) {
          const marker = this.createMarker(location);
          this.markers.push(marker);
        }
      });

      if (this.markers.length > 0) {
        this.clusterer.addMarkers(this.markers);
      }
    },

    refreshMarkers() {
      if (this.map && this.clusterer) {
        this.addMarkers();
      }
    },

    // Biar aman dari XSS
    escapeHtml(text) {
      if (!text) return "";
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    },

    formatCurrency(value) {
      if (value === undefined || value === null) return "";
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(value);
    },
  },
};
</script>

<style scoped>
.map-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #fff;
  overflow: hidden;
  margin-bottom: 20px;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.text-muted {
  margin: 0;
  font-size: 12px;
  color: #888;
}

.card-body {
  padding: 0;
}

.map-area {
  width: 100%;
  background: #f0f0f0;
}
</style>
