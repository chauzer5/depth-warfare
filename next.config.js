/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        GAME_COUNTDOWN_SECONDS: 3,
        MAP_DIMENSION: 15,
        NUM_REQUIRED_PLAYERS: 3,
        STARTING_SPOT_TIMER_SECONDS: 999,
        STARTING_HIT_POINTS: 4,
        ISLAND_MAP: "map1",
    }
}

module.exports = nextConfig
