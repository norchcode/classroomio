<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { t } from '$lib/utils/functions/translations';
  import CheckmarkFilled from 'carbon-icons-svelte/lib/CheckmarkFilled.svelte';
  import WarningFilled from 'carbon-icons-svelte/lib/WarningFilled.svelte';
  import InformationFilled from 'carbon-icons-svelte/lib/InformationFilled.svelte';
  import ErrorFilled from 'carbon-icons-svelte/lib/ErrorFilled.svelte';
  import Close from 'carbon-icons-svelte/lib/Close.svelte';
  import { goto } from '$app/navigation';

  export let error: string = '';
  export let type: 'error' | 'warning' | 'info' | 'success' = 'error';
  export let showForgotPassword = false;
  export let showSignup = false;
  export let showResendConfirmation = false;
  export let dismissible = true;

  const dispatch = createEventDispatcher();

  function dismiss() {
    error = '';
    dispatch('dismiss');
  }

  function handleForgotPassword() {
    goto('/forgot');
  }

  function handleSignup() {
    goto('/signup');
  }

  function handleResendConfirmation() {
    goto('/confirm-email');
  }

  $: iconClass = {
    error: 'text-red-500',
    warning: 'text-yellow-500', 
    info: 'text-blue-500',
    success: 'text-green-500'
  }[type];

  $: bgClass = {
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
  }[type];

  $: textClass = {
    error: 'text-red-800 dark:text-red-200',
    warning: 'text-yellow-800 dark:text-yellow-200',
    info: 'text-blue-800 dark:text-blue-200',
    success: 'text-green-800 dark:text-green-200'
  }[type];
</script>

{#if error}
  <div 
    class="mb-4 rounded-lg border p-4 {bgClass} {textClass}"
    transition:fade={{ duration: 300 }}
  >
    <div class="flex items-start">
      <div class="flex-shrink-0">
        {#if type === 'error'}
          <ErrorFilled class="h-5 w-5 {iconClass}" />
        {:else if type === 'warning'}
          <WarningFilled class="h-5 w-5 {iconClass}" />
        {:else if type === 'info'}
          <InformationFilled class="h-5 w-5 {iconClass}" />
        {:else if type === 'success'}
          <CheckmarkFilled class="h-5 w-5 {iconClass}" />
        {/if}
      </div>
      
      <div class="ml-3 flex-1">
        <p class="text-sm font-medium {textClass}">
          {error}
        </p>
        
        {#if showForgotPassword && type === 'error'}
          <div class="mt-2">
            <button
              type="button"
              class="text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
              on:click={handleForgotPassword}
            >
              Forgot your password?
            </button>
          </div>
        {/if}
        
        {#if showSignup && type === 'error'}
          <div class="mt-2">
            <button
              type="button"
              class="text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
              on:click={handleSignup}
            >
              Don't have an account? Sign up
            </button>
          </div>
        {/if}
        
        {#if showResendConfirmation && type === 'warning'}
          <div class="mt-2">
            <button
              type="button"
              class="text-sm font-medium text-yellow-600 hover:text-yellow-500 dark:text-yellow-400 dark:hover:text-yellow-300"
              on:click={handleResendConfirmation}
            >
              Resend confirmation email
            </button>
          </div>
        {/if}
      </div>
      
      {#if dismissible}
        <div class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button
              type="button"
              class="inline-flex rounded-md p-1.5 {textClass} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-600"
              on:click={dismiss}
            >
              <span class="sr-only">Dismiss</span>
              <Close class="h-4 w-4" />
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
