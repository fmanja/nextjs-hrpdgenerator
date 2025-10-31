# HR Position Description Generator

An AI-powered tool to generate professional job descriptions using **AWS Bedrock** with **Claude 3.5 Sonnet**. Built with **Next.js 15**, **TypeScript**, and deployed on AWS EC2.

## 🎯 Features

- ✅ Generate professional job descriptions using Claude AI via AWS Bedrock
- ✅ Clean separation of concerns: React components call Next.js API routes
- ✅ TypeScript for type safety
- ✅ Secure environment variable handling (no NEXT_PUBLIC_ exposure)
- ✅ SVG-based UI with step indicators
- ✅ Copy to clipboard functionality
- ✅ Loading states and error handling
- ✅ Ready for EC2 deployment

## 🏗️ Architecture

```
┌─────────────────────┐
│   React Component   │
│   (Client-Side)     │
└──────────┬──────────┘
           │ HTTP Request
           ▼
┌─────────────────────┐
│   Next.js API Route │
│   (Server-Side)     │
└──────────┬──────────┘
           │ AWS SDK
           ▼
┌─────────────────────┐
│    AWS Bedrock      │
│  (Claude 3.5 Sonnet)│
└─────────────────────┘
```

## 📁 Project Structure

```
nextjs-hrpdgenerator/
├── app/
│   ├── api/
│   │   └── generate-description/
│   │       └── route.ts          # API route with Bedrock integration
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Main page
│   └── globals.css               # Global styles
├── components/
│   └── HRPositionDescriptionGenerator.tsx  # Main component
├── lib/
│   └── bedrock.ts                # Bedrock client configuration
├── types/
│   └── index.ts                  # TypeScript interfaces
├── public/                       # Static assets
├── .env.local                    # Environment variables (not committed)
├── .env.example                  # Environment template
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- AWS Account with Bedrock access
- AWS credentials with Bedrock permissions
- Claude model access enabled in your AWS region

### 1. Clone and Install

```bash
cd /Users/frankmanja/NextjsApps/nextjs-hrpdgenerator
npm install
```

### 2. Configure AWS Credentials

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your AWS credentials:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
```

**Security Note:** These variables are **server-side only** and will NOT be exposed to the browser.

### 3. Enable Bedrock Model Access

1. Go to AWS Console → Bedrock → Model access
2. Request access to Claude 3.5 Sonnet
3. Wait for approval (usually instant for Anthropic models)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Test the Application

1. Enter a **Job Title** (e.g., "Senior Software Engineer")
2. Enter a **Department** (e.g., "Engineering")
3. Enter **Experience Level** (e.g., "5+ years")
4. Click **Generate Description**
5. Wait for Claude to generate the job description
6. Copy the result to clipboard if needed

## 🔐 Security Features

### ✅ No Client-Side Exposure of Secrets

- **All AWS credentials** are kept server-side in `.env.local`
- **No NEXT_PUBLIC_** prefix used for sensitive variables
- API routes run on the server and never expose credentials
- `.env.local` is in `.gitignore` to prevent accidental commits

### ✅ API Route Protection

The API route validates:
- Required fields (jobTitle, department, experienceLevel)
- Proper error handling for AWS errors
- Type-safe request/response with TypeScript

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |

## 🌐 Deployment Options

### Option 1: AWS EC2 (Recommended)
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed EC2 deployment instructions.

### Option 2: Vercel
Vercel deployment requires AWS credentials as environment variables in Vercel settings.

### Option 3: Docker
```bash
docker build -t hr-generator .
docker run -p 3000:3000 --env-file .env.local hr-generator
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **AI Provider:** AWS Bedrock (Claude 3.5 Sonnet)
- **Styling:** CSS + Inline Styles
- **Deployment:** AWS EC2 (or Vercel/Docker)

## 📊 AWS Bedrock Models

You can use different Claude models by changing `BEDROCK_MODEL_ID`:

| Model ID | Description | Cost |
|----------|-------------|------|
| `anthropic.claude-3-5-sonnet-20241022-v2:0` | Latest & most capable (Recommended) | $$$ |
| `anthropic.claude-3-5-sonnet-20240620-v1:0` | Previous version | $$$ |
| `anthropic.claude-3-sonnet-20240229-v1:0` | Balanced performance | $$ |
| `anthropic.claude-3-haiku-20240307-v1:0` | Fast & economical | $ |

## 🐛 Troubleshooting

### Error: "Access denied to Bedrock"
- Check your AWS credentials in `.env.local`
- Verify IAM permissions include `bedrock:InvokeModel`
- Ensure model access is enabled in Bedrock console

### Error: "Model not found"
- Check `BEDROCK_MODEL_ID` in `.env.local`
- Verify the model is available in your AWS region
- Request model access in Bedrock console

### Build errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## 📝 Migration from React

This project was migrated from a React app using:
- **OpenAI GPT-3.5** → **AWS Bedrock Claude 3.5**
- **Express.js server** → **Next.js API Routes**
- **JavaScript** → **TypeScript**
- **CRA** → **Next.js 15**

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- AWS Bedrock for Claude AI access
- Anthropic for Claude 3.5 Sonnet
- Next.js team for the amazing framework

---

**Built with ❤️ using Next.js, TypeScript, and AWS Bedrock**
