-- CreateInsightsMaterializedViews
-- Migration for creating materialized views for insights analytics

-- 1. Events Overview Daily Materialized View
CREATE MATERIALIZED VIEW mv_events_overview_daily AS
SELECT
    "siteKey" as site_key,
    DATE(ts) as bucket_date,
    COUNT(*) as events_count,
    COUNT(CASE WHEN name = 'session_start' THEN 1 END) as sessions_count,
    COUNT(DISTINCT properties->>'user_id') as users_count,
    AVG(CAST(properties->>'time_on_site' AS INTEGER)) as avg_time_on_site
FROM "Event"
WHERE "siteKey" IS NOT NULL
GROUP BY "siteKey", DATE(ts);

-- 2. Top Events Daily Materialized View
CREATE MATERIALIZED VIEW mv_top_events_daily AS
SELECT
    "siteKey" as site_key,
    DATE(ts) as bucket_date,
    name,
    COUNT(*) as events_count
FROM "Event"
WHERE "siteKey" IS NOT NULL
GROUP BY "siteKey", DATE(ts), name;

-- 3. Top Cities Daily Materialized View
CREATE MATERIALIZED VIEW mv_top_cities_daily AS
WITH city_events AS (
    -- From search_filter_city events (array of cities)
    SELECT
        "siteKey" as site_key,
        DATE(ts) as bucket_date,
        TRIM(LOWER(unnest(ARRAY(SELECT jsonb_array_elements_text(properties->'cidades'))))) as city
    FROM "Event"
    WHERE "siteKey" IS NOT NULL
    AND name = 'search_filter_city'
    AND properties->'cidades' IS NOT NULL

    UNION ALL

    -- From search_filter_changed events (comma-separated cities)
    SELECT
        "siteKey" as site_key,
        DATE(ts) as bucket_date,
        TRIM(LOWER(unnest(string_to_array(properties->>'value', ',')))) as city
    FROM "Event"
    WHERE "siteKey" IS NOT NULL
    AND name = 'search_filter_changed'
    AND properties->>'field' = 'cidade'
    AND properties->>'value' IS NOT NULL
)
SELECT
    site_key,
    bucket_date,
    city,
    COUNT(*) as events_count
FROM city_events
WHERE city != '' AND city IS NOT NULL
GROUP BY site_key, bucket_date, city;

-- 4. Devices Daily Materialized View
CREATE MATERIALIZED VIEW mv_devices_daily AS
WITH device_info AS (
    SELECT
        "siteKey" as site_key,
        DATE(ts) as bucket_date,
        CASE
            WHEN context->>'userAgent' ILIKE '%mobile%' OR context->>'userAgent' ILIKE '%android%' OR context->>'userAgent' ILIKE '%iphone%' THEN 'mobile'
            WHEN context->>'userAgent' ILIKE '%tablet%' OR context->>'userAgent' ILIKE '%ipad%' THEN 'tablet'
            ELSE 'desktop'
        END as device_type,
        CASE
            WHEN context->>'userAgent' ILIKE '%windows%' THEN 'Windows'
            WHEN context->>'userAgent' ILIKE '%mac%' OR context->>'userAgent' ILIKE '%darwin%' THEN 'macOS'
            WHEN context->>'userAgent' ILIKE '%linux%' THEN 'Linux'
            WHEN context->>'userAgent' ILIKE '%android%' THEN 'Android'
            WHEN context->>'userAgent' ILIKE '%iphone%' OR context->>'userAgent' ILIKE '%ipad%' THEN 'iOS'
            ELSE 'Other'
        END as os,
        CASE
            WHEN context->>'userAgent' ILIKE '%chrome%' AND context->>'userAgent' NOT ILIKE '%edg%' THEN 'Chrome'
            WHEN context->>'userAgent' ILIKE '%firefox%' THEN 'Firefox'
            WHEN context->>'userAgent' ILIKE '%safari%' AND context->>'userAgent' NOT ILIKE '%chrome%' THEN 'Safari'
            WHEN context->>'userAgent' ILIKE '%edg%' THEN 'Edge'
            ELSE 'Other'
        END as browser
    FROM "Event"
    WHERE "siteKey" IS NOT NULL
    AND context->>'userAgent' IS NOT NULL
)
SELECT
    site_key,
    bucket_date,
    device_type,
    os,
    browser,
    COUNT(*) as events_count
FROM device_info
GROUP BY site_key, bucket_date, device_type, os, browser;

-- Create indexes for performance
CREATE INDEX idx_mv_events_overview_daily_site_date ON mv_events_overview_daily (site_key, bucket_date);
CREATE INDEX idx_mv_top_events_daily_site_date ON mv_top_events_daily (site_key, bucket_date);
CREATE INDEX idx_mv_top_events_daily_name ON mv_top_events_daily (name);
CREATE INDEX idx_mv_top_cities_daily_site_date ON mv_top_cities_daily (site_key, bucket_date);
CREATE INDEX idx_mv_top_cities_daily_city ON mv_top_cities_daily (city);
CREATE INDEX idx_mv_devices_daily_site_date ON mv_devices_daily (site_key, bucket_date);

-- Function to refresh materialized views by date range
CREATE OR REPLACE FUNCTION insights_refresh(from_date DATE, to_date DATE)
RETURNS void AS $$
BEGIN
    -- Refresh overview view
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_events_overview_daily;

    -- Refresh top events view
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_events_daily;

    -- Refresh top cities view
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_cities_daily;

    -- Refresh devices view
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_devices_daily;
END;
$$ LANGUAGE plpgsql;

-- Initial data population (non-concurrent for first run)
REFRESH MATERIALIZED VIEW mv_events_overview_daily;
REFRESH MATERIALIZED VIEW mv_top_events_daily;
REFRESH MATERIALIZED VIEW mv_top_cities_daily;
REFRESH MATERIALIZED VIEW mv_devices_daily;
