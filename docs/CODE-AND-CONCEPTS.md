# VeriClause — code and concepts

VeriClause is a reading aid for people who have just been handed a vendor contract or a non-disclosure agreement. It explains the document in everyday words, checks it against the team's rules, and shows a Red, Amber, or Green result with a quote taken from the file. It is decision support for a lawyer who stays in the loop. It is not a law firm, and it does not give legal advice.

This note explains the ideas and the code behind them under four headings: innovation and creativity, technical complexity, functionality and user experience, and impact and relevance. File paths are from the repository root.

## What a review actually does

1. The browser uploads a PDF or DOCX, or posts a demo id to `src/app/api/demo/route.ts`.
2. `src/lib/parsing/ingest.ts` rejects anything over 4 MB or anything that is not a PDF or DOCX, then extracts text (`unpdf` for PDF, Mammoth for DOCX).
3. `src/lib/parsing/split-sections.ts` cuts the text into numbered sections and routes each section to a specialist by keyword.
4. `src/lib/agents/index.ts` runs six specialists at once. Each one either calls a model or, if no key is set or the model fails, a deterministic scanner in `src/lib/agents/specialists/`.
5. `src/lib/agents/verifier.ts` keeps a finding only when its quote is found in the extracted text. The match lives in `src/lib/verification/match-quote.ts` and `src/lib/verification/confidence.ts`.
6. `src/lib/agents/supervisor.ts` writes the summary and next steps. The color is not a model guess: `src/lib/scoring/verdict.ts` returns Red if any kept finding is red, Amber if any remaining issue is amber, and Green otherwise.
7. The review is stored in memory (`src/lib/cache/review-cache.ts`) for that browser session and rendered by `src/components/review/ReviewWorkspace.tsx`.

The same screen can read the document aloud, restate it in plain words, translate that reading into eight languages, and draft a rewrite for a Red or Amber clause.

---

## Innovation and creativity

The creative bet is that a contract review should be a **reading**, not a chatbot that invents a legal opinion. Three design choices follow from that.

### The model may propose. Only the source text may confirm.

Specialists are asked to quote the contract. A separate verifier, written in code, throws the finding away when that quote is not in the file. Exact match comes first. A fuzzy window (token overlap, Jaccard-style) covers line breaks and small wording drift, and a quote shorter than a real clause is rejected. Dropped findings never reach the report. The badge on a card says the quote was checked, or that it was not.

That split is the product. A fluent paragraph with no anchor in the PDF is treated as a failure, not as a result.

### A playbook in ordinary sentences

Counsel does not edit JSON. They type a rule such as "We require 60 days' notice before a renewal." `src/lib/agents/playbook-compiler.ts` turns that sentence into a structured rule (domain, severity, what to look for). The next review uses it. Business accounts can run reviews. Only a counsel role can change the rules (`src/lib/auth/guard.ts`, `src/lib/auth/role.ts`).

### A learn mark, not a score sold as advice

`src/lib/learn/mark.ts` holds short comparisons saved from example NDAs and vendor agreements in `learn/mark/examples/`. The classifier looks at the uploaded text and says which kind of document it resembles: mutual NDA, one-way NDA, vendor agreement, terms, privacy policy, or other. The panel then shows what the clean example did and what would be a flag. The copy on screen says it was compared with saved examples. It does not say the contract is safe to sign.

### Reading, listening, and a help desk that refuses to review

After the verdict, the same sections are restated with `src/lib/plain/explain.ts` (a phrase table: "shall" becomes "must", "indemnify" becomes "cover the other side's losses", and so on). The reader can listen to the legal text or to that plain restatement. Eight languages are available. Translation goes through `src/lib/i18n/translate.ts` and is cached by a hash of the source.

The Help button does not send the contract to a model. `src/lib/help/faq.ts` answers from a fixed guide. If the question does not match, the reply says what Help can and cannot do. A microphone fills the question box (`src/components/help/HelpChat.tsx`, `src/lib/help/speech.ts`) and still goes through that same guide.

### Sample mode is a real mode

If Gemini, Grok, and OpenRouter are all unset, the review still runs. The scanners quote the source and still pass the verifier. Demos and tests do not depend on a key. When a key exists, `src/lib/llm/router.ts` tries Gemini, then Grok, then OpenRouter.

---

## Technical complexity

### Parallel specialists, one verifier, one verdict

`runReviewPipeline` marks every specialist as running, then `Promise.all` waits for all six. A specialist that throws becomes an error row and contributes no findings. The others still finish. Sections are not copied in full to every agent: `routeSectionsToAgent` keeps the clauses whose headings match that agent's keyword list, and caps the characters (`TOKEN_CAPS` in `src/config/agents.config.ts`).

Each live specialist call is JSON, checked with a Zod schema (`src/lib/playbook/rule-schema.ts`) inside `completeJson` (`src/lib/agents/base-agent.ts`). If the model returns prose around the JSON, the parser still extracts the object. If parsing or the network fails, the pipeline uses the scanner for that domain instead of failing the whole review.

The supervisor may phrase the summary. `verdictFromFindings` still decides the color from the verified findings, so a model cannot talk a Red file into a Green badge.

### Quote matching

`normalizeForMatch` collapses whitespace, straightens quotes, and lowercases. A normalized substring hit is an exact match. Otherwise a sliding window of words is scored by token overlap. Confidence and match type are stored on the finding (`verified`, `confidence`, `matchType`). The UI shows "Quote checked" only when `verified` is true.

### Identity, limits, and abuse

`src/middleware.ts` sets an httpOnly session cookie (`vc_session`) for fourteen days so reviews and playbooks stay with that browser. API routes call `assertSameOrigin` so a random site cannot post a review on the user's behalf. `rateLimit` and `beginInflight` in `src/lib/http.ts` cap how many reviews and translations one address can start. Uploads stop at 4 MB. The FAQ and the upload hint both say 4 MB, which is `LIMITS.maxUploadBytes`.

Auth0 is optional. When it is configured, login asks for a second factor (`acr_values` for multi-factor in `src/lib/auth/authorize.ts`) and can offer Google if that connection is enabled. The session cookie is HMAC-signed with `AUTH0_SECRET`. The role is read from `https://vericlause.app/role`. A missing role is business, which can review and cannot edit the playbook.

### Language and speech

`src/lib/i18n/copy.ts` is one typed dictionary. A test (`tests/copy.test.ts`) checks that every language has the same shape, so a missing French string fails the build of the test suite rather than showing a blank label. Supported languages: English (Canada), French (Canada), Spanish, Portuguese (Brazil), German, Chinese (Simplified), Hindi, and Arabic. Arabic sets `dir` to `rtl` on the document.

Contract translation is separate from the interface dictionary. The client sends sections to `POST /api/translate`. The server clips fields, packs them into batches, and asks the router. English is not sent to the model. A hash cache avoids paying for the same text twice in one process.

Read-aloud is the browser's speech synthesis, not a paid audio API. `src/lib/speech/chunks.ts` splits the script into short utterances. `src/components/review/useSpeech.ts` works around the usual browser failures: a speak call that follows `cancel()` in the same turn is delayed, interrupted and canceled errors are ignored, a failed start is retried once without pinning a voice, a timer advances the queue if an utterance never ends, and a ten-second pause/resume keeps Chrome from stopping mid-paragraph. Pause itself cancels and resumes from the same chunk, because `speechSynthesis.pause()` is unreliable.

### Where state lives

Contracts, reviews, and playbooks sit in a `Map` on `globalThis` (`src/lib/cache/review-cache.ts`). A fingerprint of the document plus the playbook returns the previous review instead of running the pipeline again. Tiger Data (`TIGER_DATABASE_URL`) can record a finished review as an event (`src/lib/sponsors/tiger.ts`). Supabase storage is optional and is not required to finish a review.

This memory store is why **one long-lived Node process** (local `npm start`, Docker, or a single Render instance) keeps a review available after the redirect. A platform that starts a fresh process for every request can lose that map between the POST and the following page load. `docs/DEPLOY.md` says how to host it so the review stays put.

### Tests

`tests/` covers the verifier, verdict ranking, section splitting, the pipeline's sample path, translation packing, the FAQ matcher, learn-mark classification, sponsor routing, the copy dictionary, and the speech error policy. `npm test` runs them with Vitest. No network and no API key are required.

---

## Functionality and user experience

### The path a person takes

- **Home** (`src/app/page.tsx`) states the job in one sentence and plays a short film (`public/home-intro.mp4`) with Play and Sound controls.
- **Review** (`src/app/review/page.tsx`) takes a PDF or DOCX, or one of the demos. The trap vendor agreement plants unlimited liability, a short auto-renewal, and data leaving the EU. The clean agreement is the contrast.
- **Result** shows the color, the page count, the time taken, a summary, next steps, the learn mark, and which specialist finished. Findings can be filtered. "Show in contract" opens the document pane and scrolls to the clause. "Suggest fix" opens the original clause beside a rewrite and a note (`src/components/redline/`).
- **Read document** and **Read simple terms** speak the matching text and switch the pane so the words on screen are the words being read. The language menu changes both the interface and, after translation, the contract reading.
- **Playbook** is where counsel adds a rule. **History** lists reviews from this browser session.
- **FAQ** (`src/app/faq/page.tsx`) repeats the help guide and plays the "how the review works" film.
- **Help** is a panel on every page. Starter questions are the FAQ. Typed or spoken questions are matched to that guide.

### Visual system

`src/app/globals.css` and `src/design/principles.ts` fix the look. Light mode is pale beige (`#EDE8D0`). Dark mode is black (`#000000`), not dark gray. The two brand colors are teal `#40B0A6` and gold `#E1BE6A`. Action buttons are ovals. Motion is short: panels enter from the control that opened them, and presses scale to 0.97 without a bounce. The shield logo is `public/logo.png`.

Empty, busy, and error states are written in the same dictionary as the rest of the interface: no file yet, a translation still loading, a microphone blocked, a model that did not answer, a playbook locked until counsel signs in.

### What the buttons guarantee

| Control | What the code does |
| --- | --- |
| Read document | Speaks `section.document` (the extracted clause, or its translation) and shows the document pane |
| Read simple terms | Speaks the plain restatement, with the "everyday wording" preface, and shows that pane |
| Show in contract | Selects the document pane and scrolls the clause into the panel |
| Suggest fix | `POST /api/redline` returns original, rewrite, and note |
| Rerun | Runs the pipeline again with the current playbook and opens the new review |
| Speak in Help | Fills the question from the browser speech recognizer in the selected language. Send still uses the FAQ |

---

## Impact and relevance

Vendor paperwork arrives faster than a lawyer can read it. The costly failure is not a missing feature. It is a confident summary that cites a sentence the contract does not contain, or a team that treats a tool as a signature.

VeriClause is aimed at the hour before counsel spends time: a business reader, or a lawyer doing a first pass, sees which clauses break the team's own rules and can jump to the sentence. Red means a rule treated as a deal-breaker failed. Amber means a warning that still needs a person. Green means the enabled rules did not fail. Next to that, the plain-language reading and the audio exist so someone who is not a specialist can follow the document, including in French, Spanish, Portuguese, German, Chinese, Hindi, or Arabic.

The limits are part of the impact story, and they are written in the product:

- It does not sign, send, or negotiate.
- Help will not review a contract from the chat. The file has to go through the review page, where quotes are checked.
- Scanned pages with no text layer are not read.
- A rewrite is a starting point for counsel, labeled as not legal advice.
- Without a model key, the result is the sample scanners, still checked against the file. With a key, a live model can still be wrong, which is why the verifier runs after it.

The demo is built so that difference can be shown in a few minutes: the trap file should come back Red, the clean file should not, a new playbook rule should move a later run, and a suggested fix should show the original clause beside the rewrite.

---

## Map of the code

| Area | Path | Role |
| --- | --- | --- |
| Pages | `src/app/` | Home, review, playbook, history, FAQ, login |
| API | `src/app/api/` | Upload, demo, review, rerun, redline, translate, help, Auth0, health |
| Pipeline | `src/lib/agents/` | Specialists, verifier, supervisor, compiler, redliner |
| Parsing | `src/lib/parsing/` | PDF, DOCX, sections |
| Rules | `src/lib/playbook/` | Default playbook and Zod schemas |
| Models | `src/lib/llm/` | Gemini, then Grok, then OpenRouter |
| Check quotes | `src/lib/verification/` | Normalize, exact match, fuzzy window |
| Learn mark | `src/lib/learn/` and `learn/mark/` | Document kind and saved comparisons |
| Languages | `src/lib/i18n/` | Interface copy, translation |
| Speech | `src/lib/speech/` and `src/components/review/useSpeech.ts` | Chunks and browser playback |
| Help | `src/lib/help/` and `src/components/help/HelpChat.tsx` | Guide and microphone |
| Session store | `src/lib/cache/review-cache.ts` | In-memory contracts, reviews, playbooks |
| Auth | `src/lib/auth/` | Auth0 URL, signed cookie, counsel gate |
| UI | `src/components/` | Review workspace, films, playbook, history |
| Tests | `tests/` | Verifier, verdict, copy, pipeline, FAQ, speech |
| Demos | `public/demo-contracts/` and `src/lib/demo/` | PDFs and fallback text |

---

## Glossary

| Term | Meaning in this repo |
| --- | --- |
| Specialist | One of six readers: liability, payment, privacy, termination, IP and confidentiality, governing law |
| Verifier | Code that drops a finding whose quote is not in the extracted text |
| Supervisor | Writes the summary and next steps after verification |
| Playbook | The enabled rules for this session. Versioned. Counsel can add rules |
| Learn mark | A comparison with a saved example of the same kind of document |
| Sample mode | No model key. Scanners still quote the file and pass the verifier |
| Live mode | At least one of Gemini, Grok, or OpenRouter is configured |
| Fingerprint | Hash of the contract text plus the playbook, used to reuse a finished review |
| Simple terms | The phrase-table restatement, optionally translated |
| Red / Amber / Green | Deal-breaker, warning, or no enabled rule failed |

Hosting steps for Render and Vercel are in `docs/DEPLOY.md`.
