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

_Setup instructions (requirements, environment variables, Supabase configuration, and commands to run the app and its tests) will be added once the project is set up._

## Database schema

_A diagram and description of the database tables will be added once the schema is in place._

## Team

| Member            | GitHub                                         | Main areas                                                                 |
| ----------------- | ---------------------------------------------- | -------------------------------------------------------------------------- |
| Andrey Atanasov   | [@androat1003](https://github.com/androat1003) | Project setup, routing, authentication, public pages, profiles, reputation |
| Borislav Evgeniev | [@Borislav-E](https://github.com/Borislav-E)   | Posts, search, sorting and filtering, voting, tags                         |
| Ivo Karabashev    | [@frivolous-b](https://github.com/frivolous-b) | Comments, single-post page, administration, badges                         |
