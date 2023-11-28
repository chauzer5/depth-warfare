/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // ABLY_API_KEY: "2KJZGA.aX_e0g:13USKhuP_xe_jQEIP1eUmkGsau-UUNCITFKa-ZqiU1A", // Riley key
    ABLY_API_KEY: "GYFYvQ.VENUww:V9gwlj00MZ3gMTjBBngSQDtmFo11yYPDp8AGELV_yxY", // Jamison key
    // ABLY_API_KEY: "4DgG4w.aAimlA:kdKzu4HgukdZCT4w8Xgp5Ejeg1yviggZu28cDpNIQV0", // Jess key
    SUPABASE_URL: "https://cebtsanmxjqeyeafgepw.supabase.co",
    SUPABASE_API_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYnRzYW5teGpxZXllYWZnZXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgzMzA1NzMsImV4cCI6MjAxMzkwNjU3M30.SgLhxkv8t6w9wcZKYrsdHD0Yob1UqXAp-ATiZEltuhw",
    SUPABASE_TABLE_NAME: "ActiveGames",
    GAME_COUNTDOWN_SECONDS: 3,
    MAP_DIMENSION: 15,
    SECTOR_DIMENSION: 5,
    NUM_REQUIRED_PLAYERS: 8,
    STARTING_SPOT_TIMER_SECONDS: 20,
    ISLAND_MAP: "map1",
    MAX_SYSTEM_HEALTH: 100,
    STARTING_LIFE_SUPPORT: 100,
    REPAIR_MATRIX_DIMENSION: 5,
    REPAIR_MATRIX_CELL_SIZE: 50,
    TORPEDO_RANGE: 4,
    DROP_MINE_RANGE: 1,
    MAX_TORPEDO_DAMAGE: 2,
    MAX_MINE_DAMAGE: 2,
    MAX_MESSAGES: 15,
    TIME_FOR_SURFACING: 30,
    MAX_NODE_DISTANCE: 7,
    MIN_NODE_DISTANCE: 3,
    COMPLETE_STATE_UPDATE_INTERVAL: 50000,
    ROOM_CODE_LENGTH: 4,
    PROBE_DETECTION_RANGE: 3, 
  },
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig;
