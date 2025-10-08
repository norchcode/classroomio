import { getSupabase, supabase } from '$lib/utils/functions/supabase';
import type { CurrentOrg } from '$lib/utils/types/org';
import { PUBLIC_IS_SELFHOSTED } from '$env/static/public';
import type { MetaTagsProps } from 'svelte-meta-tags';
import { blockedSubdomain } from '$lib/utils/constants/app';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { getCurrentOrg, isUserOrgMember } from '$lib/utils/services/org';
import { redirect } from '@sveltejs/kit';

if (!supabase) {
  getSupabase();
}

export const ssr = PUBLIC_IS_SELFHOSTED === 'true' ? false : true;

interface LoadOutput {
  orgSiteName: string;
  isOrgSite: boolean;
  skipAuth: boolean;
  org: CurrentOrg | null;
  baseMetaTags: MetaTagsProps;
  serverLang: string;
}

const APP_SUBDOMAINS = env.PRIVATE_APP_SUBDOMAINS?.split(',') || [];

export const load = async ({ url, cookies, request }): Promise<LoadOutput> => {
  const response: LoadOutput = {
    orgSiteName: '',
    isOrgSite: false,
    skipAuth: false,
    org: null,
    baseMetaTags: getBaseMetaTags(url),
    serverLang: request.headers?.get('accept-language') || ''
  };

  console.log('PUBLIC_IS_SELFHOSTED', PUBLIC_IS_SELFHOSTED);

  // Selfhosted usecase would be here
  if (PUBLIC_IS_SELFHOSTED === 'true') {
    const subdomain = getSubdomain(url);
    console.log('subdomain', subdomain);

    // Student dashboard
    if (subdomain) {
      try {
        const org = (await getCurrentOrg(subdomain, true)) || null;

        // Organization by subdomain not found
        if (!org) {
          console.log(`Organization not found for subdomain: ${subdomain}`);
          return response;
        }

        // Get session to identify the current user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.log('No session found for organization access check');
          return response;
        }

        // Check if the current user is a member of this organization
        const isMember = await isUserOrgMember(org.id, session.user.id);
        if (!isMember) {
          console.log(`User is not a member of organization: ${subdomain}`);
          // Redirect to login page for the main app, not the org-specific login
          throw redirect(307, `https://${env.PRIVATE_APP_SUBDOMAINS.split(',')[0]}.${env.PRIVATE_APP_HOST}/login`);
        }

        response.org = org;
        response.isOrgSite = true;
        response.orgSiteName = subdomain;
      } catch (error) {
        console.error('Error loading organization:', error);
        // Return default response on error
        return response;
      }
    }

    // Never go beyond this for selfhosted instances
    return response;
  }

  const isLocalHost = url.host.includes('localhost');

  const tempSiteName = url.searchParams.get('org');

  if (isLocalHost && tempSiteName) {
    console.log('setting sitename temp');
    cookies.set('_orgSiteName', tempSiteName, {
      path: '/'
    });
  }

  const _orgSiteName = cookies.get('_orgSiteName');
  const debugPlay = cookies.get('debugPlay');
  const debugMode = _orgSiteName && _orgSiteName !== 'false';

  const subdomain = getSubdomain(url) || '';

  const isDev = dev || isLocalHost;

  if (isURLCustomDomain(url)) {
    // Custom domain
    try {
      response.org = (await getCurrentOrg(url.host, true, true)) || null;

      console.log('custom domain response.org', response.org);

      if (!response.org) {
        console.error('Custom domain org not found, loading dashboard');
        return response;
      }

      response.isOrgSite = true;
      response.orgSiteName = response.org?.siteName || '';
      return response;
    } catch (error) {
      console.error('Error loading custom domain org:', error);
      return response;
    }
  } else if (!blockedSubdomain.includes(subdomain)) {
    if (APP_SUBDOMAINS.includes(subdomain)) {
      // This is an app domain specified in the .env file
      // For app subdomains, return response without org context
      return response;
    }

    const answer = !!subdomain;

    console.log('subdomain', subdomain);

    response.isOrgSite = debugMode || answer;
    response.orgSiteName = debugMode ? _orgSiteName : subdomain;
    
    try {
      response.org = (await getCurrentOrg(response.orgSiteName, true)) || null;

      if (!response.org && !isDev) {
        // For organization subdomains that don't exist, redirect with a more friendly message
        console.log(`Organization not found for subdomain: ${response.orgSiteName}`);
        throw redirect(307, 'https://app.classroomio.com/404?type=org');
      } else if (!response.org && _orgSiteName) {
        cookies.delete('_orgSiteName', { path: '/' });
      }
    } catch (error) {
      console.error('Error loading organization:', error);
      // Don't throw, just return default response
      if (error instanceof Response) {
        throw error; // Re-throw redirects
      }
    }
  } else if (subdomain === 'play' || debugPlay === 'true') {
    response.skipAuth = true;
  } else if (!APP_SUBDOMAINS.includes(subdomain) && !isDev) {
    // This case is for anything in our blockedSubdomains
    throw redirect(307, 'https://app.classroomio.com');
  }

  return response;
};

function isURLCustomDomain(url: URL) {
  if (url.host.includes('localhost')) {
    return false;
  }

  const notCustomDomainHosts = [env.PRIVATE_APP_HOST || '', 'classroomio.com', 'vercel.app'].filter(
    Boolean
  );

  return !notCustomDomainHosts.some((host) => url.host.endsWith(host));
}

function getBaseMetaTags(url: URL) {
  return Object.freeze({
    title: 'ClassroomIO | The Open Source Learning Management System for Companies',
    description:
      'A flexible, user-friendly platform for creating, managing, and delivering courses for companies and training organisations',
    canonical: new URL(url.pathname, url.origin).href,
    openGraph: {
      type: 'website',
      url: new URL(url.pathname, url.origin).href,
      locale: 'en_IE',
      title: 'ClassroomIO | The Open Source Learning Management System for Companies',
      description:
        'A flexible, user-friendly platform for creating, managing, and delivering courses for companies and training organisations',
      siteName: 'ClassroomIO',
      images: [
        {
          url: 'https://brand.cdn.clsrio.com/og/classroomio-og.png',
          alt: 'ClassroomIO OG Image',
          width: 1920,
          height: 1080,
          secureUrl: 'https://brand.cdn.clsrio.com/og/classroomio-og.png',
          type: 'image/jpeg'
        }
      ]
    },
    twitter: {
      handle: '@classroomio',
      site: '@classroomio',
      cardType: 'summary_large_image' as const,
      title: 'ClassroomIO | The Open Source Learning Management System for Companies',
      description:
        'A flexible, user-friendly platform for creating, managing, and delivering courses for companies and training organisations',
      image: 'https://brand.cdn.clsrio.com/og/classroomio-og.png',
      imageAlt: 'ClassroomIO OG Image'
    }
  });
}

function getSubdomain(url: URL) {
  const host = url.host.replace('www.', '');
  const parts = host?.split('.');

  // For codeplanet.qzz.io domain structure, extract subdomain properly
  if (env.PRIVATE_APP_HOST && host?.endsWith(env.PRIVATE_APP_HOST)) {
    // Calculate how many parts are in the base domain: codeplanet.qzz.io = 3 parts
    const baseDomainParts = env.PRIVATE_APP_HOST.split('.').length;
    
    // Calculate how many parts come before the base domain
    const possibleSubdomainParts = parts.length - baseDomainParts;
    
    // If we have parts before the base domain, process them
    if (possibleSubdomainParts > 0) {
      // Get the parts before the base domain
      const beforeBaseDomain = parts.slice(0, possibleSubdomainParts);
      
      // Find the organization subdomain part
      // If we have app subdomains in the mix (like 'app'), we need to exclude them
      // Handle cases like {orgname}.app.{domain} or just {orgname}.{domain}
      for (let i = beforeBaseDomain.length - 1; i >= 0; i--) {
        const part = beforeBaseDomain[i];
        // Return the first non-app subdomain from right to left
        if (!APP_SUBDOMAINS.includes(part)) {
          return part;
        }
      }
    }
  }

  return null;
}
