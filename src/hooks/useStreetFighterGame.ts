import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { FLOOR_HEIGHT, MAX_HEALTH, MOVE_IMAGES, MOVES, PLAYER_1_SIZE, PLAYER_1_SKILL_REACH_BONUS, PLAYER_2_SIZE } from '../game/config'
import type { Fighter } from '../game/types'

type GameRefs = {
  arenaRef: RefObject<HTMLDivElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  p1Ref: RefObject<HTMLDivElement | null>
  p2Ref: RefObject<HTMLDivElement | null>
  p1HitboxRef: RefObject<HTMLDivElement | null>
  p2HitboxRef: RefObject<HTMLDivElement | null>
  hp1Ref: RefObject<HTMLDivElement | null>
  hp2Ref: RefObject<HTMLDivElement | null>
}

export type GameScreen = 'title' | 'playing' | 'rematch' | 'gameover'
type Score = { player1: number; player2: number }

const GRAVITY = 0.9
const JUMP_VELOCITY = 16
const MOVE_SPEED = 5
const HIT_FLASH_MS = 150
const ROUND_DURATION_SECONDS = 90
const ROUNDS_TO_WIN = 2

export function useStreetFighterGame(refs: GameRefs) {
  const [showHitboxes, setShowHitboxes] = useState(false)
  const [showDebugMenu, setShowDebugMenu] = useState(false)
  const [freezeTime, setFreezeTime] = useState(false)
  const [score, setScore] = useState<Score>({ player1: 0, player2: 0 })
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_SECONDS)
  const [screen, setScreen] = useState<GameScreen>('title')
  const scoreRef = useRef(score)
  const showHitboxesRef = useRef(false)
  const freezeTimeRef = useRef(false)
  const screenRef = useRef<GameScreen>('title')
  const actionRef = useRef<'start' | 'next' | 'home' | null>(null)

  const toggleHitboxes = useCallback(() => {
    showHitboxesRef.current = !showHitboxesRef.current
    setShowHitboxes(showHitboxesRef.current)
  }, [])
  const toggleDebugMenu = useCallback(() => setShowDebugMenu((visible) => !visible), [])
  const toggleFreezeTime = useCallback(() => {
    freezeTimeRef.current = !freezeTimeRef.current
    setFreezeTime(freezeTimeRef.current)
  }, [])
  const startMatch = useCallback(() => { actionRef.current = 'start' }, [])
  const startNextRound = useCallback(() => { actionRef.current = 'next' }, [])
  const returnHome = useCallback(() => { actionRef.current = 'home' }, [])

  // The game loop deliberately performs imperative DOM updates inside this effect.
  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => {
    const arena = refs.arenaRef.current
    const canvas = refs.canvasRef.current
    const el1 = refs.p1Ref.current
    const el2 = refs.p2Ref.current
    const hp1El = refs.hp1Ref.current
    const hp2El = refs.hp2Ref.current
    if (!arena || !canvas || !el1 || !el2 || !hp1El || !hp2El) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const COLORS = {
      bgTop: '#1b1035', bgBottom: '#3a1650', floor: '#2e2a3d', floorLine: '#ff5d3b',
      buildingFar: '#2b1f47', buildingNear: '#221739', window: 'rgba(255,214,150,0.55)',
    }
    let width = 0
    let height = 0
    let stars: { x: number; y: number; r: number; a: number }[] = []
    let buildings: { x: number; w: number; h: number; baseY: number; color: string; windows: number[][] }[] = []

    const buildStageDecor = () => {
      stars = Array.from({ length: 70 }, () => ({
        x: Math.random() * width, y: Math.random() * height * 0.5,
        r: Math.random() < 0.8 ? 1 : 2, a: 0.3 + Math.random() * 0.6,
      }))
      buildings = []
      const layers = [
        { baseY: height - FLOOR_HEIGHT + 6, color: COLORS.buildingFar, wRange: [60, 130], hRange: [80, 190] },
        { baseY: height - FLOOR_HEIGHT + 10, color: COLORS.buildingNear, wRange: [46, 100], hRange: [50, 140] },
      ]
      for (const layer of layers) {
        let x = -20
        while (x < width + 20) {
          const w = layer.wRange[0] + Math.random() * (layer.wRange[1] - layer.wRange[0])
          const h = layer.hRange[0] + Math.random() * (layer.hRange[1] - layer.hRange[0])
          const windows: number[][] = []
          if (Math.random() < 0.6) {
            for (let wy = 10; wy < h - 10; wy += 14) {
              for (let wx = 6; wx < w - 10; wx += 12) if (Math.random() < 0.3) windows.push([wx, wy])
            }
          }
          buildings.push({ x, w, h, baseY: layer.baseY, color: layer.color, windows })
          x += w + 6 + Math.random() * 10
        }
      }
    }

    const drawStage = () => {
      const grad = ctx.createLinearGradient(0, 0, 0, height)
      grad.addColorStop(0, COLORS.bgTop)
      grad.addColorStop(0.7, COLORS.bgBottom)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
      for (const star of stars) {
        ctx.fillStyle = `rgba(255,255,255,${star.a})`
        ctx.fillRect(star.x, star.y, star.r, star.r)
      }
      for (const building of buildings) {
        ctx.fillStyle = building.color
        ctx.fillRect(building.x, building.baseY - building.h, building.w, building.h + 20)
        ctx.fillStyle = COLORS.window
        for (const [wx, wy] of building.windows) ctx.fillRect(building.x + wx, building.baseY - building.h + wy, 5, 7)
      }
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

    const makeFighter = (el: HTMLDivElement, hpEl: HTMLDivElement, x: number, name: string, fighterWidth: number, fighterHeight: number): Fighter => ({
      el, hpEl, name, width: fighterWidth, height: fighterHeight, x, y: 0, vy: 0, onGround: true,
      facing: x < 300 ? 'right' : 'left', health: MAX_HEALTH, attacking: false, activeMove: null,
      attackStart: 0, hasHit: false, cooldownUntil: 0, hitFlashUntil: 0,
    })
    const p1 = makeFighter(el1, hp1El, 140, 'PLAYER 1', PLAYER_1_SIZE.width, PLAYER_1_SIZE.height)
    const p2 = makeFighter(el2, hp2El, 500, 'PLAYER 2', PLAYER_2_SIZE.width, PLAYER_2_SIZE.height)
    const debugHitboxes: Array<[Fighter, HTMLDivElement | null]> = [[p1, refs.p1HitboxRef.current], [p2, refs.p2HitboxRef.current]]
    // eslint-disable-next-line react-hooks/immutability
    el1.dataset.animation = 'idle'
    el2.dataset.animation = 'idle'
    let p1TurnUntil = 0
    let p1TurnAnimation: string | null = null
    let p2TurnUntil = 0
    let p2TurnAnimation: string | null = null
    const keys: Record<string, boolean> = {}
    const justPressed: Record<string, boolean> = {}
    let animationId = 0
    let remainingMs = ROUND_DURATION_SECONDS * 1000
    let lastTimestamp = 0
    let shownSeconds = ROUND_DURATION_SECONDS

    const clampX = (fighter: Fighter, x: number) => Math.max(0, Math.min(width - fighter.width, x))
    const bodyRect = (fighter: Fighter) => ({ left: fighter.x, right: fighter.x + fighter.width, bottom: fighter.y, top: fighter.y + fighter.height })
    const hitboxRect = (fighter: Fighter, move: (typeof MOVES)[keyof typeof MOVES]) => {
      const body = bodyRect(fighter)
      const reach = move.reach + (fighter === p1 ? PLAYER_1_SKILL_REACH_BONUS : 0)
      return fighter.facing === 'right'
        ? { left: body.right, right: body.right + reach, bottom: body.bottom, top: body.top }
        : { left: body.left - reach, right: body.left, bottom: body.bottom, top: body.top }
    }
    const overlaps = (a: ReturnType<typeof bodyRect>, b: ReturnType<typeof bodyRect>) =>
      a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom
    const screenShake = () => {
      arena.classList.remove('shake')
      void arena.offsetWidth
      arena.classList.add('shake')
    }
    const showMovePop = (fighter: Fighter, moveKey: keyof typeof MOVE_IMAGES) => {
      const pop = fighter.el.querySelector<HTMLImageElement>('.move-pop')
      if (!pop) return
      pop.src = MOVE_IMAGES[moveKey]
      pop.classList.remove('show')
      void pop.offsetWidth
      pop.classList.add('show')
    }
    const resetFighters = () => {
      for (const fighter of [p1, p2]) {
        fighter.health = MAX_HEALTH
        fighter.hpEl.style.width = '100%'
        fighter.attacking = false
        fighter.activeMove = null
        fighter.cooldownUntil = 0
        fighter.y = 0
        fighter.vy = 0
        fighter.onGround = true
        fighter.hitFlashUntil = 0
      }
      p1.x = 140
      p1.facing = 'right'
      p2.x = Math.max(width - 140 - p2.width, 500)
      p2.facing = 'left'
      p1TurnUntil = 0
      p1TurnAnimation = null
      p2TurnUntil = 0
      p2TurnAnimation = null
      el1.dataset.animation = 'idle'
      el2.dataset.animation = 'idle'
    }
    const beginRound = () => {
      resetFighters()
      remainingMs = ROUND_DURATION_SECONDS * 1000
      lastTimestamp = 0
      shownSeconds = ROUND_DURATION_SECONDS
      setTimeLeft(ROUND_DURATION_SECONDS)
      screenRef.current = 'playing'
      setScreen('playing')
    }
    const finishRound = (winner: Fighter | null) => {
      if (screenRef.current !== 'playing') return
      if (winner) {
        const nextScore = {
          player1: scoreRef.current.player1 + (winner === p1 ? 1 : 0),
          player2: scoreRef.current.player2 + (winner === p2 ? 1 : 0),
        }
        scoreRef.current = nextScore
        setScore(nextScore)
        const matchWon = nextScore.player1 >= ROUNDS_TO_WIN || nextScore.player2 >= ROUNDS_TO_WIN
        screenRef.current = matchWon ? 'gameover' : 'rematch'
        setScreen(screenRef.current)
      } else {
        screenRef.current = 'rematch'
        setScreen('rematch')
      }
    }
    const applyHit = (attacker: Fighter, target: Fighter, move: (typeof MOVES)[keyof typeof MOVES], now: number) => {
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
      if (target.health <= 0) finishRound(attacker)
    }
    const tryJump = (fighter: Fighter) => {
      if (!fighter.onGround) return
      fighter.vy = JUMP_VELOCITY
      fighter.onGround = false
    }
    const tryAttack = (fighter: Fighter, moveKey: keyof typeof MOVES, now: number) => {
      if (fighter.attacking || now < fighter.cooldownUntil) return
      fighter.attacking = true
      fighter.activeMove = moveKey
      fighter.attackStart = now
      fighter.hasHit = false
      fighter.cooldownUntil = now + MOVES[moveKey].cooldown
      showMovePop(fighter, moveKey)
    }
    const updateAttack = (attacker: Fighter, target: Fighter, now: number) => {
      if (!attacker.attacking || !attacker.activeMove) return
      const move = MOVES[attacker.activeMove]
      const elapsed = now - attacker.attackStart
      if (elapsed >= move.duration) {
        attacker.attacking = false
        return
      }
      if (!attacker.hasHit && elapsed >= move.activeFrom && elapsed <= move.activeTo && overlaps(hitboxRect(attacker, move), bodyRect(target))) {
        attacker.hasHit = true
        applyHit(attacker, target, move, now)
      }
    }
    const updateHitboxDebug = (fighter: Fighter, hitboxEl: HTMLDivElement | null, now: number) => {
      if (!hitboxEl || !showHitboxesRef.current || !fighter.attacking || !fighter.activeMove) {
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
    }

    const update = (now: number) => {
      if (actionRef.current) {
        const action = actionRef.current
        actionRef.current = null
        if (action === 'home') {
          scoreRef.current = { player1: 0, player2: 0 }
          setScore(scoreRef.current)
          resetFighters()
          screenRef.current = 'title'
          setScreen('title')
        } else {
          if (action === 'start') {
            scoreRef.current = { player1: 0, player2: 0 }
            setScore(scoreRef.current)
          }
          beginRound()
        }
      }
      let p1MovementDirection = 0
      let p2MovementDirection = 0
      if (screenRef.current === 'title' && justPressed.Enter) {
        scoreRef.current = { player1: 0, player2: 0 }
        setScore(scoreRef.current)
        beginRound()
      }
      if (screenRef.current === 'playing') {
        if (lastTimestamp && !freezeTimeRef.current) {
          remainingMs = Math.max(0, remainingMs - (now - lastTimestamp))
          const seconds = Math.ceil(remainingMs / 1000)
          if (seconds !== shownSeconds) {
            shownSeconds = seconds
            setTimeLeft(seconds)
          }
        }
        lastTimestamp = now
        if (keys.KeyA) { p1.x -= MOVE_SPEED; p1MovementDirection -= 1 }
        if (keys.KeyD) { p1.x += MOVE_SPEED; p1MovementDirection += 1 }
        if (keys.KeyW || keys.KeyS) tryJump(p1)
        if (justPressed.KeyF) tryAttack(p1, 'move1', now)
        if (justPressed.KeyG) tryAttack(p1, 'move2', now)
        if (justPressed.KeyH) tryAttack(p1, 'move3', now)
        if (keys.ArrowLeft) {
          p2.x -= MOVE_SPEED
          p2MovementDirection -= 1
          if (p2.facing !== 'left') {
            p2.facing = 'left'
            p2TurnAnimation = 'turn-to-left'
            p2TurnUntil = now + 300
          }
        }
        if (keys.ArrowRight) {
          p2.x += MOVE_SPEED
          p2MovementDirection += 1
          if (p2.facing !== 'right') {
            p2.facing = 'right'
            p2TurnAnimation = 'turn-to-right'
            p2TurnUntil = now + 300
          }
        }
        if (keys.ArrowUp || keys.ArrowDown) tryJump(p2)
        if (justPressed.Slash) tryAttack(p2, 'move1', now)
        if (justPressed.Quote) tryAttack(p2, 'move2', now)
        if (justPressed.Enter) tryAttack(p2, 'move3', now)

        const desiredFacing = p1.x < p2.x ? 'right' : 'left'
        if (desiredFacing !== p1.facing) {
          p1.facing = desiredFacing
          p1TurnAnimation = desiredFacing === 'left' ? 'turn-to-left' : 'turn-to-right'
          p1TurnUntil = now + 300
        }
        for (const fighter of [p1, p2]) {
          fighter.x = clampX(fighter, fighter.x)
          fighter.vy -= GRAVITY
          fighter.y += fighter.vy
          if (fighter.y <= 0) { fighter.y = 0; fighter.vy = 0; fighter.onGround = true }
        }
        updateAttack(p1, p2, now)
        updateAttack(p2, p1, now)
        if (screenRef.current === 'playing' && remainingMs <= 0) {
          finishRound(p1.health === p2.health ? null : p1.health > p2.health ? p1 : p2)
        }
      }

      for (const key in justPressed) delete justPressed[key]
      for (const fighter of [p1, p2]) {
        fighter.el.style.left = `${fighter.x}px`
        fighter.el.style.bottom = `${FLOOR_HEIGHT + fighter.y}px`
        fighter.el.classList.toggle('jumping', !fighter.onGround)
        fighter.el.classList.toggle('facing-right', fighter.facing === 'right')
        fighter.el.classList.toggle('facing-left', fighter.facing === 'left')
        fighter.el.classList.toggle('attacking', fighter.attacking)
        fighter.el.classList.toggle('hit', now < fighter.hitFlashUntil)
      }
      let playerAnimation = 'idle'
      if (screenRef.current === 'playing') {
        if (p1.attacking && p1.activeMove) playerAnimation = `${p1.activeMove}-attack`
        else if (now < p1TurnUntil && p1TurnAnimation) playerAnimation = p1TurnAnimation
        else if (p1MovementDirection !== 0) {
          const facingDirection = p1.facing === 'right' ? 1 : -1
          playerAnimation = p1MovementDirection === facingDirection ? 'move-forward' : 'move-backward'
        }
      }
      if (el1.dataset.animation !== playerAnimation) el1.dataset.animation = playerAnimation
      let player2Animation = 'idle'
      if (screenRef.current === 'playing') {
        if (p2.attacking && p2.activeMove) player2Animation = `${p2.activeMove}-attack`
        else if (now < p2TurnUntil && p2TurnAnimation) player2Animation = p2TurnAnimation
        else if (p2MovementDirection !== 0) {
          const facingDirection = p2.facing === 'right' ? 1 : -1
          player2Animation = p2MovementDirection === facingDirection ? 'move-forward' : 'move-backward'
        }
      }
      if (el2.dataset.animation !== player2Animation) el2.dataset.animation = player2Animation
      for (const [fighter, hitboxEl] of debugHitboxes) updateHitboxDebug(fighter, hitboxEl, now)
      animationId = requestAnimationFrame(update)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (!keys[event.code]) justPressed[event.code] = true
      keys[event.code] = true
      if (['ArrowUp', 'ArrowDown', 'KeyW', 'KeyS', 'Slash', 'Quote', 'Enter'].includes(event.code)) event.preventDefault()
      if (event.code === 'KeyB' && !event.repeat) toggleHitboxes()
    }
    const onKeyUp = (event: KeyboardEvent) => { keys[event.code] = false }

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
    refs.arenaRef,
    refs.canvasRef,
    refs.p1Ref,
    refs.p2Ref,
    refs.p1HitboxRef,
    refs.p2HitboxRef,
    refs.hp1Ref,
    refs.hp2Ref,
    toggleHitboxes,
  ])

  return {
    showHitboxes,
    showDebugMenu,
    freezeTime,
    score,
    timeLeft,
    screen,
    toggleHitboxes,
    toggleDebugMenu,
    toggleFreezeTime,
    startMatch,
    startNextRound,
    returnHome,
  }
}
