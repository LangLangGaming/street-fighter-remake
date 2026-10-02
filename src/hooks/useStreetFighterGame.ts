import { useEffect, useState, type RefObject } from 'react'
import { FLOOR_HEIGHT, MAX_HEALTH, MOVE_IMAGES, MOVES, PLAYER_1_SIZE, PLAYER_2_SIZE } from '../game/config'
import type { Fighter } from '../game/types'
import type { AnimationName } from '../game/ryuAnimations'

type GameRefs = {
  arenaRef: RefObject<HTMLDivElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  p1Ref: RefObject<HTMLDivElement | null>
  p2Ref: RefObject<HTMLDivElement | null>
  p1HitboxRef: RefObject<HTMLDivElement | null>
  p2HitboxRef: RefObject<HTMLDivElement | null>
  hp1Ref: RefObject<HTMLDivElement | null>
  hp2Ref: RefObject<HTMLDivElement | null>
  bannerRef: RefObject<HTMLDivElement | null>
  titleScreenRef: RefObject<HTMLDivElement | null>
}

const GRAVITY = 0.9
const JUMP_VELOCITY = 16
const MOVE_SPEED = 5
const HIT_FLASH_MS = 150

export function useStreetFighterGame(refs: GameRefs) {
  const [showHitboxes, setShowHitboxes] = useState(false)
  const {
    arenaRef,
    canvasRef,
    p1Ref,
    p2Ref,
    p1HitboxRef,
    p2HitboxRef,
    hp1Ref,
    hp2Ref,
    bannerRef,
    titleScreenRef,
  } = refs

  useEffect(() => {
    const arena = arenaRef.current
    const canvas = canvasRef.current
    const el1 = p1Ref.current
    const el2 = p2Ref.current
    const hp1El = hp1Ref.current
    const hp2El = hp2Ref.current
    const banner = bannerRef.current
    const titleScreen = titleScreenRef.current

    if (!arena || !canvas || !el1 || !el2 || !hp1El || !hp2El || !banner || !titleScreen) {
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    const COLORS = {
      bgTop: '#1b1035',
      bgBottom: '#3a1650',
      floor: '#2e2a3d',
      floorLine: '#ff5d3b',
      buildingFar: '#2b1f47',
      buildingNear: '#221739',
      window: 'rgba(255,214,150,0.55)',
    }

    let width = 0
    let height = 0
    let stars: { x: number; y: number; r: number; a: number }[] = []
    let buildings: { x: number; w: number; h: number; baseY: number; color: string; windows: number[][] }[] = []

    const buildStageDecor = () => {
      stars = Array.from({ length: 70 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.5,
        r: Math.random() < 0.8 ? 1 : 2,
        a: 0.3 + Math.random() * 0.6,
      }))

      buildings = []
      ;[
        {
          baseY: height - FLOOR_HEIGHT + 6,
          color: COLORS.buildingFar,
          wRange: [60, 130],
          hRange: [80, 190],
        },
        {
          baseY: height - FLOOR_HEIGHT + 10,
          color: COLORS.buildingNear,
          wRange: [46, 100],
          hRange: [50, 140],
        },
      ].forEach((layer) => {
        let x = -20
        while (x < width + 20) {
          const w = layer.wRange[0] + Math.random() * (layer.wRange[1] - layer.wRange[0])
          const h = layer.hRange[0] + Math.random() * (layer.hRange[1] - layer.hRange[0])
          const windows: number[][] = []

          if (Math.random() < 0.6) {
            for (let wy = 10; wy < h - 10; wy += 14) {
              for (let wx = 6; wx < w - 10; wx += 12) {
                if (Math.random() < 0.3) {
                  windows.push([wx, wy])
                }
              }
            }
          }

          buildings.push({ x, w, h, baseY: layer.baseY, color: layer.color, windows })
          x += w + 6 + Math.random() * 10
        }
      })
    }

    const drawStage = () => {
      const grad = ctx.createLinearGradient(0, 0, 0, height)
      grad.addColorStop(0, COLORS.bgTop)
      grad.addColorStop(0.7, COLORS.bgBottom)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      stars.forEach((star) => {
        ctx.fillStyle = `rgba(255,255,255,${star.a})`
        ctx.fillRect(star.x, star.y, star.r, star.r)
      })

      buildings.forEach((building) => {
        ctx.fillStyle = building.color
        ctx.fillRect(building.x, building.baseY - building.h, building.w, building.h + 20)

        ctx.fillStyle = COLORS.window
        building.windows.forEach(([wx, wy]) => {
          ctx.fillRect(building.x + wx, building.baseY - building.h + wy, 5, 7)
        })
      })

      const floorY = height - FLOOR_HEIGHT
      ctx.fillStyle = COLORS.floor
      ctx.fillRect(0, floorY, width, FLOOR_HEIGHT)
      ctx.fillStyle = COLORS.floorLine
      ctx.fillRect(0, floorY, width, 4)
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'

      for (let x = 0; x < width; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, floorY + 6)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
    }

    const resize = () => {
      width = canvas.width = canvas.clientWidth
      height = canvas.height = canvas.clientHeight
      buildStageDecor()
      drawStage()
    }

    const makeFighter = (
      el: HTMLDivElement,
      hpEl: HTMLDivElement,
      x: number,
      name: string,
      fighterWidth: number,
      fighterHeight: number,
    ): Fighter => ({
      el,
      hpEl,
      name,
      width: fighterWidth,
      height: fighterHeight,
      x,
      y: 0,
      vy: 0,
      onGround: true,
      facing: x < 300 ? 'right' : 'left',
      health: MAX_HEALTH,
      attacking: false,
      activeMove: null,
      attackStart: 0,
      hasHit: false,
      cooldownUntil: 0,
      hitFlashUntil: 0,
    })

    const p1 = makeFighter(el1, hp1El, 140, 'PLAYER 1', PLAYER_1_SIZE.width, PLAYER_1_SIZE.height)
    const p2 = makeFighter(el2, hp2El, 500, 'PLAYER 2', PLAYER_2_SIZE.width, PLAYER_2_SIZE.height)
    const debugHitboxes: Array<[Fighter, HTMLDivElement | null]> = [
      [p1, p1HitboxRef.current],
      [p2, p2HitboxRef.current],
    ]
    el1.dataset.animation = 'idle'
    let p1TurnUntil = 0
    let p1TurnAnimation: AnimationName | null = null

    let state: 'title' | 'fight' | 'gameover' = 'title'
    const keys: Record<string, boolean> = {}
    const justPressed: Record<string, boolean> = {}
    let animationId = 0

    const clampX = (fighter: Fighter, x: number) => Math.max(0, Math.min(width - fighter.width, x))

    const bodyRect = (fighter: Fighter) => ({
      left: fighter.x,
      right: fighter.x + fighter.width,
      bottom: fighter.y,
      top: fighter.y + fighter.height,
    })

    const hitboxRect = (fighter: Fighter, move: (typeof MOVES)[keyof typeof MOVES]) => {
      const body = bodyRect(fighter)
      if (fighter.facing === 'right') {
        return {
          left: body.right,
          right: body.right + move.reach,
          bottom: body.bottom,
          top: body.top,
        }
      }
      return {
        left: body.left - move.reach,
        right: body.left,
        bottom: body.bottom,
        top: body.top,
      }
    }

    const rectsOverlap = (
      ax1: number,
      ay1: number,
      ax2: number,
      ay2: number,
      bx1: number,
      by1: number,
      bx2: number,
      by2: number,
    ) => ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1

    const screenShake = () => {
      arena.classList.remove('shake')
      void arena.offsetWidth
      arena.classList.add('shake')
    }

    const showMovePop = (fighter: Fighter, moveKey: keyof typeof MOVE_IMAGES) => {
      const pop = fighter.el.querySelector<HTMLImageElement>('.move-pop')
      if (!pop) {
        return
      }

      pop.src = MOVE_IMAGES[moveKey]
      pop.classList.remove('show')
      void pop.offsetWidth
      pop.classList.add('show')
    }

    const tryJump = (fighter: Fighter) => {
      if (fighter.onGround) {
        fighter.vy = JUMP_VELOCITY
        fighter.onGround = false
      }
    }

    const tryAttack = (fighter: Fighter, moveKey: keyof typeof MOVES, now: number) => {
      if (fighter.attacking || now < fighter.cooldownUntil) {
        return
      }

      fighter.attacking = true
      fighter.activeMove = moveKey
      fighter.attackStart = now
      fighter.hasHit = false
      fighter.cooldownUntil = now + MOVES[moveKey].cooldown
      showMovePop(fighter, moveKey)
    }

    const applyHit = (
      attacker: Fighter,
      target: Fighter,
      move: (typeof MOVES)[keyof typeof MOVES],
      now: number,
    ) => {
      target.health = Math.max(0, target.health - move.damage)
      target.hitFlashUntil = now + HIT_FLASH_MS
      const push = attacker.facing === 'right' ? move.knockback : -move.knockback
      target.x = clampX(target, target.x + push)

      if (move.launch) {
        target.vy = 12
        target.onGround = false
      }

      target.hpEl.style.width = `${(target.health / MAX_HEALTH) * 100}%`
      screenShake()

      if (target.health <= 0) {
        endGame(attacker)
      }
    }

    const endGame = (winner: Fighter) => {
      state = 'gameover'
      banner.innerHTML = `${winner.name} WINS<span class="sub">press R for a rematch</span>`
      banner.classList.add('show')
    }

    const resetFighters = () => {
      ;[p1, p2].forEach((fighter) => {
        fighter.health = MAX_HEALTH
        fighter.hpEl.style.width = '100%'
        fighter.attacking = false
        fighter.activeMove = null
        fighter.cooldownUntil = 0
        fighter.y = 0
        fighter.vy = 0
        fighter.onGround = true
      })

      p1.x = 140
      p1.facing = 'right'
      p2.x = 500
      p2.facing = 'left'
      p1TurnUntil = 0
      p1TurnAnimation = null
      el1.dataset.animation = 'idle'
      banner.classList.remove('show')
    }

    const update = (now: number) => {
      let p1MovementDirection = 0

      if (state === 'title') {
        if (justPressed.Enter) {
          resetFighters()
          state = 'fight'
          titleScreen.classList.add('hidden')
        }
      } else {
        if (justPressed.KeyR) {
          resetFighters()
          state = 'fight'
        }

        if (state === 'fight') {
          if (keys.KeyA) {
            p1.x -= MOVE_SPEED
            p1MovementDirection -= 1
          }
          if (keys.KeyD) {
            p1.x += MOVE_SPEED
            p1MovementDirection += 1
          }
          if (keys.KeyW || keys.KeyS) {
            tryJump(p1)
          }
          if (justPressed.KeyF) tryAttack(p1, 'move1', now)
          if (justPressed.KeyG) tryAttack(p1, 'move2', now)
          if (justPressed.KeyH) tryAttack(p1, 'move3', now)

          if (keys.ArrowLeft) {
            p2.x -= MOVE_SPEED
            p2.facing = 'left'
          }
          if (keys.ArrowRight) {
            p2.x += MOVE_SPEED
            p2.facing = 'right'
          }
          if (keys.ArrowUp || keys.ArrowDown) {
            tryJump(p2)
          }
          if (justPressed.Slash) tryAttack(p2, 'move1', now)
          if (justPressed.Quote) tryAttack(p2, 'move2', now)
          if (justPressed.Enter) tryAttack(p2, 'move3', now)

          const p1DesiredFacing = p1.x < p2.x ? 'right' : 'left'
          if (p1DesiredFacing !== p1.facing) {
            p1.facing = p1DesiredFacing
            p1TurnAnimation = p1DesiredFacing === 'left' ? 'turn-to-left' : 'turn-to-right'
            p1TurnUntil = now + (3 / 10) * 1000
          }

          ;[p1, p2].forEach((fighter) => {
            fighter.x = clampX(fighter, fighter.x)
            fighter.vy -= GRAVITY
            fighter.y += fighter.vy
            if (fighter.y <= 0) {
              fighter.y = 0
              fighter.vy = 0
              fighter.onGround = true
            }
          })

          ;[[p1, p2], [p2, p1]].forEach(([attacker, target]) => {
            if (!attacker.attacking || !attacker.activeMove) {
              return
            }

            const move = MOVES[attacker.activeMove]
            const elapsed = now - attacker.attackStart

            if (elapsed >= move.duration) {
              attacker.attacking = false
              return
            }

            if (
              !attacker.hasHit &&
              elapsed >= move.activeFrom &&
              elapsed <= move.activeTo
            ) {
              const hb = hitboxRect(attacker, move)
              const tb = bodyRect(target)
              if (rectsOverlap(hb.left, hb.bottom, hb.right, hb.top, tb.left, tb.bottom, tb.right, tb.top)) {
                attacker.hasHit = true
                applyHit(attacker, target, move, now)
              }
            }
          })
        }
      }

      for (const key in justPressed) {
        delete justPressed[key]
      }

      ;[p1, p2].forEach((fighter) => {
        fighter.el.style.left = `${fighter.x}px`
        fighter.el.style.bottom = `${FLOOR_HEIGHT + fighter.y}px`
        fighter.el.classList.toggle('jumping', !fighter.onGround)
        fighter.el.classList.toggle('facing-right', fighter.facing === 'right')
        fighter.el.classList.toggle('facing-left', fighter.facing === 'left')
        fighter.el.classList.toggle('attacking', fighter.attacking)
        fighter.el.classList.toggle('hit', now < fighter.hitFlashUntil)
      })

      let playerAnimation: AnimationName = 'idle'
      if (state === 'fight') {
        if (now < p1TurnUntil && p1TurnAnimation) {
          playerAnimation = p1TurnAnimation
        } else if (p1MovementDirection !== 0) {
          const facingDirection = p1.facing === 'right' ? 1 : -1
          playerAnimation = p1MovementDirection === facingDirection ? 'move-forward' : 'move-backward'
        }
      }
      if (el1.dataset.animation !== playerAnimation) {
        el1.dataset.animation = playerAnimation
      }

      debugHitboxes.forEach(([fighter, hitboxEl]) => {
        if (!hitboxEl || !fighter.attacking || !fighter.activeMove) {
          hitboxEl?.classList.remove('active')
          return
        }

        const move = MOVES[fighter.activeMove]
        const elapsed = now - fighter.attackStart
        if (elapsed < move.activeFrom || elapsed > move.activeTo) {
          hitboxEl.classList.remove('active')
          return
        }

        const hitbox = hitboxRect(fighter, move)
        hitboxEl.style.left = `${hitbox.left}px`
        hitboxEl.style.bottom = `${FLOOR_HEIGHT + hitbox.bottom}px`
        hitboxEl.style.width = `${hitbox.right - hitbox.left}px`
        hitboxEl.style.height = `${hitbox.top - hitbox.bottom}px`
        hitboxEl.classList.add('active')
      })

      animationId = requestAnimationFrame(update)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!keys[event.code]) {
        justPressed[event.code] = true
      }
      keys[event.code] = true

      if (['ArrowUp', 'ArrowDown', 'KeyW', 'KeyS', 'Slash', 'Quote', 'Enter'].includes(event.code)) {
        event.preventDefault()
      }

      if (event.code === 'KeyB') {
        setShowHitboxes((visible) => !visible)
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      keys[event.code] = false
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    animationId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [
    arenaRef,
    bannerRef,
    canvasRef,
    hp1Ref,
    hp2Ref,
    p1HitboxRef,
    p1Ref,
    p2HitboxRef,
    p2Ref,
    setShowHitboxes,
    titleScreenRef,
  ])

  return { showHitboxes, toggleHitboxes: () => setShowHitboxes((visible) => !visible) }
}
