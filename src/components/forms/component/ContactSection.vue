<template>
  <div class="p-6 h-full flex flex-col">
    <!-- BUTTON TAMBAH -->
    <div class="flex items-center gap-3 mb-4">
      <button
        @click="handletambahcontact"
        class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-outline rounded-xl text-sm font-semibold hover:bg-light-base shadow-sm font-montserrat"
      >
        <Plus :size="18" />
        Tambah Contacts Yang Ada
      </button>

      <button
        @click="$emit('add-new')"
        class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-dark-base text-white border border-transparent rounded-xl text-sm font-semibold hover:bg-dark-hover shadow-sm transition-all font-montserrat"
      >
        <Plus :size="18" />
        Tambah Contact Baru
      </button>
    </div>

    <!-- CARD -->
    <div class="border border-outline rounded-lg p-4 flex flex-col flex-1">
      <!-- HEADER -->
      <div class="flex items-center gap-2 mb-3">
        <Users :size="16" class="text-sub-text" />
        <h3 class="text-sm font-semibold">
          Contacts yang terkait dengan company ini
        </h3>
      </div>

      <!-- LIST -->
      <div class="flex-1 overflow-y-auto pr-1">
        <ul v-if="contacts?.length" class="space-y-2">
          <li
            v-for="data in contacts"
            :key="data.id"
            class="px-3 py-2 rounded-lg bg-light-base border border-outline flex items-center justify-between group"
          >
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium truncate">
                {{ data.first_name }} {{ data.last_name }}
              </p>
              <p class="text-xs text-sub-text">ID: {{ data.id }}</p>
              <p v-if="data.email" class="text-xs text-sub-text truncate">
                {{ data.email }}
              </p>
            </div>
            <button
              @click="confirmRemove(data)"
              class="p-1.5 text-sub-text hover:text-red hover:bg-red/5 rounded-lg border border-outline bg-white shadow-sm transition-all active:scale-95 ml-2"
              title="Hapus Contact"
            >
              <Trash2 :size="16" />
            </button>
          </li>
        </ul>

        <div v-else class="text-sm text-sub-text">
          Daftar Contact belum tersedia.
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div
      v-if="openModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click="handleBackdropClick"
    >
      <div class="bg-white rounded-xl p-6 w-100 shadow-xl" @click.stop>
        <ContactAssociationForm
          ref="contactAssociationRef"
          v-model="form.contactassoc"
        />

        <!-- <h2 class="text-lg font-semibold mb-4">Tambah Contact</h2>

        <div class="space-y-3">
          <input v-model="form.first_name" placeholder="First Name" class="w-full border rounded px-3 py-2" />
          <input v-model="form.last_name" placeholder="Last Name" class="w-full border rounded px-3 py-2" />
          <input v-model="form.email" placeholder="Email" class="w-full border rounded px-3 py-2" />
        </div> -->

        <div class="flex justify-end gap-2 mt-4">
          <button @click="openModal = false" class="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            @click="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Plus, Users, Trash2 } from "lucide-vue-next";
import { mapActions, mapGetters } from "vuex";
import FormBrowseDialog from "@/components/widgets/FormBrowseDialog.vue";
import FormBrowse from "@/components/widgets/FormBrowse.vue";
import ContactAssociationForm from "../assoc/contacts.vue";
import { alertService } from "@/services/alertService";

export default {
  name: "ContactSection",

  props: {
    contacts: {
      type: Array,
      default: () => [],
    },
  },

  components: {
    Plus,
    Users,
    Trash2,
    FormBrowse,
    ContactAssociationForm,
  },

  emits: ["save", "remove"],

  data() {
    return {
      openModal: false,
      form: {
        contactassoc: [],
      },
    };
  },

  computed: {
    ...mapGetters({ allContacts: "contacts/allContacts" }),
  },

  methods: {
    ...mapActions({ fetchAllContacts: "contacts/fetchAllContacts" }),

    handleBackdropClick() {
      // Close nested layer first (quick form/dropdown), then close this modal.
      const handledByChild =
        this.$refs.contactAssociationRef?.closeTopLayer?.();
      if (handledByChild) return;

      this.openModal = false;
    },

    submit() {
      this.$emit("save", this.form);

      this.openModal = false;

      // reset form
      this.form = {
        contactassoc: [],
      };
    },
    async handletambahcontact() {
      this.openModal = true;
    },
    confirmRemove(data) {
      alertService.confirm(
        "Data contact ini hanya akan dihapus dari daftar hubungan company ini, namun tetap akan tersedia di modul Contacts sebagai arsip.",
        "Hapus Hubungan Contact?",
        {
          confirmButtonText: "Ya, Hapus",
          cancelButtonText: "Kembali",
        }
      ).then((result) => {
        if (result) {
          this.$emit("remove", { contactassoc: [data.id] });
        }
      });
    },
  },

  watch: {
    contacts(newVal) {
      console.log("Contacts updated:", newVal);
    },

    form(e) {
      console.log("Form updated:", e);
    },
  },
};
</script>

