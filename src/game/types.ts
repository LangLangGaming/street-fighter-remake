import type { MoveKey } from './config'

export type Fighter = {
  el: HTMLDivElement
  hpEl: HTMLDivElement
  name: string
  width: number
  height: number
  visualWidth: number
  x: number
  y: number
  vy: number
  onGround: boolean
  facing: 'right' | 'left'
  health: number
  attacking: boolean
  activeMove: MoveKey | null
  attackStart: number
  hasHit: boolean
  cooldownUntil: number
  hitFlashUntil: number
}
