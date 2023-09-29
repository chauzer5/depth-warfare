/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ABLY_API_KEY: "2KJZGA.aX_e0g:13USKhuP_xe_jQEIP1eUmkGsau-UUNCITFKa-ZqiU1A", // Use if this API_KEY doesn't work: "GYFYvQ.VENUww:V9gwlj00MZ3gMTjBBngSQDtmFo11yYPDp8AGELV_yxY"
    // ABLY_API_KEY: "GYFYvQ.VENUww:V9gwlj00MZ3gMTjBBngSQDtmFo11yYPDp8AGELV_yxY",
    GAME_COUNTDOWN_SECONDS: 3,
    MAP_DIMENSION: 15,
    SECTOR_DIMENSION: 5,
    NUM_REQUIRED_PLAYERS: 8,
    STARTING_SPOT_TIMER_SECONDS: 20,
    STARTING_HIT_POINTS: 4,
    ISLAND_MAP: "map1",
    MAX_SYSTEM_HEALTH: 100,
    LIFE_SUPPORT_DAMAGE_AMOUNT: 25,
    SYSTEM_DAMAGE_AMOUNT: 20,
    REPAIR_MATRIX_DIMENSION: 5,
    REPAIR_MATRIX_CELL_SIZE: 50,
    TORPEDO_RANGE: 4,
    DROP_MINE_RANGE: 1,
    MAX_TORPEDO_DAMAGE: 2,
    MAX_MINE_DAMAGE: 2,
    MAX_MESSAGES: 15,
    TIME_FOR_SURFACING: 30,
    COMPLETE_STATE_UPDATE_INTERVAL: 1000,
  },
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig;
