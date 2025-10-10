-- Add 'id' (Indonesian) to LOCALE enum
-- Strategy: drop dependent view, recreate enum with new set, migrate columns, recreate view

-- 0) Drop dependent view
drop view if exists "public"."lesson_versions";

-- 1) Drop defaults before casting
alter table "public"."lesson_language" alter column "locale" drop default;
alter table "public"."profile"        alter column "locale" drop default;

-- 2) Recreate enum with 'id'
alter type "public"."LOCALE" rename to "LOCALE__old_version_to_be_dropped";
create type "public"."LOCALE" as enum ('en','hi','fr','pt','de','vi','ru','es','pl','id');

-- 3) Cast columns to the new enum
alter table "public"."lesson_language"
  alter column "locale" type "public"."LOCALE" using "locale"::text::"public"."LOCALE";
alter table "public"."profile"
  alter column "locale" type "public"."LOCALE" using "locale"::text::"public"."LOCALE";

-- 4) Restore defaults
alter table "public"."lesson_language" alter column "locale" set default 'en'::"LOCALE";
alter table "public"."profile"        alter column "locale" set default 'en'::"LOCALE";

-- 5) Recreate the view with correct column references
create or replace view "public"."lesson_versions" as
  SELECT llh.old_content,
    llh.new_content,
    llh."timestamp",
    ll.locale,
    ll.lesson_id
   FROM (lesson_language_history llh
     JOIN lesson_language ll ON ((ll.id = llh.lesson_language_id)));

-- 6) Clean up old enum
drop type "public"."LOCALE__old_version_to_be_dropped";

