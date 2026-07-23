const { CAPABILITY_MATRIX, evaluateAllCapabilities } = require('../../frontend/src/services/capabilityEvaluator.js');

describe('AIVisualize 32-Capability Evaluation Engine (Milestone 2)', () => {
  it('should contain exactly 32 distinct capabilities in the capability matrix', () => {
    expect(CAPABILITY_MATRIX.length).toBe(32);
  });

  it('should categorize capabilities correctly into Sections 1, 2, 3, and 4', () => {
    const sec1 = CAPABILITY_MATRIX.filter(c => c.section === 1);
    const sec2 = CAPABILITY_MATRIX.filter(c => c.section === 2);
    const sec3 = CAPABILITY_MATRIX.filter(c => c.section === 3);
    const sec4 = CAPABILITY_MATRIX.filter(c => c.section === 4);

    expect(sec1.length).toBe(3);  // Gateway & Access Control (3)
    expect(sec2.length).toBe(7);  // Presence & Hygiene (7)
    expect(sec3.length).toBe(10); // Parsing & Readability (10)
    expect(sec4.length).toBe(12); // Machine Manifests & Handshake (12) -> Total: 32
  });

  it('should evaluate default scan data and return 32 capability results with overall and section scores', () => {
    const results = evaluateAllCapabilities({});
    expect(results.totalCapabilities).toBe(32);
    expect(results.capabilities.length).toBe(32);
    expect(typeof results.totalScore).toBe('number');
    expect(results.totalScore).toBeGreaterThanOrEqual(0);
    expect(results.totalScore).toBeLessThanOrEqual(100);

    expect(results.sectionScores).toHaveProperty('section1');
    expect(results.sectionScores).toHaveProperty('section2');
    expect(results.sectionScores).toHaveProperty('section3');
    expect(results.sectionScores).toHaveProperty('section4');
  });

  it('should accurately evaluate CDN firewall block in Section 1', () => {
    const blockedRes = evaluateAllCapabilities({ sec1: { cdnBlocked: true } });
    const cap = blockedRes.capabilities.find(c => c.id === 'cdnFirewallBlocking');
    expect(cap.status).toBe('blocked');
    expect(cap.score).toBe(0);
  });

  it('should accurately evaluate 1:1 FAQ Q&A parity ratio in Section 3', () => {
    const res = evaluateAllCapabilities({ sec3: { faqQuestions: 4, faqAnswers: 4, hasFaqSchema: true } });
    const cap = res.capabilities.find(c => c.id === 'faqSchemaParity');
    expect(cap.status).toBe('pass');
    expect(cap.details).toContain('Parity Ratio: 1:1.0');
  });
});
