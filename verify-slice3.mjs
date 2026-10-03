import ingestion from './backend/services/multiSourceIngestionService.js';

async function main() {
  console.log('\n--- 1. LOCAL DOCUMENT (Valid Markdown) ---');
  console.log(ingestion.ingestLocalDocumentSource({
    filename: 'overview.md',
    content: '# Core Overview\nDeterministic AEO pipeline without synthetic fallbacks.'
  }));

  console.log('\n--- 2. LOCAL DOCUMENT ZERO-FALLBACK (Empty File) ---');
  console.log(ingestion.ingestLocalDocumentSource({ filename: 'empty.md', content: '    ' }));

  console.log('\n--- 3. GITHUB REPO (Valid Ingestion) ---');
  console.log(ingestion.ingestGitHubSource({
    repoString: 'thatworkx/aeo-suite-v3',
    files: [
      { path: 'README.md', content: '# AEO Suite V3' },
      { path: 'package.json', content: JSON.stringify({ name: 'aeo' }) }
    ]
  }));

  console.log('\n--- 4. GITHUB ZERO-FALLBACK (Malformed / Missing Repo) ---');
  console.log(ingestion.ingestGitHubSource({ repoString: 'invalid-repo-format' }));

  console.log('\n--- 5. WEBSITE SOURCE (Trial User -> STATIC_ONLY) ---');
  console.log(await ingestion.ingestWebsiteSource({
    url: 'https://example.com',
    user: { tier: 'TRIAL' },
    requestHeadless: true,
    htmlContent: '<html><head><title>Example</title><meta name="description" content="Test site"></head><body><h1>Welcome</h1><p>Main content text</p></body></html>'
  }));

  console.log('\n--- 6. WEBSITE ZERO-FALLBACK (Unreachable URL) ---');
  console.log(await ingestion.ingestWebsiteSource({
    url: 'https://non-existent-domain-fail-xyz-987.com',
    user: { tier: 'TRIAL' }
  }));
}

main();