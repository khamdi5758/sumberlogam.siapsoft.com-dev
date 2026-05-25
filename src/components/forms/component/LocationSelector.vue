<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-main-text mb-2"
          >Province</label
        >
        <div class="relative">
          <v-select
            v-model="modelValue.province"
            :options="getprovinsi"
            label="nm_provinsi"
            :reduce="(opt) => opt.kd_provinsi"
            placeholder="Select Province"
            @update:modelValue="onChangeProvince"
          />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-main-text mb-2"
          >City</label
        >
        <div class="relative">
          <v-select
            v-model="modelValue.city"
            :options="getkotakabupaten"
            label="nm_kota_kabupaten"
            :reduce="(opt) => opt.kd_kota_kabupaten"
            placeholder="Select City"
            @update:modelValue="onChangeCity"
          />
        </div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-main-text mb-2"
          >Kecamatan</label
        >
        <div class="relative">
          <v-select
            v-model="modelValue.kecamatan"
            :options="getkecamatan"
            label="nm_kecamatan"
            :reduce="(opt) => opt.kd_kecamatan"
            placeholder="Select Kecamatan"
            @update:modelValue="onChangeKecamatan"
          />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-main-text mb-2"
          >Kelurahan</label
        >
        <div class="relative">
          <v-select
            v-model="modelValue.kelurahan"
            :options="getkelurahan"
            label="caption_kelurahan"
            :reduce="(opt) => opt.kd_kelurahan"
            placeholder="Select Kelurahan"
            @update:modelValue="onChangekelurahan"
          />
        </div>
      </div>
    </div>

    <div class="grid gap-4">
      <!-- <div>
        <label class="block text-sm font-medium text-main-text mb-2"
          >Pos Code</label
        >
       
        <div class="relative">
          <v-select
            v-model="modelValue.pos_code"
            :options="getkodepos"
            label="kode_pos"
            :reduce="(opt) => opt.kode_pos"
            placeholder="Select Kode Pos"
          />
        </div>
      </div> -->

      <div>
        <label class="block text-sm font-medium text-main-text mb-2"
          >Address</label
        >
        <!-- <input
          :value="currentValue.address || ''"
          type="text"
          placeholder="Address"
          :disabled="disabled"
          class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
          @input="emitValue({ address: $event.target.value })"
        /> -->

        <textarea
          :value="currentValue.address || ''"
          placeholder="Address"
          :disabled="disabled"
          rows="4"
          class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
          @input="emitValue({ address: $event.target.value })"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import { ChevronDown } from "lucide-vue-next";
import provincesCsv from "idn-area-data/data/provinces.csv?raw";
import regenciesCsv from "idn-area-data/data/regencies.csv?raw";
import { mapActions, mapGetters } from "vuex";
import { on } from "devextreme/events";

function parseCsvRows(csvText) {
  if (!csvText || typeof csvText !== "string") return [];

  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row = {};

    headers.forEach((header, index) => {
      row[header] = (values[index] || "").trim();
    });

    return row;
  });
}

export default {
  name: "LocationSelector",

  components: {
    ChevronDown,
  },

  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
    modelValue: {
      type: Object,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["input", "update:modelValue"],

  data() {
    return {
      provincesData: [],
      regenciesData: [],
      citySearch: "",
      provincesearch: "",
      isCityDropdownOpen: false,
      isProvinceDropdownOpen: false,
    };
  },

  computed: {
    ...mapGetters({
      getprovinsi: "lokasi/getprovinsi",
      getkotakabupaten: "lokasi/getkotakabupaten",
      getkecamatan: "lokasi/getkecamatan",
      getkelurahan: "lokasi/getkelurahan",
      getkodepos: "lokasi/getkodepos",
    }),

    currentValue() {
      return this.modelValue || this.value || {};
    },

    provinceOptions() {
      return (this.provincesData || []).map((province) => ({
        id: String(province.code),
        name: province.name,
      }));
    },

    selectedProvinceId() {
      const provinceName = (this.currentValue.province || "")
        .toLowerCase()
        .trim();
      if (!provinceName) return "";

      const selectedProvince = (this.provincesData || []).find(
        (province) => (province.name || "").toLowerCase() === provinceName,
      );

      return selectedProvince ? String(selectedProvince.code) : "";
    },

    cityOptions() {
      return (this.regenciesData || [])
        .filter((regency) => {
          if (!this.selectedProvinceId) return true;
          return (
            String(regency.province_code) === String(this.selectedProvinceId)
          );
        })
        .map((regency) => ({
          id: String(regency.code),
          name: regency.name,
          provinceCode: String(regency.province_code),
        }));
    },

    filteredCityOptions() {
      const query = (this.citySearch || "").toLowerCase().trim();

      if (!query) {
        return this.cityOptions.slice(0, 120);
      }

      return this.cityOptions
        .filter((city) => (city.name || "").toLowerCase().includes(query))
        .slice(0, 120);
    },

    countryValue() {
      if (this.currentValue.city && String(this.currentValue.city).trim()) {
        return "Indonesia";
      }

      return this.currentValue.country || "";
    },
  },

  watch: {
    "currentValue.city": {
      immediate: true,
      handler(nextCity) {
        if (!this.isCityDropdownOpen) {
          this.citySearch = nextCity || "";
        }
      },
    },
  },

  mounted() {
    this.provincesData = parseCsvRows(provincesCsv);
    this.regenciesData = parseCsvRows(regenciesCsv);
    document.addEventListener("mousedown", this.handleClickOutside);
    this.actprovinsi();
  },

  beforeUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  },

  methods: {
    ...mapActions({
      actprovinsi: "lokasi/actprovinsi",
      actkotakabupaten: "lokasi/actkotakabupaten",
      actkecamatan: "lokasi/actkecamatan",
      actkelurahan: "lokasi/actkelurahan",
      actkodepos: "lokasi/actkodepos",
    }),

    emitValue(updatedFields) {
      const nextValue = {
        ...this.currentValue,
        ...updatedFields,
      };

      this.$emit("input", nextValue);
      this.$emit("update:modelValue", nextValue);
    },
    onChangeProvince(event) {
      console.log("Province changed:", event);
      this.actkotakabupaten({ id: event });
    },
    onChangeCity(event) {
      console.log("City changed:", event);
      this.actkecamatan({ id: event });
    },
    onChangeKecamatan(event) {
      console.log("Kecamatan changed:", event);
      this.actkelurahan({ id: event });
    },
    onChangekelurahan(event) {
      console.log("Kelurahan changed:", event);
      let thisdtkelurahan = this.getkelurahan.filter(
        (kelurahan) => String(kelurahan.kd_kelurahan) === String(event),
      );
      this.modelValue.pos_code = thisdtkelurahan[0].kode_pos;
      this.actkodepos({ id: event });
    },

    onCityInput(event) {
      const nextValue = event.target.value;
      this.citySearch = nextValue;
      this.isCityDropdownOpen = true;

      this.emitValue({
        city: nextValue,
        country: nextValue && nextValue.trim() ? "Indonesia" : "",
      });
    },

    openCityDropdown() {
      this.isCityDropdownOpen = true;
    },

    onCityInput(event) {
      const nextValue = event.target.value;
      this.citySearch = nextValue;
      this.isCityDropdownOpen = true;

      this.emitValue({
        city: nextValue,
        country: nextValue && nextValue.trim() ? "Indonesia" : "",
      });
    },

    selectCity(city) {
      const selectedProvince = (this.provincesData || []).find(
        (province) => String(province.code) === String(city.provinceCode),
      );

      this.citySearch = city.name;
      this.isCityDropdownOpen = false;

      this.emitValue({
        city: city.name,
        province: selectedProvince
          ? selectedProvince.name
          : this.currentValue.province || "",
        country: "Indonesia",
      });
    },

    selectprovince(province) {
      this.provincesearch = province.nm_provinsi;
      this.isProvinceDropdownOpen = false;

      this.emitValue({
        province: province.kd_provinsi,
        city: "",
        country: "Indonesia",
      });

      this.citySearch = "";
    },

    handleClickOutside(event) {
      if (!this.$refs.cityDropdownRef) return;
      if (!this.$refs.cityDropdownRef.contains(event.target)) {
        this.isCityDropdownOpen = false;
      }
    },
  },
};
</script>
