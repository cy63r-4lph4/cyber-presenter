import type { SceneEntry } from "../shared/types/presentation";
import { GenericSlideScene } from "./GenericSlideScene";

/**
 * Factory for the common case: a scene that's just a title, a subtitle,
 * and (optionally) a list of reveal talking-points. This replaces the old
 * `slides.ts` array of plain objects — GenericSlideScene is no longer an
 * implicit fallback for every scene, but this factory keeps the simple
 * cases just as easy to write as they were before.
 *
 * navLabel defaults to the title since for these simple scenes they're
 * usually the same thing, but can be overridden if you want a shorter
 * label in Remote's dropdown than what's shown on the big screen.
 */
export function genericSlide(
  title: string,
  subtitle: string,
  options?: { revealItems?: string[]; navLabel?: string },
): SceneEntry {
  return {
    navLabel: options?.navLabel ?? title,
    component: (props) => (
      <GenericSlideScene
        {...props}
        title={title}
        subtitle={subtitle}
        revealItems={options?.revealItems ?? []}
      />
    ),
  };
}