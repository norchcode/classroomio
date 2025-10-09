<script lang="ts">
  import { goto } from '$app/navigation';
  import TextField from '$lib/components/Form/TextField.svelte';
  import PrimaryButton from '$lib/components/PrimaryButton/index.svelte';
  import { VARIANTS } from '$lib/components/PrimaryButton/constants';
  import { getSupabase } from '$lib/utils/functions/supabase';
  import { forgotValidation } from '$lib/utils/functions/validator';
  import { ROUTE } from '$lib/utils/constants/routes';
  import { FORGOT_PASSWORD_FIELDS } from '$lib/utils/constants/authentication';
  import AuthUI from '$lib/components/AuthUI/index.svelte';
  import AuthError from '$lib/components/ErrorMessage/AuthError.svelte';
  import EmailSentIcon from '$lib/components/Icons/EmailSentIcon.svelte';
  import { currentOrg } from '$lib/utils/store/org';

  export let data;

  let supabase = getSupabase();
  let fields = Object.assign({}, FORGOT_PASSWORD_FIELDS);
  let submitError: string;
  let errorType: 'error' | 'warning' | 'info' | 'success' = 'error';
  let loading = false;
  let success = false;
  let errors: Record<string, string> = {};
  let formRef: HTMLFormElement;

  // Get organization name from layout data (server-side) or store (client-side)
  $: orgName = data.org?.name || $currentOrg.name || 'ClassroomIO';
  $: orgLogo = data.org?.avatar_url || $currentOrg.avatar_url;

  function dismissError() {
    submitError = '';
  }

  async function handleSubmit() {
    errors = forgotValidation(fields);
    console.log('errors', errors);

    if (Object.keys(errors).length) {
      return;
    }

    try {
      loading = true;
      submitError = ''; // Clear previous errors

      // First check if the email exists in the system
      const { data: profileData, error: profileError } = await supabase
        .from('profile')
        .select('id, email')
        .eq('email', fields.email)
        .single();

      if (profileError || !profileData) {
        errorType = 'warning';
        submitError = `No account found with this email address. Please check your email or create a new account.`;
        loading = false;
        return;
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(fields.email, {
        redirectTo: `${window.location.origin}/reset`
      });
      console.log('data', data);
      
      if (error) {
        console.log('Reset password error:', error);
        errorType = 'error';
        submitError = (error as any)?.error_description || (error as any)?.message || 'Failed to send reset email. Please try again.';
        loading = false;
        return;
      }

      success = true;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      errorType = 'error';
      submitError = error?.error_description || error?.message || 'An unexpected error occurred. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Reset Password - {orgName}</title>
</svelte:head>

<AuthUI {supabase} {handleSubmit} showOnlyContent={true} showLogo={!success} orgName={orgName} orgLogo={orgLogo} bind:formRef>
  {#if success}
    <div class="mt-4 w-full flex items-center justify-center flex-col">
      <EmailSentIcon />
      <h3 class="dark:text-white text-xl font-semibold my-3">Email Sent!</h3>
      <p class="dark:text-white text-md mb-6 text-center">
        We have sent a confirmation email to <span class="text-primary-700">{fields.email}</span>.
        Kindly check your inbox to reset password or spam to reset your password.
      </p>
    </div>

    <div class="my-4 w-full flex justify-end items-center flex-col">
      <PrimaryButton
        label="Okay"
        type="button"
        className="sm:w-full w-full mb-4"
        onClick={() => goto(ROUTE.LOGIN)}
      />
    </div>
  {:else}
    <div class="mt-4 w-full">
      <h3 class="dark:text-white text-xl font-semibold my-3">Reset Your Password</h3>
      <p class="dark:text-white text-sm mb-6">Enter your email address and we'll send you a link to reset your password.</p>
      
      <AuthError 
        bind:error={submitError}
        type={errorType}
        showSignup={true}
        on:dismiss={dismissError}
      />
      
      <TextField
        label="Your email"
        bind:value={fields.email}
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
        label="Reset Password"
        type="submit"
        className="sm:w-full w-full mb-4"
        isDisabled={loading}
        isLoading={loading}
      />
      <PrimaryButton
        label="Cancel"
        type="button"
        className="sm:w-full w-full text-primary-700"
        variant={VARIANTS.NONE}
        onClick={() => goto(ROUTE.LOGIN)}
      />
    </div>
  {/if}
</AuthUI>
