# Deployment Guide for MAT-CHA.AI

Because this application uses a Python Backend, a Real Database (MongoDB), and AI Models, it cannot be hosted **solely** on GitHub (GitHub Pages only hosts static files like HTML/images).

However, you can deploy it for free using the following services:

## 1. The Database (MongoDB Atlas)
Since you cannot run MongoDB on GitHub, use the free cloud version.
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database).
2. Create a free cluster (M0 Sandbox).
3. Create a user (username/password) and whitelist `0.0.0.0/0` (allow access from anywhere) in Network Access.
4. Install the required driver in your backend:
   ```bash
   python -m pip install "pymongo[srv]"
   ```
5. Get your connection string from "Connect" > "Drivers":
   `mongodb+srv://MAT-CHA:<db_password>@cluster0.hufgf3m.mongodb.net/?appName=Cluster0`
6. You will use this as your `MONGO_URL` in the backend `.env` file (replace `<db_password>` with your actual password).

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

## 3. The Frontend (AWS Amplify)
AWS Amplify is a powerful alternative to Vercel for hosting React apps with tight AWS integration.
1. Sign up/Login to the [AWS Management Console](https://console.aws.amazon.com/amplify).
2. Click **New App** > **Host web app**.
3. Connect your GitHub repo.
4. **App Settings**:
   - **App Name**: `mat-cha-frontend`
   - **Build Settings**: Amplify should auto-detect the build command (`yarn build` or `npm run build`).
   - **Root Directory**: Ensure the build points to `Frontend/apps/frontend`.
5. **Environment Variables**:
   - Add `REACT_APP_BACKEND_URL`: The URL provided by Render (e.g., `https://mat-cha-backend.onrender.com`).
6. **Redirects (Important)**: In the Amplify console, go to **Rewrites and redirects** and add a rule for Single Page Apps (SPA):
   - Source: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
   - Target: `/index.html`
   - Type: `200 (Rewrite)`

## Summary
| Component | Hosting Service | Cost |
|-----------|----------------|------|
| **Frontend** | AWS Amplify / Vercel | Free Tier |
| **Backend** | Render / Railway | Free Tier |
| **Database** | MongoDB Atlas | Free |
| **Code** | GitHub | Free |

## GitHub Codespaces (Alternative)
If you just want to "run" it in the cloud to show someone without setting up production servers, you can use **GitHub Codespaces**.
1. Go to your repo on GitHub.
2. Click `<> Code` -> `Codespaces` -> `Create codespace on main`.
3. This gives you a full VS Code in the browser. You can run the terminals just like you do locally!
