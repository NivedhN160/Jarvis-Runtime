# Deploying MAT-CHA.AI to Vercel (Frontend) & Render (Backend)

Since you prefer GitHub, this is the **standard way** to deploy fullstack apps:
1. **GitHub**: Holds your code.
2. **Vercel**: Hosts the **Frontend** (connected to GitHub).
3. **Render**: Hosts the **Backend** (connected to GitHub).

---

## Step 1: Push Code to GitHub
You need to get your local changes (including the new DB URL) onto GitHub.

1. Create a new repository on [GitHub](https://github.com/new). Name it `mat-cha-ai`.
2. Do **NOT** initialize with README, .gitignore, etc. (Keep it empty).
3. Open your terminal in VS Code (in the project root) and run these commands one by one:

```powershell
# Initialize git if you haven't (you already have a .git folder, so skip this if done)
# git init

# Add all files
git add .

# Commit changes
git commit -m "Ready for deployment: Added Groq and Atlas DB"

# specific branch (usually main or master)
git branch -M main

# Link to your new GitHub repo (REPLACE WITH YOUR URL!)
git remote add origin https://github.com/YOUR_USERNAME/mat-cha-ai.git

# Push the code
git push -u origin main
```

*(If `git remote add` fails saying "remote origin already exists", run `git remote set-url origin https://github.com/YOUR_USERNAME/mat-cha-ai.git`)*

---

## Step 2: Deploy Frontend on Vercel
1. Go to [Vercel](https://vercel.com/) and sign up with GitHub.
2. Click **Add New** > **Project**.
3. Import your `mat-cha-ai` repository.
4. **Configure Project**:
   - **Framework Preset**: Create React App (should auto-detect).
   - **Root Directory**: Click "Edit" and select `Frontend/apps/frontend`.
   - **Environment Variables**: Add one variable:
     - Name: `REACT_APP_BACKEND_URL`
     - Value: `https://mat-cha-backend.onrender.com` (You will get this URL in Step 3. For now, you can leave it blank and redeploy later, OR do Step 3 first).
5. Click **Deploy**.

---

## Step 3: Deploy Backend on Render
1. Go to [Render](https://render.com/) and sign up with GitHub.
2. Click **New +** > **Web Service**.
3. Connect your `mat-cha-ai` repository.
4. **Configure Service**:
   - **Name**: `mat-cha-backend`
   - **Root Directory**: `Frontend/backend`
   - **Environment**: Python 3
   - **Region**: Singapore (or nearest to you)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables** (Scroll down):
   - Add `MONGO_URL`: (Copy from your `.env` file)
   - Add `GROQ_API_KEY`: (Copy from your `.env` file)
   - Add `HF_TOKEN`: (Optional, leave blank if using Groq)
6. Click **Create Web Service**.

**Wait for it to deploy.** Once it's live, copy the URL (e.g., `https://mat-cha-backend.onrender.com`) and go back to Vercel (Step 2) to update the `REACT_APP_BACKEND_URL` variable if you haven't already.

---

## Troubleshooting
- **Frontend 404 on Refresh**: I added a `vercel.json` to fix this automatically.
- **Backend Slow**: It might take 50 seconds to sleep on free tier. This is normal.
- **Database Error**: Ensure you whitelisted IP `0.0.0.0/0` in MongoDB Atlas Network Access.
