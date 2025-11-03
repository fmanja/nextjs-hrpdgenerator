# AWS EC2 Deployment Guide

Complete guide to deploy the HR Position Description Generator on AWS EC2.

## 📋 Prerequisites

- AWS Account
- AWS CLI installed and configured
- SSH key pair for EC2 access
- Domain name (optional, for custom domain)

## 🚀 Step-by-Step Deployment

### 1. Launch EC2 Instance

#### A. Create EC2 Instance via AWS Console

1. Go to **AWS Console → EC2 → Launch Instance**
2. Configure the instance:
   - **Name:** `hr-generator-prod`
   - **AMI:** Ubuntu Server 22.04 LTS (free tier eligible)
   - **Instance Type:** `t2.micro` (free tier) or `t3.small` (recommended for production)
   - **Key pair:** Select or create a new key pair
   - **Network settings:**
     - Allow SSH (port 22) from your IP
     - Allow HTTP (port 80) from anywhere
     - Allow HTTPS (port 443) from anywhere
     - Allow Custom TCP (port 3000) from anywhere (for testing)
   - **Storage:** 20 GB gp3
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
cd /Users/frankmanja/NextjsApps/nextjs-hrpdgenerator
npm run build

# Create a deployment package (excluding node_modules and .next cache)
tar -czf hr-generator.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='.env.local' \
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

# Install production dependencies
npm ci --production

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

```bash
# Build the application on EC2
npm run build

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

# Install dependencies
npm ci --production

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

Ensure your AWS IAM user/role has the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:*"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/*",
        "arn:aws:bedrock:*:*:custom-model/*",
        "arn:aws:bedrock:*:*:provisioned-model/*",
        "arn:aws:bedrock:*:*:agent/*",
        "arn:aws:bedrock:*:*:knowledge-base/*",
        "arn:aws:bedrock:*:*:flow/*",
        "arn:aws:bedrock:*:*:prompt/*",
        "arn:aws:bedrock:*:*:guardrail/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:ListFoundationModels",
        "bedrock:ListCustomModels",
        "bedrock:ListFoundationModelAgreements",
        "bedrock:GetFoundationModel",
        "bedrock:GetCustomModel",
        "bedrock:GetFoundationModelAvailability",
        "bedrock:GetUseCaseForModelAccess",
        "bedrock:ListTagsForResource",
        "bedrock:TagResource",
        "bedrock:UntagResource"
      ],
      "Resource": "*"
    }
  ]
}
```

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
npm ci --production
npm run build
pm2 restart hr-generator
```

## 🔒 Security Best Practices

### 1. Secure Environment Variables

```bash
# Set proper permissions on .env.local
chmod 600 ~/hr-generator/.env.local
```

### 2. Use IAM Roles (Recommended)

Instead of storing AWS credentials in `.env.local`, attach an IAM role to your EC2 instance:

1. **Create IAM Role:**
   - Go to IAM → Roles → Create Role
   - Select "AWS service" → "EC2"
   - Attach policy with Bedrock permissions
   - Name: `EC2-Bedrock-Access`

2. **Attach to EC2:**
   - EC2 → Select instance → Actions → Security → Modify IAM role
   - Select `EC2-Bedrock-Access`

3. **Update .env.local (remove AWS credentials):**
   ```env
   AWS_REGION=us-east-1
   BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
   ```

The AWS SDK will automatically use the IAM role credentials.

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

# Restart the application
pm2 restart hr-generator
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
  - Bedrock (Claude 3.5 Sonnet): ~$0.003/1K input tokens, ~$0.015/1K output tokens
  - Data Transfer: ~$0.09/GB after 15 GB/month

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

### Enable Gzip Compression

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

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Need help?** Check the troubleshooting section or open an issue on GitHub.
