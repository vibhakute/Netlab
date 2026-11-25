# NetLab — Data Communication

An interactive learning site for an undergraduate **Data Communication** course. Every topic follows the same five-step path:

**Theory → Visualize → Simulate → Quiz → Notes**

| Content | Count |
|---|---|
| Syllabus topics (Units I–IV, from the course PDFs) | 41 |
| Additional networking topics (the original NetLab lessons, all kept) | 24 |
| Visualizations and simulations | 103 |
| Quiz questions (each tagged easy / medium / hard) | 342 |

The site is plain HTML, CSS and JavaScript with no build step. A small optional Node server adds the AI study assistant.

---

## 1. Setup

### Fastest: free cloud AI + Vercel

1. Get a free key: **Google Gemini** at https://aistudio.google.com/apikey (or **Groq** at https://console.groq.com/keys). No credit card.
2. Local: put `GEMINI_API_KEY=...` (or `GROQ_API_KEY=...`) in `.env`, then `npm run dev` → http://localhost:5050.
3. Deploy: `npx vercel` (log in, accept defaults), add the same variable with `npx vercel env add GEMINI_API_KEY`, then `npx vercel --prod`.
   The AI runs as Vercel functions (`api/ai/*.mjs`, logic in `lib/ai.mjs`); `.vercelignore` keeps `.env`, `node_modules` and `tests` out of the upload.

AI provider order when several are configured (`AI_PROVIDER=auto`): Claude (paid key) → Gemini → Groq → local Ollama. `GEMINI_MODEL` / `GROQ_MODEL` override the automatically chosen model.

### Option A — full site with the FREE local AI (Ollama)

Requires **Node.js 20.12 or newer**.

1. Install **Ollama** (free) from https://ollama.com and open it once.
2. Download the free model (about 2 GB, one time only):
   ```bash
   ollama pull llama3.2
   ```
3. Start NetLab:
   ```bash
   npm install                  # one time only
   npm run dev                  # http://localhost:5050  (npm start also works)
   ```

The terminal says `AI assistant: FREE local model via Ollama`. No account, API key or payment is needed, and your questions never leave your computer.

**Paid alternative:** a real Claude API key in `.env` (`ANTHROPIC_API_KEY=sk-ant-api03-…`) makes NetLab use Claude instead, which gives better answers but is billed by Anthropic.

Without either one, the server still runs and the assistant works in offline mode, saying so.

### Option B — static only (no AI)

Serve the folder with any static server:

```bash
python -m http.server 8080   # or: npx serve .
```

You can also open `index.html` directly. Everything works except the AI calls: lessons, visualizations, simulations, quizzes, progress, uploads and offline notes all run. The assistant shows **Offline mode**.

### Tests

```bash
npm test                     # unit tests for the simulation maths (assets/js/sim-logic.js)
```

---

## 2. Features

### Home (`index.html`)

- Full-screen animated network: computers, servers, switches and routers, with packets moving between them.
- One **START LEARNING** button, which becomes **CONTINUE LEARNING** once you've started.
- Overall progress bar and recently studied topics.

### Learn (`learn.html`)

- **Dashboard** (`#/`): overall progress, a continue button, recent topics, and each unit's progress.
- **Unit page** (`#/unit/u1` … `#/unit/extra`):
  - exam weight and learning outcome;
  - every topic with its step progress and completion status;
  - a continue button.
- **Topic workflow** (`#/topic/<id>/<step>`), five steps:
  1. **Theory**:
     - introduction, definition, why it matters, how it works;
     - a detailed explanation and diagrams;
     - examples, terminology, advantages and disadvantages, comparison tables;
     - exam points and a summary;
     - a **Simple / Detailed** toggle.
  2. **Visualize**: a staged animation with play/pause, back/next, restart, speed and stage dots, and an explanation for each stage.
  3. **Simulate**: an interactive model with real controls, a "Try this" task list, and a readout that explains the result.
  4. **Quiz**: MCQs from easy to hard, with a difficulty filter, instant feedback and explanation, a score, a review list, and retry (all, or only the ones you got wrong).
  5. **Notes**:
     - revision notes, and ☆ to save a point;
     - personal notes that save automatically;
     - download and print;
     - an upload link;
     - Previous / **Mark complete** / Next.
- **Course sidebar**:
  - Units I–IV and Additional Topics, each expandable;
  - a status dot for every topic;
  - Study Notes and My Learning Progress;
  - collapses to icons on desktop and becomes a drawer on phones.
- **My Learning Progress** (`#/progress`): per-unit tables, quiz bests, modules explored, and reset.

Syllabus topics are tagged **Unit N · Syllabus**. The original lessons are tagged **Additional** wherever they appear.

### Visualization Studio (`visualizer.html`)

- All 103 modules, filterable by text and type.
- A "Core labs" list covering:
  - data transmission, topologies, OSI and encapsulation;
  - packet formation, TCP/UDP and the handshake;
  - DNS, DHCP, routing and switching;
  - digital encoding, AM/FM/PM, and FSK/BPSK/QPSK/QAM;
  - FDM/TDM, optical fibre, media comparison, and error detection with noise.
- `visualizer.html#<module-id>` opens a module directly. Each module page links back to the lessons that use it.
- The **Packet Formation Lab** (`s-packet`):
  - builds a real Ethernet + IPv4 + TCP/UDP frame from your values;
  - the field table and hex dump are linked;
  - the IPv4 and TCP/UDP checksums and CRC-32 FCS are computed, and the IP checksum is verified;
  - it has a 9-step encapsulation → decapsulation view;
  - it is labelled *simulated, not captured traffic*.

### Exams (`quiz.html`)

- Unit tests for Units I–IV, a full syllabus test, a mixed challenge, Additional level tests, and every topic quiz.
- Old links such as `quiz.html#dns` still work.

### Practice (`exercises.html`)

The original eight generated exercises, unchanged.

### Study Notes (`notes.html`)

| Tab | Contents |
|---|---|
| College syllabus notes | definition, key points, comparison and summary for all 41 syllabus topics; printable |
| Topic notes | notes for the Additional topics, plus the formula and port cheat sheet |
| Uploaded files | **UPLOAD STUDY MATERIAL**: PDF, PPTX, DOCX, TXT or MD, up to 30 MB each |
| Generated notes | **Quick revision** or **Detailed** notes from any upload; edit, save, download and print |
| Personal notes | saved points and your notes from every topic; download all |

**How uploads work:**

- Files are parsed **in the browser** and stored only on this device (IndexedDB):
  - PDF uses pdf.js 3.11.174;
  - DOCX and PPTX use JSZip 3.10.1;
  - both libraries are vendored in `assets/vendor`.
- The upload is checked by extension, size and file signature.
- Unreadable files get a specific error and **no notes are invented**. This covers:
  - fake or renamed files;
  - password-protected PDFs;
  - scanned PDFs with no text layer (there is no OCR);
  - old `.doc`/`.ppt` files.

**About the offline notes generator:**

- It is **extractive**: every bullet is quoted from the file and tagged with its page or slide, e.g. `[p. 14]`.
- It removes repeated headers and footers, then picks out headings, definitions, formulas and key sentences.
- "Likely questions" are built only from the document's own headings and definitions.
- Word page numbers come from the page breaks Word saves, so they are approximate. This is stated on the notes.

### Study Assistant (every page, bottom-right)

- Chat window with history, minimize, close and clear.
- Shows which topic and step you are on, and uses it as context.

| Mode | With AI configured | Offline mode (no AI) |
|---|---|---|
| Ask a doubt | Claude answers using the current topic, plus matching passages from your uploads (cited) | Searches the lessons and your uploads and quotes the matching passages with links |
| My materials | Answers **only** from your uploaded files, citing file and page; says so when the answer is not there | Quotes the best-matching passages with file and page |
| Find a simulation | Claude picks from the site's **existing** modules and suggests what to try (it cannot invent new ones) | Keyword search over the modules |
| Make notes | Claude writes revision notes for a topic | Compiles notes from the lesson |
| Practice | Five adaptive questions, one at a time (difficulty goes up after a right answer and down after a wrong one), then a report with topics to revise. Questions come from the question bank. With AI, "Explain this more" is available after a wrong answer | Same, without "Explain this more" |

The header always shows **AI connected** or **Offline mode**, with the reason. Offline answers are labelled *not AI-generated*.

### Progress and storage

- Everything is kept in `localStorage` under `netlearn:*`.
- The v1 keys (`completed`, `quiz`, `exercises`, `viz`) are unchanged, so earlier progress carries over.
- New keys: `steps`, `recent`, `saved`, `mynotes`, and `ui:*`.
- Uploaded files are kept in IndexedDB (`netlearn-docs`).
- **Reset progress** clears learning progress only. Notes, saved points and uploads are kept.

---

## 3. Architecture

```
index.html          home (assets/js/home.js)
learn.html          dashboard / unit / topic workflow / progress (learn.js)
visualizer.html     Visualization Studio (studio.js)
quiz.html           Exams (exams.js)
exercises.html      Practice (exercises.js)
notes.html          Study Notes (notes-app.js, doc-parser.js, notes-generator.js)
tutorials.html      redirect: tutorials.html#id → learn.html#/topic/id/theory
server.mjs          static server + AI API (Node, @anthropic-ai/sdk)
api/ai/status       static stub so plain static hosting reports "no backend" cleanly

assets/js/
  app.js            shell, icons, units/steps model, Progress (localStorage), course sidebar, search
  topics-*.js       24 Additional lessons (original content, unchanged)
  syllabus-u1..u4   41 syllabus topics (structured fields) + their quiz questions
  quiz-data.js      original 96 questions (+ difficulty tags)
  quiz-engine.js    reusable MCQ runner (lesson quiz step + Exams)
  sim-logic.js      pure, tested maths: modulation, constellations, media loss, fibre,
                    satellite orbits, delays, codes (ASCII/EBCDIC/BCD/Gray/UTF-8), parity,
                    CRC, Internet checksum, CRC-32, packet builder, subnetting, TDM/FDM, T1, WDM
  viz-core.js       VizKit: drawing kit + engines (timeline, flow, waves, controls) + registry
  viz-network.js    original 12 simulations, ported to the registry
  viz-u1..u4.js     Unit I–IV visualizations and simulations
  viz-extra.js      networking modules + Visualize/Simulate mapping for Additional topics
  doc-store.js      IndexedDB store + passage search (BM25-style) with page references
  doc-parser.js     PDF / PPTX / DOCX / TXT / MD text extraction with validation
  notes-generator.js extractive notes with page references
  assistant.js      floating assistant (NetAI client + offline modes)
assets/vendor/      pdf.js 3.11.174, JSZip 3.10.1 (with licences)
docs/TOPIC-MAPPING.md  syllabus → topic → visualization/simulation map, slide-accuracy notes
tests/              sim-logic unit tests, harness.html (mounts/exercises any module)
```

**Adding content:**

- **A topic**: push an object into `window.TOPICS` with `unit`, the theory fields, `viz: {id, params, intro}`, `sim: {id, params, tasks}` and `quiz`. See `syllabus-u1.js`. It then appears automatically in the sidebar, dashboard, search, notes, exams and progress.
- **A visualization or simulation**: call `VizKit.register(id, {kind, category, title, desc, run})` and build it with one of the engines.
- **Module tests**: `tests/harness.html#<id>` mounts any module, and `testModule(id)` in its console drives every control.

---

## 4. AI / API configuration

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `AI_PROVIDER` | no | `auto` | `auto` uses Claude if a valid key is set, otherwise free Ollama. `ollama` or `claude` forces one |
| `OLLAMA_MODEL` | no | `llama3.2` | Any model you have pulled (e.g. `qwen2.5:7b` for better answers on a 6 GB+ GPU) |
| `OLLAMA_URL` | no | `http://127.0.0.1:11434` | Where Ollama listens |
| `ANTHROPIC_API_KEY` | no (paid) | — | Claude API key. Read **only** by `server.mjs`. Placeholder or malformed keys are detected and ignored |
| `NETLAB_MODEL` | no | `claude-opus-5-5` | Claude model id |
| `PORT` | no | `5050` | Server port |
| `HOST` | no | `127.0.0.1` | Bind address (use `0.0.0.0` to expose on a network) |

Put these in `.env`. It is in `.gitignore`, and the server refuses to serve `.env*`, `server.mjs`, `package*.json` and `node_modules`.

**Endpoints:**

- `GET /api/ai/status` returns `{configured, provider: "ollama"|"claude"|null, free, model, setupHint}`. It re-checks Ollama every few seconds, so installing Ollama needs no server restart.
- `POST /api/ai/chat` takes `{mode: ask|materials|sim, messages, context, materials?, catalog?}`.
- `POST /api/ai/notes` takes `{kind: quick|detailed, title, source: [{label, page, text}]}`. It streams internally for long notes.

**Security:**

- The API key never reaches the browser.
- Request bodies are limited to 400 KB.
- AI calls are limited to 20 per minute per IP.
- Input is validated.
- Uploaded text is passed to the model as reference material, not as instructions.
- Refusals and API errors (bad key, unknown model, rate limit, network) come back as clear messages.

**Local model limits:** a small local model reads less text at once, so for long files **AI notes** cover the first part of the file (about 24,000 characters) and say so on the notes; the offline Quick/Detailed generator always covers the whole file.

**Browser data:** files are parsed and stored only in the browser. With Ollama, nothing leaves your computer. With Claude, the text of a file is sent to the Claude API **only** when you press **AI notes**, or ask in *My materials* / *Ask a doubt* while AI is connected. In those cases only the matching passages are sent.
