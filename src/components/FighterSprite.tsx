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
}

export function FighterSprite({ fighterRef, id, sprite, animations, width, height, facing }: FighterSpriteProps) {
  const animationCanvasRef = useRef<HTMLCanvasElement>(null)
  const projectileCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = animationCanvasRef.current
    const projectileCanvas = projectileCanvasRef.current
    const fighter = canvas?.parentElement
    const context = canvas?.getContext('2d')
    const projectileContext = projectileCanvas?.getContext('2d')
    if (!canvas || !projectileCanvas || !fighter || !context || !projectileContext || !animations) {
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
    let lastDrawnProjectileFrame = ''

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
        lastDrawnFrame = ''
        lastDrawnProjectileFrame = ''
        canvas.width = Math.max(...animation.frames.map(({ width: frameWidth }) => frameWidth))
        canvas.height = Math.max(...animation.frames.map(({ y, height: frameHeight }) => y + frameHeight))
        canvas.style.width = `${canvas.width}px`
        canvas.style.height = `${canvas.height}px`
        if (animation.projectile) {
          projectileCanvas.width = Math.max(...animation.projectile.frames.map(({ width: frameWidth }) => frameWidth))
          projectileCanvas.height = Math.max(...animation.projectile.frames.map(({ height: frameHeight }) => frameHeight))
          projectileCanvas.style.width = `${projectileCanvas.width}px`
          projectileCanvas.style.height = `${projectileCanvas.height}px`
          projectileCanvas.style.display = 'block'
        } else {
          projectileCanvas.style.display = 'none'
        }
      }

      const elapsedFrames = Math.floor(((now - animationStartedAt) * animation.fps) / 1000)
      animationFrame = animation.loop
        ? elapsedFrames % animation.frames.length
        : Math.min(elapsedFrames, animation.frames.length - 1)
      const frame = animation.frames[animationFrame]
      const image = images.get(animation.src)
      const frameKey = `${animationName}:${animationFrame}:${frame.width}x${frame.height}`

      if (image?.complete && image.naturalWidth > 0 && frameKey !== lastDrawnFrame) {
        context.clearRect(0, 0, canvas.width, canvas.height)
        const drawX = (canvas.width - frame.width) / 2
        const drawY = canvas.height - frame.y - frame.height
        context.drawImage(image, frame.x, frame.y, frame.width, frame.height, drawX, drawY, frame.width, frame.height)
        lastDrawnFrame = frameKey
      }

      const projectile = animation.projectile
      const projectileStartMs = ((animation.frames.length - 1) * 1000) / animation.fps
      const projectileElapsedMs = now - animationStartedAt - projectileStartMs
      const projectileFrameIndex = Math.floor((projectileElapsedMs * (projectile?.fps ?? animation.fps)) / 1000)
      if (projectile && projectileFrameIndex >= 0 && projectileFrameIndex < projectile.frames.length) {
        projectileCanvas.style.display = 'block'
        const projectileFrame = projectile.frames[projectileFrameIndex]
        const projectileKey = `${animationName}:${projectileFrameIndex}`
        if (image?.complete && image.naturalWidth > 0 && projectileKey !== lastDrawnProjectileFrame) {
          projectileContext.clearRect(0, 0, projectileCanvas.width, projectileCanvas.height)
          const drawY = projectileCanvas.height - projectileFrame.height
          projectileContext.drawImage(
            image,
            projectileFrame.x,
            projectileFrame.y,
            projectileFrame.width,
            projectileFrame.height,
            0,
            drawY,
            projectileFrame.width,
            projectileFrame.height,
          )
          lastDrawnProjectileFrame = projectileKey
        }

        const facingLeft = fighter.classList.contains('facing-left')
        const stageWidth = fighter.parentElement?.clientWidth ?? 0
        const fighterLeft = Number.parseFloat(fighter.style.left) || 0
        const availableDistance = facingLeft
          ? fighterLeft - projectile.spawnOffset
          : stageWidth - fighterLeft - fighter.offsetWidth - projectileCanvas.width - projectile.spawnOffset
        const travel = Math.min(
          projectile.distance * (projectileFrameIndex / Math.max(1, projectile.frames.length - 1)),
          Math.max(0, availableDistance),
        )
        projectileCanvas.style.left = facingLeft
          ? `${-projectileCanvas.width - projectile.spawnOffset - travel}px`
          : `${fighter.offsetWidth + projectile.spawnOffset + travel}px`
        projectileCanvas.style.transform = facingLeft ? 'scaleX(-1)' : ''
      } else {
        projectileCanvas.style.display = 'none'
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
        <>
          <canvas ref={animationCanvasRef} className="sprite sprite-animated" aria-hidden="true" />
          <canvas ref={projectileCanvasRef} className="projectile-sprite" aria-hidden="true" />
        </>
      ) : (
        <img className="sprite" src={sprite ?? ''} alt="" draggable="false" />
      )}
    </div>
  )
}
