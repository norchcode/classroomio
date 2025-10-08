# SQL Queries to Set Enterprise Plan and Custom Domain for Organization

## Check Current Organization Settings
```sql
SELECT 
    id,
    name,
    siteName,
    customDomain,
    isCustomDomainVerified,
    avatar_url,
    landingpage,
    customization,
    theme
FROM organization 
WHERE id = 'f3133ad7-7ae7-45be-abcc-e04db60d93ca';
```

## Set Custom Domain
```sql
UPDATE organization 
SET 
    customDomain = 'yourdomain.com',  -- Replace with your actual domain
    isCustomDomainVerified = true      -- Mark as verified
WHERE id = 'f3133ad7-7ae7-45be-abcc-e04db60d93ca';
```

## Check Current Plan Status
```sql
SELECT * FROM organization_plan 
WHERE org_id = 'f3133ad7-7ae7-45be-abcc-e04db60d93ca';
```

## Insert New Enterprise Plan Record
```sql
INSERT INTO organization_plan (
    org_id,
    plan_name,
    is_active,
    activated_at,
    deactivated_at,
    payload,
    triggered_by,
    provider,
    subscription_id
) VALUES (
    'f3133ad7-7ae7-45be-abcc-e04db60d93ca',
    'ENTERPRISE',
    true,
    NOW(),
    NULL,
    NULL,
    12,
    'manual',
    'manual-enterprise'
);
```

## Verify the Updates
```sql
SELECT 
    o.name as organization_name,
    o.customDomain,
    o.isCustomDomainVerified,
    op.plan_name,
    op.is_active,
    op.activated_at
FROM organization o
LEFT JOIN organization_plan op ON o.id = op.org_id
WHERE o.id = 'f3133ad7-7ae7-45be-abcc-e04db60d93ca';
```

## DNS Configuration Required:
For the custom domain to work, you'll also need to:
1. Add a CNAME record in your DNS settings pointing your custom domain to your ClassroomIO instance
2. For example, if your ClassroomIO instance is accessible at `classroomio.yourdomain.com`, you would set up:
   - Type: CNAME
   - Name: `subdomain` (or `@` for root domain)
   - Value: `classroomio.yourdomain.com`