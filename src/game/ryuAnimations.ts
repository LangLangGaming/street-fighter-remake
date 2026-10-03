import idle from '../assets/ryu_idle.png'
import move1 from '../assets/ryu_move1.png'
import move2 from '../assets/ryu_move2.png'
import hadouken from '../assets/ryu_hadouken.png'
import moveBackward from '../assets/ryu_movebackwards.png'
import moveForward from '../assets/ryu_moveforwards.png'
import turn from '../assets/ryu_turn.png'

export type SpriteFrame = {
  x: number
  y: number
  width: number
  height: number
}

export type SpriteAnimation = {
  src: string
  frames: SpriteFrame[]
  fps: number
  loop: boolean
  projectile?: {
    frames: SpriteFrame[]
    distance: number
    fps: number
    spawnOffset: number
  }
}

export const RYU_ANIMATIONS = {
  idle: { src: idle, frames: [
    { x: 0, y: 3, width: 59, height: 90 }, { x: 59, y: 4, width: 59, height: 89 },
    { x: 118, y: 3, width: 59, height: 90 }, { x: 181, y: 0, width: 55, height: 93 },
    { x: 237, y: 1, width: 58, height: 92 },
  ], fps: 6, loop: true },
  'move-backward': { src: moveBackward, frames: [
    { x: 0, y: 0, width: 61, height: 91 }, { x: 61, y: 0, width: 59, height: 91 },
    { x: 120, y: 0, width: 59, height: 91 }, { x: 179, y: 0, width: 57, height: 91 },
    { x: 236, y: 0, width: 56, height: 91 }, { x: 292, y: 0, width: 56, height: 91 },
  ], fps: 10, loop: true },
  'move-forward': { src: moveForward, frames: [
    { x: 0, y: 0, width: 56, height: 91 }, { x: 56, y: 0, width: 55, height: 91 },
    { x: 111, y: 0, width: 63, height: 91 }, { x: 174, y: 0, width: 58, height: 91 },
    { x: 232, y: 0, width: 58, height: 91 }, { x: 290, y: 0, width: 50, height: 91 },
  ], fps: 10, loop: true },
  'move1-attack': { src: move1, frames: [
    { x: 0, y: 0, width: 56, height: 93 },
    { x: 59, y: 0, width: 65, height: 93 },
    { x: 135, y: 0, width: 105, height: 93 },
  ], fps: 30, loop: false },
  'move2-attack': { src: move2, frames: [
    { x: 0, y: 0, width: 66, height: 113 },
    { x: 66, y: 0, width: 86, height: 113 },
    { x: 153, y: 0, width: 84, height: 113 },
  ], fps: 30, loop: false },
  'move3-attack': {
    src: hadouken,
    frames: [
      { x: 34, y: 0, width: 74, height: 90 },
      { x: 135, y: 0, width: 85, height: 90 },
      { x: 244, y: 0, width: 90, height: 90 },
      { x: 357, y: 0, width: 106, height: 90 },
    ],
    fps: 30,
    loop: false,
    projectile: {
      frames: [
        { x: 493, y: 0, width: 43, height: 90 },
        { x: 550, y: 0, width: 56, height: 90 },
        { x: 493, y: 0, width: 43, height: 90 },
        { x: 550, y: 0, width: 56, height: 90 },
        { x: 493, y: 0, width: 43, height: 90 },
        { x: 550, y: 0, width: 56, height: 90 },
        { x: 614, y: 0, width: 26, height: 90 },
        { x: 652, y: 0, width: 15, height: 90 },
        { x: 677, y: 0, width: 27, height: 90 },
      ],
      distance: 210,
      fps: 12,
      spawnOffset: 76,
    },
  },
  'turn-to-left': { src: turn, frames: [
    { x: 109, y: 0, width: 54, height: 96 }, { x: 54, y: 0, width: 55, height: 96 },
    { x: 0, y: 0, width: 54, height: 96 },
  ], fps: 10, loop: false },
  'turn-to-right': { src: turn, frames: [
    { x: 0, y: 0, width: 54, height: 96 }, { x: 54, y: 0, width: 55, height: 96 },
    { x: 109, y: 0, width: 54, height: 96 },
  ], fps: 10, loop: false },
} satisfies Record<string, SpriteAnimation>

export type CharacterAnimations = Record<string, SpriteAnimation>
