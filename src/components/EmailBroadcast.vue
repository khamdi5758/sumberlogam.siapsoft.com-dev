<script setup>
import { ref } from "vue";
import { Mail, RefreshCw, Check } from "lucide-vue-next";

const exchangeStatus = ref("disconnected"); // disconnected | connecting | connected
const gmailStatus = ref("disconnected");

const connectExchange = async () => {
  if (exchangeStatus.value === "connected") {
    exchangeStatus.value = "disconnected";
    alert("Disconnected from Exchange");
    return;
  }

  exchangeStatus.value = "connecting";

  try {
    // Simulate API call - replace with actual endpoint
    await new Promise((resolve) => setTimeout(resolve, 1500));
    exchangeStatus.value = "connected";
    alert("Successfully connected to Exchange!");
  } catch (error) {
    exchangeStatus.value = "disconnected";
    alert("Failed to connect to Exchange");
  }
};

const connectGmail = async () => {
  if (gmailStatus.value === "connected") {
    gmailStatus.value = "disconnected";
    alert("Disconnected from Gmail");
    return;
  }

  gmailStatus.value = "connecting";

  try {
    // Simulate API call - replace with actual endpoint
    await new Promise((resolve) => setTimeout(resolve, 1500));
    gmailStatus.value = "connected";
    alert("Successfully connected to Gmail!");
  } catch (error) {
    gmailStatus.value = "disconnected";
    alert("Failed to connect to Gmail");
  }
};
</script>

<template>
  <div class="">
    <div class="mb-5">
      <h1 class="text-2xl font-bold text-main-text mb-1 font-['Montserrat']">
        Email Sync
      </h1>
      <p class="text-sm text-sub-text">
        Email sync settings are shared between lead flows and collected forms.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Exchange Section -->
      <div
        class="bg-white rounded-xl border border-outline p-8 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div class="flex items-center gap-4 mb-6">
          <div
            class="w-12 h-12 flex items-center justify-center bg-[#0078d4]/10 rounded-lg"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M26 4H6C4.89543 4 4 4.89543 4 6V26C4 27.1046 4.89543 28 6 28H26C27.1046 28 28 27.1046 28 26V6C28 4.89543 27.1046 4 26 4Z"
                fill="#0078D4"
              />
              <path d="M21.5 22.5H10.5V11.5H21.5V22.5Z" fill="white" />
              <path d="M12.5 13.5H19.5V20.5H12.5V13.5Z" fill="#0078D4" />
              <path d="M14.5 15.5H17.5V18.5H14.5V15.5Z" fill="white" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-[#0078D4]">Exchange</h2>
        </div>

        <button
          @click="connectExchange"
          :disabled="exchangeStatus === 'connecting'"
          class="w-full md:w-auto px-6 py-2.5 font-semibold rounded-lg shadow-sm transition-all text-sm mb-4 flex items-center justify-center gap-2 disabled:opacity-60"
          :class="[
            exchangeStatus === 'connected'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-[#0078D4] hover:bg-[#006abc] text-white',
          ]"
        >
          <RefreshCw
            v-if="exchangeStatus === 'connecting'"
            :size="16"
            class="animate-spin"
          />
          <Check v-else-if="exchangeStatus === 'connected'" :size="16" />
          <span v-if="exchangeStatus === 'connecting'">Connecting...</span>
          <span v-else-if="exchangeStatus === 'connected'">
            Connected - Click to Disconnect
          </span>
          <span v-else>Connect with Exchange</span>
        </button>

        <p class="text-xs text-sub-text">
          *only for microsoft business account with exchange enabled
        </p>
      </div>

      <!-- Gmail Section -->
      <div
        class="bg-white rounded-xl border border-outline p-8 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div class="flex items-center gap-4 mb-6">
          <div
            class="w-12 h-12 flex items-center justify-center bg-[#EA4335]/10 rounded-lg"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 8V24H28V8H4ZM25.32 10.4L16 16.32L6.68 10.4H25.32ZM6.4 21.6V12.4L16 18.32L25.6 12.4V21.6H6.4Z"
                fill="#EA4335"
              />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-main-text">Gmail</h2>
        </div>

        <button
          @click="connectGmail"
          :disabled="gmailStatus === 'connecting'"
          class="w-full md:w-auto px-6 py-2.5 font-semibold rounded-lg shadow-sm transition-all text-sm mb-4 flex items-center justify-center gap-2 disabled:opacity-60"
          :class="[
            gmailStatus === 'connected'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-[#0078D4] hover:bg-[#006abc] text-white',
          ]"
        >
          <RefreshCw
            v-if="gmailStatus === 'connecting'"
            :size="16"
            class="animate-spin"
          />
          <Check v-else-if="gmailStatus === 'connected'" :size="16" />
          <span v-if="gmailStatus === 'connecting'">Connecting...</span>
          <span v-else-if="gmailStatus === 'connected'">
            Connected - Click to Disconnect
          </span>
          <span v-else>Connect with Gmail</span>
        </button>

        <p class="text-xs text-sub-text">*only for business email</p>
      </div>
    </div>

    <!-- Business Notification -->
    <div
      class="mt-8 p-4 bg-white border border-outline rounded-lg flex items-start gap-3"
    >
      <div class="p-1 bg-outline rounded-full">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1c2434"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <p class="text-sm text-main-text font-medium leading-relaxed">
        <strong>Note:</strong> Fitur email broadcast ini dikhususkan untuk akun
        email bisnis guna memastikan deliverability rate yang optimal.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Matching satoshi/montserrat fonts usage from welcome.css */
h1 {
  font-family: "Montserrat", sans-serif;
}
</style>
