<template>
  <div class="relative" ref="contactDropdownRef">
    <div class="flex items-center gap-1.5 mb-2">
      <label class="block text-sm font-medium text-dark-base">
        Contact Association
      </label>
      <div v-if="filterByCompany" class="relative group flex items-center">
        <Info
          :size="14"
          class="text-gray-400 cursor-help hover:text-gray-600 transition-colors"
        />
        <!-- Info Tooltip (Menggunakan Warna dari welcome.css) -->
        <div
          class="absolute right-0 top-6 w-44 p-2.5 text-white text-[10px] leading-snug rounded shadow-2xl z-[70] border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
          style="background-color: var(--color-waiting-color, #404460);"
        >
          <div class="flex items-start gap-1.5">
            <Info :size="10" class="mt-0.5 shrink-0 text-blue-300" />
            <p>Kontak difilter berdasarkan perusahaan terpilih.</p>
          </div>
          <!-- Arrow Tooltip -->
          <div 
            class="absolute -top-1 right-1.5 w-2 h-2 rotate-45 border-t border-l border-white/10"
            style="background-color: var(--color-waiting-color, #404460);"
          ></div>
        </div>
      </div>
    </div>

    <div
      @click="handledropdown"
      class="w-full px-3 py-2 border border-outline rounded-lg flex flex-wrap gap-2 items-center cursor-pointer min-h-10.5 bg-white transition focus-within:ring-1 focus-within:ring-sub-text"
    >
      <div v-if="contactassoc.length === 0" class="text-gray-400 text-sm">
        Search and select contacts
      </div>
      <div
        v-for="contact in selectedContacts"
        :key="contact.id"
        class="flex items-center gap-1 bg-light-base px-2 py-1 rounded text-xs font-medium text-dark-base border border-outline"
        @click.stop
      >
        {{ getDisplayNameFromContact(contact) }}
        <X
          :size="12"
          class="cursor-pointer hover:text-red"
          @click="toggleContact(contact)"
        />
      </div>
      <ChevronDown :size="16" class="ml-auto text-sub-text" />
    </div>

    <!-- Dropdown Menu -->
    <div
      v-if="isContactDropdownOpen"
      class="absolute z-50 w-full mt-1 bg-white border border-outline rounded-lg shadow-xl flex flex-col max-h-64"
    >
      <div class="p-2 border-b border-outline">
        <div class="relative">
          <Search
            :size="14"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-sub-text"
          />
          <input
            v-model="contactSearch"
            type="text"
            placeholder="Search by name or email"
            class="w-full pl-9 pr-3 py-2 bg-light-base/50 border border-outline rounded text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
            @click.stop
          />
        </div>
      </div>
      <div
        ref="scrollContainer"
        class="flex-1 overflow-y-auto py-1"
        @scroll="handleScroll"
      >
        <div
          v-for="contact in filteredContacts"
          :key="contact.id"
          @click="toggleContact(contact)"
          class="px-4 py-2 hover:bg-light-base cursor-pointer flex items-center justify-between text-sm transition"
        >
          <div class="flex flex-col">
            <span class="font-medium text-dark-base">{{
              getDisplayNameFromContact(contact)
            }}</span>
            <span class="text-xs text-sub-text">{{ contact.email || "" }}</span>
          </div>
          <div
            v-if="isContactSelected(contact.id)"
            class="w-5 h-5 bg-dark-base rounded-full flex items-center justify-center"
          >
            <Check :size="12" class="text-white" />
          </div>
        </div>
        <div
          v-if="filteredContacts.length === 0"
          class="px-4 py-6 text-center text-sm text-sub-text"
        >
          No contacts found
        </div>
      </div>
    </div>
  </div>

  <AddContactQuickForm
    :isOpen="showAddContactQuickForm"
    @close="showAddContactQuickForm = false"
    @submit="handleContactQuickSubmit"
  />
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import { X, ChevronDown, Search, Check, Plus, Info } from "lucide-vue-next";
import AddContactQuickForm from "@/components/forms/AddContactQuickForm.vue";

export default {
  name: "ContactAssociationForm",

  components: {
    X,
    ChevronDown,
    Search,
    Check,
    Plus,
    Info,
    AddContactQuickForm,
  },

  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    contacts: {
      type: Array,
      default: () => [],
    },
    companyId: {
      type: [String, Number, Array],
      default: () => [],
    },
    filterByCompany: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isContactDropdownOpen: false,
      contactSearch: "",
      showAddContactQuickForm: false,
      page: 1,
      debounceTimer: null,
      hasMore: true,
      isLoading: false,
    };
  },

  computed: {
    ...mapGetters({
      allContacts: "assoc/allContacts",
      dealsContacts: "deals/getcontact",
    }),

    contactassoc: {
      get() {
        return this.modelValue || [];
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },

    contactOptions() {
      let storeData =
        (this.filterByCompany ? this.dealsContacts : this.allContacts) || [];
      if (storeData && storeData.data && Array.isArray(storeData.data))
        storeData = storeData.data;

      // Gabungkan data awal (prop contacts) dengan data dari store
      const combined = [
        ...(this.contacts || []),
        ...(Array.isArray(storeData) ? storeData : []),
      ];

      const map = new Map();
      combined.forEach((item) => {
        const id = item.value || item.id;
        if (id) {
          map.set(String(id), {
            ...item,
            id: String(id),
            first_name: item.label || item.first_name,
            last_name: item.label ? "" : item.last_name,
          });
        }
      });

      return Array.from(map.values());
    },

    filteredContacts() {
      return this.contactOptions;
    },

    selectedContacts() {
      if (!this.contactassoc.length) return [];
      return this.contactOptions.filter((contact) =>
        this.contactassoc.includes(String(contact.id))
      );
    },
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside);
    if (this.filterByCompany) {
      this.resetDealsContacts();
      this.fetchContacts();
    }
  },

  unmounted() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  methods: {
    ...mapActions({
      getcontacts: "assoc/getcontacts",
      dealsFetchContact: "deals/fetchcontact",
    }),

    ...mapMutations({
      resetAssocContacts: "assoc/resetContacts",
      resetDealsContacts: "deals/RESET_CONTACTS",
    }),

    handledropdown() {
      if (!this.isContactDropdownOpen) {
        if (this.filterByCompany) {
          this.resetDealsContacts();
        } else {
          this.resetAssocContacts();
        }
        this.page = 1;
        this.hasMore = true;
      }
      this.isContactDropdownOpen = !this.isContactDropdownOpen;
    },

    async fetchContacts() {
      if (!this.hasMore || this.isLoading) return;

      this.isLoading = true;
      const params = {
        page: this.page,
        search: this.contactSearch,
      };

      try {
        if (this.filterByCompany) {
          let cid = null;
          if (Array.isArray(this.companyId) && this.companyId.length > 0) {
            cid = this.companyId[0];
          } else if (this.companyId && !Array.isArray(this.companyId)) {
            cid = this.companyId;
          }

          if (!cid) {
            console.log("fetchContacts: No companyId available, clearing list");
            this.resetDealsContacts();
            this.isLoading = false;
            this.hasMore = false;
            return;
          }

          params.companyid = cid;
          const res = await this.dealsFetchContact(params);
          this.hasMore = (res && typeof res === 'object' && res.next_page_url) ? true : false;
        } else {
          const res = await this.getcontacts(params);
          this.hasMore = (res && typeof res === 'object' && res.next_page_url) ? true : false;
          if (this.hasMore) this.page++;
        }
      } catch (e) {
        this.hasMore = false;
      } finally {
        this.isLoading = false;
      }
    },

    handleScroll() {
      const el = this.$refs.scrollContainer;
      if (!el || this.isLoading || !this.hasMore) return;
      const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
      if (bottom) {
        this.fetchContacts();
      }
    },

    toggleContact(contact) {
      const contactId = String(contact.id);
      let newValue;
      if (this.contactassoc.includes(contactId)) {
        newValue = this.contactassoc.filter((id) => id !== contactId);
      } else {
        newValue = [...this.contactassoc, contactId];
      }
      this.contactassoc = newValue;
      this.isContactDropdownOpen = false;
    },

    isContactSelected(id) {
      return this.contactassoc.includes(String(id));
    },

    getDisplayNameFromContact(contact) {
      if (contact.label) return contact.label;
      return `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "Unknown Contact";
    },

    handleClickOutside(e) {
      if (!this.$refs.contactDropdownRef?.contains(e.target)) {
        this.isContactDropdownOpen = false;
      }
    },

    handleContactQuickSubmit(e) {
      console.log("New contact created", e);
    }
  },

  watch: {
    isContactDropdownOpen(val) {
      if (!val) {
        this.contactSearch = "";
        this.page = 1;
        this.hasMore = true;
      } else if (this.contactOptions.length === 0) {
        this.fetchContacts();
      }
    },

    contactSearch() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.page = 1;
        this.hasMore = true;
        if (this.filterByCompany) {
          this.resetDealsContacts();
        } else {
          this.resetAssocContacts();
        }
        this.fetchContacts();
      }, 300);
    },

    companyId: {
      deep: true,
      handler(newVal, oldVal) {
        if (this.filterByCompany) {
          const newId = Array.isArray(newVal) ? newVal[0] : newVal;
          const oldId = Array.isArray(oldVal) ? oldVal[0] : oldVal;

          // Hanya reset jika ID perusahaan benar-benar berubah (bukan inisialisasi pertama)
          if (oldId && newId != oldId) {
            console.log("Company changed, resetting list");
            this.contactassoc = [];
          }

          this.resetDealsContacts();
          this.page = 1;
          this.hasMore = true;
          this.fetchContacts();
        }
      },
    },
  },
};
</script>
