# Domu TAM Command Center

An AI-powered operations tool for Domu Technical Account Managers. Built with Next.js + Claude API.

## Features

- **Script Builder** — Convert raw client scripts into structured voice agent prompts
- **QA Reviewer** — Analyze flagged call transcripts and categorize issues
- **Prompt Fixer** — Diagnose performance issues and generate updated prompts
- **Eng Ticket Generator** — Turn client requests into developer-ready tickets
- **Compliance Investigator** — Review flagged calls and draft client responses
- **Performance Dashboard** — Summarize weekly call data across all clients

## Deploy to Vercel (5 minutes)

### 1. Upload files to GitHub
Upload all files in this folder to your GitHub repo, preserving the folder structure.

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Select your repository
4. Framework will auto-detect as **Next.js**

### 3. Add your API key
Before clicking Deploy, scroll to **Environment Variables** and add:
- Name: `ANTHROPIC_API_KEY`
- Value: your key from [console.anthropic.com](https://console.anthropic.com)

### 4. Deploy
Click **Deploy** — your app will be live at `your-repo-name.vercel.app` in ~60 seconds.

## Local Development

```bash
npm install
echo "ANTHROPIC_API_KEY=your_key_here" > .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
