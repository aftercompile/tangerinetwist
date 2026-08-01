/**
 * Frame zero of the lamp scene, in pure CSS.
 *
 * Server component by design — it renders in the initial HTML, so the stage box is
 * filled from the very first paint and there is nothing to lay out later. Three
 * jobs, in order of importance:
 *
 *  1. It reserves the stage visually while the ~220KB three chunk loads on idle.
 *  2. It is the permanent fallback for devices with no WebGL (or too few cores),
 *     and for a lost GL context — in those cases LampCanvas renders null and this
 *     is simply what the hero is.
 *  3. Because it depicts the same empty print bed the canvas starts on, the
 *     crossfade when the canvas arrives is imperceptible.
 *
 * Deliberately not a photograph: the three JPEGs in public/images/hero are all lit,
 * finished lamps, and swapping one of those for an empty print bed would flash.
 */
export function LampPoster() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Warm bloom where the bulb will eventually sit */}
      <div
        className="absolute left-1/2 top-[38%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.16] blur-3xl"
        style={{ background: "radial-gradient(circle, #F0A164 0%, transparent 70%)" }}
      />
      {/* The bed itself — a shallow ellipse, foreshortened like the 3D one */}
      <div
        className="absolute left-1/2 top-[68%] h-24 w-[74%] max-w-sm -translate-x-1/2 rounded-[50%] opacity-70 blur-[2px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, #F1E9DC 0%, #E4D8C3 55%, transparent 78%)",
        }}
      />
      {/* Contact shadow */}
      <div
        className="absolute left-1/2 top-[70%] h-8 w-40 -translate-x-1/2 rounded-[50%] opacity-[0.10] blur-xl"
        style={{ background: "radial-gradient(ellipse, #1B1815 0%, transparent 72%)" }}
      />
    </div>
  );
}
