# OAuth Setup Guide for Trekka

This guide explains how to configure Google and Apple Sign-in for your Supabase project.

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client IDs**
5. Choose **Web application** as the application type
6. Add your authorized redirect URIs:
   - Development: `https://[your-supabase-project].supabase.co/auth/v1/callback`
   - Production: `https://[your-domain]/auth/v1/callback`

### 2. Configure in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Providers**
3. Find **Google** and click to configure
4. Enable the provider
5. Add your **Client ID** and **Client Secret** from Google Console
6. Save the configuration

## Apple OAuth Setup

### 1. Create Apple Sign-in Configuration

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** and create a new **App ID**
4. Enable **Sign In with Apple** capability
5. Create a **Service ID** for web authentication
6. Configure the Service ID with your redirect URLs:
   - `https://[your-supabase-project].supabase.co/auth/v1/callback`

### 2. Generate Private Key

1. In Apple Developer Portal, go to **Keys**
2. Create a new key and enable **Sign In with Apple**
3. Download the private key file (you can only download it once)
4. Note the **Key ID** and **Team ID**

### 3. Configure in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Providers**
3. Find **Apple** and click to configure
4. Enable the provider
5. Enter your **Service ID** (Bundle ID)
6. Upload your private key file or paste the key content
7. Enter your **Key ID** and **Team ID**
8. Save the configuration

## Environment Variables

Make sure your `.env.local` file includes:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
```

## Testing

### Local Development
- Use `http://localhost:3000` as your redirect URL during development
- Make sure your OAuth providers are configured with the correct callback URLs

### Production
- Update redirect URLs to use your production domain
- Ensure SSL certificates are properly configured

## Additional Notes

### Google OAuth
- Google requires verified domains for production use
- You may need to submit your app for verification if you plan to have many users
- Consider adding scopes for additional permissions (email, profile, etc.)

### Apple OAuth
- Apple Sign-in is required for iOS apps that use other social login methods
- The private key should be kept secure and not committed to version control
- Apple Sign-in works best with a verified domain

### Security Considerations
- Always use HTTPS in production
- Keep your OAuth client secrets secure
- Regularly rotate your keys and secrets
- Monitor your OAuth provider usage and logs

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Double-check your redirect URLs in both the OAuth provider and Supabase
   - Ensure URLs match exactly (including trailing slashes)

2. **"Invalid client"**
   - Verify your client ID and secret are correct
   - Check that the OAuth provider is properly enabled in Supabase

3. **"Unauthorized client"**
   - Ensure your domain is verified with the OAuth provider
   - Check that your OAuth app is approved and not in sandbox mode

For more detailed information, refer to the [Supabase Auth documentation](https://supabase.com/docs/guides/auth/social-login).