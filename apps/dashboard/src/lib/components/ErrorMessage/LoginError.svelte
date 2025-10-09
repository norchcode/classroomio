<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let error: string = '';
  export let type: 'error' | 'warning' | 'info' = 'error';
  export let dismissible: boolean = true;
  
  const dispatch = createEventDispatcher();
  
  function dismiss() {
    dispatch('dismiss');
  }
  
  function getIconClass() {
    switch (type) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-red-500';
    }
  }
  
  function getBgClass() {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
    }
  }
  
  function getIcon() {
    switch (type) {
      case 'error':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
      case 'info':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
    }
  }
</script>

{#if error}
  <div class="relative rounded-lg border p-4 mb-4 {getBgClass()} animate-in slide-in-from-top-2 duration-300">
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 {getIconClass()}" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="{getIcon()}" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
          {error}
        </p>
      </div>
      {#if dismissible}
        <div class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button
              type="button"
              class="inline-flex rounded-md p-1.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
              on:click={dismiss}
            >
              <span class="sr-only">Dismiss</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  @keyframes slide-in-from-top-2 {
    from {
      transform: translateY(-8px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .animate-in {
    animation: slide-in-from-top-2 0.3s ease-out;
  }
</style>
