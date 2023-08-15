/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        ABLY_API_KEY: "2KJZGA.aX_e0g:13USKhuP_xe_jQEIP1eUmkGsau-UUNCITFKa-ZqiU1A",
        GAME_COUNTDOWN_SECONDS: 3,
        MAP_DIMENSION: 15,
        SECTOR_DIMENSION: 5,
        NUM_REQUIRED_PLAYERS: 3,
        STARTING_SPOT_TIMER_SECONDS: 999,
        STARTING_HIT_POINTS: 4,
        ISLAND_MAP: "map1",
        MAX_SYSTEM_HEALTH: 100,
        SYSTEM_DAMAGE_AMOUNT: 25,
    }
}

module.exports = nextConfig
