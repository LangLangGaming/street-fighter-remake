export type MoveKey = 'move1' | 'move2' | 'move3'

export const PLAYER_1_SIZE = { width: 59, height: 93 }
export const PLAYER_2_SIZE = { width: 57, height: 98 }
export const PLAYER_1_MAX_SPRITE_WIDTH = 114
export const PLAYER_2_MAX_SPRITE_WIDTH = 134
export const RYU_HADOUKEN_REACH = 342
export const RYU_HADOUKEN_DURATION_MS = 900
export const KEN_SHORYUKEN_DURATION_MS = 750

export const FLOOR_HEIGHT = 70
export const MAX_HEALTH = 100
export const SKILL_REACH_BONUS = 44

export const MOVES = {
  move1: {
    damage: 6,
    reach: 26,
    duration: 250,
    activeFrom: 85,
    activeTo: 200,
    cooldown: 340,
    knockback: 16,
    launch: false,
  },
  move2: {
    damage: 12,
    reach: 34,
    duration: 320,
    activeFrom: 90,
    activeTo: 200,
    cooldown: 420,
    knockback: 20,
    launch: false,
  },
  move3: {
    damage: 18,
    reach: 30,
    duration: 500,
    activeFrom: 120,
    activeTo: 850,
    cooldown: 650,
    knockback: 12,
    launch: true,
  },
} as const
