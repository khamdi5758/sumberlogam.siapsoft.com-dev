<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-outline p-12 text-center"
  >
    <div
      class="w-20 h-20 bg-light-base rounded-full flex items-center justify-center mx-auto mb-6"
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-sub-text"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    </div>
    <h2 class="text-xl font-bold text-main-text mb-2">Short Codes</h2>
    <p class="text-sub-text max-w-md mx-auto">
      Define and manage shortcodes for dynamic content in your documents. This
      feature is currently under development.
    </p>
    <div class="mt-8 flex flex-wrap justify-center gap-3">
      <span
        class="px-3 py-1 bg-gray-100 rounded-md text-xs text-sub-text border border-gray-200"
        >[user_name]</span
      >
      <span
        class="px-3 py-1 bg-gray-100 rounded-md text-xs text-sub-text border border-gray-200"
        >[company_name]</span
      >
      <span
        class="px-3 py-1 bg-gray-100 rounded-md text-xs text-sub-text border border-gray-200"
        >[date_today]</span
      >
    </div>
  </div>
</template>
