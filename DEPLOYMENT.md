# Deployment Guide for MAT-CHA.AI

Because this application uses a Python Backend, a Real Database (MongoDB), and AI Models, it cannot be hosted **solely** on GitHub (GitHub Pages only hosts static files like HTML/images).

However, you can deploy it for free using the following services:

## 1. The Database (MongoDB Atlas)
Since you cannot run MongoDB on GitHub, use the free cloud version.
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database).
2. Create a free cluster (M0 Sandbox).
3. Create a user (username/password) and whitelist `0.0.0.0/0` (allow access from anywhere) in Network Access.
4. Get your connection string: `mongodb+srv://<user>:<password>@cluster...`
5. You will use this as your `MONGO_URL` in the backend.

## 2. The Backend (Render.com or Railway)
The Python server needs to run 24/7.
1. Push your code to a GitHub repository.
2. Sign up for [Render](https://render.com/).
3. Create a **New Web Service**.
4. Connect your GitHub repo.
5. **Root Directory**: `Frontend/backend`
6. **Build Command**: `pip install -r requirements.txt`
7. **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
8. **Environment Variables**: Add your keys here!
   - `MONGO_URL`: (From Step 1)
   - `HF_TOKEN` or `OPENAI_API_KEY`: (Required for AI)
   - `CORS_ORIGINS`: `https://your-frontend-url.vercel.app` (You'll get this in Step 3)

**⚠️ Important Note on Local AI**: 
The "Local Fallback Model" `distilgpt2` requires RAM and CPU. Free tier servers (like Render's free tier) often crash if you try to load heavy AI models locally. **For cloud deployment, it is highly recommended to provide a valid `HF_TOKEN` or `OPENAI_API_KEY` so the app uses the remote API instead of trying to run `torch` on a small server.**

## 3. The Frontend (Vercel)
Vercel is excellent for React apps.
1. Sign up for [Vercel](https://vercel.com/).
2. "Import Project" from GitHub.
3. Select your repository.
4. **Root Directory**: Edit this to `Frontend/apps/frontend`.
5. **Environment Variables**:
   - `REACT_APP_BACKEND_URL`: The URL provided by Render (e.g., `https://mat-cha-backend.onrender.com`)
6. Deploy!

## Summary
| Component | Hosting Service | Cost |
|-----------|----------------|------|
| **Frontend** | Vercel / Netlify | Free |
| **Backend** | Render / Railway | Free |
| **Database** | MongoDB Atlas | Free |
| **Code** | GitHub | Free |

## GitHub Codespaces (Alternative)
If you just want to "run" it in the cloud to show someone without setting up production servers, you can use **GitHub Codespaces**.
1. Go to your repo on GitHub.
2. Click `<> Code` -> `Codespaces` -> `Create codespace on main`.
3. This gives you a full VS Code in the browser. You can run the terminals just like you do locally!
