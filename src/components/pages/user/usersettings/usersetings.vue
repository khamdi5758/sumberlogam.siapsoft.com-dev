<template>
  <div class="flex flex-col h-full">
    <div
      class="bg-white rounded-lg shadow-sm p-4 border border-outline flex flex-col min-h-0 flex-1 overflow-hidden mb-4 lg:mb-0"
    >
      <!-- Header -->
      <UsersHeader
        :isLoading="isLoadingTable"
        :totalUsers="totalDocuments"
        @refresh="fetchData"
        @open-add-user="showCreateUserForm = true"
        @delete-users="handleDeleteUsers"
      />

      <!-- Filter Bar -->
      <UsersFilterBar
        :searchQuery="searchQuery"
        :itemsPerPage="itemsPerPage"
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:searchQuery="searchQuery = $event"
        @update:itemsPerPage="itemsPerPage = $event"
        @update:currentPage="currentPage = $event"
        @search="fetchData"
        @prev-page="prevPage"
        @next-page="nextPage"
      />

      <!-- Table (scrollable) -->
      <div class="mt-3 flex-1 min-h-0 relative overflow-hidden">
        <UsersTable
          :users="currentUser"
          :isLoading="isLoadingTable"
          :currentPage="currentPage"
          :itemsPerPage="itemsPerPage"
          @edit="openUserDetail"
          @delete="handleDeleteUser"
        />
      </div>
    </div>
  </div>

  <!-- Add User Form Modal -->
  <CreateUserForm
    :isOpen="showCreateUserForm"
    :user="selectedUser"
    @close="
      showCreateUserForm = false;
      selectedUser = null;
    "
    @submit="fetchData"
  />
</template>

<script>
import { mapGetters, mapActions, mapState } from "vuex";
import { alertService } from "@/services/alertService";

import UsersHeader from "./usersHeader.vue";
import UsersFilterBar from "./usersetFiltBar.vue";
import UsersTable from "./usersTable.vue";
import CreateUserForm from "@/components/forms/CreateUserForm.vue";

export default {
  name: "UserSettings",
  components: {
    UsersHeader,
    UsersFilterBar,
    UsersTable,
    CreateUserForm,
  },

  data() {
    return {
      showCreateUserForm: false,
      itemsPerPage: 5,
      currentPage: 1,
      selectedUser: null,
      searchQuery: "",
    };
  },

  computed: {
    ...mapGetters({
      users: "users/allUsers",
      isLoadingTable: "users/isLoading",
      errorMsgTable: "users/error",
    }),

    ...mapState({
      authUser: (state) => state.auth.user,
    }),

    isAdmin() {
      const user = this.authUser;
      return (
        user &&
        (user.role === "admin" ||
          user.stafflevel === "admin" ||
          user.role === "Admin")
      );
    },

    totalDocuments() {
      return this.users.length;
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.totalDocuments / this.itemsPerPage));
    },

    currentUser() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.users.slice(start, end);
    },
  },

  watch: {
    currentPage(val) {
      if (val < 1) this.currentPage = 1;
      if (val > this.totalPages) this.currentPage = this.totalPages;
    },

    itemsPerPage() {
      this.currentPage = 1;
    },
  },

  methods: {
    ...mapActions({
      fetchUsers: "users/fetchAllusers",
      deleteUser: "users/deleteuser",
    }),

    fetchData() {
      this.fetchUsers()
        .then(() => {
          console.log("Users fetched successfully");
        })
        .catch((err) => {
          console.error("Failed to fetch users:", err);
        });
    },

    openUserDetail(user) {
      this.selectedUser = user;
      this.showCreateUserForm = true;
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },

    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },

    async handleDeleteUser(user) {
      if (!user?.id) return;

      const confirmDelete = await alertService.confirm(
        `User "${user.firstname || user.name}" akan dihapus permanen. Lanjutkan?`,
        "Hapus User?",
        {
          confirmButtonText: "Ya, Hapus",
          cancelButtonText: "Kembali",
        },
      );

      if (!confirmDelete) return;

      try {
        await this.deleteUser(user.id);
        await alertService.success("User berhasil dihapus");
        this.fetchData(); // Refresh list
      } catch (error) {
        console.error("Failed deleting user:", error);
        const backendMessage =
          error?.response?.data?.message || "Gagal menghapus user.";
        await alertService.error(backendMessage);
      }
    },
  },

  mounted() {
    this.fetchData();
  },
};
</script>
