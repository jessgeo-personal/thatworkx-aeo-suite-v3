# ==========================================
# Official Crawl Directives (RFC 9309)
# ==========================================

# Explicitly Authorize AI Search and Retrieval Bots
User-agent: OAI-SearchBot
User-agent: PerplexityBot
User-agent: Claude-SearchBot
Allow: /
Allow: /ai-context.md
Allow: /llms.txt

# Explicitly Manage Training Scrapers
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: Applebot-Extended
Allow: /ai-context.md
Allow: /llms.txt
Disallow: /dashboard/

# Map Critical Machine-Readable Discoverability Manifests
Sitemap: https://yourdomain.com/sitemap.xml
X-Llms-Txt: https://yourdomain.com/llms.txt