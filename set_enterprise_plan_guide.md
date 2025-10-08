# SQL Queries to Set Enterprise Plan for Organization

## Check Current Plan Status
```sql
SELECT * FROM organization_plan 
WHERE org_id = 'f3133ad7-7ae7-45be-abcc-e04db60d93ca';
```

## Insert New Enterprise Plan Record
```sql
INSERT INTO organization_plan (
    id,
    org_id,
    plan_name,
    is_active,
    activated_at,
    provider,
    subscription_id
) VALUES (
    gen_random_uuid(),
    'f3133ad7-7ae7-45be-abcc-e04db60d93ca',
    'ENTERPRISE',
    true,
    NOW(),
    'manual',
    'manual-enterprise'
);
```

## Alternative: Insert with Auto-generated ID (if the UUID approach doesn't work)
```sql
INSERT INTO organization_plan (
    org_id,
    plan_name,
    is_active,
    activated_at,
    provider,
    subscription_id
) VALUES (
    'f3133ad7-7ae7-45be-abcc-e04db60d93ca',
    'ENTERPRISE',
    true,
    NOW(),
    'manual',
    'manual-enterprise'
);
```

## Verify the Update
```sql
SELECT 
    o.name as organization_name,
    op.plan_name,
    op.is_active,
    op.activated_at
FROM organization o
LEFT JOIN organization_plan op ON o.id = op.org_id
WHERE o.id = 'f3133ad7-7ae7-45be-abcc-e04db60d93ca';
```

## Check Organization Member Role (for reference)
```sql
SELECT 
    o.name as organization_name,
    p.email as member_email,
    om.role_id,
    CASE 
        WHEN om.role_id = 1 THEN 'ADMIN'
        WHEN om.role_id = 2 THEN 'TUTOR' 
        WHEN om.role_id = 3 THEN 'STUDENT'
        ELSE 'UNKNOWN'
    END as role_name
FROM organization o
JOIN organizationmember om ON o.id = om.organization_id
JOIN profile p ON om.profile_id = p.id
WHERE o.id = 'f3133ad7-7ae7-45be-abcc-e04db60d93ca';
```