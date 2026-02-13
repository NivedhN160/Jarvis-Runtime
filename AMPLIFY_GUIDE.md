# Deploying MAT-CHA.AI to AWS Amplify (Frontend) & Render (Backend)

This guide explains how to host your full-stack application using AWS Amplify for the Frontend and Render for the Backend.

---

## Step 1: Push Code to GitHub
Ensure your local changes (including API keys in your local `.env` and database configuration) are pushed to GitHub.

```powershell
# Add all files
git add .

# Commit changes
git commit -m "Ready for deployment: Configured for AWS Amplify"

# Push the code
git push origin main
```

---

## Step 2: Deploy Frontend on AWS Amplify
1. Log in to the [AWS Management Console](https://console.aws.amazon.com/amplify).
2. Click **New App** > **Host web app**.
3. Choose **GitHub** and authorize AWS to access your repositories.
4. Select your `mat-cha-ai` repository and the `main` branch.
5. **App Settings**:
   - **App Name**: `mat-cha-frontend`
   - **Root Directory**: `Frontend/apps/frontend`
6. **Build Settings**: Amplify should auto-detect your project. Click **Edit** on the build spec if you need to manually set the base directory to `build`.
   ```yaml
   version: 1
   applications:
     - frontend:
         phases:
           preBuild:
             commands:
               - npm install
           build:
             commands:
               - npm run build
         artifacts:
           baseDirectory: build
           files:
             - '**/*'
         cache:
           paths:
             - node_modules/**/*
   ```
7. **Environment Variables**:
   - Add `REACT_APP_BACKEND_URL`
   - Value: `https://mat-cha-backend.onrender.com` (Your Render URL)
8. **Save and Deploy**.

### ⚠️ IMPORTANT: SPA Redirects
React apps use client-side routing. If you refresh the page on a sub-route (like `/dashboard`), AWS will return a 404.
1. In the Amplify console, select your app.
2. Go to **Rewrites and redirects** in the sidebar.
3. Click **Edit** and add the following rule:
   - **Source address**: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
   - **Target address**: `/index.html`
   - **Type**: `200 (Rewrite)`

---

## Step 3: Deploy Backend on Render
1. Go to [Render](https://render.com/) and sign up with GitHub.
2. Click **New +** > **Web Service**.
3. Connect your repository.
4. **Configuration**:
   - **Name**: `mat-cha-backend`
   - **Root Directory**: `Frontend/backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**:
   - Add `MONGO_URL`: `mongodb+srv://MAT-CHA:<db_password>@cluster0.hufgf3m.mongodb.net/?appName=Cluster0`
   - Add `GROQ_API_KEY`: (Your Groq API key)
6. Click **Create Web Service**.

---

## Step 4: Database Setup (MongoDB Atlas)
1. In MongoDB Atlas, go to "Network Access" and whitelist `0.0.0.0/0`.
2. Go to "Database User" and ensure user `MAT-CHA` has "Read and Write" access.
3. Install the driver locally if testing: `python -m pip install "pymongo[srv]"`

---

## Troubleshooting
- **Backend CORS Error**: Ensure you update the `CORS_ORIGINS` in your Render environment variables to include your new AWS Amplify URL (e.g., `https://main.dxxxxx.amplifyapp.com`).
- **Build Fails**: Check the "Build" logs in the Amplify console. Ensure the "Root Directory" is set correctly to `Frontend/apps/frontend`.
