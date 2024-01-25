# Twitter Clone

Welcome to the Twitter Clone project! This application is built using Next.js, TypeScript, Prisma, Tailwind CSS, NextAuth.js, and tRPC. It aims to replicate some of the key features of Twitter, including tweets, following, likes, and an infinite tweet feed.

## Features

- **Tweeting**: Share your thoughts with the world by creating tweets.
- **Following**: Stay connected with others by following their profiles.
- **Like**: Show appreciation for tweets by liking them.
- **Infinite Tweet Feed**: Scroll endlessly through a dynamically updating tweet feed.

## Technologies Used

- [Next.js](https://nextjs.org/) - A React framework for building web applications.
- [TypeScript](https://www.typescriptlang.org/) - Adds static typing to JavaScript.
- [Prisma](https://www.prisma.io/) - A modern database toolkit for Node.js.
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
- [NextAuth.js](https://next-auth.js.org/) - An authentication library for Next.js.
- [tRPC](https://trpc.io/) - A TypeScript-first API framework.

## Getting Started

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/twitter-clone.git
   cd twitter-clone
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**
   Make a database using cockroachDb or planetscale copy the environment variable from there and place then in .env file. Login with discord and get the DISCORD_CLIENT_ID and 
   DISCORD_CLIENT_SECRET and them in the respected field.

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

   The application will be accessible at `http://localhost:3000`.

## Project Structure

- `pages/`: Contains Next.js pages.
- `components/`: Reusable React components.
- `prisma/`: Prisma configuration and database schema.
- `trpc/`: tRPC API definition and generated client.
