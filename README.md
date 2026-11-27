# NetLab — Data Communication

An interactive learning platform for the undergraduate **Data Communication** course (S.Y. B.Tech IT). It covers exactly the four course units (the Unit I–IV slide PDFs) in detail. Every topic follows the same five-step path:

**Theory → Visualize → Simulate → Quiz → Notes**

| Content | Count |
|---|---|
| Topics (Units I–IV, from the course PDFs) | 41 |
| Visualizations and simulations | 77 |
| Quiz questions (each tagged easy / medium / hard) | 246 |
| Practice exercises (Units I–IV) | 9 |
| Badges | 10 |

The site is plain HTML, CSS and JavaScript with no build step, no database and no backend. It runs on any static host.

---

## 1. Running the site

- **Live:** https://vibhakute.github.io/Netlab/ (GitHub Pages, deployed from `main`).
- **Locally:** `npm start` → http://localhost:5050 (Node.js 20.12+, no packages to install), or any static server such as `python -m http.server 8080`.
- **Tests:** `npm test` runs the unit tests for the simulation maths (`assets/js/sim-logic.js`). `tests/harness.html#<module-id>` mounts any visualization; `testModule(id)` in its console drives every control.

---

## 2. Features

### Home (`index.html`)

- Full-screen animated network: computers, servers, switches and routers, with packets moving between them.
- One **START LEARNING** button, which becomes **CONTINUE LEARNING** once you've started.
- Overall progress bar and recently studied topics.

### Learn (`learn.html`)

- **Dashboard** (`#/`): overall progress, a continue button, recent topics, each unit's progress, and the **course overview** (objectives, outcomes and the MSE / ESE / IA assessment scheme from the slides).
- **Unit page** (`#/unit/u1` … `#/unit/u4`):
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
  - Units I–IV, each expandable;
  - a status dot for every topic;
  - Study Notes and My Learning Progress;
  - collapses to icons on desktop and becomes a drawer on phones.
- **My Learning Progress** (`#/progress`): per-unit tables, quiz bests, modules explored, and reset.

Every topic is tagged **Unit N · Syllabus** and lists its slide source.

### Visualization Studio (`visualizer.html`)

- All 77 modules, grouped by unit and filterable by text and type.
- A "Core labs" list with the key simulations of each unit:
  - Unit I: data transmission, simplex/half/full-duplex, serial vs parallel, modem modulation;
  - Unit II: twisted-pair noise, optical fibre, wireless path loss, choosing a medium;
  - Unit III: ASCII and EBCDIC encoders, crosstalk, transients;
  - Unit IV: AM/FM/PM, ASK/FSK/PSK/QAM, FDM and TDM, the T1 carrier.
- `visualizer.html#<module-id>` opens a module directly. Each module page links back to the lessons that use it.

### Exams (`quiz.html`)

- Unit tests for Units I–IV, a full syllabus test, a quick mixed challenge, **MSE practice** (Units I–II) and **ESE focus** (Units III–IV), and every topic quiz.

### Practice (`exercises.html`)

Nine generated exercises, all from the units: transmission modes and LAN/MAN/WAN (Unit I); matching transmission media (Unit II); binary conversion, ASCII/EBCDIC encoding and naming line impairments (Unit III); naming modulation and multiplexing techniques and a TDM/T1 frame calculator (Unit IV).

### Study Notes (`notes.html`)

| Tab | Contents |
|---|---|
| College syllabus notes | definition, key points, comparison and summary for all 41 syllabus topics; printable |
| Quick revision sheet | the key facts, values and comparison tables of all four units on one printable page |
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

### Students and saved progress

Several students can use the same browser — for example a shared lab computer — and each one's progress stays separate.

- On the first visit a **Student Sign-In** page (welcome panel, feature highlights and sign-in card) asks for the student's **PRN**, e.g. `1234567890`. A PRN is 3–20 letters or digits (`-` and `_` also allowed), not case-sensitive, with no spaces. Empty or invalid PRNs are rejected with a clear message. No password is used.
- Each student's data is one LocalStorage record, `student_progress_<ID>`, containing: completed lessons, quiz and test scores, solved practice activities, explored visualizations, per-lesson workflow steps (current progress), recently studied lessons, badges, the last visited page, saved points and personal notes. A new ID starts from a fresh record.
- Everything is saved automatically the moment it happens (finishing a step, a quiz, an exercise or a lesson), so refreshing or closing the browser loses nothing.
- Signing in again with the same PRN restores that student's progress.
- **Switch student / Log out** (the PRN button in the header) only clears the signed-in ID (`netlab:currentStudent`); it never deletes anyone's record. The next student then signs in with their own PRN and sees only their own data.
- Uploaded study files (IndexedDB) are tagged with their owner's ID, so students only see their own uploads and generated notes.
- **Badges:** First Steps, Unit I–IV Complete, Quiz Ace (100% in any quiz), Exam Ready (70%+ in all four unit tests), Explorer (20 modules), Practice Champion (all nine exercises) and Course Complete. They are awarded automatically and listed on **My Learning Progress**.
- **Reset progress** on My Learning Progress clears only the signed-in student's learning progress and badges.
- Progress lives in the browser, so it does not move between computers, and clearing the browser's site data removes it.

---

## 3. Architecture

```
index.html          home (assets/js/home.js)
learn.html          dashboard / unit / topic workflow / progress and badges (learn.js)
visualizer.html     Visualization Studio (studio.js)
quiz.html           Exams (exams.js)
exercises.html      Practice (exercises.js)
notes.html          Study Notes (notes-app.js, doc-store.js, doc-parser.js, notes-generator.js)
tutorials.html      redirect for old lesson links
local-server.mjs    optional local static server (npm start); ignored by Vercel

assets/js/
  app.js            shell, icons, Student (per-ID LocalStorage records, sign-in, switching),
                    Store, Progress, badges, units/steps model, course sidebar, search
  syllabus-u1..u4   41 topics (structured fields) + their quiz questions
  quiz-engine.js    reusable MCQ runner (lesson quiz step + Exams)
  sim-logic.js      pure, tested maths: modulation, media loss, fibre, satellite orbits,
                    delays, codes (ASCII/EBCDIC/BCD/Gray/UTF-8), TDM/FDM, T1, WDM
  viz-core.js       VizKit: drawing kit + engines (timeline, flow, waves, controls) + registry
  viz-network.js    the Data Transmission simulation (Unit I)
  viz-u1..u4.js     Unit I–IV visualizations and simulations
  doc-store.js      per-student IndexedDB store for uploads + passage search
  doc-parser.js     PDF / PPTX / DOCX / TXT / MD text extraction with validation
  notes-generator.js extractive notes with page references
assets/vendor/      pdf.js 3.11.174, JSZip 3.10.1 (with licences)
docs/TOPIC-MAPPING.md  syllabus → topic → visualization/simulation map, slide-accuracy notes
tests/              sim-logic unit tests, harness.html (mounts/exercises any module)
```

**Adding content:**

- **A topic**: push an object into `window.TOPICS` with `unit`, the theory fields, `viz: {id, params, intro}`, `sim: {id, params, tasks}` and `quiz`. See `syllabus-u1.js`. It then appears automatically in the sidebar, dashboard, search, notes, exams and progress.
- **A visualization or simulation**: call `VizKit.register(id, {kind, category, title, desc, run})` and build it with one of the engines.
- **Module tests**: `tests/harness.html#<id>` mounts any module, and `testModule(id)` in its console drives every control.

---
