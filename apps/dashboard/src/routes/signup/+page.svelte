<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import AuthUI from '$lib/components/AuthUI/index.svelte';
  import TextField from '$lib/components/Form/TextField.svelte';
  import PrimaryButton from '$lib/components/PrimaryButton/index.svelte';
  import SenjaEmbed from '$lib/components/Senja/Embed.svelte';
  import AuthError from '$lib/components/ErrorMessage/AuthError.svelte';
  import SuccessMessage from '$lib/components/ErrorMessage/SuccessMessage.svelte';
  import { SIGNUP_FIELDS } from '$lib/utils/constants/authentication';
  import { getSupabase } from '$lib/utils/functions/supabase';
  import { t } from '$lib/utils/functions/translations';
  import {
    authValidation,
    getConfirmPasswordError,
    getDisableSubmit
  } from '$lib/utils/functions/validator';
  import { capturePosthogEvent } from '$lib/utils/services/posthog';
  import { globalStore } from '$lib/utils/store/app';
  import { currentOrg } from '$lib/utils/store/org';
  import { profile } from '$lib/utils/store/user';

  export let data;

  let supabase = getSupabase();
  let fields = Object.assign({}, SIGNUP_FIELDS);
  let loading = false;
  let success = false;
  let errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  } = {};
  let submitError: string;
  let errorType: 'error' | 'warning' | 'info' | 'success' = 'error';
  let disableSubmit = false;
  let formRef: HTMLFormElement;
  let showSuccessMessage = false;
  let successMessage = '';

  let query = new URLSearchParams($page.url.search);
  let redirect = query.get('redirect');

  // Get organization name from layout data (server-side) or store (client-side)
  $: orgName = data.org?.name || $currentOrg.name || 'ClassroomIO';
  $: orgLogo = data.org?.avatar_url || $currentOrg.avatar_url;

  function dismissError() {
    submitError = '';
  }

  function dismissSuccess() {
    showSuccessMessage = false;
    successMessage = '';
  }

  async function handleSubmit() {
    const validationRes = authValidation(fields);
    console.log('validationRes', validationRes);

    if (Object.keys(validationRes).length) {
      errors = Object.assign(errors, validationRes);
      return;
    }

    try {
      loading = true;
      submitError = ''; // Clear previous errors

      const {
        data: { session },
        error
      } = await supabase.auth.signUp({
        email: fields.email,
        password: fields.password
      });
      console.log('session', session);

      if (error) {
        console.log('Signup error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('already registered') || error.message?.includes('already exists') || error.message?.includes('User already registered')) {
          errorType = 'warning';
          submitError = `An account with this email already exists. Please try logging in instead.`;
        } else if (error.message?.includes('invalid email')) {
          errorType = 'error';
          submitError = 'Please enter a valid email address.';
        } else if (error.message?.includes('password')) {
          errorType = 'error';
          submitError = 'Password must be at least 6 characters long.';
        } else {
          errorType = 'error';
          submitError = error.message || 'An error occurred during signup. Please try again.';
        }
        loading = false;
        return;
      }

      const { user: authUser } = session || {};
      if (!authUser) {
        throw new Error('Error creating user account');
      }

      console.log('Signup successful, user:', authUser);

      // Check if email confirmation is required
      if (authUser.email_confirmed_at === null) {
        // Email confirmation is required - show appropriate message
        showSuccessMessage = true;
        successMessage = `🎉 Account created successfully! Please check your email (${authUser.email}) and click the confirmation link to activate your account. You'll be able to log in after confirming your email.`;
        
        // Redirect to login after showing the message
        setTimeout(() => {
          goto('/login');
        }, 5000);
        return;
      }

      // If email is already confirmed (shouldn't happen with confirmations enabled, but just in case)
      // Check if this is an organization site
      if ($globalStore.isOrgSite && $currentOrg.id) {
        const [regexUsernameMatch] = [...(authUser.email?.matchAll(/(.*)@/g) || [])];
        const response = await fetch('https://api.ipregistry.co/?key=tryout');
        const metadata = await response.json();

        const profileRes = await supabase
          .from('profile')
          .insert({
            id: authUser.id,
            username: regexUsernameMatch[1] + `${new Date().getTime()}`,
            fullname: regexUsernameMatch[1],
            email: authUser.email,
            metadata,
            is_email_verified: true,
            verified_at: new Date().toISOString()
          })
          .select();
        console.log('profileRes', profileRes);

        if (profileRes.error) {
          throw profileRes.error;
        }

        // Setting profile
        console.log('setting profile', profileRes.data[0]);
        profile.set(profileRes.data[0]);

        capturePosthogEvent('user_signed_up', {
          distinct_id: $profile.id || '',
          email: authUser.email,
          username: regexUsernameMatch[1],
          metadata
        });

        capturePosthogEvent('student_signed_up', {
          distinct_id: $profile.id || '',
          email: authUser.email,
          username: regexUsernameMatch[1],
          metadata
        });

        // Show success message and redirect
        showSuccessMessage = true;
        successMessage = `🎉 Welcome to ${orgName}! Your account has been created successfully. You can now log in.`;
        
        // Redirect after a short delay
        setTimeout(() => {
          if (redirect) {
            goto(redirect);
          } else {
            goto('/login');
          }
        }, 3000);
      } else {
        // For non-org sites, show success and redirect to login
        showSuccessMessage = true;
        successMessage = '🎉 Account created successfully! You can now log in with your credentials.';
        
        setTimeout(() => {
          goto('/login');
        }, 3000);
      }

      formRef?.reset();
      success = true;
      fields = Object.assign({}, SIGNUP_FIELDS);
    } catch (error: any) {
      console.error('Signup error:', error);
      errorType = 'error';
      submitError = error?.error_description || error?.message || 'An unexpected error occurred. Please try again.';
      loading = false;
    }
  }

  $: errors.confirmPassword = getConfirmPasswordError(fields);
  $: disableSubmit = getDisableSubmit(fields);
</script>

<svelte:head>
  <title>Join {orgName}</title>
</svelte:head>

<SenjaEmbed id="aa054658-1e15-4d00-8920-91f424326c4e" />

<AuthUI {supabase} isLogin={false} {handleSubmit} isLoading={loading} bind:formRef orgName={orgName} orgLogo={orgLogo}>
  <div class="mt-4 w-full">
    <p class="mb-6 text-lg font-semibold dark:text-white">Create your account</p>
    
    <SuccessMessage 
      bind:message={successMessage}
      title="Account Created!"
      on:dismiss={dismissSuccess}
    />
    
    <AuthError 
      bind:error={submitError}
      type={errorType}
      showSignup={false}
      on:dismiss={dismissError}
    />
    
    <TextField
      label={$t('login.fields.email')}
      bind:value={fields.email}
      type="email"
      placeholder="you@domain.com"
      className="mb-6"
      inputClassName="w-full"
      isDisabled={loading}
      errorMessage={$t(errors.email ?? '')}
      isRequired
    />
    <TextField
      label={$t('login.fields.password')}
      bind:value={fields.password}
      type="password"
      placeholder="Create a strong password"
      className="mb-6"
      inputClassName="w-full"
      isDisabled={loading}
      errorMessage={$t(errors.password ?? '')}
      helperMessage={$t('login.fields.password_helper_message')}
      isRequired
    />
    <TextField
      label={$t('login.fields.confirm_password')}
      bind:value={fields.confirmPassword}
      type="password"
      placeholder="Confirm your password"
      className="mb-6"
      inputClassName="w-full"
      isDisabled={loading}
      errorMessage={errors.confirmPassword}
      isRequired
    />
  </div>

  <div class="my-4 flex w-full items-center justify-end">
    <PrimaryButton
      label={$t('login.create_account')}
      type="submit"
      className="sm:w-full w-full"
      isDisabled={disableSubmit || loading}
      isLoading={loading}
    />
  </div>
</AuthUI>
