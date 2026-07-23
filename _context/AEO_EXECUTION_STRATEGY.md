## 🛠️ The Execution Strategy: "Clean Slate with Asset Migration"

To protect our brand identity while ensuring the code remains pristine, you should implement an **Asset Migration** path. Treat the physical brand look (colors, themes, typography tokens) as structural inputs, but build the architectural framework entirely from a zeroed repository directory.

Here is exactly how to sequence this handoff for the different agent pods:

### Step 1: Extract the Legacy Design Tokens (For the Design Agents)

Before initializing the build scripts, have your documentation agent scrape the existing codebase to isolate all brand-specific aesthetic variables. Bundle these variables into a standalone global theme asset file (e.g., `design-tokens.json` or a global theme style manifest). The UI/UX Design Agent maintains and updates this stand-alone global theme asset file containing:

* The exact hex code arrays (monochromatic canvas tones, sharp color accents).
* Typography scaling factors, font family rules, and borders.
* Layout spacing constants and element curvature profiles.

### Step 2: Handoff the Greenfield Blueprint (For the Product Owner & Engineering Agents)

Instruct the Antigravity CLI and engineering agents to scaffold version 2 into a completely empty project workspace. Provide the extracted design token file along with our locked **Master Vision & Mission Manifest**. Give the development framework this explicit constraint command sequence:

```markdown
### AGENTIC COMPILATION DIRECTIVE: ZERO-STATE SCAFFOLDING
1. Initialize a clean repository directory. Do not read from or merge historical project repository code files.
2. Ingest `/theme/design-tokens.json` to extract canonical layout variables, ensuring all brand color identities and attributes map cleanly to the interface styling parameters.
3. Build the core multi-state application from scratch using the strict user tier parameters, daily usage limit tables, and parallel markdown file hierarchy rules specified in the strategic guidelines.

```

### Step 3: Enforce Isolation Routines (For the QA & Regression Agents)

Because the codebase is new, the QA agent does not have to worry about breaking backward-compatible legacy integration failures. They can focus entirely on executing unit testing matrices against our new concrete performance metrics—ensuring that an anonymous user's single-page request bypasses heavy Puppeteer processing, while verified Pro members receive their exact, tailored copy-paste platform export scripts flawlessly.

---

## 🔒 LOCAL DEVELOPMENT ENVIRONMENT BASELINE

* **Database Engine:** Native, bare-metal Windows MongoDB instance. Docker and `docker-compose` dependencies are strictly deprecated and banned from local development environments due to hardware-level virtualization constraints.
* **Loopback Connection URI:** `mongodb://127.0.0.1:27017/thatworkx-aeo`
* **Execution Boundary:** All local backend bootstrap routines, environment templates (`.env.development`), and Thread B unit testing matrices must execute against this native loopback URI string.
* **Cloud Deployment Alignment:** DigitalOcean staging and production server configurations (`.do/app.yaml`) remain separate and untouched.

---

## 🔄 THE GIT VERSION CONTROL LOOP
* **Automatic Feature Commits:** Upon the successful completion of any feature task or BDD Test Gate approval, the pipeline must automatically stage, commit, and push the codebase to the remote repository's `dev` branch.
* **Commit Message Standard:** Use semantic commit tags (e.g., `feat:`, `fix:`, `docs:`, `test:`, `chore:`).

---

## 🛡️ SYSTEM SECURITY & DIRECTORY SANDBOXING GATE

1. **Workspace Isolation:** All agents (Control, Engineering, PO, QA, Docs) are locked strictly within the current working directory path (`D:\MyApps\aeo-audit-tool-v3`).
2. **Absolute Path Block:** The Engineering Agent is strictly forbidden from parsing, reading, writing, or executing commands targeting any path outside this project folder.
3. **Forbidden Commands:**
   * Absolute path referencing targeting `C:\` or parent folders outside the workspace.
   * Any recursive deletion commands targeting wildcards (e.g., `rmdir /s`, `rm -rf *`, `Remove-Item -Recurse *`).
   * Executing system-level Windows configuration changes or registry edits.
4. **Path Traversal Guard:** If any proposed file action or terminal command contains `..` (parent directory navigation), the Control Agent must instantly HALT execution and trigger the Windows alert for Human review.

---

## ⚡ TOKEN CAPACITY & CONTEXT DRAIN GUARD

1. **Context Monitoring:** Continuously monitor token usage across agentic interactions.
2. **Saturation Threshold:** If conversation token saturation crosses 75% of maximum context capacity:
   * Complete the current active sub-task safely.
   * Trigger an automated Git commit to the `dev` branch.
   * Update `AEO_MASTER_PROJECT_PLAN.md` and `AEO_CHANGELOG.md` with current session progress.
   * Print terminal warning: `⚠️ CONTEXT CAPACITY REACHED (75%+). Please issue /exit and launch a fresh session.`

---

## 🔄 AUTOMATED SPRINT DOCUMENTATION LIFECYCLE HOOKS

1. **SPRINT START HOOK**: Before any coding or BDD spec generation begins for a new Sprint, the Control Agent must mandate that the Docs Agent updates `_context/AEO_MASTER_PROJECT_PLAN.md`, setting the active Sprint status badge to `[IN PROGRESS 🟡]`.
2. **SPRINT END HOOK**: Upon passing all BDD integration tests, the Control Agent must mandate that the Docs Agent updates `_context/AEO_MASTER_PROJECT_PLAN.md` setting the active Sprint status badge to `[DONE 🟢]`, appends entry notes to `_context/AEO_CHANGELOG.md`, and updates `_context/AEO_REGRESSION_MATRIX.md` PRIOR TO executing the git commit and push to remote dev.

---

## 🔒 MANDATORY 6-STAGE EXECUTION PIPELINE (NON-NEGOTIABLE)

For EVERY change request (whether a full sprint, a minor UI tweak, or a bug fix), the Control Agent MUST execute the following sequence:

### STAGE 1: PRE-FLIGHT IMPACT ANALYSIS & BDD SPEC
- Generate plain-English BDD test specs (Given/When/Then).
- Print the exact list of files to be modified (Code, Tests, Docs).
- For any frontend/UI task, the UI/UX DESIGN AGENT must review design token alignment and visual hierarchy specs alongside the QA AGENT's BDD test cases BEFORE human approval is requested.
- **MANDATORY HALT**: Print prompt: `> Awaiting Human PM Approval. Type 'APPROVED' to execute or specify changes:` and WAIT for user response before making any edits.

### STAGE 2: CODE IMPLEMENTATION
- Engineering Agent implements requested code changes within workspace boundary.

### STAGE 3: AUTOMATED TESTING PASS
- QA Agent executes Vitest test suite and verifies 100% pass rate.

### STAGE 4: DOCUMENTATION & CHANGELOG SYNC
- Docs Agent MUST update `_context/AEO_CHANGELOG.md` with date, scope, and technical details.
- Docs Agent MUST append test scenarios to `_context/AEO_REGRESSION_MATRIX.md`.
- Docs Agent MUST update `_context/AEO_MASTER_PROJECT_PLAN.md`.

### STAGE 5: AUDIT VERIFICATION
- Verify system integrity using local health checks / audit scripts.

### STAGE 6: GIT COMMIT & REMOTE PUSH
- Execute automated Git commit with semantic commit message and push to remote 'dev' branch.


