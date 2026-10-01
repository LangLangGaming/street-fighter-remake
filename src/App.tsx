import { useRef } from 'react'
import { FighterSprite } from './components/FighterSprite'
import { HudPanel } from './components/HudPanel'
import { TitleScreen } from './components/TitleScreen'
import move1 from './assets/move1.png'
import move2 from './assets/move2.png'
import move3 from './assets/move3.png'
import player2Sprite from './assets/imnumber2.png'
import titleBackground from './assets/title-bg.png'
import { PLAYER_1_SIZE, PLAYER_2_SIZE } from './game/config'
import { RYU_ANIMATIONS } from './game/ryuAnimations'
import { useStreetFighterGame } from './hooks/useStreetFighterGame'
import './App.css'

function App() {
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

  const { showHitboxes, toggleHitboxes } = useStreetFighterGame({
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
  })

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

      <FighterSprite fighterRef={p1Ref} id="p1" animations={RYU_ANIMATIONS} {...PLAYER_1_SIZE} facing="right" movePop={move1} />
      <FighterSprite fighterRef={p2Ref} id="p2" sprite={player2Sprite} {...PLAYER_2_SIZE} facing="left" movePop={move1} />
      <div ref={p1HitboxRef} className="debug-hitbox" aria-hidden="true" />
      <div ref={p2HitboxRef} className="debug-hitbox" aria-hidden="true" />

      <button
        id="debug-toggle"
        type="button"
        aria-pressed={showHitboxes}
        onClick={toggleHitboxes}
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
