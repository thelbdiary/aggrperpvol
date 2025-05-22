# Aggregate Perpetual Volume Dashboard

A Next.js application for tracking and visualizing trading volume from WooX and Paradex exchanges.

## Features

- Track trading volume from WooX and Paradex exchanges
- Visualize historical volume data with Chart.js
- Store data in Supabase database
- Manage API keys and JWT tokens securely

## Setup

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