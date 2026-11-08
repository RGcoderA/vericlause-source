/** How VeriClause should look and move. Both lists stay in force together. */

export const AVOID = [
  "Tags and pills",
  "Excessive italics",
  "Instrument Serif",
  "Negative kerning",
  "Over-the-top detailed UI",
  "Overusing dividers",
  "Color shades and opacities",
  "Containers with borders",
  "Overly detailed diagrams",
  "Verbose, redundant text",
  "Code breadcrumbs",
  "Section numbering",
  "Eyebrows",
  "Dithering",
  "ASCII images",
  "Squircles",
  "Excessive mono fonts",
  "All-caps subtitles",
  "Gradient backgrounds",
  "Periods in titles",
] as const;

export const MOTION = [
  "Ease-out for entrances",
  "Dropdowns at 150–250ms",
  "Stagger list rows by 30ms",
  "Scale to 0.97 on press",
  "Stretch moving knobs 12%",
  "Stagger as details settle",
  "Arcs for object movement",
  "Pulse to confirm success",
  "Ease-in-out for moves",
  "Start popovers at 0.95",
  "Enter from the trigger",
  "Exit to the trigger",
  "No bounce on everyday UI",
  "Don't tween while held",
  "Make exits 20% shorter",
  "Overlap old and new states",
  "Masks for reveals and colour",
  "Crossfade icons and blur",
  "Rubber band past bounds",
  "Reuse the same layoutId",
] as const;

export const ENTER_MS = 200;
export const EXIT_MS = 160;
export const STAGGER_MS = 30;
export const PRESS_SCALE = 0.97;
export const POPOVER_SCALE = 0.95;
export const KNOB_STRETCH = 1.12;

/** Later request: square action buttons are ovals, with room around the label. */
export const BUTTON_SHAPE = "oval";

export const EASE_OUT = [0.2, 0, 0, 1] as const;
export const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const;
