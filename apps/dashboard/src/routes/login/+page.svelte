<script lang="ts">
  import AuthUI from '$lib/components/AuthUI/index.svelte';
  import TextField from '$lib/components/Form/TextField.svelte';
  import PrimaryButton from '$lib/components/PrimaryButton/index.svelte';
  import AuthError from '$lib/components/ErrorMessage/AuthError.svelte';
  import { LOGIN_FIELDS } from '$lib/utils/constants/authentication';
  import { getSupabase } from '$lib/utils/functions/supabase';
  import { t } from '$lib/utils/functions/translations';
  import { authValidation } from '$lib/utils/functions/validator';
  import { capturePosthogEvent } from '$lib/utils/services/posthog';
  import { globalStore } from '$lib/utils/store/app';
  import { currentOrg } from '$lib/utils/store/org';
  import { getCurrentOrg } from '$lib/utils/services/org';
  import { page } from '$app/stores';

  export let data;

  let formRef: HTMLFormElement;
  let supabase = getSupabase();
  let fields = Object.assign({}, LOGIN_FIELDS);
  let submitError: string;
  let errorType: 'error' | 'warning' | 'info' = 'error';
  let loading = false;
  let errors = Object.assign({}, LOGIN_FIELDS);

  // Get organization name from layout data (server-side) or store (client-side)
  // Priority: layout data (persists after logout) > store data > fallback
  $: orgName = data.org?.name || $currentOrg.name || 'ClassroomIO';
  $: orgLogo = data.org?.avatar_url || $currentOrg.avatar_url;
  
  // Debug logging to see what data is available
  $: console.log('Login page - Organization data:', {
    layoutData: data.org,
    storeData: $currentOrg,
    finalOrgName: orgName,
    finalOrgLogo: orgLogo
  });

  function dismissError() {
    submitError = '';
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
      
      // First, authenticate the user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: fields.email,
        password: fields.password
      });
      console.log('Authentication data', data);
      
      if (error) {
        console.log('Authentication error', error);
        throw error;
      }

      // If this is an organization site, check if the user belongs to this organization
      if ($globalStore.isOrgSite) {
        console.log('Checking organization membership for org site');
        console.log('Current org:', $currentOrg);
        
        // Ensure we have the organization ID
        let orgId = $currentOrg.id;
        if (!orgId) {
          console.log('No org ID in store, trying to get from URL or context');
          // Try to get organization from the current context
          const urlParts = window.location.hostname.split('.');
          if (urlParts.length >= 2) {
            const siteName = urlParts[0];
            const orgData = await getCurrentOrg(siteName, true);
            if (orgData) {
              orgId = orgData.id;
              console.log('Got org ID from site name:', orgId);
            }
          }
        }
        
        if (!orgId) {
          console.error('Cannot determine organization ID');
          errorType = 'error';
          throw new Error('Unable to verify organization membership. Please try again.');
        }
        
        // Check organization membership
        const { data: orgMembershipData, error: orgMembershipError } = await supabase
          .from('organizationmember')
          .select('id, role_id')
          .eq('profile_id', data.user.id)
          .eq('organization_id', orgId)
          .single();
          
        console.log('Organization membership check:', { orgMembershipData, orgMembershipError });
        
        if (orgMembershipError || !orgMembershipData) {
          // User is authenticated but doesn't belong to this organization
          console.log('User not a member of this organization');
          
          // Sign out the user since they shouldn't have access
          await supabase.auth.signOut();
          
          errorType = 'warning';
          throw new Error(`You don't have access to this organization. Please contact your administrator or try logging into the correct organization.`);
        }
        
        console.log('User is a valid member of the organization');
        capturePosthogEvent('student_login', {
          email: fields.email,
          organization_id: orgId,
          role_id: orgMembershipData.role_id
        });
      }
      
      capturePosthogEvent('login', {
        email: fields.email
      });
    } catch (error: any) {
      console.error('Login error:', error);
      submitError = error.error_description || error.message || 'An unexpected error occurred. Please try again.';
      loading = false;
      return;
    }
    
    // If we get here, either it's not an org site or the user belongs to the org
    // Let the normal app flow handle the redirect
    window.location.reload();
  }
</script>

<svelte:head>
  <title>Welcome back to {orgName}</title>
</svelte:head>

<AuthUI {supabase} isLogin={true} {handleSubmit} isLoading={loading} bind:formRef orgName={orgName} orgLogo={orgLogo}>
  <div class="mt-4 w-full">
    <p class="mb-6 text-lg font-semibold dark:text-white">{$t('login.welcome')}</p>
    <TextField
      label={$t('login.email')}
      bind:value={fields.email}
      type="email"
      autoFocus={true}
      placeholder="you@domain.com"
      className="mb-6"
      inputClassName="w-full"
      isDisabled={loading}
      errorMessage={$t(errors.email)}
    />
    <TextField
      label={$t('login.password')}
      bind:value={fields.password}
      type="password"
      placeholder="************"
      className="mb-6"
      inputClassName="w-full"
      isDisabled={loading}
      errorMessage={$t(errors.password)}
    />
    <AuthError 
      bind:error={submitError} 
      type={errorType} 
      showForgotPassword={true}
      showSignup={true}
      on:dismiss={dismissError}
    />
    <div class="w-full text-right">
      <a class="text-md text-primary-700" href="/forgot"> {$t('login.forgot')} </a>
    </div>
  </div>

  <div class="my-4 flex w-full items-center justify-end">
    <!-- <a href="/login" class="text-primary-700 text-sm">Create an account</a> -->
    <PrimaryButton
      label={$t('login.login')}
      type="submit"
      className="sm:w-full w-full"
      isDisabled={loading}
      isLoading={loading}
    />
  </div>
</AuthUI>
