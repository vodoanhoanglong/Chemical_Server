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

