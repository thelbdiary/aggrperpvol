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
   - Click "New Table" to create each of the following tables:

   **For the api_keys table**:
   - Table Name: `api_keys`
   - Description: (Optional) "Stores API keys for exchanges"
   - Enable Row Level Security (RLS): Check this box (recommended for security)
   - Enable Realtime: Leave unchecked (unless you need real-time updates)
   - Columns:
     - The `id` and `created_at` columns are added by default
     - Click "Add column" three times to add these columns:
       1. Name: `platform`, Type: `text`, Default Value: leave empty, Check "Not Null"
       2. Name: `api_key`, Type: `text`, Default Value: leave empty, Check "Not Null"
       3. Name: `api_secret`, Type: `text`, Default Value: leave empty, Check "Not Null"
   - Click "Save" to create the table
   
   **Add a unique constraint to the platform column**:
   - After creating the table, go to the "Table Editor"
   - Click on the "api_keys" table
   - Go to the "Constraints" tab
   - Click "Add Constraint"
   - Select "Unique" as the constraint type
   - Select "platform" as the column
   - Click "Save" to add the constraint

   **For the jwt_tokens table**:
   - Table Name: `jwt_tokens`
   - Description: (Optional) "Stores JWT tokens for authentication"
   - Enable Row Level Security (RLS): Check this box (recommended for security)
   - Enable Realtime: Leave unchecked
   - Columns:
     - The `id` and `created_at` columns are added by default
     - Click "Add column" twice to add these columns:
       1. Name: `platform`, Type: `text`, Default Value: leave empty, Check "Not Null"
       2. Name: `token`, Type: `text`, Default Value: leave empty, Check "Not Null"
   - Click "Save" to create the table
   
   **Add a unique constraint to the platform column**:
   - After creating the table, go to the "Table Editor"
   - Click on the "jwt_tokens" table
   - Go to the "Constraints" tab
   - Click "Add Constraint"
   - Select "Unique" as the constraint type
   - Select "platform" as the column
   - Click "Save" to add the constraint

   **For the historical_volume table**:
   - Table Name: `historical_volume`
   - Description: (Optional) "Stores historical volume data"
   - Enable Row Level Security (RLS): Check this box (recommended for security)
   - Enable Realtime: Leave unchecked
   - Columns:
     - The `id` and `created_at` columns are added by default
     - Click "Add column" three times to add these columns:
       1. Name: `platform`, Type: `text`, Default Value: leave empty, Check "Not Null"
       2. Name: `volume_usd`, Type: `float8`, Default Value: leave empty, Check "Not Null"
       3. Name: `timestamp`, Type: `timestamptz`, Default Value: `now()`, Check "Not Null"
   - Click "Save" to create the table

   **Alternative: Add Unique Constraints Using SQL**:
   - If you prefer, you can add the unique constraints using SQL directly
   - Go to the "SQL Editor" in the Supabase dashboard
   - Run the following SQL commands:
     ```sql
     -- Add unique constraint to api_keys.platform
     ALTER TABLE "public"."api_keys" ADD CONSTRAINT "api_keys_platform_key" UNIQUE ("platform");
     
     -- Add unique constraint to jwt_tokens.platform
     ALTER TABLE "public"."jwt_tokens" ADD CONSTRAINT "jwt_tokens_platform_key" UNIQUE ("platform");
     ```

   **After creating the tables, set up RLS policies**:
   - For each table, you'll need to create a policy to allow access
   - Click on the table name in the Table Editor
   - Go to the "Policies" tab
   - Click "New Policy" button
   - In the "Create a new Row Level Security policy" dialog that appears:
     - Policy Name: "Enable read access for all users" (this should be pre-filled)
     - Table: Should show your table name (e.g., "public.api_keys")
     - Policy Behavior: Should show "PERMISSIVE" (leave as is)
     - Policy Command: Make sure "SELECT" is selected (for read access)
     - Target Roles: Leave empty (defaults to "public")
     - Using clause: Leave as `true` in the code editor at the bottom
     - The SQL preview should look something like:
       ```sql
       create policy "Enable read access for all users"
       on "public"."api_keys"
       as PERMISSIVE
       for SELECT
       to public
       using (
         true
       );
       ```
     - Click "Save policy" to create the policy
   
   - Repeat the same process for the other tables (`jwt_tokens` and `historical_volume`)
   
   - You can also add policies for INSERT, UPDATE, and DELETE if your application needs to modify data:
     - Follow the same steps but select the appropriate command (INSERT, UPDATE, or DELETE)
     - You can use the templates provided at the bottom of the policy creation dialog
   
   ![Supabase RLS Policy Setup](https://i.imgur.com/Wd9Ygqm.png)

3. **Get Your Supabase Credentials**:
   - Go to the "Project Settings" section in your Supabase project (click the gear icon in the sidebar)
   - Click on "API" in the sidebar
   - You'll need two values:
     - **Project URL**: Copy the URL under "Project URL" (looks like `https://xxxxxxxxxxxx.supabase.co`)
     - **anon public key**: Copy the key under "Project API keys" > "anon public" (starts with "eyJh...")
   - Keep these values handy for the Vercel deployment
   
   ![Supabase API Keys Location](https://i.imgur.com/JsHLN2C.png)

4. **Add Initial Data (Optional)**:
   - To add your WooX API keys:
     - Go to the "Table Editor" in the sidebar
     - Click on the "api_keys" table
     - Click "Insert" button at the top right
     - Fill in the following fields:
       - platform: "woox"
       - api_key: Your WooX API key (e.g., "1VH4jswjYDOf2ZdE2JsxrQ==")
       - api_secret: Your WooX API secret (e.g., "2IEEY77I72T2MB5RPO3DRVIN7JBQ")
       - Leave id and created_at as they are (they'll be auto-generated)
     - Click "Save" to insert the row
   
   - To add your Paradex JWT token:
     - Click on the "jwt_tokens" table
     - Click "Insert" button at the top right
     - Fill in the following fields:
       - platform: "paradex"
       - token: Your Paradex JWT token (generated using the scripts/generate_paradex_jwt.js script)
       - Leave id and created_at as they are (they'll be auto-generated)
     - Click "Save" to insert the row
   
   ![Supabase Insert Row Example](https://i.imgur.com/8Yvj5Wd.png)

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
   - Add the following variables one by one:
     - First variable:
       - Name: `NEXT_PUBLIC_SUPABASE_URL`
       - Value: Your Supabase Project URL (from Step 1.3)
       - Click "Add"
     - Second variable:
       - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
       - Value: Your Supabase anon public key (from Step 1.3)
       - Click "Add"
   
   ![Vercel Environment Variables](https://i.imgur.com/JvN5hGO.png)

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
   - Go to your Vercel project dashboard
   - Click on your project
   - Go to "Settings" tab
   - Select "Cron Jobs" from the left sidebar
   - Click "Create Cron Job"
   - Fill in the following:
     - Name: "Update Volume Data"
     - Cron Expression: `0 * * * *` (runs every hour)
     - HTTP Method: GET
     - URL Path: `/api/volume`
   - Click "Create" to save the cron job
   
   ![Vercel Cron Job Setup](https://i.imgur.com/DZnLdJP.png)

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