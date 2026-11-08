export const APP_NAME = "VeriClause";

export const APP_TAGLINE =
  "Verified contract risk review. Lawyer in the loop.";

export const DEMO_FILES = {
  clean: {
    id: "clean",
    filename: "clean-vendor-agreement.pdf",
    title: "Clean vendor MSA",
    blurb: "Balanced terms. Expect a green verdict against the starter playbook.",
  },
  trap: {
    id: "trap",
    filename: "trap-vendor-agreement.pdf",
    title: "Trap vendor MSA",
    blurb:
      "Planted gotchas: unlimited liability, 15-day auto-renewal, data leaving the EU.",
  },
  mutual: {
    id: "mutual",
    filename: "mutual-nda.txt",
    title: "Mutual NDA",
    blurb: "A balanced two-year NDA. The learn mark expects a mostly green read.",
  },
  oneway: {
    id: "oneway",
    filename: "one-way-nda.txt",
    title: "One-way NDA",
    blurb: "Only one side shares secrets, for three years.",
  },
  risky: {
    id: "risky",
    filename: "risky-vendor.txt",
    title: "Risky vendor agreement",
    blurb: "A one-sided vendor draft from the learn-mark pack.",
  },
} as const;

export const SESSION_COOKIE = "vc_session";
