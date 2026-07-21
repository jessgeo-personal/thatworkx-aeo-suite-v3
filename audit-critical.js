/**
 * Standalone Human Audit Script - Thatworkx AEO Suite
 * Run manually via CLI: node audit-critical.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.development') });
const mongoose = require('mongoose');
const axios = require('axios');

// ANSI Color Escape Sequences for CLI Formatting
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/thatworkx-aeo';
const port = process.env.PORT || 5000;
const serverUrl = `http://127.0.0.1:${port}`;

async function runAudit() {
  console.log(`\n${colors.bright}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  🕵️  THATWORKX AEO SUITE: CRITICAL HUMAN AUDIT CLI  ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}====================================================${colors.reset}\n`);

  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoConfig: {
      targetURI: mongoURI,
      status: 'DISCONNECTED',
      collections: {}
    },
    backendApi: {
      endpoint: `${serverUrl}/api/scan`,
      status: 'OFFLINE',
      testScanResponse: null
    }
  };

  // 1. Audit Native MongoDB Connectivity & Collections
  console.log(`${colors.bright}1. Testing Native MongoDB Loopback Connection...${colors.reset}`);
  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
    report.mongoConfig.status = 'CONNECTED 🟢';
    console.log(`   ${colors.green}✔ Connected to ${mongoURI}${colors.reset}`);

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (let col of collections) {
      const count = await db.collection(col.name).countDocuments();
      report.mongoConfig.collections[col.name] = count;
    }
    console.log(`   ${colors.green}✔ Collections audited: ${Object.keys(report.mongoConfig.collections).length} active${colors.reset}`);
  } catch (err) {
    report.mongoConfig.status = `FAILED 🔴 (${err.message})`;
    console.log(`   ${colors.red}✖ Native MongoDB Error: ${err.message}${colors.reset}`);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }

  // 2. Audit Backend Express Server Endpoint
  console.log(`\n${colors.bright}2. Testing Backend API Health & Audit Route...${colors.reset}`);
  try {
    const response = await axios.post(`${serverUrl}/api/scan`, {
      email: 'pm-audit@thatworkx.com',
      targetUrl: 'https://example.com',
      headless: false
    }, { timeout: 4000 });

    report.backendApi.status = 'ONLINE 🟢';
    report.backendApi.testScanResponse = {
      success: response.data.success,
      tier: response.data.stats.tier,
      overallScore: response.data.results.scoreCard.overallScore,
      classification: response.data.results.scoreCard.classification
    };
    console.log(`   ${colors.green}✔ Backend API is responding on ${serverUrl}${colors.reset}`);
  } catch (err) {
    report.backendApi.status = `OFFLINE/WARN 🟡 (${err.message})`;
    console.log(`   ${colors.yellow}⚠ Backend API Notice: ${err.message}${colors.reset}`);
  }

  // 3. Print Raw Color-Coded JSON Payload
  console.log(`\n${colors.bright}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bright}  RAW AUDIT REPORT PAYLOAD (JSON)${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}====================================================${colors.reset}\n`);

  const statusColor = report.mongoConfig.status.includes('CONNECTED') ? colors.green : colors.yellow;
  console.log(statusColor + JSON.stringify(report, null, 2) + colors.reset);

  console.log(`\n${colors.bright}${colors.cyan}Audit sequence finished.${colors.reset}\n`);
}

runAudit();
