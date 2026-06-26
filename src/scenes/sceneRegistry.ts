import { scenes } from "../data/scenes";
import type { SceneEntry } from "../shared/types/presentation";


/**
 * Looks up a scene by index, clamped to a valid range. This is now a much
 * thinner layer than before — there's no separate "registry map" to keep in
 * sync with anything, because `scenes` (src/data/scenes.ts) already IS the
 * ordered list of SceneEntry objects. This function just guards against an
 * out-of-range index (e.g. currentSlide briefly ahead of the array during
 * a fast "next" click).
 */
export function getScene(index: number): SceneEntry {
  const clamped = Math.min(Math.max(index, 0), scenes.length - 1);
  return scenes[clamped];
}

export { scenes };