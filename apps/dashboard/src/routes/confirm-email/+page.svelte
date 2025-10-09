<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import AuthUI from '$lib/components/AuthUI/index.svelte';
  import TextField from '$lib/components/Form/TextField.svelte';
  import PrimaryButton from '$lib/components/PrimaryButton/index.svelte';
  import AuthError from '$lib/components/ErrorMessage/AuthError.svelte';
  import SuccessMessage from '$lib/components/ErrorMessage/SuccessMessage.svelte';
  import { getSupabase } from '$lib/utils/functions/supabase';
  import { forgotValidation } from '$lib/utils/functions/validator';
  import { currentOrg } from '$lib/utils/store/org';

  export let data;

  let supabase = getSupabase();
  let email = '';
  let submitError: string;
  let errorType: 'error' | 'warning' | 'info' | 'success' = 'error';
  let loading = false;
  let success = false;
  let successMessage = '';
  let errors: Record<string, string> = {};
  let formRef: HTMLFormElement;

  // Get organization name from layout data (server-side) or store (client-side)
  $: orgName = data.org?.name || $currentOrg.name || 'ClassroomIO';
  $: orgLogo = data.org?.avatar_url || $currentOrg.avatar_url;

  function dismissError() {
    submitError = '';
  }

  function dismissSuccess() {
    successMessage = '';
  }

  async function handleSubmit() {
    errors = forgotValidation({ email });
    console.log('errors', errors);

    if (Object.keys(errors).length) {
      return;
    }

    try {
      loading = true;
      submitError = ''; // Clear previous errors

      // Resend confirmation email
      const { data: resendData, error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      console.log('Resend confirmation data', resendData);
      
      if (error) {
        console.log('Resend confirmation error:', error);
        errorType = 'error';
        submitError = error.message || 'Failed to send confirmation email. Please try again.';
        loading = false;
        return;
      }

      success = true;
      successMessage = `Confirmation email sent! Please check your email (${email}) and click the confirmation link to activate your account.`;
    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      errorType = 'error';
      submitError = error?.message || 'An unexpected error occurred. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Confirm Email - {orgName}</title>
</svelte:head>

<AuthUI {supabase} {handleSubmit} showOnlyContent={true} showLogo={!success} orgName={orgName} orgLogo={orgLogo} bind:formRef>
  {#if success}
    <div class="mt-4 w-full flex items-center justify-center flex-col">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
      </div>
      <h3 class="dark:text-white text-xl font-semibold my-3">Email Sent!</h3>
      <p class="dark:text-white text-md mb-6 text-center">
        We've sent a confirmation email to <span class="text-primary-700 font-medium">{email}</span>.
        Please check your inbox and click the confirmation link to activate your account.
      </p>
    </div>

    <div class="my-4 w-full flex justify-end items-center flex-col">
      <PrimaryButton
        label="Back to Login"
        type="button"
        className="sm:w-full w-full mb-4"
        onClick={() => goto('/login')}
      />
    </div>
  {:else}
    <div class="mt-4 w-full">
      <h3 class="dark:text-white text-xl font-semibold my-3">Confirm Your Email</h3>
      <p class="dark:text-white text-sm mb-6">
        Enter your email address and we'll send you a new confirmation link.
      </p>
      
      <SuccessMessage 
        bind:message={successMessage}
        title="Email Sent!"
        on:dismiss={dismissSuccess}
      />
      
      <AuthError 
        bind:error={submitError}
        type={errorType}
        showSignup={true}
        on:dismiss={dismissError}
      />
      
      <TextField
        label="Your email"
        bind:value={email}
        type="email"
        autoFocus={true}
        placeholder="you@domain.com"
        className="mb-6"
        inputClassName="w-full"
        isDisabled={loading}
        errorMessage={errors.email}
      />
    </div>

    <div class="my-4 w-full flex justify-end items-center flex-col">
      <PrimaryButton
        label="Send Confirmation Email"
        type="submit"
        className="sm:w-full w-full mb-4"
        isDisabled={loading}
        isLoading={loading}
      />
      <PrimaryButton
        label="Back to Login"
        type="button"
        className="sm:w-full w-full text-primary-700"
        variant="NONE"
        onClick={() => goto('/login')}
      />
    </div>
  {/if}
</AuthUI>
