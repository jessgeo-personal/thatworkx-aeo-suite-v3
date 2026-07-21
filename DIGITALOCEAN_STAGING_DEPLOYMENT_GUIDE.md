# 🚀 DIGITALOCEAN APP PLATFORM: STAGING DEPLOYMENT & PRODUCTION PRE-FLIGHT GUIDE

**Project**: Thatworkx AEO Suite (v1.6.0-sprint8)  
**Target Environment**: DigitalOcean App Platform / Managed Staging  
**Document Status**: Locked Staging Release Blueprint  

---

## 1. 📋 Environment Variables Checklist (12-Factor Standard)

Ensure the following key-value pairs are configured in the DigitalOcean App Platform Environment Settings:

| Parameter Key | Recommended Value | Purpose / Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `staging` (or `production`) | Defines application environment mode |
| `PORT` | `8080` | Internal container bind port mapped by DO App Platform |
| `MONGO_URI` | `mongodb+srv://<user>:<password>@cluster.mongodb.net/thatworkx-aeo` | Production / Staging Managed MongoDB Connection URI |
| `JWT_SECRET` | `<secure-random-sha256-string>` | Signed Bearer token authentication secret key |
| `RATE_LIMIT_FREE_DAILY` | `5` | Free Tier Daily Crawl Cap |
| `RATE_LIMIT_PRO_DAILY` | `50` | Pro Tier Daily Crawl Cap |
| `HEADLESS_PRO_DAILY` | `3` | On-Demand Puppeteer Headless Sweep Limit for Pro Users |

---

## 2. 🐋 Container Build & App Spec Configuration (`.do/app.yaml`)

The repository includes a ready-to-deploy `.do/app.yaml` manifest:

```yaml
name: thatworkx-aeo-suite
region: nyc
services:
  - name: web
    github:
      branch: dev
      deploy_on_push: true
      repo: jessgeo-personal/thatworkx-aeo-suite-v3
    dockerfile_path: Dockerfile
    http_port: 8080
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: NODE_ENV
        value: staging
      - key: PORT
        value: "8080"
```

---

## 3. 🛠️ Step-by-Step Staging Launch Instructions

### Step 1: Push Local Changes to Remote Repository
```bash
git add .
git commit -m "feat(release): Sprint 8 Citation Attribution & Staging Deployment Package"
git push origin dev
```

### Step 2: Provision DigitalOcean App Component
1. Log into the [DigitalOcean Cloud Console](https://cloud.digitalocean.com/apps).
2. Click **Create App** and select **GitHub** as the source repository.
3. Select repo: `jessgeo-personal/thatworkx-aeo-suite-v3` and branch: `dev`.
4. DigitalOcean automatically detects `Dockerfile` in the root directory.

### Step 3: Inject Production Environment Secrets
1. Navigate to **Environment Variables** tab in the DO App Platform dashboard.
2. Input `MONGO_URI`, `JWT_SECRET`, and `PORT=8080`.
3. Save and trigger initial build pipeline.

### Step 4: Verify Post-Deployment Health & Endpoints
1. Test Health Check Endpoint: `GET https://aeo-staging.ondigitalocean.app/api/auth/me`
2. Test Scan API Endpoint: `POST https://aeo-staging.ondigitalocean.app/api/scan`
3. Execute frontend sanity check at `https://aeo-staging.ondigitalocean.app`

---

## 🛡️ Pre-Flight Verification Pass

- [x] All 14 Vitest unit & integration tests passing (`npm test`)
- [x] Zero-Docker local enforcement retained (`mongodb://127.0.0.1:27017/thatworkx-aeo` for local dev)
- [x] Cloudflare Worker Edge Proxy templates verified
- [x] Semrush Affiliate Referral links active on frontend sidebar & socialize viewports
