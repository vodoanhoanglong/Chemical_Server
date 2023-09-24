------------------------------------------------------------------
-- TABLE public.country
------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "public"."country" (
  iso       TEXT NOT NULL PRIMARY KEY,
  iso3      TEXT DEFAULT NULL,
  name      TEXT NOT NULL,
  nice_name TEXT NOT NULL,
  num_code  smallint DEFAULT NULL,
  phone_code int NOT NULL
);

------------------------------------------------------------------
-- END TABLE public.country
------------------------------------------------------------------;

------------------------------------------------------------------
-- TABLE public.timezone
------------------------------------------------------------------
CREATE TABLE "public"."timezone" (
  id text NOT NULL PRIMARY KEY,
  name text NOT NULL
);
------------------------------------------------------------------
-- TABLE public.timezone
------------------------------------------------------------------



CREATE TABLE "public"."province" (
   "country_code" TEXT NOT NULL,
   "code"         TEXT NOT NULL,
   "name"         TEXT NOT NULL,
   PRIMARY KEY ("country_code", "code"),
   FOREIGN KEY ("country_code") 
      REFERENCES "public"."country"("iso") 
      ON UPDATE cascade ON DELETE restrict
);
--------------------------------------------------------
-- END TABLE "public"."province"
--------------------------------------------------------

CREATE TABLE "public"."district" (
   "country_code"    TEXT  NOT NULL,
   "province_code"   TEXT     NOT NULL,
   "code"            TEXT     NOT NULL,
   "name"            TEXT     NOT NULL,
   PRIMARY KEY ("country_code", "province_code", "code"),
   FOREIGN KEY ("country_code", "province_code") 
      REFERENCES "public"."province"("country_code", "code") 
      ON UPDATE cascade ON DELETE restrict
);

CREATE TABLE "public"."ward" (
   "country_code"    TEXT  NOT NULL,
   "province_code"   TEXT     NOT NULL,
   "district_code"   TEXT     NOT NULL,
   "code"            TEXT     NOT NULL,
   "name"            TEXT     NOT NULL,
   PRIMARY KEY ("country_code", "province_code", "district_code", "code"),
   FOREIGN KEY ("country_code", "province_code", "district_code") 
      REFERENCES "public"."district"("country_code", "province_code", "code") 
      ON UPDATE cascade ON DELETE restrict
);

CREATE TABLE "public"."village" (
   "country_code"    TEXT  NOT NULL,
   "province_code"   TEXT     NOT NULL,
   "district_code"   TEXT     NOT NULL,
   "ward_code"       TEXT     NOT NULL,
   "code"            TEXT     NOT NULL,
   "name"            TEXT     NOT NULL,
   PRIMARY KEY ("country_code", "province_code", "district_code", "ward_code", "code"),
   FOREIGN KEY ("country_code", "province_code", "district_code", "ward_code") 
      REFERENCES "public"."ward"("country_code", "province_code", "district_code", "code") 
      ON UPDATE cascade ON DELETE restrict
);