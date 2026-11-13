CREATE VIEW "insight_daily" AS
  select
    date_trunc('day', e.created_at) as day,
    count(distinct e.session_id) as sessions,
    count(*) filter (where e.type = 'page_view') as page_views,
    count(*) filter (where e.type = 'greeting_shown') as greetings,
    count(*) filter (where e.type = 'chat_open') as chats,
    count(*) filter (where e.type = 'message_sent') as messages,
    count(*) filter (where e.type = 'escalation_offered') as escalations,
    count(*) filter (where e.type = 'whatsapp_open') as whatsapp_opens
  from chat_event e
  group by 1;--> statement-breakpoint
ALTER VIEW "insight_daily" SET (security_invoker = true);--> statement-breakpoint
REVOKE ALL ON "insight_daily" FROM anon, authenticated;

-- ROLLBACK:
-- DROP VIEW IF EXISTS "insight_daily";
