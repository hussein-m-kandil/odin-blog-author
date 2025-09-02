# [Odin Blog Author](https://odin-blog-author.hussein-kandil.vercel.app/)

A **blog authoring app** built as part of the required projects at [The Odin Project Node.js course](https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs).

**The course requirements for this project are divided into 3 pieces**:

1. **Backend API**, which I built as part of the [`generic-express-service`](https://github.com/hussein-m-kandil/generic-express-service).
2. **Blog author**: which I built in this project for authoring/viewing the blog posts.
3. **Blog viewer**: which I will build later for only viewing the blog posts and interacting with them.

**Here are the requirements from the course website**:

> We’re actually going to create the backend and two different front-ends for accessing and editing your blog posts. One of the front-end sites will be for people that want to read and comment on your posts, while the other one will be just for you to write, edit and publish your posts. Why are we setting it up like this? Because we can! The important exercise here is setting up the API and then accessing it from the outside.

**Important Notes**:

1. **Multiple Authors**: I have extended the author website (this project) to accept multiple authors, so any signed-up account can author a blog post.
2. **Guest Sing-in**: I have added the ability to _sign in as a guest_ to facilitate trying the app.
3. **Backend _State Reset_**: I am building these projects to practice what I am learning and to be part of my portfolio, and I don't plan to continue maintaining them in the future, hence I have implemented a reset logic within the [`generic-express-service`](https://github.com/hussein-m-kandil/generic-express-service) that will periodically delete any non-admin data.

---

## Tech Stack

- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/) with Context API
- [Next.js](https://nextjs.org/) with SSR and `fetch` for server HTTP requests
- [TanStack Query](https://tanstack.com/query) for data fetching and caching
- [Motion (prev Framer Motion)](https://motion.dev/) for animations
- [axios](https://axios-http.com/) for browser HTTP requests
- [date-fns](https://date-fns.org/) for date formatting
- [shadcn/ui](https://ui.shadcn.com) for UI primitives
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [vitest](https://vitest.dev/) for testing

---

## Challenges

While building this project, I faced several challenges, such as:

- **Authentication with SSR**:
  I wanted the backend to handle auth while still leveraging Next.js SSR. The solution was to introduce a custom Next.js API route that proxies auth requests, maintains a cookie between the Next server and frontend, and uses a Bearer token schema between the Next server and backend. Check out the [auth route](./src/app/api/auth/[action]/route.ts), [auth module](./src/lib/auth.ts), and [auth context](./src/contexts/auth-context/auth-context.tsx) for implementation details.

- **Reusable Dialog with Form Component**:
  I created a dialog system via context, so I can avoid repeating it on every usage (DRY). However, when placing a reusable form inside a dialog, I needed the dialog to stay open while the form had unsaved changes. To solve this, the form exposes a `shouldUnmount` function as [ref](https://react.dev/reference/react/useRef) within an [imperative handle](https://react.dev/reference/react/useImperativeHandle), and the form's parent passes it to the dialog, which expects it and calls it before closing. Check out the [dialog context](./src/contexts/dialog-context/dialog-context.tsx) and, for example, the [`PostForm`](./src/components/post-form/post-form.tsx) for implementation details.

- **Image Uploader & Editor**:
  The backend image upload was already a challenge in the [`generic-express-service`](https://github.com/hussein-m-kandil/generic-express-service). On the frontend, I needed to show the selected image immediately and allow deleting the image or positioning it within the image boundaries, while not committing any of these changes until submitting the image form. I built a small custom image toolkit to handle this. Check out [`ImageToolkit`](./src/components/image-toolkit/image-toolkit.tsx), [`MutableImage`](./src/components/mutable-image/mutable-image.tsx), [`ImageInput`](./src/components/image-input/image-input.tsx), and [`ImageForm`](./src/components/image-form/image-form.tsx) for implementation details.

- **Reusable/Customizable Tested Components**:
  I tried hard to build this app consists of multiple reusable/customizable components to be useful for future usage, and to facilitate the app's maintainability.

---

## Features

- **Authentication & Authorization**

  - Custom solution that bridges SSR in Next.js with backend auth.
  - Auth API route in Next.js acts as a middle layer between frontend and backend.
  - Auth context on the frontend with cookie-based session between the Next.js server and its frontend.
  - Bearer token schema between Next.js and the backend.
  - Middleware validation in Next.js.

- **Blog Management**

  - Create, update, delete, and search posts.
  - Infinite scroll powered by [TanStack Query](https://tanstack.com/query).
  - Attach images to posts.

- **Comments**

  - Add, update, and delete comments.
  - Infinite loading of comments.

- **User Profiles**

  - View/Edit profile info (username, bio, avatar).
  - Profile-specific post listings.
  - delete account.

- **Images**

  - Upload and store images using the backend service.
  - Simple in-app image editor to adjust position.
  - Temporarily delete/edit an image until submission.
  - Automatic image browser-cache invalidation, for real-time mutations.

- **Reusable Components**

  - **Dialog system** via context (global dialogs for forms, confirmations, etc.).
  - **Dynamic Form system** with `react-hook-form`, reusable across the app.
  - **Image toolkit** for image editing (positioning, deleting).
  - Shared UI primitives from [`shadcn/ui`](https://ui.shadcn.com).

- **UI/UX**

  - Animated components via [Motion (prev Framer Motion)](https://motion.dev/).
  - Loading skeletons for better perceived performance.
  - Responsive, dark/light/system mode.
  - Toast notifications for global feedback.

- **Testing**
  - Component tests with [`vitest`](https://vitest.dev/).

---

## Local Development

### Requirements

- Node.js (20 LTS or later)
- Clone of [`generic-express-service`](https://github.com/hussein-m-kandil/generic-express-service)

### Setup

1. **Clone and set up the backend**

   > Refer to [`generic-express-service`](https://github.com/hussein-m-kandil/generic-express-service) for more details.

   ```bash
   git clone https://github.com/hussein-m-kandil/generic-express-service.git
   cd generic-express-service
   npm install
   # Refer to `.env.test` to configure .env (DB connection, ports, etc.)
   # Start the PostgreSQL database
   npm run pg:up
   # Build the backend source code
   npm run build
   # Start the backend production server
   npm run start
   ```

   > Make note of the backend base URL, which should be `http://localhost:8080/api/v1`. You will need it in the frontend `.env`.

2. **Clone, install, and configure the Next.js app**

   ```bash
   git clone https://github.com/hussein-m-kandil/odin-blog-author.git
   cd odin-blog-author
   npm install
   # Copy `env.sample` to `.env` in the project root
   # Start the frontend dev server
   npm run dev
   ```

   > The app will be available at: `http://localhost:3000`.

3. **Useful scripts**

   - **Start dev server**: `npm run dev`
   - **Run tests**: `npm test`
   - **Lint**: `npm run lint`
   - **Build**: `npm run build`
   - **Start production server**: `npm run start`

   > **Important Note**: A secure cookie is used for authentication between the browser and the Next.js server, _hence an `https` scheme is mandatory_. So, connecting to the local `http` server via local IP address from another device (e.g, mobile phone), won't work as expected, and _you will never leave the signin/signup pages even after a successful sign-in_. The only solution that I know for this situation is using the [`--experimental-https` option with the Next.js dev server](https://nextjs.org/docs/app/api-reference/cli/next#using-https-during-development).
