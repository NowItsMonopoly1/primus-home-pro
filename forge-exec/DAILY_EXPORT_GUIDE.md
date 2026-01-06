# Daily Export System - Business Continuity Guide

## Overview

The ForgeExec Daily Export System provides **automated, triple-path data delivery** to ensure your operational records are preserved and accessible even if the app or UI experiences downtime.

**Status: ✅ FULLY OPERATIONAL**

## What This System Does

Every night at 11:59 PM, the system automatically:

1. **Generates Export Files**
   - CSV file (machine-readable for accounting/payroll)
   - PDF report (human-readable daily summary)

2. **Delivers via Three Independent Paths**
   - **Local File Storage** - Saved to organized folders by date
   - **Email Delivery** - Sent to office/accounting/owner emails
   - **Cloud Storage** - Uploaded to SharePoint/OneDrive

3. **Creates Audit Trail**
   - Every export is timestamped and logged
   - Metadata preserved for compliance

## Why This Matters for Commercial Electrical Contractors

This system eliminates critical business risks:

| Problem | Solution |
|---------|----------|
| "The app was down" | Exports run independently of app uptime |
| Missed inspection proof | Daily evidence preserved automatically |
| Payroll disputes | Immutable labor records with timestamps |
| GC short-pay disputes | Timestamped proof of work completed |
| Vendor lock-in fear | Guaranteed daily data portability |
| Lost data liability | Triple-redundant delivery paths |

---

## Quick Start

### 1. Test the System (Right Now)

```bash
# Run a test export with sample data
node test-export.js
```

This will create files in `test-exports/2026/2026-01-06/` containing:
- `daily-report-2026-01-06.csv`
- `daily-report-2026-01-06.pdf`
- `metadata.json`

**Check these files to verify the system works.**

### 2. Configure for Production

```bash
# Copy the example configuration
cp .env.example .env

# Edit .env with your settings
# At minimum: Set EMAIL_ENABLED=true and configure SMTP settings
```

**Required Configuration:**
- Local file storage (enabled by default)
- Email delivery (highly recommended)
- Cloud storage (recommended for GC/owner access)

### 3. Start the Automated Scheduler

```bash
# Start the scheduler (runs 11:59 PM daily)
npm run scheduler:start
```

**For Production Deployment:**
- Run as a system service (pm2, systemd, Windows Service)
- Or use system-level cron/Task Scheduler
- See "Deployment Options" section below

---

## Configuration Guide

### Email Configuration

**Gmail Example:**
```env
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Generate at https://myaccount.google.com/apppasswords
SMTP_FROM=noreply@nextlevelelectric.com
SMTP_TO=office@nextlevelelectric.com,accounting@nextlevelelectric.com
```

**Office 365 Example:**
```env
EMAIL_ENABLED=true
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com
SMTP_TO=office@yourdomain.com,accounting@yourdomain.com
```

### Cloud Storage Configuration (SharePoint/OneDrive)

```env
CLOUD_ENABLED=true
CLOUD_TYPE=onedrive
CLOUD_ACCESS_TOKEN=your-microsoft-graph-access-token
CLOUD_FOLDER_PATH=ForgeExec/Exports
```

**To get a Microsoft Graph access token:**
1. Register app in Azure AD: https://portal.azure.com
2. Grant Files.ReadWrite permissions
3. Generate access token
4. See: https://docs.microsoft.com/en-us/graph/auth/

**Folder Structure Created:**
```
ForgeExec/Exports/
  └── 2026/
      └── 2026-01-06/
          ├── daily-report-2026-01-06.csv
          └── daily-report-2026-01-06.pdf
```

---

## Deployment Options

### Option 1: PM2 (Recommended for Linux/Mac)

```bash
# Install PM2 globally
npm install -g pm2

# Start scheduler with PM2
pm2 start scheduler/daily-export-scheduler.js --name "forgeexec-export"

# Save PM2 config
pm2 save

# Set PM2 to auto-start on boot
pm2 startup
```

### Option 2: systemd (Linux)

Create `/etc/systemd/system/forgeexec-export.service`:

```ini
[Unit]
Description=ForgeExec Daily Export Scheduler
After=network.target

[Service]
Type=simple
User=yourusername
WorkingDirectory=/path/to/forge-exec
ExecStart=/usr/bin/node scheduler/daily-export-scheduler.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl enable forgeexec-export
sudo systemctl start forgeexec-export

# Check status
sudo systemctl status forgeexec-export
```

### Option 3: Windows Task Scheduler

1. Open Task Scheduler
2. Create New Task
3. Trigger: Daily at 11:55 PM (5 min before export)
4. Action: Start a program
   - Program: `node.exe`
   - Arguments: `scheduler/daily-export-scheduler.js`
   - Start in: `C:\path\to\forge-exec`
5. Settings: Run whether user is logged on or not

### Option 4: System Cron (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add this line (runs at 11:55 PM)
55 23 * * * cd /path/to/forge-exec && /usr/bin/node scheduler/daily-export-scheduler.js >> /var/log/forgeexec-export.log 2>&1
```

---

## Testing & Verification

### Test Export Now

```bash
# Method 1: Use test script
node test-export.js

# Method 2: Trigger via API (requires API server running)
npm run export:now

# Method 3: Verify configuration
npm run export:verify
```

### Check Export History

```bash
# List all exports
ls -R exports/

# View specific export
cat exports/2026/2026-01-06/daily-report-2026-01-06.csv
```

### Verify Email Delivery

After configuring email settings:

```bash
# Set RUN_ON_STARTUP to test immediately
RUN_ON_STARTUP=true npm run scheduler:start
```

Check your inbox for the daily report email.

---

## Export File Formats

### CSV File Contents

**Columns:**
- Export Date
- Job ID, Customer Name, Customer ID, Customer Phone
- Address, Job Type, Current State
- Assigned Technician, Scheduled Time
- Estimated Duration, Total Labor Hours, Total Material Cost
- Priority, Notes
- Photos Count, Voice Notes Count, Materials Used Count, Change Orders Count

**Use for:**
- Importing into accounting software (QuickBooks, Xero)
- Payroll processing
- Automated billing
- Data analysis

### PDF File Contents

**Sections:**
1. Daily Summary
   - Total Jobs, Active Jobs, Completed Jobs
   - Total Labor Hours, Total Material Cost

2. Job Details (grouped by state)
   - Job ID, Customer, Address
   - Technician, Priority, Labor/Materials
   - Notes and change orders

**Use for:**
- Daily management review
- GC/owner reporting
- Inspector documentation
- Paper backups

---

## Business Continuity Scenarios

### Scenario 1: App/UI is Down

**What happens:**
- Scheduler continues running independently
- Exports are still generated and delivered
- Data is preserved in all three locations

**Recovery:**
- Access local exports: `exports/2026/2026-01-06/`
- Check email inbox for daily reports
- Access cloud storage (SharePoint/OneDrive)

### Scenario 2: Email Delivery Fails

**What happens:**
- Export marks email as failed but continues
- Local file and cloud storage still succeed
- Error is logged for troubleshooting

**Recovery:**
- Access local exports or cloud storage
- Fix email configuration and retry

### Scenario 3: Complete Server Failure

**What happens:**
- Local exports may be unavailable
- Email and cloud storage still have copies
- Data is preserved externally

**Recovery:**
- Download from cloud storage (SharePoint/OneDrive)
- Access email archives
- Rebuild server and restore

### Scenario 4: "What if I need yesterday's data?"

**Solution:**
- All exports are preserved by date
- Navigate to: `exports/2026/2026-01-05/`
- Or search email for "Daily Activity Report - 2026-01-05"
- Or browse cloud storage folder

---

## Contract Language (For GCs and Owners)

Include this in your service agreements:

> **Data Export & Portability**
>
> The ForgeExec system automatically generates and delivers a Daily Activity Export (CSV and PDF) containing job states, labor activity, change orders, and captured field evidence.
>
> - Export runs automatically every 24 hours
> - Files are delivered via email and stored in customer-owned cloud location
> - No user action required
> - Exports remain available regardless of application availability
>
> This ensures uninterrupted access to operational records for compliance, billing, and audit purposes.

---

## FAQ

### Q: What happens if the export runs multiple times in one day?

**A:** Each export is timestamped. Multiple exports on the same day will not overwrite each other - they'll be stored with different timestamps.

### Q: How long are exports retained?

**A:** By default, exports are kept indefinitely. You can implement a retention policy using the cleanup function:

```javascript
import { cleanupOldExports } from './adapters/export/file-storage.js';

// Delete exports older than 365 days
await cleanupOldExports(config.fileStorage, 365);
```

### Q: Can I run an export manually?

**A:** Yes, three ways:
1. `node test-export.js` (test script)
2. `npm run export:now` (via API)
3. `POST http://localhost:3000/api/export/daily` (API endpoint)

### Q: What if I want exports at a different time?

**A:** Edit the `EXPORT_SCHEDULE` environment variable:

```env
# Midnight
EXPORT_SCHEDULE=0 0 * * *

# Noon
EXPORT_SCHEDULE=0 12 * * *

# 11:59 PM (default)
EXPORT_SCHEDULE=59 23 * * *
```

### Q: Does this work with the current in-memory storage?

**A:** Yes! The export system works with the current job storage. When you upgrade to a database later, the export system will automatically work with that too.

### Q: What are the system requirements?

**A:** Minimal:
- Node.js 16+
- ~50MB disk space per year of exports
- SMTP access (for email delivery)
- Microsoft Graph API access (for cloud storage)

---

## Support & Troubleshooting

### Enable Debug Logging

```bash
# Set environment variable
DEBUG=forgeexec:export npm run scheduler:start
```

### Common Issues

**Issue: "SMTP connection failed"**
- Check SMTP credentials in `.env`
- Verify firewall allows port 587/465
- For Gmail: Use App Password, not regular password

**Issue: "Cloud upload failed"**
- Verify Microsoft Graph access token is valid
- Check token has Files.ReadWrite permission
- Ensure folder path doesn't have special characters

**Issue: "Export directory not writable"**
- Check file permissions on `EXPORT_DIR`
- Ensure the directory path exists
- Try absolute path instead of relative

### Health Check

```bash
# Verify all systems operational
curl http://localhost:3000/api/export/verify
```

---

## Next Steps

1. ✅ Test the system with sample data (`node test-export.js`)
2. ✅ Configure production settings in `.env`
3. ✅ Deploy scheduler to run automatically
4. ✅ Add export clause to service contracts
5. ✅ Train office staff on accessing exports
6. ✅ Create GC/owner access to cloud storage folder

---

## Architecture Notes (For Developers)

This system follows ForgeExec's strict architectural principles:

- **Side-effect only adapters** - No business logic in export code
- **Immutable exports** - Generated files are never modified
- **Independent operation** - Runs separately from app/UI
- **Triple-path delivery** - Eliminates single points of failure
- **Event-driven** - Can be triggered by scheduler, API, or manual invocation

**Key Files:**
- `adapters/export/daily-export.js` - Main orchestrator
- `adapters/export/csv-formatter.js` - CSV generation
- `adapters/export/pdf-formatter.js` - PDF generation
- `adapters/export/email-delivery.js` - Email sender
- `adapters/export/cloud-storage.js` - Cloud upload
- `adapters/export/file-storage.js` - Local storage
- `scheduler/daily-export-scheduler.js` - Automated scheduler

---

## License & Support

ForgeExec Daily Export System
Version 1.0.0
© 2026 Next Level Electric

For support or questions, see the main ForgeExec documentation.
