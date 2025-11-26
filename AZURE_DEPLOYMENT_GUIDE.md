# Azure Deployment Guide - MediCare Platform

This guide covers deploying both the **Next.js frontend** and **Django backend** on Azure.

---

## Prerequisites

1. **Azure Account** - Active Azure subscription
2. **Azure CLI** - Install from https://aka.ms/installazurecliwindows
3. **Git** - For version control
4. **Node.js** - v18+ (for Next.js)
5. **Python** - v3.9+ (for Django)

---

## Part 1: Backend Deployment (Django on Azure App Service)

### Step 1: Create Azure Resources

1. **Create a Resource Group**:

```powershell
az group create --name MediCareRG --location eastus
```

2. **Create App Service Plan** (Free tier for testing):

```powershell
az appservice plan create `
  --name MediCareBackendPlan `
  --resource-group MediCareRG `
  --sku F1 `
  --is-linux
```

3. **Create Web App for Backend**:

```powershell
az webapp create `
  --resource-group MediCareRG `
  --plan MediCareBackendPlan `
  --name medicare-backend-api `
  --runtime "PYTHON|3.11"
```

### Step 2: Configure Django for Azure

1. **Update `backend/medical_platform/settings.py`**:

```python
import os
from pathlib import Path

# Add Azure to allowed hosts
ALLOWED_HOSTS = [
    '127.0.0.1',
    'localhost',
    'medicare-backend-api.azurewebsites.net',  # Your Azure domain
    '*'  # For development only, restrict in production
]

# Ensure CORS is properly configured
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://medicare-frontend.azurewebsites.net",  # Your frontend Azure domain
]

# Database configuration (use Azure Database for PostgreSQL or keep SQLite for testing)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Security settings for production
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_SECURITY_POLICY = {}
```

2. **Create `backend/requirements.txt`** (verify it exists):

```
asgiref==3.7.2
Django==4.2.7
django-cors-headers==4.3.1
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
python-decouple==3.8
Pillow==10.4.0
pytz==2023.3
sqlparse==0.4.4
django-filter==23.3
reportlab==4.4.4
joblib>=1.3.0
numpy>=1.24.0
scikit-learn>=1.3.0
pandas>=2.0.0
gunicorn==21.2.0
whitenoise==6.6.0
```

3. **Create `backend/startup.sh`**:

```bash
#!/bin/bash
set -e

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Running migrations..."
python manage.py migrate --noinput

echo "Starting Gunicorn..."
gunicorn medical_platform.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

### Step 3: Deploy Backend to Azure

1. **Create deployment configuration `backend/.deployment`**:

```
[config]
command = bash startup.sh
```

2. **Deploy using Git**:

```powershell
# Navigate to backend directory
cd backend

# Initialize git if not already done
git init

# Add Azure remote
az webapp deployment source config-zip `
  --resource-group MediCareRG `
  --name medicare-backend-api `
  --src "path-to-backend-zip"
```

**OR use Azure DevOps/GitHub Actions** (recommended):

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - "backend/**"

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: "medicare-backend-api"
          package: "backend/"
          publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE_BACKEND }}
```

### Step 4: Configure Environment Variables

1. **In Azure Portal or via CLI**:

```powershell
az webapp config appsettings set `
  --resource-group MediCareRG `
  --name medicare-backend-api `
  --settings `
  DEBUG=False `
  DJANGO_SECRET_KEY="your-secret-key-here" `
  ALLOWED_HOSTS="medicare-backend-api.azurewebsites.net"
```

---

## Part 2: Frontend Deployment (Next.js on Azure App Service)

### Step 1: Build Next.js for Production

1. **Update `next.config.ts`** to ensure proper output:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ensure API calls point to correct backend
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },
};

export default nextConfig;
```

2. **Create `.env.production`**:

```
NEXT_PUBLIC_API_URL=https://medicare-backend-api.azurewebsites.net
```

### Step 2: Create Azure Resources for Frontend

1. **Create App Service Plan** (if not reusing):

```powershell
az appservice plan create `
  --name MediCareFrontendPlan `
  --resource-group MediCareRG `
  --sku F1 `
  --is-linux
```

2. **Create Web App for Frontend**:

```powershell
az webapp create `
  --resource-group MediCareRG `
  --plan MediCareFrontendPlan `
  --name medicare-frontend `
  --runtime "NODE|18-lts"
```

### Step 3: Deploy Frontend

**Option A: Using GitHub Actions** (Recommended)

Create `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - "src/**"
      - "package.json"
      - "next.config.ts"

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js
        run: npm run build

      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: "medicare-frontend"
          package: "."
          publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE_FRONTEND }}
```

**Option B: Manual Deployment**

1. **Build locally**:

```powershell
npm run build
```

2. **Create deployment package**:

```powershell
# Create a .deployment file
echo "[config]" > .deployment
echo "command = npm install --production && npm run start" >> .deployment
```

3. **Deploy using Azure CLI**:

```powershell
az webapp deployment source config-zip `
  --resource-group MediCareRG `
  --name medicare-frontend `
  --src "frontend-package.zip"
```

### Step 4: Configure Node.js App for Next.js

1. **Create `web.config`** (for IIS compatibility):

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <webSocket enabled="false" />
    <rewrite>
      <rules>
        <rule name="NextJs" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <fileExtensions>
          <add fileExtension=".json" allowed="true" />
        </fileExtensions>
      </requestFiltering>
    </security>
  </system.webServer>
</configuration>
```

2. **Add environment variables in Azure Portal**:

```
NEXT_PUBLIC_API_URL = https://medicare-backend-api.azurewebsites.net
NODE_ENV = production
```

---

## Part 3: Optional - Azure Database Setup

### For Production PostgreSQL Database

1. **Create PostgreSQL Database**:

```powershell
az postgres server create `
  --resource-group MediCareRG `
  --name medicare-postgres `
  --location eastus `
  --admin-user dbadmin `
  --admin-password "SecurePassword123!" `
  --sku-name B_Gen5_1 `
  --storage-size 51200
```

2. **Update Django settings.py**:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'medicare_db',
        'USER': 'dbadmin@medicare-postgres',
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': 'medicare-postgres.postgres.database.azure.com',
        'PORT': '5432',
    }
}
```

3. **Create requirements update**:

```
psycopg2-binary==2.9.9
```

---

## Part 4: Monitoring & Troubleshooting

### View Logs

**Backend**:

```powershell
az webapp log tail `
  --resource-group MediCareRG `
  --name medicare-backend-api
```

**Frontend**:

```powershell
az webapp log tail `
  --resource-group MediCareRG `
  --name medicare-frontend
```

### Common Issues

1. **CORS Errors**:

   - Ensure `CORS_ALLOWED_ORIGINS` includes your frontend URL
   - Check browser console for specific origin rejection

2. **Environment Variables Not Loading**:

   - Restart the app: `az webapp restart --resource-group MediCareRG --name medicare-backend-api`

3. **Static Files Not Serving**:

   - Run migrations and collectstatic
   - Ensure `STATIC_ROOT` path is correct

4. **Build Failures**:
   - Check deployment logs in Azure Portal
   - Verify `node_modules` and dependencies

---

## Part 5: Cleanup (if needed)

```powershell
# Delete entire resource group
az group delete --name MediCareRG --yes --no-wait
```

---

## Summary of URLs After Deployment

- **Frontend**: https://medicare-frontend.azurewebsites.net
- **Backend API**: https://medicare-backend-api.azurewebsites.net/api/
- **Admin Panel**: https://medicare-backend-api.azurewebsites.net/admin/

---

## Next Steps

1. ✅ Set up CI/CD pipelines with GitHub Actions
2. ✅ Configure custom domain names
3. ✅ Set up SSL/TLS certificates (automatic with \*.azurewebsites.net)
4. ✅ Configure backup strategies
5. ✅ Set up monitoring and alerts
6. ✅ Implement proper error logging (Application Insights)
