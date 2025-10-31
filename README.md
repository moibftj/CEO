# Talk to My Lawyer (TTML) - MVP Application

A full-stack Next.js application for AI-powered legal letter generation with Supabase backend, Stripe payments, and role-based access control.

## 🏗️ Technology Stack

- **Frontend/Fullstack**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Postgres, Auth, RLS, Edge Functions)
- **Payments**: Stripe
- **AI**: Gemini API (via OpenAI-compatible endpoint)

## 👥 User Roles

1. **Subscriber**: Can generate legal letters and track their status
2. **Employee**: Can view their coupon code and commission metrics
3. **Admin**: Can view all users, letters, and transactions

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Stripe account (test mode)
- Gemini API key

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd ttml-talk-to-my-lawyer
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open `supabase/schema.sql` and run the entire script
4. This will create:
   - All required tables (`profiles`, `letters`, `subscriptions`, `employee_metrics`, `transactions`)
   - Row Level Security (RLS) policies
   - Database triggers for new user creation
   - Helper functions for commission calculation

### 4. Deploy Supabase Edge Functions

Install the Supabase CLI if you haven't already:

```bash
npm install -g supabase
```

Login to Supabase:

```bash
supabase login
```

Link your project:

```bash
supabase link --project-ref your_project_ref
```

Deploy the Edge Functions:

```bash
supabase functions deploy generate-letter
supabase functions deploy calculate-commission
supabase functions deploy handle-stripe-webhook
```

Set the required secrets for Edge Functions:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key
supabase secrets set STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
supabase secrets set NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
```

### 5. Configure Stripe

1. Create products and prices in your Stripe Dashboard:
   - One-time letter: $299 (one-time payment)
   - 4 letters/month: $299/year (subscription)
   - 8 letters/year: $599/year (subscription)

2. Update the `priceId` values in `src/app/subscriber/pricing/page.tsx` with your actual Stripe Price IDs

3. Set up a webhook endpoint in Stripe Dashboard:
   - URL: `https://your-project-ref.supabase.co/functions/v1/handle-stripe-webhook`
   - Events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Creating Admin and Employee Users

By default, all new users are created with the `subscriber` role. To promote users to `admin` or `employee`:

1. Go to your Supabase SQL Editor
2. Run the following query:

```sql
-- Promote to admin
UPDATE app.profiles SET role = 'admin' WHERE id = 'user_uuid_here';

-- Promote to employee (and create metrics entry)
UPDATE app.profiles SET role = 'employee' WHERE id = 'user_uuid_here';
INSERT INTO app.employee_metrics (employee_id, coupon_code) 
VALUES ('user_uuid_here', 'UNIQUE_COUPON_CODE');
```

## 📁 Project Structure

```
ttml-talk-to-my-lawyer/
├── src/
│   ├── app/
│   │   ├── actions/          # Server Actions (Stripe)
│   │   ├── api/              # API Routes (Auth)
│   │   ├── admin/            # Admin dashboard
│   │   ├── employee/         # Employee dashboard
│   │   ├── subscriber/       # Subscriber dashboard & pricing
│   │   ├── login/            # Login page
│   │   ├── register/         # Register page
│   │   ├── unauthorized/     # Unauthorized access page
│   │   └── page.tsx          # Landing page
│   ├── lib/
│   │   ├── supabase/         # Supabase client utilities
│   │   └── auth.ts           # Auth helper functions
│   └── middleware.ts         # Role-based route protection
├── supabase/
│   ├── functions/            # Edge Functions (Deno)
│   │   ├── generate-letter/
│   │   ├── calculate-commission/
│   │   └── handle-stripe-webhook/
│   └── schema.sql            # Database schema and RLS policies
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Enforced at the database level
- **Middleware Protection**: Role-based route gating
- **Service Role Key**: Only used in Edge Functions, never exposed to client
- **Stripe Webhook Verification**: Ensures webhook authenticity

## 🧪 Testing Checklist

- [ ] User registration and login
- [ ] Role-based access control (try accessing different dashboards)
- [ ] Letter generation (subscriber)
- [ ] Letter status tracking (subscriber)
- [ ] Employee coupon code display
- [ ] Admin dashboard data display
- [ ] Stripe checkout flow
- [ ] Webhook handling (test with Stripe CLI)

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Import the project in Vercel
3. Add all environment variables from `.env.local`
4. Deploy

### Update Environment Variables

After deployment, update:
- `NEXT_PUBLIC_APP_URL` to your production URL
- Stripe webhook URL to point to your production Edge Function

## 📝 Notes

- The Edge Functions use the Gemini API via an OpenAI-compatible endpoint
- Commission calculation is simplified in this MVP (employee linking via coupon needs full implementation)
- PDF generation is not yet implemented (placeholder in schema)
- Email delivery is not yet implemented

## 🐛 Troubleshooting

### Edge Function Errors
- Ensure all secrets are set correctly in Supabase
- Check Edge Function logs in Supabase Dashboard

### Authentication Issues
- Verify Supabase URL and keys are correct
- Check that the database trigger for profile creation is working

### Stripe Issues
- Use Stripe CLI for local webhook testing: `stripe listen --forward-to localhost:54321/functions/v1/handle-stripe-webhook`
- Verify webhook secret matches between Stripe and your environment

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📄 License

This project is for demonstration purposes as part of the MVP Build Canvas.

