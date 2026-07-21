# ☁️ Cloudflare Edge Worker Deployment Guide

For websites locked down by CMS templates or hosted on isolated store sub-domains (e.g., `shop.yourdomain.com`), custom files like `/llms.txt` and `/ai-context.md` cannot easily be uploaded to the root directory. 

To bypass this limitation, you can deploy a lightweight Cloudflare Edge Worker to intercept inbound AI crawler traffic and proxy the files seamlessly.

---

## 🛠️ Step-by-Step Deployment Instructions

### Step 1: Initialize Cloudflare Worker
1. Log in to your **Cloudflare Dashboard**.
2. Navigate to **Workers & Pages** in the left-hand sidebar menu.
3. Click the **Create Application** button, then select **Create Worker**.
4. Set a name for your worker (e.g., `aeo-file-proxy`) and click **Deploy**.

### Step 2: Paste the Proxy Code
1. Click **Edit Code** to open the Cloudflare Edge Quick Editor.
2. Replace all placeholder code in the workspace editor with the custom script generated in your **AI Optimize** workspace:
   ```javascript
   // Paste the generated Cloudflare Worker Script here
   ```
3. Click the **Save and Deploy** button.

### Step 3: Map the Custom Worker Routes
To intercept `/llms.txt` and `/ai-context.md` traffic on your root domain, you must map the worker to specific URL paths:
1. Navigate back to your target **Web Domain settings panel** in Cloudflare.
2. Select **Websites** -> Choose your Domain -> **Workers Routes**.
3. Click **Add Route** and insert the following mapping criteria:
   * **Route 1**: `yourdomain.com/llms.txt`
   * **Route 2**: `yourdomain.com/ai-context.md`
4. Assign both routes to your newly deployed worker (`aeo-file-proxy`).
5. Set the **Request Limit Mode** to Active/Bypass.
6. Click **Save**.

### Step 4: Verify the Proxy Connection
1. Open your browser and navigate to `https://yourdomain.com/llms.txt`.
2. Verify that the raw markdown text is displayed cleanly with no styling or theme layouts.
3. Run a new scan in the **AI Visualize** dashboard to verify the status indicator changes to **🟢 PASS**.
