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

CREATE TABLE "public"."shared_videos"
(
    "id"              uuid        NOT NULL DEFAULT gen_random_uuid(),
    "createdAt"       timestamptz NOT NULL DEFAULT now(),
    "updatedAt"       timestamptz NOT NULL DEFAULT now(),
    "createdBy"       uuid references "public"."system_users" ("id") on update restrict on delete restrict,
    "updatedBy"       uuid references "public"."system_users" ("id") on update restrict on delete restrict,
    "status"          text        NOT NULL DEFAULT 'active',
    "url"             text,
    "title"           text,
    "description"     text,
    PRIMARY KEY ("id")
);

CREATE TRIGGER "set_public_shared_videos_updatedAt"
    BEFORE UPDATE
    ON "public"."shared_videos"
    FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_shared_videos_updatedAt" ON "public"."shared_videos"
    IS 'trigger to set value of column "updatedAt" to current timestamp on row update';


CREATE TABLE "public"."video_votes"
(
    "id"              uuid        NOT NULL DEFAULT gen_random_uuid(),
    "createdAt"       timestamptz NOT NULL DEFAULT now(),
    "status"          text        NOT NULL DEFAULT 'active',
    "videoId"         uuid references "public"."shared_videos" ("id") on update restrict on delete restrict,
    "userId"          uuid references "public"."system_users" ("id") on update restrict on delete restrict,
    "react"           text        NOT NULL DEFAULT 'voted',
    PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX video_vote_userId_videoId_unique ON video_votes("userId", "videoId") WHERE (status = 'active');


CREATE TABLE "public"."notifications"
(
    "id"                    uuid        NOT NULL DEFAULT gen_random_uuid(),
    "createdAt"             timestamptz NOT NULL DEFAULT now(),
    "updatedAt"             timestamptz NOT NULL DEFAULT now(),
    "createdBy"             uuid,
    "updatedBy"             uuid,
    "status"                text        NOT NULL DEFAULT 'active',
    "title"                 text        NOT NULL,
    "subtitle"              text,  
    "content"               text        NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("createdBy") REFERENCES "public"."system_users" ("id") ON UPDATE restrict ON DELETE restrict,
    FOREIGN KEY ("updatedBy") REFERENCES "public"."system_users" ("id") ON UPDATE restrict ON DELETE restrict
);

CREATE TRIGGER "set_public_notifications_updatedAt"
    BEFORE UPDATE
    ON "public"."notifications"
    FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_notifications_updatedAt" ON "public"."notifications"
    IS 'trigger to set value of column "updatedAt" to current timestamp on row update';

CREATE TABLE "public"."notification_reads"
(
    "id"                    uuid        NOT NULL DEFAULT gen_random_uuid(),
    "userId"                uuid,
    "notificationId"        uuid,
    "readAt"                timestamptz,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("userId") REFERENCES "public"."system_users" ("id") ON UPDATE restrict ON DELETE restrict,
    FOREIGN KEY ("notificationId") REFERENCES "public"."notifications" ("id") ON UPDATE restrict ON DELETE restrict
);


CREATE OR REPLACE FUNCTION public.push_notify()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO notification_reads ("userId", "notificationId")
    SELECT id, NEW.id FROM system_users;
    RETURN NEW;
END;
$function$;

CREATE TRIGGER push_notify_after_insert
    AFTER INSERT ON notifications
    FOR EACH ROW
    EXECUTE PROCEDURE push_notify();
