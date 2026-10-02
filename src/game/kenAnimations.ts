import idle from '../assets/ken_idle.png'
import move1 from '../assets/ken_move1.png'
import move2 from '../assets/ken_move2.png'
import move3 from '../assets/ken_move3.png'
import moveBackward from '../assets/ken_movebackwards.png'
import moveForward from '../assets/ken_moveforwards.png'
import turn from '../assets/ken_turn.png'
import type { CharacterAnimations } from './ryuAnimations'

export const KEN_ANIMATIONS = {
  idle: { src: idle, frames: [
    { x: 2, y: 0, width: 55, height: 94 },
    { x: 61, y: 0, width: 55, height: 94 },
    { x: 121, y: 0, width: 55, height: 94 },
    { x: 180, y: 0, width: 55, height: 94 },
    { x: 237, y: 0, width: 52, height: 94 },
    { x: 293, y: 0, width: 55, height: 94 },
  ], fps: 6, loop: true },
  'move-forward': { src: moveForward, frames: [
    { x: 11, y: 0, width: 47, height: 90 },
    { x: 65, y: 0, width: 52, height: 90 },
    { x: 125, y: 0, width: 54, height: 90 },
    { x: 186, y: 0, width: 49, height: 90 },
    { x: 249, y: 0, width: 47, height: 90 },
  ], fps: 10, loop: true },
  'move-backward': { src: moveBackward, frames: [
    { x: 2, y: 0, width: 57, height: 91 },
    { x: 63, y: 0, width: 57, height: 91 },
    { x: 121, y: 0, width: 54, height: 91 },
    { x: 179, y: 0, width: 56, height: 91 },
    { x: 295, y: 0, width: 54, height: 91 },
  ], fps: 10, loop: true },
  'turn-to-left': { src: turn, frames: [
    { x: 113, y: 0, width: 52, height: 98 },
    { x: 56, y: 0, width: 53, height: 98 },
    { x: 1, y: 0, width: 51, height: 98 },
  ], fps: 10, loop: false },
  'turn-to-right': { src: turn, frames: [
    { x: 1, y: 0, width: 51, height: 98 },
    { x: 56, y: 0, width: 53, height: 98 },
    { x: 113, y: 0, width: 52, height: 98 },
  ], fps: 10, loop: false },
  'move1-attack': { src: move1, frames: [
    { x: 2, y: 0, width: 50, height: 103 },
    { x: 56, y: 0, width: 49, height: 103 },
    { x: 112, y: 0, width: 67, height: 103 },
  ], fps: 12, loop: false },
  'move2-attack': { src: move2, frames: [
    { x: 0, y: 0, width: 48, height: 93 },
    { x: 50, y: 0, width: 43, height: 93 },
    { x: 96, y: 0, width: 73, height: 93 },
  ], fps: 9, loop: false },
  'move3-attack': { src: move3, frames: [
    { x: 2, y: 0, width: 67, height: 65 },
    { x: 71, y: 0, width: 83, height: 65 },
    { x: 170, y: 0, width: 101, height: 65 },
    { x: 291, y: 0, width: 134, height: 65 },
  ], fps: 9, loop: false },
} satisfies CharacterAnimations
