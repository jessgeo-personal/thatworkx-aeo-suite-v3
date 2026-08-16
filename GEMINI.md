# AGY SYSTEM GOVERNANCE & ROUTER

## 1. ABSOLUTE CONSTRAINTS
- **Halt on Error:** NO silent fallbacks. If an environment, DB, or Vitest error occurs, HALT and notify the human manager.
- **Zero Production Mocks:** Do not inject placeholder data unless explicitly tagged as a temporary debug stub. 
- **Wait for Human:** Do NOT execute `git commit` until the human manager has verified local tests.
- **Strict Vocabulary Rule:** NEVER use the term "AI-first". Use "AI-Optimized" to describe a human-centric web presence with no technical AI blocks. Use "AI-Ready" to describe a site that has successfully implemented the 4-level machine manifest hierarchy (llms.txt, ai-context.md, etc.).

## 2. Working methodology
- **frontend and backend independence:**  Ensure the backend works completely independently from the frontend, so a simple API call to the backend should return a JSON result that can be visualized in the frontend.  Ensure this is maintained at all times, so the API to the backend can be used with multiple frontends in the future
- **Working with Engineering Manager agent from Gemini AI:**  We are following a human in the middle of 2 agents methodology.  I am running an engineering manager, UIUX manager, AEO consultant agent on Gemini AI.  My planning and changes will be done there, while you in agy CLI will only be executing the code changes appropriately.  We follow the BDD-TTD method, so the first prompt from the engineering manager agent will be pasted by me into AGY which should setup the failing test, confirm it has failed and stop.  Then I will provide the green prompt to go ahead and complete the fixes.  No edits to the core files should be made during the red failing test phase.
- **AI Bots to be covered:**
    # Allow all Top Global, European, and Asian AI engines to cite and index your content
User-agent: OAI-SearchBot
User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: Googlebot
User-agent: Meta-WebIndexer
User-agent: Meta-ExternalAgent
User-agent: Bingbot
User-agent: PerplexityBot
User-agent: Applebot-Extended
User-agent: Amazonbot
User-agent: QwenBot
User-agent: Baidu-Ansur
User-agent: ERNIEBot
User-agent: Bytespider
User-agent: TencentBot
User-agent: Claude-SearchBot
User-agent: ClaudeBot
User-agent: MistralBot
User-agent: CCBot
User-agent: cohere-ai
Allow: /


## 3. TOKEN ECONOMY
Keep responses brief. Generate single-file or two-file payloads (<2,000 chars) to prevent terminal clipping.