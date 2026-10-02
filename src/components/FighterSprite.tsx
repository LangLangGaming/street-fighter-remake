import { useEffect, useRef, type RefObject } from 'react'
import type { CharacterAnimations } from '../game/ryuAnimations'

type FighterSpriteProps = {
  fighterRef: RefObject<HTMLDivElement | null>
  id: 'p1' | 'p2'
  sprite?: string
  animations?: CharacterAnimations
  width: number
  height: number
  facing: 'left' | 'right'
  movePop: string
}

export function FighterSprite({ fighterRef, id, sprite, animations, width, height, facing, movePop }: FighterSpriteProps) {
  const animationCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = animationCanvasRef.current
    const fighter = canvas?.parentElement
    const context = canvas?.getContext('2d')
    if (!canvas || !fighter || !context || !animations) {
      return
    }

    const images = new Map<string, HTMLImageElement>()
    Object.values(animations).forEach(({ src }) => {
      if (!images.has(src)) {
        const image = new Image()
        image.src = src
        images.set(src, image)
      }
    })

    let currentAnimation: string | null = null
    let animationStartedAt = 0
    let animationFrame = 0
    let requestId = 0
    let lastDrawnFrame = ''

    const drawFrame = (now: number) => {
      const requestedAnimation = fighter.dataset.animation
      const animationName = requestedAnimation && animations[requestedAnimation]
        ? requestedAnimation
        : animations.idle ? 'idle' : Object.keys(animations)[0]
      const animation = animations[animationName]

      if (animationName !== currentAnimation) {
        currentAnimation = animationName
        animationStartedAt = now
        animationFrame = 0
      }

      const elapsedFrames = Math.floor(((now - animationStartedAt) * animation.fps) / 1000)
      animationFrame = animation.loop
        ? elapsedFrames % animation.frames.length
        : Math.min(elapsedFrames, animation.frames.length - 1)
      const frame = animation.frames[animationFrame]
      const image = images.get(animation.src)
      const frameKey = `${animationName}:${animationFrame}:${frame.width}x${frame.height}`

      if (image?.complete && image.naturalWidth > 0 && frameKey !== lastDrawnFrame) {
        if (canvas.width !== frame.width || canvas.height !== frame.height) {
          canvas.width = frame.width
          canvas.height = frame.height
          canvas.style.width = `${frame.width}px`
          canvas.style.height = `${frame.height}px`
        }

        context.clearRect(0, 0, frame.width, frame.height)
        context.drawImage(image, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height)
        lastDrawnFrame = frameKey
      }

      const isTurn = animationName.startsWith('turn-')
      const shouldFlip = !isTurn && fighter.classList.contains('facing-left')
      const transform = `translateX(-50%)${shouldFlip ? ' scaleX(-1)' : ''}`
      if (canvas.style.transform !== transform) canvas.style.transform = transform
      requestId = requestAnimationFrame(drawFrame)
    }

    requestId = requestAnimationFrame(drawFrame)
    return () => cancelAnimationFrame(requestId)
  }, [animations])

  return (
    <div
      ref={fighterRef}
      id={id}
      className={`fighter facing-${facing}`}
      style={{ width, height }}
    >
      <div className="face" />
      {animations ? (
        <canvas ref={animationCanvasRef} className="sprite sprite-animated" aria-hidden="true" />
      ) : (
        <img className="sprite" src={sprite ?? ''} alt="" draggable="false" />
      )}
      <img className="move-pop" src={movePop} alt="" />
    </div>
  )
}
