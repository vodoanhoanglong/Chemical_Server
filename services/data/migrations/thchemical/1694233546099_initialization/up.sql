CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE DOMAIN email AS TEXT
CHECK(
   VALUE ~ '^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$'
);

CREATE DOMAIN identity_card AS TEXT
CHECK(
   VALUE ~ '^[0-9\.]+$'
);

CREATE DOMAIN no_space AS TEXT
CHECK(
   VALUE ~ '^[^\s]+$'
);


CREATE OR REPLACE FUNCTION public.lower_email()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  _new record;
BEGIN
    _new := NEW;
    IF _new."email" IS NULL THEN RETURN _new;
    END IF;
    _new."email" = LOWER(_new."email");
    RETURN _new;
END;
$function$;


CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updatedAt"()
    RETURNS TRIGGER AS
$$
DECLARE
    _new record;
BEGIN
    _new := NEW;
    _new."updatedAt" = NOW();
    RETURN _new;
END;
$$ LANGUAGE plpgsql;


--- USER IN PORTAL ---
CREATE TABLE "public"."system_users"
(
    "id"              uuid        NOT NULL DEFAULT gen_random_uuid(),
    "createdAt"       timestamptz NOT NULL DEFAULT now(),
    "updatedAt"       timestamptz NOT NULL DEFAULT now(),
    "createdBy"       uuid references "public"."system_users" ("id") on update restrict on delete restrict,
    "updatedBy"       uuid references "public"."system_users" ("id") on update restrict on delete restrict,
    "status"          text        NOT NULL DEFAULT 'active',
    "fullName"        text,
    "email"           email,
    "identityCard"    identity_card,
    "phoneNumber"     no_space,
    "code"            no_space    UNIQUE,
    "role"            text,
    "gender"          text,
    "dateOfBirth"     timestamptz,
    "avatar"          text,
    "password"        text,
    PRIMARY KEY ("id")
);

CREATE TRIGGER "set_public_system_users_updatedAt"
    BEFORE UPDATE
    ON "public"."system_users"
    FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_system_users_updatedAt" ON "public"."system_users"
    IS 'trigger to set value of column "updatedAt" to current timestamp on row update';

CREATE TRIGGER "lower_email_system_user_before_upset"
BEFORE INSERT OR UPDATE OF "email" ON "public"."system_users"
FOR EACH ROW
EXECUTE PROCEDURE "public"."lower_email"();

CREATE UNIQUE INDEX system_user_phone_unique ON system_users("phoneNumber") WHERE (status = 'active');
CREATE UNIQUE INDEX system_user_email_unique ON system_users("email") WHERE (status = 'active');
CREATE UNIQUE INDEX system_user_identity_unique ON system_users("identityCard") WHERE (status = 'active');



--- MASTER DATA ---
CREATE TABLE "public"."master_data"
(
    "id"              uuid        NOT NULL DEFAULT gen_random_uuid(),
    "createdAt"       timestamptz NOT NULL DEFAULT now(),
    "updatedAt"       timestamptz NOT NULL DEFAULT now(),
    "createdBy"       uuid references "public"."system_users" ("id") on update restrict on delete restrict,
    "updatedBy"       uuid references "public"."system_users" ("id") on update restrict on delete restrict,
    "status"          text        NOT NULL DEFAULT 'active',
    "data"            text        NOT NULL,
    "type"            text        NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TRIGGER "set_public_master_data_updatedAt"
    BEFORE UPDATE
    ON "public"."master_data"
    FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_master_data_updatedAt" ON "public"."master_data"
    IS 'trigger to set value of column "updatedAt" to current timestamp on row update';


--- CATEGORY ---
CREATE TABLE "public"."categories"
(
    "id"              uuid        NOT NULL DEFAULT gen_random_uuid(),
    "createdAt"       timestamptz NOT NULL DEFAULT now(),
    "updatedAt"       timestamptz NOT NULL DEFAULT now(),
    "createdBy"       uuid references "public"."system_users" ("id") on update restrict on delete restrict,
    "updatedBy"       uuid references "public"."system_users" ("id") on update restrict on delete restrict,
    "status"          text        NOT NULL DEFAULT 'active',
    "code"            no_space    UNIQUE,
    "name"            text,
    "description"     text,
    "images"          jsonb,
    "metadata"        jsonb,
    PRIMARY KEY ("id")
);

CREATE TRIGGER "set_public_categories_updatedAt"
    BEFORE UPDATE
    ON "public"."categories"
    FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_categories_updatedAt" ON "public"."categories"
    IS 'trigger to set value of column "updatedAt" to current timestamp on row update';


--- PRODUCT ---
CREATE TABLE "public"."products"
(
    "id"              uuid        NOT NULL DEFAULT gen_random_uuid(),
    "createdAt"       timestamptz NOT NULL DEFAULT now(),
    "updatedAt"       timestamptz NOT NULL DEFAULT now(),
    "createdBy"       uuid references "public"."system_users" ("id") on update restrict on delete restrict,
    "updatedBy"       uuid references "public"."system_users" ("id") on update restrict on delete restrict,
    "status"          text        NOT NULL DEFAULT 'active',
    "code"            no_space    UNIQUE,
    "name"            text,
    "description"     text,
    "categoryId"      uuid NOT NULL references "public"."categories" ("id") on update restrict on delete restrict,
    "price"           integer,
    "images"          jsonb,
    "metadata"        jsonb,
    PRIMARY KEY ("id")
);

CREATE TRIGGER "set_public_products_updatedAt"
    BEFORE UPDATE
    ON "public"."products"
    FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_products_updatedAt" ON "public"."products"
    IS 'trigger to set value of column "updatedAt" to current timestamp on row update';



--- BLOG ---
CREATE TABLE "public"."blogs"
(
    "id"              uuid        NOT NULL DEFAULT gen_random_uuid(),
    "createdAt"       timestamptz NOT NULL DEFAULT now(),
    "updatedAt"       timestamptz NOT NULL DEFAULT now(),
    "createdBy"       uuid references "public"."system_users" ("id") on update restrict on delete restrict,
    "updatedBy"       uuid references "public"."system_users" ("id") on update restrict on delete restrict,
    "status"          text        NOT NULL DEFAULT 'active',
    "typeId"          uuid references "public"."master_data" ("id") on update restrict on delete restrict,
    "code"            no_space    UNIQUE,
    "title"           text NOT NULL,
    "description"     text NOT NULL,
    "content"         text NOT NULL,
    "banner"          text NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TRIGGER "set_public_blogs_updatedAt"
    BEFORE UPDATE
    ON "public"."blogs"
    FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_blogs_updatedAt" ON "public"."blogs"
    IS 'trigger to set value of column "updatedAt" to current timestamp on row update';


--- CONTACT ---
CREATE TABLE "public"."contacts"
(
    "id"              uuid        NOT NULL DEFAULT gen_random_uuid(),
    "createdAt"       timestamptz NOT NULL DEFAULT now(),
    "updatedAt"       timestamptz NOT NULL DEFAULT now(),
    "createdBy"       uuid references "public"."system_users" ("id") on update restrict on delete restrict,
    "updatedBy"       uuid references "public"."system_users" ("id") on update restrict on delete restrict,
    "status"          text        NOT NULL DEFAULT 'active',
    "email"           email NOT NULL UNIQUE,
    "phoneNumber"     text,
    "fullName"        text,
    PRIMARY KEY ("id")
);

CREATE TRIGGER "set_public_contacts_updatedAt"
    BEFORE UPDATE
    ON "public"."contacts"
    FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_contacts_updatedAt" ON "public"."contacts"
    IS 'trigger to set value of column "updatedAt" to current timestamp on row update';


CREATE TRIGGER "lower_email_contact_before_upset"
BEFORE INSERT OR UPDATE OF "email" ON "public"."contacts"
FOR EACH ROW
EXECUTE PROCEDURE "public"."lower_email"();


--- SYSTEM CONFIGURATION ---
CREATE TABLE "public"."configurations"
(
    "key"             text        NOT NULL,
    "createdAt"       timestamptz NOT NULL DEFAULT now(),
    "updatedAt"       timestamptz NOT NULL DEFAULT now(),
    "createdBy"       uuid references "public"."system_users" ("id") on update restrict on delete restrict,
    "updatedBy"       uuid references "public"."system_users" ("id") on update restrict on delete restrict,
    "status"          text        NOT NULL DEFAULT 'active',
    "value"           text        NOT NULL,
    "type"            text,
    "description"     text,
    PRIMARY KEY ("key")
);

CREATE TRIGGER "set_public_configurations_updatedAt"
    BEFORE UPDATE
    ON "public"."configurations"
    FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_configurations_updatedAt" ON "public"."configurations"
    IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
