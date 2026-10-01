import { useEffect, useRef, useState, type RefObject } from 'react'
import move1 from './assets/move1.png'
import move2 from './assets/move2.png'
import move3 from './assets/move3.png'
import player1Sprite from './assets/imnumber1.png'
import player2Sprite from './assets/imnumber2.png'
import titleBackground from './assets/title-bg.png'
import './App.css'

const moveImages = {
  move1,
  move2,
  move3,
} as const

const PLAYER_1_SIZE = { width: 112, height: 152 }
const PLAYER_2_SIZE = { width: 100, height: 172 }

type MoveKey = keyof typeof moveImages

type Fighter = {
  el: HTMLDivElement
  hpEl: HTMLDivElement
  name: string
  width: number
  height: number
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

type HudPanelProps = {
  title: string
  healthRef: RefObject<HTMLDivElement | null>
  sideClassName?: string
  moves: Array<{
    key: string
    asset: string
    label: string
  }>
  controls: string
  isPlayerOne?: boolean
}

function HudPanel({ title, healthRef, sideClassName, moves, controls, isPlayerOne = false }: HudPanelProps) {
  return (
    <div className={sideClassName ? `side ${sideClassName}` : 'side'}>
      <div className={isPlayerOne ? 'tag p1' : 'tag p2'}>{title}</div>
      <div className="healthbar">
        <div ref={healthRef} className={isPlayerOne ? 'fill p1fill' : 'fill p2fill'} />
      </div>
      <div className="moves-mini">
        {moves.map((move) => (
          <span key={move.key} className="mv">
            {move.label && <b>{move.label}</b>}
            <img src={move.asset} alt={move.key} />
          </span>
        ))}
      </div>
      <div className="keys" dangerouslySetInnerHTML={{ __html: controls }} />
    </div>
  )
}

type FighterSpriteProps = {
  fighterRef: RefObject<HTMLDivElement | null>
  id: 'p1' | 'p2'
  sprite: string
  width: number
  height: number
  facing: 'left' | 'right'
  movePop: string
}

function FighterSprite({ fighterRef, id, sprite, width, height, facing, movePop }: FighterSpriteProps) {
  return (
    <div
      ref={fighterRef}
      id={id}
      className={`fighter facing-${facing}`}
      style={{ width, height }}
    >
      <div className="face" />
      <img className="sprite" src={sprite} alt="" draggable="false" />
      <img className="move-pop" src={movePop} alt="" />
    </div>
  )
}

type TitleScreenProps = {
  titleBackground: string
  titleScreenRef: RefObject<HTMLDivElement | null>
}

function TitleScreen({ titleBackground, titleScreenRef }: TitleScreenProps) {
  return (
    <div ref={titleScreenRef} id="title-screen" style={{ backgroundImage: `url(${titleBackground})` }}>
      <div className="title-card">
        <div className="title-logo">
          <span className="t1">STREET</span>
          <span className="t2">FIGHT&nbsp;PROTOTYPE</span>
        </div>

        <div className="moves-legend">
          <div className="legend-col">
            <div className="legend-head p1">PLAYER 1 &middot; WASD</div>
            <div className="legend-row">
              <img src={move1} alt="" />
              <span>F &mdash; Move 1: Jab</span>
            </div>
            <div className="legend-row">
              <img src={move2} alt="" />
              <span>G &mdash; Move 2: Kick</span>
            </div>
            <div className="legend-row">
              <img src={move3} alt="" />
              <span>H &mdash; Move 3: Uppercut</span>
            </div>
          </div>

          <div className="legend-col">
            <div className="legend-head p2">PLAYER 2 &middot; ARROWS</div>
            <div className="legend-row">
              <img src={move1} alt="" />
              <span>/ &mdash; Move 1: Jab</span>
            </div>
            <div className="legend-row">
              <img src={move2} alt="" />
              <span>' &mdash; Move 2: Kick</span>
            </div>
            <div className="legend-row">
              <img src={move3} alt="" />
              <span>Enter &mdash; Move 3: Uppercut</span>
            </div>
          </div>
        </div>

        <div className="start-prompt">PRESS ENTER TO START</div>
      </div>
    </div>
  )
}

function App() {
  const [showHitboxes, setShowHitboxes] = useState(false)
  const arenaRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const p1Ref = useRef<HTMLDivElement>(null)
  const p2Ref = useRef<HTMLDivElement>(null)
  const p1HitboxRef = useRef<HTMLDivElement>(null)
  const p2HitboxRef = useRef<HTMLDivElement>(null)
  const hp1Ref = useRef<HTMLDivElement>(null)
  const hp2Ref = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLDivElement>(null)
  const titleScreenRef = useRef<HTMLDivElement>(null)

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

    const FLOOR_HEIGHT = 70
    const GRAVITY = 0.9
    const JUMP_VELOCITY = 16
    const MOVE_SPEED = 5
    const MAX_HEALTH = 100
    const HIT_FLASH_MS = 150

    const MOVES = {
      move1: {
        damage: 6,
        reach: 26,
        duration: 180,
        activeFrom: 40,
        activeTo: 100,
        cooldown: 220,
        knockback: 10,
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
      width: number,
      height: number,
    ): Fighter => ({
      el,
      hpEl,
      name,
      width,
      height,
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

    const hitboxRect = (fighter: Fighter, move: (typeof MOVES)[MoveKey]) => {
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

    const showMovePop = (fighter: Fighter, moveKey: MoveKey) => {
      const pop = fighter.el.querySelector<HTMLImageElement>('.move-pop')
      if (!pop) {
        return
      }

      pop.src = moveImages[moveKey]
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

    const tryAttack = (fighter: Fighter, moveKey: MoveKey, now: number) => {
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
      move: (typeof MOVES)[MoveKey],
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
      banner.classList.remove('show')
    }

    const update = (now: number) => {
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
            p1.facing = 'left'
          }
          if (keys.KeyD) {
            p1.x += MOVE_SPEED
            p1.facing = 'right'
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
  }, [])

  return (
    <div ref={arenaRef} id="arena" className={showHitboxes ? 'debug-hitboxes' : ''}>
      <canvas ref={canvasRef} id="stage" />

      <div id="hud">
        <HudPanel
          title="PLAYER 1"
          healthRef={hp1Ref}
          isPlayerOne
          moves={[
            { key: 'move1', asset: move1, label: 'F' },
            { key: 'move2', asset: move2, label: 'G' },
            { key: 'move3', asset: move3, label: 'H' },
          ]}
          controls="A / D move &middot; W or S jump"
        />

        <HudPanel
          title="PLAYER 2"
          healthRef={hp2Ref}
          sideClassName="right"
          moves={[
            { key: 'move1', asset: move1, label: '/' },
            { key: 'move2', asset: move2, label: "'" },
            { key: 'move3', asset: move3, label: '&crarr;' },
          ]}
          controls="&larr; / &rarr; move &middot; &uarr; or &darr; jump"
        />
      </div>

      <FighterSprite fighterRef={p1Ref} id="p1" sprite={player1Sprite} {...PLAYER_1_SIZE} facing="right" movePop={move1} />
      <FighterSprite fighterRef={p2Ref} id="p2" sprite={player2Sprite} {...PLAYER_2_SIZE} facing="left" movePop={move1} />
      <div ref={p1HitboxRef} className="debug-hitbox" aria-hidden="true" />
      <div ref={p2HitboxRef} className="debug-hitbox" aria-hidden="true" />

      <button
        id="debug-toggle"
        type="button"
        aria-pressed={showHitboxes}
        onClick={() => setShowHitboxes((visible) => !visible)}
      >
        Hitboxes: {showHitboxes ? 'ON' : 'OFF'} <span>(B)</span>
      </button>

      <div ref={bannerRef} id="banner" />
      <TitleScreen titleBackground={titleBackground} titleScreenRef={titleScreenRef} />

      <div id="footer">preset stage &middot; div fighters on a canvas stage</div>
    </div>
  )
}

export default App
