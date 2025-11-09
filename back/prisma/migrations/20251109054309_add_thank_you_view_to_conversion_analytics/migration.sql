-- Update mv_conversion_analytics_daily to include thank_you_view and conversion_generate_lead events
-- These events are captured on the /obrigado page and provide richer conversion data

DROP MATERIALIZED VIEW IF EXISTS mv_conversion_analytics_daily;

CREATE MATERIALIZED VIEW mv_conversion_analytics_daily AS
SELECT
    "siteKey" as site_key,
    DATE(ts) as bucket_date,
    name as conversion_type,
    COUNT(*) as conversion_count,
    COUNT(DISTINCT "userId") as unique_users,
    COUNT(DISTINCT "sessionId") as unique_sessions,
    properties->>'codigo' as property_code,
    properties->>'source' as conversion_source
FROM "Event"
WHERE "siteKey" IS NOT NULL
    AND name IN (
        'conversion_complete',
        'conversion_contact_form',
        'conversion_whatsapp_click',
        'conversion_phone_click',
        'conversion_email_click',
        'thank_you_view',
        'conversion_generate_lead'
    )
GROUP BY "siteKey", DATE(ts), name, properties->>'codigo', properties->>'source';

-- Recreate indexes
CREATE INDEX idx_mv_conversion_analytics_site_date ON mv_conversion_analytics_daily (site_key, bucket_date);
CREATE INDEX idx_mv_conversion_analytics_type ON mv_conversion_analytics_daily (conversion_type);

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW mv_conversion_analytics_daily;
