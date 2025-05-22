# Aggregate Perpetual Volume Dashboard

A Next.js application for tracking and visualizing trading volume from WooX and Paradex exchanges.

## Features

- Track trading volume from WooX and Paradex exchanges
- Visualize historical volume data with Chart.js
- Store data in Supabase database
- Manage API keys and JWT tokens securely

## Local Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Set up the Supabase database with the following tables:
   - `api_keys`: Store API keys for exchanges
   - `jwt_tokens`: Store JWT tokens for authentication
   - `historical_volume`: Store historical volume data

5. Run the development server:
   ```
   npm run dev
   ```

## Database Schema

### api_keys
- `id`: UUID (primary key)
- `platform`: String (woox, paradex)
- `api_key`: String
- `api_secret`: String
- `created_at`: Timestamp

### jwt_tokens
- `id`: UUID (primary key)
- `platform`: String (paradex)
- `token`: String
- `created_at`: Timestamp

### historical_volume
- `id`: UUID (primary key)
- `platform`: String (woox, paradex)
- `volume_usd`: Float
- `timestamp`: Timestamp

## API Endpoints

- `GET /api/volume`: Get volume data from exchanges
- `POST /api/jwt`: Save JWT token for Paradex

## Technologies Used

- Next.js
- React
- Chart.js
- Supabase
- Axios

## Deployment Guide to Vercel

This guide will walk you through deploying your Next.js application to Vercel and setting up Supabase integration.

### Prerequisites

- A GitHub account with this repository pushed to it
- A Vercel account (you can sign up at [vercel.com](https://vercel.com) using your GitHub account)
- A Supabase account (you can sign up at [supabase.com](https://supabase.com))

### Step 1: Set Up Supabase

1. **Create a Supabase Project**:
   - Log in to your Supabase account
   - Click "New Project"
   - Enter a name for your project (e.g., "aggrperpvol")
   - Set a secure database password
   - Choose a region closest to your users
   - Click "Create new project"

2. **Create Required Tables**:
   - Once your project is created, go to the "Table Editor" in the Supabase dashboard
   - Create the following tables:

   **api_keys table**:
   ```sql
   create table api_keys (
     id uuid default uuid_generate_v4() primary key,
     platform text not null,
     api_key text not null,
     api_secret text not null,
     created_at timestamp with time zone default now()
   );
   ```

   **jwt_tokens table**:
   ```sql
   create table jwt_tokens (
     id uuid default uuid_generate_v4() primary key,
     platform text not null,
     token text not null,
     created_at timestamp with time zone default now()
   );
   ```

   **historical_volume table**:
   ```sql
   create table historical_volume (
     id uuid default uuid_generate_v4() primary key,
     platform text not null,
     volume_usd float not null,
     timestamp timestamp with time zone default now()
   );
   ```

3. **Get Your Supabase Credentials**:
   - Go to the "Settings" section in your Supabase project
   - Click on "API" in the sidebar
   - You'll need two values:
     - **Project URL**: Copy the URL under "Project URL"
     - **anon public key**: Copy the key under "anon public"
   - Keep these values handy for the Vercel deployment

4. **Add Initial Data (Optional)**:
   - To add your WooX API keys, go to the "Table Editor", select the "api_keys" table, and click "Insert Row"
   - Fill in the following:
     - platform: "woox"
     - api_key: Your WooX API key
     - api_secret: Your WooX API secret
   - Click "Save"

### Step 2: Deploy to Vercel

1. **Connect Your GitHub Repository to Vercel**:
   - Log in to your Vercel account
   - Click "Add New..." and select "Project"
   - Connect your GitHub account if you haven't already
   - Select the repository containing your Next.js application
   - Click "Import"

2. **Configure Project Settings**:
   - Project Name: Enter a name for your project (e.g., "aggrperpvol")
   - Framework Preset: Vercel should automatically detect Next.js
   - Root Directory: If your Next.js app is in the root of the repository, leave this blank. Otherwise, specify the directory (e.g., "clean-nextjs-app")
   - Build Command: Leave as default (`next build`)
   - Output Directory: Leave as default (`Next.js default`)

3. **Add Environment Variables**:
   - Expand the "Environment Variables" section
   - Add the following variables:
     - Name: `NEXT_PUBLIC_SUPABASE_URL`
       Value: Your Supabase Project URL (from Step 1.3)
     - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
       Value: Your Supabase anon public key (from Step 1.3)
   - Click "Add" for each variable

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Once deployment is complete, you'll see a success message and a link to your deployed application

### Step 3: Test Your Deployed Application

1. **Visit Your Deployed Application**:
   - Click on the link provided by Vercel after deployment
   - Your application should now be live

2. **Add Your Exchange Credentials**:
   - For WooX: If you didn't add your API keys to Supabase directly, you can add them through the application interface
   - For Paradex: Generate a JWT token using the scripts in the repository and add it through the application interface

3. **Verify Data Fetching**:
   - Check that your application is correctly fetching and displaying volume data
   - If using the fallback mechanism, you should see public data even without valid credentials

### Step 4: Set Up Automatic Updates (Optional)

1. **Configure Vercel for Automatic Deployments**:
   - By default, Vercel will automatically deploy when you push changes to the main branch of your GitHub repository
   - You can customize this behavior in the Vercel project settings under "Git"

2. **Set Up a Scheduled Job for Data Updates**:
   - To regularly update your volume data, you can set up a scheduled job using Vercel Cron Jobs:
   - Go to your Vercel project settings
   - Navigate to "Cron Jobs"
   - Click "Create Cron Job"
   - Set up a job to call your `/api/volume` endpoint at regular intervals (e.g., every hour)
   - Example cron expression: `0 * * * *` (runs every hour)

### Troubleshooting

1. **Deployment Fails**:
   - Check the build logs in Vercel for specific errors
   - Ensure all dependencies are correctly listed in your package.json
   - Verify that your Next.js application works locally

2. **API Errors**:
   - Check that your environment variables are correctly set in Vercel
   - Verify your Supabase tables are set up correctly
   - Check the browser console and Vercel logs for specific error messages

3. **Authentication Issues**:
   - For WooX: Verify your API keys are correct and have the necessary permissions
   - For Paradex: Ensure your JWT token is correctly generated and not expired

4. **CORS Errors**:
   - If you see CORS errors in the console, you may need to add your Vercel domain to the allowed origins in Supabase:
     - Go to your Supabase project settings
     - Navigate to "API" > "Auth Settings"
     - Add your Vercel domain to the "Additional Redirect URLs" field

### Updating Your Application

1. **Make Changes Locally**:
   - Make and test changes in your local development environment

2. **Push to GitHub**:
   - Commit your changes and push to your GitHub repository
   ```
   git add .
   git commit -m "Your update message"
   git push origin master
   ```

3. **Automatic Deployment**:
   - Vercel will automatically detect the push and deploy the updated application
   - You can monitor the deployment status in your Vercel dashboard

By following this guide, you should have successfully deployed your Next.js application to Vercel with Supabase integration. Your application will now be accessible worldwide with automatic updates whenever you push changes to your GitHub repository.