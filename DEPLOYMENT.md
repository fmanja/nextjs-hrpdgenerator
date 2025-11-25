# AWS EC2 Deployment Guide

Complete guide to deploy the HR Position Description Generator (Federal Government Job Description Generator) on AWS EC2.

## 📋 Prerequisites

- AWS Account with Bedrock access
- AWS CLI installed and configured
- SSH key pair for EC2 access
- Domain name (optional, for custom domain)
- Node.js 18+ (will be installed on EC2)
- Claude model access enabled in your AWS region
- All dependencies including Zod (for form validation)

## 👤 Setting up a Deployment User Account

For security and operational best practices, create a dedicated IAM user for deployment operations instead of using your root AWS account.

### Create IAM User for Deployment

1. **Navigate to IAM Console:**
   - Go to **AWS Console → IAM → Users → Create User**

2. **Configure User Details:**
   - **User name:** `hr-generator-deploy` (or your preferred name)
   - **Access type:** Select "Programmatic access" (for AWS CLI/API access)
   - Click **Next: Permissions**

3. **Attach Policies:**
   - Select "Attach policies directly"
   - Attach the following policies:
     - `AmazonEC2FullAccess` (or create a custom policy with minimal required permissions)
     - `IAMFullAccess` (for attaching roles to EC2 instances)
     - Custom Bedrock policy (see IAM Access Configuration section below)
   - Click **Next: Tags** (optional)
   - Click **Next: Review**

4. **Review and Create:**
   - Review the configuration
   - Click **Create User**

5. **Save Credentials:**
   - **IMPORTANT:** Download or copy the Access Key ID and Secret Access Key
   - Store these securely (e.g., password manager, AWS Secrets Manager)
   - You won't be able to view the secret key again after this step

6. **Configure AWS CLI:**
   ```bash
   # Configure AWS CLI with the new user credentials
   aws configure
   # Enter:
   # - AWS Access Key ID: [your access key]
   # - AWS Secret Access Key: [your secret key]
   # - Default region: us-east-1 (or your preferred region)
   # - Default output format: json
   
   # Verify the configuration
   aws sts get-caller-identity
   ```

### Best Practices for Deployment User

- **Enable MFA:** Require multi-factor authentication for the deployment user
- **Rotate Credentials:** Regularly rotate access keys (every 90 days recommended)
- **Use IAM Roles:** For EC2 instances, prefer IAM roles over access keys when possible
- **Least Privilege:** Grant only the minimum permissions required for deployment
- **Separate Users:** Use different users for different environments (dev, staging, prod)

## 🔐 IAM Access Configuration

Proper IAM configuration ensures secure access to AWS services while following the principle of least privilege.

### Create Custom IAM Policy for Bedrock Access

Instead of using full access policies, create a custom policy with only the required permissions:

1. **Navigate to IAM Policies:**
   - Go to **AWS Console → IAM → Policies → Create Policy**

2. **Create Policy (JSON):**
   - Click **JSON** tab
   - Paste the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockInvokeModels",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-5-sonnet-*",
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-*",
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-*"
      ]
    },
    {
      "Sid": "BedrockListModels",
      "Effect": "Allow",
      "Action": [
        "bedrock:ListFoundationModels"
      ],
      "Resource": "*"
    }
  ]
}
```

3. **Name and Create:**
   - **Policy name:** `HRGeneratorBedrockAccess`
   - **Description:** "Allows Bedrock model invocation for HR Generator application"
   - Click **Create Policy**

### Create IAM Role for EC2 Instance

For better security, create an IAM role that EC2 instances can assume:

1. **Create IAM Role:**
   - Go to **AWS Console → IAM → Roles → Create Role**
   - **Trusted entity type:** AWS service
   - **Use case:** EC2
   - Click **Next**

2. **Attach Permissions:**
   - Search for and select `HRGeneratorBedrockAccess` (the policy created above)
   - Optionally attach `CloudWatchAgentServerPolicy` for monitoring
   - Click **Next**

3. **Name and Create:**
   - **Role name:** `EC2-HRGenerator-BedrockAccess`
   - **Description:** "IAM role for EC2 instances running HR Generator with Bedrock access"
   - Click **Create Role**

4. **Attach Role to EC2 Instance:**
   - Go to **EC2 → Instances**
   - Select your instance → **Actions → Security → Modify IAM role**
   - Select `EC2-HRGenerator-BedrockAccess`
   - Click **Update IAM role**

### Additional IAM Policies (Optional)

For advanced deployments, you may need additional permissions:

**EC2 Management Policy (for deployment user):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus",
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:RebootInstances",
        "ec2:ModifyInstanceAttribute"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:AssociateIamInstanceProfile",
        "ec2:ReplaceIamInstanceProfileAssociation"
      ],
      "Resource": "*"
    }
  ]
}
```

**VPC Management Policy (if managing VPC resources):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeVpcs",
        "ec2:DescribeSubnets",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeRouteTables",
        "ec2:DescribeInternetGateways"
      ],
      "Resource": "*"
    }
  ]
}
```

### Verify IAM Configuration

```bash
# Test Bedrock access with the deployment user
aws bedrock list-foundation-models --region us-east-1

# Verify IAM role is attached to EC2 instance (from within the instance)
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/

# Test Bedrock invocation (if role is properly configured)
aws bedrock invoke-model \
  --model-id anthropic.claude-3-haiku-20240307-v1:0 \
  --body '{"anthropic_version":"bedrock-2023-05-31","max_tokens":10,"messages":[{"role":"user","content":"test"}]}' \
  --region us-east-1
```

## 🌐 VPC Configuration

A Virtual Private Cloud (VPC) provides network isolation and security for your EC2 instances. While AWS provides a default VPC, creating a custom VPC gives you more control.

### Option A: Use Default VPC (Quick Start)

If you're getting started quickly, AWS provides a default VPC in each region:

1. **Verify Default VPC:**
   - Go to **AWS Console → VPC → Your VPCs**
   - You should see a VPC named "default" with CIDR `172.31.0.0/16`

2. **Use Default VPC for EC2:**
   - When launching EC2 instance, select the default VPC
   - Select a default subnet in your preferred availability zone

**Pros:** Quick setup, no configuration needed  
**Cons:** Less control, shared with other default resources

### Option B: Create Custom VPC (Recommended for Production)

For production deployments, create a dedicated VPC:

1. **Create VPC:**
   - Go to **AWS Console → VPC → Your VPCs → Create VPC**
   - **Name tag:** `hr-generator-vpc`
   - **IPv4 CIDR block:** `10.0.0.0/16` (provides 65,536 IP addresses)
   - **IPv6 CIDR block:** No IPv6 CIDR block (unless needed)
   - **Tenancy:** Default
   - Click **Create VPC**

2. **Create Internet Gateway:**
   - Go to **VPC → Internet Gateways → Create Internet Gateway**
   - **Name tag:** `hr-generator-igw`
   - Click **Create Internet Gateway**
   - Select the gateway → **Actions → Attach to VPC**
   - Select `hr-generator-vpc` → **Attach Internet Gateway**

3. **Create Subnets:**
   
   **Public Subnet (for web-facing instances):**
   - Go to **VPC → Subnets → Create Subnet**
   - **VPC:** Select `hr-generator-vpc`
   - **Subnet name:** `hr-generator-public-subnet-1a`
   - **Availability Zone:** `us-east-1a` (or your preferred AZ)
   - **IPv4 CIDR block:** `10.0.1.0/24`
   - Click **Create Subnet**
   
   **Private Subnet (optional, for enhanced security):**
   - Create another subnet: `hr-generator-private-subnet-1a`
   - **Availability Zone:** `us-east-1a`
   - **IPv4 CIDR block:** `10.0.2.0/24`
   - **Note:** Private subnets require NAT Gateway for outbound internet access

4. **Configure Route Table:**
   - Go to **VPC → Route Tables**
   - Find the route table associated with your VPC
   - **Name:** `hr-generator-public-rt`
   - Click **Edit Routes → Add Route**
   - **Destination:** `0.0.0.0/0`
   - **Target:** Select the Internet Gateway (`hr-generator-igw`)
   - Click **Save Changes**
   - Click **Subnet Associations → Edit Subnet Associations**
   - Select `hr-generator-public-subnet-1a`
   - Click **Save Associations**

5. **Create Security Group:**
   - Go to **EC2 → Security Groups → Create Security Group**
   - **Name:** `hr-generator-sg`
   - **Description:** "Security group for HR Generator EC2 instances"
   - **VPC:** Select `hr-generator-vpc`
   - **Inbound Rules:**
     - SSH (22) from your IP: `0.0.0.0/0` (restrict to your IP for production)
     - HTTP (80) from anywhere: `0.0.0.0/0`
     - HTTPS (443) from anywhere: `0.0.0.0/0`
     - Custom TCP (3000) from anywhere: `0.0.0.0/0` (for testing, remove in production)
   - **Outbound Rules:** Allow all (default)
   - Click **Create Security Group**

### VPC Configuration for EC2 Launch

When launching your EC2 instance:

1. **Network Settings:**
   - **VPC:** Select `hr-generator-vpc` (or default VPC)
   - **Subnet:** Select `hr-generator-public-subnet-1a` (or default subnet)
   - **Auto-assign Public IP:** Enable (for public subnets)
   - **Security Group:** Select `hr-generator-sg` (or create new)

2. **Advanced Network Configuration (Optional):**
   - **Elastic IP:** Allocate and associate for static IP address
   - **Placement Group:** Not needed for single instance
   - **Network Interfaces:** Use default

### VPC Best Practices

- **Multi-AZ Deployment:** Create subnets in multiple availability zones for high availability
- **NAT Gateway:** Use NAT Gateway for private subnets to allow outbound internet access without public IPs
- **Network ACLs:** Use Network ACLs for additional subnet-level security (optional)
- **VPC Flow Logs:** Enable VPC Flow Logs for network monitoring and troubleshooting
- **VPN/PrivateLink:** Consider AWS PrivateLink for secure Bedrock access without internet exposure

### Verify VPC Configuration

```bash
# From AWS CLI, verify VPC configuration
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=hr-generator-vpc"

# List subnets in your VPC
aws ec2 describe-subnets --filters "Name=vpc-id,Values=vpc-xxxxx"

# Check security group rules
aws ec2 describe-security-groups --group-names hr-generator-sg

# Test connectivity from EC2 instance
ping -c 3 8.8.8.8  # Test internet connectivity
```

## 🚀 Step-by-Step Deployment

### 1. Launch EC2 Instance

**Note:** For VPC setup instructions, see the [VPC Configuration](#-vpc-configuration) section above. Ensure you have a VPC, subnet, and security group configured before launching the instance.

#### A. Create EC2 Instance via AWS Console

1. Go to **AWS Console → EC2 → Launch Instance**
2. Configure the instance:
   - **Name:** `hr-generator-prod`
   - **AMI:** Ubuntu Server 22.04 LTS (free tier eligible)
   - **Instance Type:** `t2.micro` (free tier) or `t3.small` (recommended for production)
   - **Key pair:** Select or create a new key pair
   - **Network settings:**
     - **VPC:** Select your VPC (default VPC or `hr-generator-vpc` from VPC Configuration section)
     - **Subnet:** Select a public subnet (e.g., `hr-generator-public-subnet-1a`)
     - **Auto-assign Public IP:** Enable (for public subnets)
     - **Security Group:** Select existing security group (e.g., `hr-generator-sg`) or create new with:
       - Allow SSH (port 22) from your IP
       - Allow HTTP (port 80) from anywhere
       - Allow HTTPS (port 443) from anywhere
       - Allow Custom TCP (port 3000) from anywhere (for testing, remove in production)
   - **Storage:** 20 GB gp3
   - **IAM instance profile:** Select `EC2-HRGenerator-BedrockAccess` (if created in IAM Access Configuration section)
3. Click **Launch Instance**

#### B. Connect to EC2 Instance

```bash
# Download your key pair (e.g., hr-generator-key.pem) and set permissions
chmod 400 ~/path/to/hr-generator-key.pem

# Connect via SSH (replace with your instance public IP)
ssh -i ~/path/to/hr-generator-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 2. Install Node.js and Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x

# Note: Next.js 16 requires Node.js 18.17 or later

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install git -y
```

### 3. Install and Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/hr-generator
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/hr-generator /etc/nginx/sites-enabled/

# Remove default configuration
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 4. Deploy the Application

#### Option A: Deploy from Local (Recommended for initial setup)

**On your local machine:**

```bash
# Build the project locally
cd /path/to/nextjs-hrpdgenerator
npm run build

# Create a deployment package (excluding node_modules and .next cache)
tar -czf hr-generator.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='.env.local' \
  --exclude='.env.example' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  .

# Copy to EC2
scp -i ~/path/to/hr-generator-key.pem \
  hr-generator.tar.gz \
  ubuntu@YOUR_EC2_PUBLIC_IP:~/
```

**On EC2 instance:**

```bash
# Create application directory
mkdir -p ~/hr-generator
cd ~/hr-generator

# Extract the application
tar -xzf ~/hr-generator.tar.gz

# Install all dependencies (including devDependencies for build)
# This includes Zod for form validation
npm ci

# Create .env.local with your AWS credentials
nano .env.local
```

Add your environment variables:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
```

**Note:** If using IAM roles (recommended), you only need `AWS_REGION` and `BEDROCK_MODEL_ID`. See the Security Best Practices section below.

```bash
# Build the application on EC2
# This will compile Next.js, TypeScript, and Tailwind CSS
# Note: Build will succeed even without AWS credentials (lazy initialization)
npm run build

# Verify build was successful
# You should see .next directory created with BUILD_ID file
# Standalone build will be in .next/standalone directory

# Start with PM2
pm2 start npm --name "hr-generator" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup systemd
# Follow the command output instructions (usually requires sudo)
```

#### Option B: Deploy from Git Repository

```bash
# Clone your repository (if using Git)
cd ~
git clone YOUR_REPOSITORY_URL hr-generator
cd hr-generator

# Install all dependencies (including devDependencies for build)
npm ci

# Create .env.local
nano .env.local
# Add your AWS credentials (same as above)

# Build
npm run build

# Start with PM2
pm2 start npm --name "hr-generator" -- start
pm2 save
pm2 startup systemd
```

### 5. Configure AWS Bedrock Permissions

**Note:** For detailed IAM setup instructions, see the [IAM Access Configuration](#-iam-access-configuration) section above.

Ensure your AWS IAM user/role has the following permissions (these are included in the `HRGeneratorBedrockAccess` policy created in the IAM Access Configuration section):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-5-sonnet-*",
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-*",
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:ListFoundationModels"
      ],
      "Resource": "*"
    }
  ]
}
```

**Important:** 
- Request model access in AWS Bedrock Console → Model access
- Select the Claude models you want to use
- Wait for approval (usually instant for Anthropic models)
- If using IAM roles (recommended), ensure the role `EC2-HRGenerator-BedrockAccess` is attached to your EC2 instance

### 6. Configure SSL/HTTPS (Recommended for Production)

#### Install Certbot for Let's Encrypt SSL

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

Certbot will automatically update your Nginx configuration to use HTTPS.

### 7. Configure Firewall

```bash
# Enable UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

## 📊 Monitoring and Management

### PM2 Commands

```bash
# View running processes
pm2 list

# View logs
pm2 logs hr-generator

# Restart application
pm2 restart hr-generator

# Stop application
pm2 stop hr-generator

# Monitor resources
pm2 monit

# View detailed info
pm2 show hr-generator
```

### Application Updates

```bash
# On local machine - build and package
npm run build
tar -czf hr-generator.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  .

# Copy to EC2
scp -i ~/path/to/hr-generator-key.pem \
  hr-generator.tar.gz \
  ubuntu@YOUR_EC2_PUBLIC_IP:~/

# On EC2 - deploy update
cd ~/hr-generator
tar -xzf ~/hr-generator.tar.gz
npm ci
npm run build
pm2 restart hr-generator
```

## 🔒 Security Best Practices

### 1. Secure Environment Variables

```bash
# Set proper permissions on .env.local
chmod 600 ~/hr-generator/.env.local

# Verify .env.local is not tracked in git
cd ~/hr-generator
git check-ignore .env.local || echo "WARNING: .env.local is not in .gitignore"
```

### 2. Use IAM Roles (Recommended)

**Note:** For detailed IAM role setup instructions, see the [IAM Access Configuration](#-iam-access-configuration) section above.

Instead of storing AWS credentials in `.env.local`, attach an IAM role to your EC2 instance. Follow the steps in the IAM Access Configuration section to create the `EC2-HRGenerator-BedrockAccess` role, then:

1. **Attach to EC2:**
   - EC2 → Select instance → Actions → Security → Modify IAM role
   - Select `EC2-HRGenerator-BedrockAccess` (created in IAM Access Configuration section)

2. **Update .env.local (remove AWS credentials):**
   ```env
   AWS_REGION=us-east-1
   BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
   ```

The AWS SDK will automatically use the IAM role credentials from the EC2 instance metadata service.

**Benefits of IAM Roles:**
- No credentials stored in files
- Automatic credential rotation
- More secure than access keys
- Easier to manage permissions

### 3. Enable Auto-Updates

```bash
# Enable automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 4. Set Up Monitoring

```bash
# Install CloudWatch agent (optional)
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
```

## 🐛 Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs hr-generator --lines 100

# Check if port 3000 is in use
sudo netstat -tulpn | grep 3000
# Or use: sudo ss -tulpn | grep 3000

# Check Next.js build output
cd ~/hr-generator
cat .next/BUILD_ID 2>/dev/null || echo "Build not found - run npm run build"

# Restart the application
pm2 restart hr-generator

# Check for TypeScript errors
npm run build

# Verify validation schemas are working
# The build process will validate all Zod schemas compile correctly

# Note: Build will succeed even without AWS credentials
# AWS credentials are validated at runtime (lazy initialization)
# This allows building the app before setting up environment variables
```

### Nginx Errors

```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### AWS Bedrock Connection Issues

```bash
# Test AWS credentials
aws bedrock list-foundation-models --region us-east-1

# Check if IAM role is attached (if using IAM role)
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/

# Test Bedrock model access
aws bedrock get-foundation-model \
  --model-identifier anthropic.claude-3-5-sonnet-20241022-v2:0 \
  --region us-east-1

# Check environment variables
cd ~/hr-generator
cat .env.local | grep -E "AWS_|BEDROCK"

# Verify model is available in your region
aws bedrock list-foundation-models \
  --region us-east-1 \
  --query "modelSummaries[?contains(modelId, 'claude')].modelId" \
  --output table
```

### Out of Memory

```bash
# Add swap space (if instance has low memory)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 💰 Cost Optimization

### Free Tier (12 months)

- **EC2:** 750 hours/month of t2.micro
- **Data Transfer:** 15 GB/month outbound
- **Bedrock:** Pay per use (no free tier)

### Production Recommendations

- **Instance Type:** t3.small or t3.medium
- **Estimated Costs:**
  - EC2 t3.small: ~$15/month
  - EC2 t3.medium: ~$30/month
  - Bedrock (Claude 3.5 Sonnet): 
    - Input: ~$3.00 per 1M input tokens
    - Output: ~$15.00 per 1M output tokens
    - Typical job description: ~2K input + ~1.5K output = ~$0.03 per generation
  - Data Transfer: ~$0.09/GB after 15 GB/month

### Cost-Saving Tips

- Use Claude 3 Haiku for faster/cheaper generations if quality allows
- Monitor Bedrock usage in CloudWatch
- Set up billing alerts in AWS
- Consider Reserved Instances for EC2 if running 24/7

### Auto-Scaling (Optional)

For high-traffic scenarios, consider:
- Application Load Balancer
- Auto Scaling Group
- Multiple EC2 instances
- CloudFront CDN

## 🔄 Backup and Disaster Recovery

### Automated Backups

```bash
# Create backup script
nano ~/backup.sh
```

Add:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups
APP_DIR=~/hr-generator

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz $APP_DIR

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR/app_$DATE.tar.gz s3://your-backup-bucket/

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t | tail -n +8 | xargs rm -f
```

```bash
# Make executable
chmod +x ~/backup.sh

# Schedule with cron (daily at 2 AM)
crontab -e
# Add: 0 2 * * * ~/backup.sh
```

## 📈 Performance Optimization

### Built-in Optimizations

The application includes several production optimizations configured in `next.config.ts`:

- ✅ **Automatic Compression**: Gzip compression is enabled by default
- ✅ **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options, and more are automatically added
- ✅ **Standalone Output**: Optimized standalone build reduces deployment size
- ✅ **Image Optimization**: AVIF and WebP formats for better performance

### Additional Nginx Gzip Compression (Optional)

While Next.js handles compression, you can also enable it in Nginx for additional optimization:

Edit Nginx config:

```bash
sudo nano /etc/nginx/nginx.conf
```

Add inside `http` block:

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### Enable HTTP/2

In your Nginx site config, change:

```nginx
listen 443 ssl http2;
```

## 🎯 Next Steps

1. ✅ Set up domain name and DNS
2. ✅ Configure SSL certificate
3. ✅ Set up monitoring and alerts
4. ✅ Configure automated backups
5. ✅ Enable CloudWatch logging
6. ✅ Set up CI/CD pipeline (GitHub Actions, AWS CodeDeploy)
7. ✅ Test the application with federal government job data
8. ✅ Verify OPM job family and series data is working correctly
9. ✅ Test form validation (Zod) - ensure all fields validate correctly
10. ✅ Set up AWS Bedrock usage monitoring and alerts

## 🚀 Production Features

The application includes several production-ready features:

- **Security Headers**: Automatically configured in `next.config.ts`
  - Strict-Transport-Security (HSTS)
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection
  - Referrer-Policy
  - Permissions-Policy

- **Build Optimizations**:
  - Standalone output mode for efficient deployments
  - Automatic compression
  - Image optimization (AVIF/WebP)
  - Lazy AWS client initialization (build-time safety)

- **Runtime Safety**:
  - Environment variables validated at runtime (not build time)
  - Supports both IAM roles and access keys
  - Graceful error handling

## 📚 Additional Resources

- [Next.js 16 Deployment Documentation](https://nextjs.org/docs/deployment)
- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [AWS Bedrock Model Access](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [OPM Position Classification](https://www.opm.gov/policy-data-oversight/classification-qualifications/classifying-general-schedule-positions/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Need help?** Check the troubleshooting section or open an issue on GitHub.
