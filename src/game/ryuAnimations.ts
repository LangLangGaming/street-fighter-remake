import idle from '../assets/ryu_idle.png'
import moveBackward from '../assets/ryu_movebackwards.png'
import moveForward from '../assets/ryu_moveforwards.png'
import turn from '../assets/ryu_turn.png'

export type SpriteFrame = {
  x: number
  y: number
  width: number
  height: number
}

export type AnimationName = 'idle' | 'move-backward' | 'move-forward' | 'turn-to-left' | 'turn-to-right'

export type SpriteAnimation = {
  src: string
  frames: SpriteFrame[]
  fps: number
  loop: boolean
}

const idleFrames: SpriteFrame[] = [
  { x: 0, y: 3, width: 59, height: 90 },
  { x: 59, y: 4, width: 59, height: 89 },
  { x: 118, y: 3, width: 59, height: 90 },
  { x: 181, y: 0, width: 55, height: 93 },
  { x: 237, y: 1, width: 58, height: 92 },
]

const backwardFrames: SpriteFrame[] = [
  { x: 0, y: 0, width: 61, height: 91 },
  { x: 61, y: 0, width: 59, height: 91 },
  { x: 120, y: 0, width: 59, height: 91 },
  { x: 179, y: 0, width: 57, height: 91 },
  { x: 236, y: 0, width: 56, height: 91 },
  { x: 292, y: 0, width: 56, height: 91 },
]

const forwardFrames: SpriteFrame[] = [
  { x: 0, y: 0, width: 56, height: 91 },
  { x: 56, y: 0, width: 55, height: 91 },
  { x: 111, y: 0, width: 63, height: 91 },
  { x: 174, y: 0, width: 58, height: 91 },
  { x: 232, y: 0, width: 58, height: 91 },
  { x: 290, y: 0, width: 50, height: 91 },
]

const turnFrames: SpriteFrame[] = [
  { x: 0, y: 0, width: 54, height: 96 },
  { x: 54, y: 0, width: 55, height: 96 },
  { x: 109, y: 0, width: 54, height: 96 },
]

export const RYU_ANIMATIONS: Record<AnimationName, SpriteAnimation> = {
  idle: { src: idle, frames: idleFrames, fps: 6, loop: true },
  'move-backward': { src: moveBackward, frames: backwardFrames, fps: 10, loop: true },
  'move-forward': { src: moveForward, frames: forwardFrames, fps: 10, loop: true },
  'turn-to-left': { src: turn, frames: [...turnFrames].reverse(), fps: 10, loop: false },
  'turn-to-right': { src: turn, frames: turnFrames, fps: 10, loop: false },
}
