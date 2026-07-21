# 🌐 DIGITALOCEAN STAGING: MASTER ENVIRONMENT VARIABLES MANIFEST

This master list documents all environment variables required by the **Thatworkx AEO Suite** backend when deploying to **DigitalOcean App Platform (Staging)**.

---

## 📋 Comprehensive Environment Variables Table

| Key | Environment Scope | Staging Recommended Value | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | `RUN_AND_BUILD_TIME` | `5000` | Network port for the Express application server. |
| `NODE_ENV` | `RUN_AND_BUILD_TIME` | `staging` | Runtime environment identifier (`development`, `staging`, `production`). |
| `MONGODB_URI` | `RUN_TIME` | `${aeo-db.DATABASE_URL}` | Connection string to DigitalOcean Managed MongoDB database cluster. |
| `AIV_FREE_MAX_SCANS` | `RUN_TIME` | `5` | Maximum daily scan allocation for unauthenticated / Free users. |
| `AIV_PRO_MAX_SCANS` | `RUN_TIME` | `50` | Maximum daily scan allocation for AIVisualize Pro subscribers. |
| `AIV_FREE_MAX_PAGES` | `RUN_TIME` | `3` | Maximum page depth limit for Free tier audits. |
| `AIV_PRO_MAX_PAGES` | `RUN_TIME` | `40` | Maximum page depth limit for Pro tier audits. |
| `AIO_PRO_MAX_HEADLESS` | `RUN_TIME` | `3` | Maximum daily headless browser sweep sessions for AIOptimize Pro. |
| `AIO_ENT_MAX_HEADLESS` | `RUN_TIME` | `10` | Maximum daily headless browser sweep sessions for AIOptimize Enterprise. |
| `SEMRUSH_AFFILIATE_URL` | `RUN_TIME` | `https://www.semrush.com/affiliate-redirect-placeholder` | Target affiliate redirect link for Semrush Generative AI tracking. |

---

## 📄 Raw Copy-Paste ENV Format (For Bulk Import)

```env
PORT=5000
NODE_ENV=staging
MONGODB_URI=${aeo-db.DATABASE_URL}
AIV_FREE_MAX_SCANS=5
AIV_PRO_MAX_SCANS=50
AIV_FREE_MAX_PAGES=3
AIV_PRO_MAX_PAGES=40
AIO_PRO_MAX_HEADLESS=3
AIO_ENT_MAX_HEADLESS=10
SEMRUSH_AFFILIATE_URL=https://www.semrush.com/affiliate-redirect-placeholder
```

---

## 🛠️ DigitalOcean App Platform Integration Steps
1. Navigate to your App in the **DigitalOcean Control Panel**.
2. Go to **App Settings** -> **Components** -> Select `aeo-server`.
3. Scroll down to **Environment Variables**.
4. Click **Edit** and add the key-value pairs listed above.
5. Click **Save** and trigger a manual redeployment.
