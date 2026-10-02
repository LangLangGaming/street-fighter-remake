import { useRef } from 'react'
import { FighterSprite } from './components/FighterSprite'
import { HudPanel } from './components/HudPanel'
import { TitleScreen } from './components/TitleScreen'
import move1 from './assets/move1.png'
import move2 from './assets/move2.png'
import move3 from './assets/move3.png'
import titleBackground from './assets/title-bg.png'
import { PLAYER_1_SIZE, PLAYER_2_SIZE } from './game/config'
import { KEN_ANIMATIONS } from './game/kenAnimations'
import { RYU_ANIMATIONS } from './game/ryuAnimations'
import { useStreetFighterGame } from './hooks/useStreetFighterGame.ts'
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
  const {
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
  } = useStreetFighterGame({
    arenaRef,
    canvasRef,
    p1Ref,
    p2Ref,
    p1HitboxRef,
    p2HitboxRef,
    hp1Ref,
    hp2Ref,
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

      <div className="match-display" aria-label="Match score and round timer">
        <div className="scoreboard">
          <span className="score-player p1-score">P1 <b>{score.player1}</b></span>
          <span className="score-divider">:</span>
          <span className="score-player p2-score"><b>{score.player2}</b> P2</span>
        </div>
        <div className={`round-timer${timeLeft <= 10 ? ' urgent' : ''}`}>{String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</div>
      </div>

      <FighterSprite fighterRef={p1Ref} id="p1" animations={RYU_ANIMATIONS} {...PLAYER_1_SIZE} facing="right" movePop={move1} />
      <FighterSprite fighterRef={p2Ref} id="p2" animations={KEN_ANIMATIONS} {...PLAYER_2_SIZE} facing="left" movePop={move1} />
      <div ref={p1HitboxRef} className="debug-hitbox" aria-hidden="true" />
      <div ref={p2HitboxRef} className="debug-hitbox" aria-hidden="true" />

      <button id="debug-toggle" type="button" aria-expanded={showDebugMenu} onClick={toggleDebugMenu}>
        {showDebugMenu ? 'Close Debug' : 'Debug'}
      </button>
      {showDebugMenu && (
        <div className="debug-menu" role="group" aria-label="Debug options">
          <strong>DEBUG OPTIONS</strong>
          <label><input type="checkbox" checked={showHitboxes} onChange={toggleHitboxes} /> Show hitboxes <kbd>B</kbd></label>
          <label><input type="checkbox" checked={freezeTime} onChange={toggleFreezeTime} /> Freeze timer</label>
        </div>
      )}

      {screen === 'rematch' && (
        <div className="round-overlay" role="dialog" aria-modal="true" aria-labelledby="round-title">
          <div className="result-card">
            <span className="result-kicker">ROUND COMPLETE</span>
            <h1 id="round-title">Rematch?</h1>
            <p>First player to win two rounds takes the match.</p>
            <button type="button" className="result-primary" onClick={startNextRound}>FIGHT AGAIN</button>
          </div>
        </div>
      )}
      {screen === 'gameover' && (
        <div className="round-overlay" role="dialog" aria-modal="true" aria-labelledby="round-title">
          <div className="result-card">
            <span className="result-kicker">MATCH COMPLETE</span>
            <h1 id="round-title">{score.player1 > score.player2 ? 'PLAYER 1 WINS' : 'PLAYER 2 WINS'}</h1>
            <p>Final score <b>{score.player1} — {score.player2}</b></p>
            <button type="button" className="result-primary" onClick={returnHome}>BACK TO HOMEPAGE</button>
          </div>
        </div>
      )}
      <TitleScreen titleBackground={titleBackground} visible={screen === 'title'} onStart={startMatch} />
    </div>
  )
}

export default App
