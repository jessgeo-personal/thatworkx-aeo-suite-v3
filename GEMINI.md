# AGY SYSTEM GOVERNANCE & ROUTER

## 1. ABSOLUTE CONSTRAINTS
- **Halt on Error:** NO silent fallbacks. If an environment, DB, or Vitest error occurs, HALT and notify the human manager.
- **Zero Production Mocks:** Do not inject placeholder data unless explicitly tagged as a temporary debug stub. 
- **Wait for Human:** Do NOT execute `git commit` until the human manager has verified local tests.
- **Strict Vocabulary Rule:** NEVER use the term "AI-first". Use "AI-Optimized" to describe a human-centric web presence with no technical AI blocks. Use "AI-Ready" to describe a site that has successfully implemented the 4-level machine manifest hierarchy (llms.txt, ai-context.md, etc.).

## 2. Working methodology
- **frontend and backend independence:**  Ensure the backend works completely independently from the frontend, so a simple API call to the backend should return a JSON result that can be visualized in the frontend.  Ensure this is maintained at all times, so the API to the backend can be used with multiple frontends in the future


## 3. TOKEN ECONOMY
Keep responses brief. Generate single-file or two-file payloads (<2,000 chars) to prevent terminal clipping.