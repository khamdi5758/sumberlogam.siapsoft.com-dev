<template>
  <div class="relative" ref="contactDropdownRef">
    <label class="block text-sm font-medium text-dark-base mb-2">
      Tambah Contact Association
    </label>
    <div
      @click="isContactDropdownOpen = !isContactDropdownOpen"
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
            <span class="text-xs text-sub-text">{{ contact.email }}</span>
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

  <!-- <button
    type="button"
    @click="showAddContactQuickForm = true"
    class="mt-2 text-sm text-sub-text hover:text-dark-base font-medium flex items-center gap-1"
  >
    <Plus :size="14" />
    Create Contact
  </button> -->

  <AddContactQuickForm
    :isOpen="showAddContactQuickForm"
    @close="showAddContactQuickForm = false"
    @submit="handleContactQuickSubmit"
  />
</template>
<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import { X, ChevronDown, Search, Check, Plus } from "lucide-vue-next";
import AddContactQuickForm from "@/components/forms/AddContactQuickForm.vue";

export default {
  name: "ContactAssociationForm",

  components: {
    X,
    ChevronDown,
    Search,
    Check,
    Plus,
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
    }),

    contactassoc: {
      get() {
        return this.modelValue || [];
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },

    // 🔥 deduplicate
    contactOptions() {
      let data = [];

      if (Array.isArray(this.contacts) && this.contacts.length > 0) {
        data = this.contacts;
      } else {
        data = this.allContacts || [];
      }

      const map = new Map();
      data.forEach((item) => {
        map.set(item.id, item);
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
  },

  unmounted() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  methods: {
    ...mapActions({
      getcontacts: "assoc/getcontacts",
    }),

    ...mapMutations({
      resetContacts: "assoc/RESET_CONTACTS",
    }),

    async fetchContacts() {
      if (!this.hasMore || this.isLoading) return;

      this.isLoading = true;

      const res = await this.getcontacts({
        page: this.page,
        search: this.contactSearch,
      });

      this.hasMore = res.next_page_url !== null;

      if (this.hasMore) {
        this.page++;
      }

      this.isLoading = false;
    },

    handleScroll() {
      const el = this.$refs.scrollContainer;
      if (!el || this.isLoading || !this.hasMore) return;

      const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;

      if (bottom) {
        this.fetchContacts();
      }
    },

    // 🔥 FIXED
    toggleContact(contact) {
      const contactId = String(contact.id);

      let newValue;

      if (this.contactassoc.includes(contactId)) {
        newValue = this.contactassoc.filter((id) => id !== contactId);
      } else {
        newValue = [...this.contactassoc, contactId];
      }

      this.contactassoc = newValue;
    },

    isContactSelected(id) {
      return this.contactassoc.includes(String(id));
    },

    getDisplayNameFromContact(contact) {
      return `${contact.first_name || ""} ${contact.last_name || ""}`.trim();
    },

    handleClickOutside(e) {
      if (!this.$refs.contactDropdownRef?.contains(e.target)) {
        this.isContactDropdownOpen = false;
      }
    },
  },

  watch: {
    isContactDropdownOpen(val) {
      if (!val) {
        this.contactSearch = "";
        this.page = 1;
        this.hasMore = true;
      }

      if (val && this.contactOptions.length === 0) {
        this.fetchContacts();
      }
    },

    contactSearch() {
      clearTimeout(this.debounceTimer);

      this.debounceTimer = setTimeout(() => {
        this.page = 1;
        this.hasMore = true;

        // 🔥 RESET DATA BIAR TIDAK DUPLIKAT
        this.resetContacts();

        this.fetchContacts();
      }, 300);
    },
  },
};
</script>







<!-- 
ditutup karena salah file, ini untuk referensi saja, jangan disarankan untuk dikembalikan ke codebase

<script>
import { mapActions, mapGetters } from "vuex";
import { X, ChevronDown, Search, Check, Plus } from "lucide-vue-next";
import AddContactQuickForm from "@/components/forms/AddContactQuickForm.vue";

export default {
  name: "ContactAssociationForm",

  components: {
    X,
    ChevronDown,
    Search,
    Check,
    Plus,
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
  },

  data() {
    return {
      isContactDropdownOpen: false,
      contactSearch: "",
      showAddContactQuickForm: false,
      page: 1,
      debounceTimer: null,
      hasMore: false,
    };
  },

  computed: {
    ...mapGetters({
      allContacts: "assoc/allContacts",
    }),

    contactassoc: {
      get() {
        return this.modelValue || [];
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },

    filteredContacts() {
      if (!this.contactSearch) return this.contactOptions;

      return this.contactOptions;

      // return (this.allContacts || []).filter((c) => {
      //   const name = `${c.first_name || ""} ${c.last_name || ""}`
      //     .toLowerCase()
      //     .trim();
      //   const email = (c.email || "").toLowerCase();
      //   const search = this.contactSearch.toLowerCase();

      //   return name.includes(search) || email.includes(search);
      // });
    },

    contactOptions() {
      if (Array.isArray(this.contacts) && this.contacts.length > 0) {
        return this.contacts;
      }
      return this.allContacts || [];
    },

    selectedContacts() {
      if (!Array.isArray(this.contactassoc) || this.contactassoc.length === 0) {
        return [];
      }

      return this.contactOptions.filter((contact) =>
        this.contactassoc.some(
          (id) => String(id).trim() === String(contact.id).trim(),
        ),
      );
    },
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },

  destroyed() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  methods: {
    ...mapActions({
      getcontacts: "assoc/getcontacts",
    }),

    async fetchContacts() {
      const res = await this.getcontacts({
        page: this.page,
        search: this.contactSearch,
      });

      this.hasMore = res.next_page_url !== null;
      if (this.hasMore) {
        this.page++;
      }

      // console.log("Fetched contacts:", this.hasMore);
      // console.log("Fetched contacts:", res);
      // console.log("page:", this.page);
    },

    handleContactQuickSubmit(e) {
      console.log("New contact created", e);
    },

    handleScroll() {
      const el = this.$refs.scrollContainer;

      if (!el) return;

      const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
      if (bottom) {
        this.fetchContacts();
      }
    },

    toggleContact(contact) {
      const contactId = String(contact.id).trim();
      const index = this.contactassoc.findIndex(
        (id) => String(id).trim() === contactId,
      );

      let newValue;
      if (index === -1) {
        newValue = [...this.contactassoc, contactId];
      } else {
        newValue = this.contactassoc.filter((id, i) => i !== index);
      }

      console.log("Toggling contact:", newValue);
      // this.contactassoc = newValue;
    },

    isContactSelected(id) {
      const contactId = String(id).trim();
      return this.contactassoc.some((cid) => String(cid).trim() === contactId);
    },

    getDisplayNameFromContact(contact) {
      return `${contact.first_name || ""} ${contact.last_name || ""}`.trim();
    },

    handleClickOutside(e) {
      if (!this.$refs.contactDropdownRef?.contains(e.target)) {
        this.isContactDropdownOpen = false;
      }
    },
  },

  watch: {
    isContactDropdownOpen(e) {
      console.log("Dropdown open changed:", e);
      if (e == false) {
        this.contactSearch = "";
        this.page = 1;
        // this.hasMore = false;
        // this.selectedContactsCache = (this.allContacts || []).filter((c) =>
        //   this.contactassoc.some((id) => String(id).trim() === String(c.id).trim()),
        // );
      }

      if (e && (!this.contactOptions || this.contactOptions.length === 0)) {
        this.fetchContacts();
      }
    },

    contactSearch(e) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.page = 1; // reset page
        this.fetchContacts();
      }, 300);
    },
    selectedContacts(newVal) {
      console.log("Selected contacts changed:", newVal);
    }
  },
};
</script> -->
