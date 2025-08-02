# MyCrypto.tech Deployment Guide

## 🚀 Vercel Deployment with Custom Domain

This guide explains how to deploy the Web3 Analytics Platform to mycrypto.tech using Vercel.

### Prerequisites

- Vercel account
- mycrypto.tech domain access
- MongoDB Atlas database
- Environment variables configured

### Deployment Steps

#### 1. Connect Repository to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy project
vercel --prod
```

#### 2. Add Custom Domain

1. Go to Vercel Dashboard > Project > Settings > Domains
2. Add `mycrypto.tech` and `www.mycrypto.tech`
3. Configure DNS records as shown below

#### 3. DNS Configuration

Add these records to your domain registrar:

```dns
Type: A
Name: @
Value: 76.76.19.19

Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### 4. Environment Variables

Set these in Vercel Dashboard > Settings > Environment Variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `NEXT_PUBLIC_SITE_URL=https://mycrypto.tech`
- `NODE_ENV=production`

#### 5. Verification

After deployment, verify:

- ✅ https://mycrypto.tech loads correctly
- ✅ https://www.mycrypto.tech redirects properly
- ✅ SSL certificate is active
- ✅ API endpoints work
- ✅ Database connection is established

### Custom Domain Features

- **SSL Certificate**: Automatically provided by Vercel
- **CDN**: Global edge network for fast loading
- **Redirects**: www to non-www (configurable)
- **Headers**: Security headers configured
- **Analytics**: Vercel Web Analytics available

### Troubleshooting

#### Domain Not Working
- Check DNS propagation (can take 24-48 hours)
- Verify DNS records are correct
- Check domain registrar settings

#### SSL Issues
- Wait for automatic certificate generation
- Contact Vercel support if issues persist

#### Performance Optimization
- Enable Vercel Analytics
- Configure ISR (Incremental Static Regeneration)
- Optimize images and assets

### Post-Deployment Checklist

- [ ] Domain resolves correctly
- [ ] SSL certificate is active
- [ ] Environment variables are set
- [ ] Database connection works
- [ ] Authentication system functions
- [ ] API endpoints respond
- [ ] Static assets load properly
- [ ] SEO meta tags are configured

### Support

For deployment issues:
- Check Vercel documentation
- Review deployment logs
- Contact support if needed

---

**Live Site**: https://mycrypto.tech
**Dashboard**: https://mycrypto.tech/dashboard
**API**: https://mycrypto.tech/api
