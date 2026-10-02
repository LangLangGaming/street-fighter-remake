import type { RefObject } from 'react'
import move1 from '../assets/move1.png'
import move2 from '../assets/move2.png'
import move3 from '../assets/move3.png'

type TitleScreenProps = {
  titleBackground: string
  titleScreenRef: RefObject<HTMLDivElement | null>
}

export function TitleScreen({ titleBackground, titleScreenRef }: TitleScreenProps) {
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
