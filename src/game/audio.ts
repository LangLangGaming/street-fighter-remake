import fightSound from '../assets/sfx/fight.mp3.mpeg?url'
import kenMove1 from '../assets/sfx/ken_move1.mpeg?url'
import kenMove2 from '../assets/sfx/ken_move2.mpeg?url'
import kenDeath from '../assets/sfx/ken_death.mpeg?url'
import hadoukenSound from '../assets/sfx/hadouken.mpeg?url'
import shoryukenSound from '../assets/sfx/shoryuken.mpeg?url'
import backgroundMusic from '../assets/sfx/music.mpeg?url'
import ryuMove1 from '../assets/sfx/ryu_move1.mpeg?url'
import ryuMove2 from '../assets/sfx/ryu_move2.mpeg?url'
import ryuDeath from '../assets/sfx/ryu_death.mpeg?url'

const SOUND_EFFECTS = {
  fight: fightSound,
  ryuMove1,
  ryuMove2,
  kenMove1,
  kenMove2,
  ryuDeath,
  kenDeath,
  hadouken: hadoukenSound,
  shoryuken: shoryukenSound,
} as const

export type SoundEffectId = keyof typeof SOUND_EFFECTS

const music = new Audio(backgroundMusic)
music.loop = true
music.volume = 0.35

let musicUnlockPending = false

export function startBackgroundMusic(): void {
  musicUnlockPending = false
  if (!music.paused) return

  void music.play().then(() => {
    musicUnlockPending = false
    window.removeEventListener('pointerdown', resumeMusic)
    window.removeEventListener('keydown', resumeMusic)
  }).catch(() => {
    if (musicUnlockPending) return
    musicUnlockPending = true
    window.addEventListener('pointerdown', resumeMusic, { once: true })
    window.addEventListener('keydown', resumeMusic, { once: true })
  })
}

export function pauseBackgroundMusic(): void {
  music.pause()
  musicUnlockPending = false
  window.removeEventListener('pointerdown', resumeMusic)
  window.removeEventListener('keydown', resumeMusic)
}

function resumeMusic(): void {
  musicUnlockPending = false
  startBackgroundMusic()
}

export function playSoundEffect(id: SoundEffectId): void {
  const sound = new Audio(SOUND_EFFECTS[id])
  sound.volume = id === 'fight' ? 0.8 : 0.75
  void sound.play().catch(() => {
    // Browser playback can be blocked until the user interacts with the page.
  })
}
