# Get.tech Domain Setup for mycrypto.tech

## 🌐 DNS Records for Get.tech Control Panel

### Required DNS Records

Copy and paste these exact values into your Get.tech DNS management:

#### A Records (Root Domain)
```
Type: A
Name: @
Value: 76.76.19.19
TTL: 28800

Type: A
Name: @
Value: 76.76.21.21
TTL: 28800
```

#### CNAME Record (WWW)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 28800
```

### Optional Subdomains
```
Type: CNAME
Name: api
Value: cname.vercel-dns.com
TTL: 28800

Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 28800
```

## 📋 Step-by-Step Setup

### In Get.tech Dashboard:

1. **Login** to your Get.tech account
2. Go to **My Domains** 
3. Click on **mycrypto.tech**
4. Find **DNS Management** or **Manage DNS** section
5. Click **Add Record** or **Add New Record**
6. Add each record above one by one

### Common Get.tech Interface Fields:

- **Record Type**: Select from dropdown (A, CNAME, etc.)
- **Host/Name**: Enter @ for root, www for www, etc.
- **Value/Points to**: Enter the IP or domain value
- **TTL**: Set to 28800 (8 hours) - optimal for production

### In Vercel Dashboard:

1. Go to **Vercel Dashboard**
2. Select your **web3-analytics-platform** project
3. Go to **Settings** > **Domains**
4. Click **Add Domain**
5. Enter `mycrypto.tech` and click **Add**
6. Enter `www.mycrypto.tech` and click **Add**

## ⏰ Propagation Time

- **DNS Changes**: 15 minutes to 48 hours
- **SSL Certificate**: Automatic after domain verification
- **Full Activation**: Usually within 1-2 hours

## ✅ Verification Steps

After setup, wait 30 minutes then check:

```bash
# Check DNS propagation
nslookup mycrypto.tech
nslookup www.mycrypto.tech

# Check if site is live
curl -I https://mycrypto.tech
```

## 🔧 Troubleshooting

### Common Issues:

1. **Domain not resolving**
   - Wait longer (up to 48 hours)
   - Double-check DNS records
   - Clear DNS cache

2. **SSL Certificate issues**
   - Vercel generates SSL automatically
   - Wait 15-30 minutes after DNS propagation

3. **Get.tech specific issues**
   - Make sure you're in the correct domain management section
   - Some Get.tech panels have different layouts

### Get.tech Support:
- Check Get.tech documentation
- Contact Get.tech support if DNS interface is confusing

## 🎯 Final Result

Once complete, these URLs will work:
- https://mycrypto.tech → Your Web3 Analytics Platform
- https://www.mycrypto.tech → Redirects to mycrypto.tech
- https://mycrypto.tech/dashboard → Dashboard page
- https://mycrypto.tech/api/health → API endpoint

---
**Note**: Get.tech domains work exactly like other domains once DNS is configured properly.
