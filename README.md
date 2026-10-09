# Cinephile Forum

A community forum for movie lovers, built as a Forum Management System. People share posts about films, reply to each other, and upvote or downvote the content they like or dislike the most. The frontend is built with **React**, and authentication, data, and file storage are handled by **Supabase**.

> **Status:** planning. Work is tracked as [GitHub Issues](https://github.com/telerik-team3/cinephile-forum/issues) grouped into [milestones](https://github.com/telerik-team3/cinephile-forum/milestones) M1–M7 (see [Roadmap](#roadmap)).

## About the project

The forum has three levels of access:

- **Visitors** can see what the platform offers, how many people use it, and which posts are popular or new. They can also register or log in.
- **Registered users** can write posts, comment on other users' posts, vote, and manage their own content and profile.
- **Administrators** moderate the community. They can find users, block rule breakers, and remove any post.

Supabase handles all authentication. All data is stored in Supabase's PostgreSQL database, and Row Level Security (RLS) rules enforce who can read or change what. The UI shows or hides actions based on the user's permissions, but the database rules are what actually enforce security.

## Features

### Public part (no login required)

- Home page that presents the platform's core features, the total number of users, and the total number of posts
- The 10 most commented posts and the 10 newest posts
- Registration and login

### Registered users

- Log in and log out
- Browse all posts, search them by title and content, and sort or filter them (newest, oldest, most commented, most liked)
- Open a single post to see its title, content, comments, and votes, with every available action (comment, vote, edit, delete) on the same page
- Create posts and edit or delete their own posts, from the post page or from the post list
- Comment on any post and edit or delete their own comments
- Upvote or downvote posts, with one active vote per user per post that can be changed or removed
- View any user's posts and comments, with filtering and sorting
- Edit their profile and upload a profile photo. The username can't be changed after registration.

### Administrators

- Search users by username, email, or display name
- Block and unblock users. Blocked users can't create posts or comments.
- Delete any post
- View all posts, with search, filtering, and sorting
- Give administrator rights to other users (for example, a newly hired moderator). Regular users can't make themselves administrators.

### Optional features

- **Tags.** The author adds tags to a post from its edit page. Tags are lowercase only, and an existing tag is reused instead of being created again. Searching for a tag returns every post that has it. Users can manage tags only on their own posts, while administrators can manage tags on all posts.
- **Reputation.** Upvotes on a user's posts raise that user's reputation, and downvotes lower it. The score updates whenever a vote is added, changed, or removed, and it appears on the user's profile.
- **Badges.** Users earn badges automatically for milestones such as number of posts, number of comments, reputation reached, or long-term participation. Badges appear on the user's profile and can also appear next to their name on posts and comments.

## Validation rules

| Entity | Field                 | Rule                                        |
| ------ | --------------------- | ------------------------------------------- |
| User   | First name, last name | 4–32 characters                             |
| User   | Email                 | Valid format, unique in the system          |
| User   | Username              | Can't be changed after registration         |
| Admin  | First name, last name | 4–32 characters                             |
| Admin  | Email                 | Valid format, unique in the system          |
| Admin  | Phone number          | Optional                                    |
| Post   | Title                 | 16–64 characters                            |
| Post   | Content               | 32–8192 characters                          |
| Post   | Author                | Required                                    |
| Tag    | Name                  | Lowercase only, reused if it already exists |

## Tech stack

- **Frontend:** React
- **Backend:** Supabase (Auth, PostgreSQL, Storage for profile photos, Row Level Security)
- **Testing:** automated tests for the React UI and for the authorization rules (RLS, blocked users, admin access)
- **CI/CD:** tests and a production build run automatically on every pull request (planned for M7)
- **Hosting:** the React frontend and a production Supabase project will be deployed online (planned for M7)

## Roadmap

| Milestone            | Scope                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| M1 Foundation        | React project setup, routing and layout, Supabase Auth, database schema and services for profiles, posts, and comments, RLS, admin authorization |
| M2 Authentication    | Registration page, login and logout                                                                                                              |
| M2 Public            | Landing page with statistics, top-10 newest and most commented posts                                                                             |
| M2 Profiles          | Profile page, profile editing, profile photo upload                                                                                              |
| M3 Core Forum        | Posts feed, create/edit/delete posts, search, sorting and filtering, voting, single-post page, comments                                          |
| M4 Administration    | Admin dashboard, user search, block/unblock, post moderation                                                                                     |
| M5 Testing           | Automated tests for authentication, profiles, posts, voting, comments, admin features, and authorization                                         |
| M6 Optional Features | Tags, reputation, badges                                                                                                                         |
| M7 Release           | Documentation, CI/CD, production deployment, user and admin acceptance testing, security and UI/UX review                                        |

## Live demo

_A link will be added once the application is deployed._


## Getting started

### Requirements

- [Node.js](https://nodejs.org/) **20.19+** or **22.12+** (required by Vite 8). npm comes with Node.js.
- A [Supabase](https://supabase.com/) project (the team's existing one, or a new one of your own).

### 1. Clone the repository

```bash
git clone https://github.com/telerik-team3/cinephile-forum.git
cd cinephile-forum
```

### 2. Install the dependencies

```bash
npm install
```

This installs everything listed in `package.json`, including React, React Router, Supabase, Pico.css, Vite and Vitest.

### 3. Create the `.env` file

Create a file named exactly `.env` in the **project's root folder**, next to `package.json` (not inside `src` or any subfolder):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Where to find the values in the Supabase dashboard:

- **`VITE_SUPABASE_URL`**: *Project Settings → Data API*, the **Project URL**. Use only the base address ending in `.supabase.co`, without `/rest/v1/`.
- **`VITE_SUPABASE_ANON_KEY`**: *Project Settings → API Keys*, the **publishable** key (or the legacy **anon** key).

> ⚠️ Never use the **secret** or **service_role** key. It bypasses all Row Level Security policies and must never be placed in a frontend app.

The `.env` file is listed in `.gitignore`, so it is never committed. Each developer creates their own copy.

### 4. Set up the database (new Supabase projects only)

If you are using a brand-new Supabase project, create the tables, functions and security policies by running the contents of [`supabase-schema.sql`](./supabase-schema.sql) in the Supabase dashboard's **SQL Editor**. This step is not needed when using the team's existing project.

### 5. Run the app

```bash
npm run dev
```

Then open **http://localhost:5173** in your browser.

> If the page is blank and the browser console shows `supabaseUrl is required`, the `.env` file is missing, misnamed or in the wrong folder. Fix it and restart `npm run dev`, since Vite only reads `.env` on startup.

### 6. Run the tests and the linter

```bash
npm test        # runs the Vitest test suite
npm run lint    # checks the code with ESLint
```

The service tests mock Supabase, so they do not need a `.env` file or a database connection.

## Database schema

All data is stored in Supabase (PostgreSQL). The full script, with tables, functions, triggers and Row Level Security policies, is in [`supabase-schema.sql`](./supabase-schema.sql).

### Relationships

```
auth.users ──1:1── profiles
                      │
                      ├──< posts ──< comments
                      │      │
                      │      └──< votes
                      ├──< comments (author)
                      └──< votes (voter)
```

- Every **profile** belongs to one Supabase Auth user.
- A **post** has one author (a profile) and many comments and votes.
- A **comment** and a **vote** each belong to one post and one profile.
- Deleting a profile deletes their posts, comments and votes. Deleting a post deletes its comments and votes.

---

### `profiles`

Public profile data for each registered user. Login data (email, password) lives in Supabase's own `auth.users` table.
Usernames can’t be changed after registration, enforced by column permissions

| Column       | Type        | Rules |
|--------------|-------------|-------|
| `id`         | uuid        | Primary key. Same ID as the user's `auth.users` row; deleted when that user is deleted |
| `username`   | text        | Unique |
| `first_name` | text        | Required. 4–32 characters |
| `last_name`  | text        | Required. 4–32 characters |
| `phone`      | text        | Optional |
| `avatar_url` | text        | Optional |
| `is_admin`   | boolean     | Default `false` |
| `is_blocked` | boolean     | Default `false` |
| `created_at` | timestamptz | Set automatically on sign-up |

**Automatic behavior**
- **`handle_new_user`** (trigger on `auth.users`): creates the profile row with the username and names when someone registers.
- **`guard_profile_privileges`** (trigger on `profiles`): stops non-admins from making themselves admin or unblocking themselves.

**Helper functions**
- **`is_admin()`** / **`is_blocked()`**: return whether the current user is an admin or blocked. Used by the RLS policies of every table.
- **`admin_search_users(search_term)`**: admin-only search by username, email or full name. It runs in the database because emails live in `auth.users`, which the browser can't read.

**Row Level Security**
- **Read:** everyone.
- **Create:** users can create only their own profile (normally done automatically on sign-up).
- **Update:** users can update their own profile. Admins can update any profile (for example, to block users or grant admin rights).

---

### `posts`

A forum post written by a user.

| Column       | Type        | Rules |
|--------------|-------------|-------|
| `id`         | uuid        | Primary key, generated automatically |
| `author_id`  | uuid        | Required. References `profiles.id`; deleted when the profile is deleted |
| `title`      | text        | Required. 16–64 characters |
| `content`    | text        | Required. 32–8192 characters |
| `created_at` | timestamptz | Set automatically when the post is created |
| `updated_at` | timestamptz | Starts equal to `created_at`; updated automatically by a trigger on every edit |

**Row Level Security**
- **Read:** everyone, including anonymous visitors.
- **Create:** logged-in users who are not blocked, only as themselves (`author_id` must be their own ID).
- **Update:** users can edit only their own posts, and not while blocked. The post's author cannot be changed.
- **Delete:** users can delete their own posts while not blocked. Admins can delete any post.

---

### `comments`

A reply to a post.

| Column       | Type        | Rules |
|--------------|-------------|-------|
| `id`         | uuid        | Primary key, generated automatically |
| `post_id`    | uuid        | Required. References `posts.id`; deleted when the post is deleted |
| `author_id`  | uuid        | Required. References `profiles.id`; deleted when the profile is deleted |
| `content`    | text        | Required. 1–8192 characters |
| `created_at` | timestamptz | Set automatically when the comment is created |
| `updated_at` | timestamptz | Starts equal to `created_at`; updated automatically by a trigger on every edit |

- **Column permissions:** users may only write `post_id`, `author_id` and `content` when creating a comment, and only `content` when editing one.

**Row Level Security**
- **Read:** everyone, including anonymous visitors.
- **Create:** logged-in users who are not blocked, only as themselves.
- **Update:** users can edit only their own comments, and not while blocked.
- **Delete:** users can delete their own comments while not blocked. Admins can delete any comment.

---

### `votes`

One row per vote. A user can like or dislike a post once.

| Column      | Type    | Rules |
|-------------|---------|-------|
| `id`        | uuid    | Primary key, generated automatically |
| `post_id`   | uuid    | Required. References `posts.id`; deleted when the post is deleted |
| `author_id` | uuid    | Required. References `profiles.id`; deleted when the profile is deleted |
| `rating`    | integer | Required. Only `1` (like) or `-1` (dislike) |

- **One vote per user per post:** `unique (author_id, post_id)`.
- **A post's rating** is the sum of its votes' `rating` values.

**Row Level Security**
- **Read:** everyone, including anonymous visitors.
- **Create:** logged-in users who are not blocked, only as themselves.
- **Update / delete:** users can change or remove only their own vote, and not while blocked.

## Team

| Member            | GitHub                                         | Main areas                                                                 |
| ----------------- | ---------------------------------------------- | -------------------------------------------------------------------------- |
| Andrey Atanasov   | [@androat1003](https://github.com/androat1003) | Project setup, routing, authentication, public pages, profiles, reputation |
| Borislav Evgeniev | [@Borislav-E](https://github.com/Borislav-E)   | Posts, search, sorting and filtering, voting, tags                         |
| Ivo Karabashev    | [@frivolous-b](https://github.com/frivolous-b) | Comments, single-post page, administration, badges                         |
