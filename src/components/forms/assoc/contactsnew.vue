<template>
  <div>
    <label class="block text-sm font-medium text-main-text mb-2">
      Contact Association
    </label>

    <v-select
      v-model="contactassoc"
      :options="allContacts"
      :reduce="(c) => String(c.id)"
      :get-option-label="getDisplayNameFromContact"
      multiple
      searchable
      clearable
      placeholder="Search and select contacts"
      class="w-full"
    >
      <!-- OPTION LIST -->
      <template #option="{ first_name, last_name, email }">
        <div class="flex flex-col">
          <span class="font-medium text-main-text">
            {{ first_name }} {{ last_name }}
          </span>
          <span class="text-xs text-sub-text">
            {{ email || "No email" }}
          </span>
        </div>
      </template>

      <!-- SELECTED TAG -->
      <template #selected-option="{ first_name, last_name }">
        <span> {{ first_name }} {{ last_name }} </span>
      </template>
    </v-select>

    <!-- BUTTON TAMBAH -->
    <button
      type="button"
      @click="showAddContactQuickForm = true"
      class="mt-2 text-sm text-sub-text hover:text-main-text font-medium flex items-center gap-1"
    >
      <Plus :size="14" />
      Create Contact
    </button>

    <!-- MODAL -->
    <AddContactQuickForm
      :isOpen="showAddContactQuickForm"
      @close="showAddContactQuickForm = false"
      @submit="handleContactQuickSubmit"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import { Plus } from "lucide-vue-next";
import AddContactQuickForm from "@/components/forms/AddContactQuickForm.vue";

export default {
  name: "ContactAssociationForm",

  components: {
    vSelect,
    Plus,
    AddContactQuickForm,
  },

  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      showAddContactQuickForm: false,
    };
  },

  computed: {
    ...mapGetters({
      allContacts: "assoc/allContacts",
    }),

    // 🔥 binding ke parent
    contactassoc: {
      get() {
        return this.modelValue || [];
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },

  mounted() {
    // load kalau kosong
    if (!this.allContacts || this.allContacts.length === 0) {
      this.getcontacts();
    }
  },

  methods: {
    ...mapActions({
      getcontacts: "assoc/getcontacts",
    }),

    getDisplayNameFromContact(contact) {
      return (
        `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
        `Contact #${contact.id}`
      );
    },

    async handleContactQuickSubmit(newContact) {
      this.showAddContactQuickForm = false;

      // reload data
      await this.getcontacts();

      // auto select contact baru
      if (newContact?.id) {
        this.contactassoc = [...this.contactassoc, String(newContact.id)];
      }
    },
  },
};
</script>
