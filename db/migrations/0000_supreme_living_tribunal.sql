CREATE TABLE "chat_event" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"type" text NOT NULL,
	"page_url" text,
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE "chat_message" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"page_url" text,
	"page_title" text,
	"provider" text,
	"model" text,
	"kb_version" text,
	"tokens_in" integer,
	"cached_tokens_in" integer,
	"tokens_out" integer,
	"cost_usd" numeric(10, 6),
	"latency_ms" integer,
	"escalated" boolean DEFAULT false NOT NULL,
	"recaptcha_score" numeric(3, 2)
);
--> statement-breakpoint
CREATE TABLE "chat_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"first_page" text,
	"referrer" text,
	"utm" jsonb,
	"device" jsonb,
	"consent" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"key" text PRIMARY KEY NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_session_id_chat_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_event_type_idx" ON "chat_event" USING btree ("type","created_at");--> statement-breakpoint
CREATE INDEX "chat_message_session_idx" ON "chat_message" USING btree ("session_id","created_at");

--> statement-breakpoint
-- RLS tanpa policy = deny-all untuk anon/authenticated: aplikasi hanya mengakses
-- lewat koneksi Postgres langsung dari server (PRD 12.1).
ALTER TABLE "chat_session" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chat_message" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chat_event" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "rate_limit" ENABLE ROW LEVEL SECURITY;

-- ROLLBACK:
-- DROP TABLE IF EXISTS "rate_limit";
-- DROP TABLE IF EXISTS "chat_event";
-- DROP TABLE IF EXISTS "chat_message";
-- DROP TABLE IF EXISTS "chat_session";
