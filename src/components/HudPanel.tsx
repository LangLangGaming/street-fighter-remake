import type { RefObject } from 'react'

type HudPanelProps = {
  title: string
  healthRef: RefObject<HTMLDivElement | null>
  sideClassName?: string
  moves: Array<{
    key: string
    label: string
    name: string
  }>
  controls: string
  isPlayerOne?: boolean
}

export function HudPanel({ title, healthRef, sideClassName, moves, controls, isPlayerOne = false }: HudPanelProps) {
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
            <span>{move.name}</span>
          </span>
        ))}
      </div>
      <div className="keys" dangerouslySetInnerHTML={{ __html: controls }} />
    </div>
  )
}
