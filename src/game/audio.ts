/** Central registry for future sound effects; add asset imports and playback here. */
export const SOUND_EFFECTS = {} as const

export type SoundEffectId = keyof typeof SOUND_EFFECTS

export function playSoundEffect(_id: SoundEffectId): void {
  void _id
  // Sound playback is intentionally a no-op until SFX assets are added.
}