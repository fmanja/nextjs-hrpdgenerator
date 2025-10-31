# 🚀 Quick Start Guide

Get the HR Position Description Generator running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- AWS Account
- AWS Bedrock access (Claude 3.5 Sonnet enabled)

## Step 1: Configure AWS Credentials

Edit `.env.local` and add your AWS credentials:

```bash
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
```

**Where to get AWS credentials:**
1. Go to AWS Console → IAM → Users
2. Create a user or select existing user
3. Security credentials → Create access key
4. Copy Access Key ID and Secret Access Key

**Enable Bedrock Model Access:**
1. Go to AWS Console → Bedrock → Model access
2. Click "Edit" → Select "Claude 3.5 Sonnet"
3. Click "Save changes" (approval is usually instant)

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 4: Test the App

1. Enter **Job Title:** "Senior Software Engineer"
2. Enter **Department:** "Engineering"
3. Enter **Experience Level:** "5+ years"
4. Click **Generate Description**
5. Wait 3-5 seconds for Claude to generate
6. ✅ Success!

## Troubleshooting

### "Access denied to Bedrock"
- Verify AWS credentials in `.env.local`
- Check IAM permissions include `bedrock:InvokeModel`
- Ensure Bedrock model access is enabled

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
rm -rf .next
npm run build
```

## Deploy to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for AWS EC2 deployment guide.

Quick deploy to Vercel:
```bash
npm install -g vercel
vercel
# Add AWS credentials as environment variables in Vercel dashboard
```

## Next Steps

✅ You're up and running!

**Recommended:**
1. Review [README.md](./README.md) for full documentation
2. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for EC2 deployment
3. Read [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) for architecture details

---

Need help? Open an issue or check the documentation.
