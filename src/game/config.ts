import move1 from '../assets/move1.png'
import move2 from '../assets/move2.png'
import move3 from '../assets/move3.png'

export const MOVE_IMAGES = {
  move1,
  move2,
  move3,
} as const

export type MoveKey = keyof typeof MOVE_IMAGES

export const PLAYER_1_SIZE = { width: 59, height: 93 }
export const PLAYER_2_SIZE = { width: 57, height: 98 }

export const FLOOR_HEIGHT = 70
export const MAX_HEALTH = 100
export const PLAYER_1_SKILL_REACH_BONUS = 44

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
    duration: 420,
    activeFrom: 140,
    activeTo: 260,
    cooldown: 650,
    knockback: 12,
    launch: true,
  },
} as const
