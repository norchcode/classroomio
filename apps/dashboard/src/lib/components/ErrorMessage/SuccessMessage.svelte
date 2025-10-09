<script lang="ts">
  import { fade } from 'svelte/transition';
  import CheckmarkFilled from 'carbon-icons-svelte/lib/CheckmarkFilled.svelte';
  import { createEventDispatcher } from 'svelte';

  export let message: string = '';
  export let title: string = 'Success!';
  export let dismissible = true;

  const dispatch = createEventDispatcher();

  function dismiss() {
    message = '';
    dispatch('dismiss');
  }
</script>

{#if message}
  <div 
    class="mb-6 rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20"
    transition:fade={{ duration: 300 }}
  >
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <CheckmarkFilled class="h-6 w-6 text-green-500" />
      </div>
      
      <div class="ml-3 flex-1">
        <h3 class="text-lg font-semibold text-green-800 dark:text-green-200">
          {title}
        </h3>
        <p class="mt-2 text-sm text-green-700 dark:text-green-300">
          {message}
        </p>
      </div>
      
      {#if dismissible}
        <div class="ml-auto pl-3">
          <button
            type="button"
            class="inline-flex rounded-md p-1.5 text-green-600 hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600 dark:text-green-400"
            on:click={dismiss}
          >
            <span class="sr-only">Dismiss</span>
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
