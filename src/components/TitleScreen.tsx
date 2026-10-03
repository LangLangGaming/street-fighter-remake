type TitleScreenProps = {
  titleBackground: string
  visible: boolean
  onStart: () => void
}

export function TitleScreen({ titleBackground, visible, onStart }: TitleScreenProps) {
  return (
    <div id="title-screen" className={visible ? '' : 'hidden'} style={{ backgroundImage: `url(${titleBackground})` }}>
      <div className="title-card">
        <div className="title-logo">
          <span className="t1">STREET</span>
          <span className="t2">FIGHTER&nbsp;REMAKE</span>
        </div>

        <div className="moves-legend">
          <div className="legend-col">
            <div className="legend-head p1">PLAYER 1 &middot; WASD</div>
            <div className="legend-row">
              <span>F &mdash; Move 1: Jab</span>
            </div>
            <div className="legend-row">
              <span>G &mdash; Move 2: Kick</span>
            </div>
            <div className="legend-row">
              <span>H &mdash; Move 3: Hadouken</span>
            </div>
          </div>

          <div className="legend-col">
            <div className="legend-head p2">PLAYER 2 &middot; ARROWS</div>
            <div className="legend-row">
              <span>/ &mdash; Move 1: Jab</span>
            </div>
            <div className="legend-row">
              <span>' &mdash; Move 2: Kick</span>
            </div>
            <div className="legend-row">
              <span>Enter &mdash; Move 3: Shoryuken</span>
            </div>
          </div>
        </div>

        <button className="start-prompt" type="button" onClick={onStart}>PRESS ENTER TO START</button>
      </div>
    </div>
  )
}
