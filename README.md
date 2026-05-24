# xitter-backend

A Twitter/X clone REST API built with NestJS for a school project. Supports user authentication, posting, media uploads, social interactions (follows, likes, reposts, blocks, mutes), and trending hashtag tracking.



## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/) (recommended)
- **Or** Node.js ≥ 20 and a running PostgreSQL instance (for local development)

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
POSTGRES_PASSWORD="your_db_password"
POSTGRES_DB="xitterdb"
JWTSECRET="a_long_random_secret"
SERVER_ROOT="http://localhost:3000"        # public hostname used in email links & media URLs
UPLOADS_PATH="/absolute/path/to/uploads"  # host directory mounted for file storage
MAIL_SERVER="smtp.example.com"
MAIL_USERNAME="noreply@example.com"
MAIL_PASSWORD="your_mail_password"
MAIL_REQUIRED="0"                         # set to "1" to require email activation on sign-up
```

### Running with Docker Compose

```bash
cp .env.example .env
# edit .env with your values

docker compose up --build
```

The API will be available at `http://localhost:3000`.  
Swagger UI: `http://localhost:3000/docs`

### Running Locally

```bash
npm install

# Make sure PostgreSQL is running and the credentials in .env match
npm run start:dev   # watch mode
# or
npm run start       # production mode (requires npm run build first)
```

---

## API Overview

> Full interactive documentation (with try-it-out) is available at **`/docs`** (Swagger UI).
>
> **Access token** — short-lived JWT (10 min), sent as `Authorization: Bearer <token>` header.  
> **Refresh token** — long-lived JWT (7 days), stored in an `httpOnly; Secure; SameSite=Strict` cookie. Not readable by client JS.

---

### Auth — `/auth`

#### `GET /auth/preRegister`
Returns a 15-minute JWT that can be used **instead of** a real access token when calling `POST /media/upload` before an account exists.

**Request:** none  
**Response `200`:**
```json
{ "upload_token": "eyJhbGciOiJIUzI1NiJ9..." }
```
**Error `400`:** already logged in (refresh token cookie present).

---

#### `POST /auth/signup`
Register a new account. If `MAIL_REQUIRED=1`, the account starts inactive and an activation link is emailed.

**Request body (`application/json`):**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "s3cr3tP@ss!",
  "imageId": "uuid-of-uploaded-image"
}
```
`imageId` is optional. The image must have been uploaded first (via `POST /media/upload`) and must be unowned.

**Response `201`** (mail off): full user object  
**Response `201`** (mail on):
```json
{ "message": "Check your mail in order to activate your account" }
```
**Error `409`:** username or email already taken.  
**Error `400`:** `imageId` does not exist.

---

#### `POST /auth/signin`
Authenticate with username **or** email and password.

**Request body (`application/json`):**
```json
{ "username": "john_doe", "password": "s3cr3tP@ss!" }
```
`username` accepts either the display name or the email address.

**Response `200`:** sets `refresh_token` httpOnly cookie (7 days) and returns:
```json
{ "access_token": "eyJhbGciOiJIUzI1NiJ9..." }
```
**Error `401`:** invalid credentials.  
**Error `400`:** already logged in.

---

#### `POST /auth/refresh`
Exchange the `refresh_token` cookie for a fresh access token. Rotates the refresh token as well.

**Request:** `refresh_token` cookie (automatically sent by the browser).  
**Response `200`:** rotates cookie, returns:
```json
{ "access_token": "eyJhbGciOiJIUzI1NiJ9..." }
```
**Error `401`:** missing or invalid refresh token.

---

#### `POST /auth/logout`
Invalidate the current session.

**Request:** `refresh_token` cookie.  
**Response `200`:** clears the cookie, nullifies the stored token server-side. No body.  
**Error `401`:** not logged in.

---

#### `GET /auth/activate?hash=<md5>`
Activate an account from the link emailed on sign-up.

**Query param:** `hash` — MD5 activation hash from the email.  
**Response `200`:** no body (account is now active).  
**Error `400`:** hash not found or already used.

---

#### `GET /auth/resetPassword` 
Trigger a password-reset flow for the currently authenticated user. Sets a reset hash on the user and deactivates the account until the reset is completed.

**Auth:** Access Token  
**Response `200`:** no body (email sent with reset link, contains `change_hash`).

---

#### `POST /auth/resetPassword`
Complete a password reset using the hash from the email.

**Request body (`application/json`):**
```json
{ "hash": "6d5321fea8f...", "newPassword": "newP@ss!" }
```
**Response `200`:** no body.  
**Error `400`:** hash not found.

---

### Posts — `/post`

All post objects returned look like this:
```json
{
  "id": "uuid",
  "createdAt": "2026-05-24T18:00:00.000Z",
  "content": "Hello world! #nestjs",
  "likesCount": 3,
  "repostsCount": 1,
  "replyCount": 0,
  "mediaURLs": ["http://localhost:3000/media/uuid"],
  "hashtags": ["nestjs"],
  "author": { "id": "uuid", "name": "john_doe", "tag": "john_doe", "image": "http://..." },
  "repliesTo": null,
  "reposts": null
}
```

---

#### `GET /post`
Returns every post in the database, populated with author, media, hashtags, repliesTo, reposts.

**Response `200`:** array of post objects.

---

#### `POST /post/create` 
Create a new post. Hashtags are parsed automatically from `#word` patterns in `content`.

**Auth:** Access Token  
**Request body (`application/json`):**
```json
{
  "content": "Hello world! #nestjs",
  "mediaIds": ["uuid-1", "uuid-2"]
}
```
`mediaIds` is optional (max 5). Each UUID must belong to an existing Media record **owned by the authenticated user**.

**Response `201`:** created post object.  
**Error `400`:** a media UUID doesn't exist or isn't owned by the user.

---

#### `GET /post/:id`
Get a single post by its UUID.

**Path param:** `id` — UUID of the post.  
**Response `200`:** post object.  
**Response `404`:** post not found.

---

#### `PUT /post/:id` 
Replace the content and media of an existing post. Hashtag associations are rebuilt from the new content.

**Auth:** Access Token  
**Path param:** `id` — UUID of the post.  
**Request body (`application/json`):** same shape as `POST /post/create`.  
**Response `200`:** updated post object.  
**Error `403`:** not the author.  
**Error `404`:** post not found.

---

#### `DELETE /post/:id` 
Delete a post. Decrements `replyCount` on the parent if it was a reply.

**Auth:** Access Token  
**Path param:** `id` — UUID of the post.  
**Response `200`:** no body.  
**Error `403`:** not the author.  
**Error `404`:** post not found.

---

#### `POST /post/:id/reply` 
Create a new post linked to an existing post as a reply. Increments `replyCount` on the parent.

**Auth:** Access Token  
**Path param:** `id` — UUID of the parent post.  
**Request body:** same shape as `POST /post/create`.  
**Response `201`:** created reply post object.  
**Error `400`:** you or the author have blocked each other.  
**Error `404`:** parent post not found.

---

#### `POST /post/:id/repost` 
Creates a new empty post with `reposts` pointing to the target. Increments `repostsCount` on the original.

**Auth:** Access Token  
**Path param:** `id` — UUID of the post to repost.  
**Response `201`:** created repost object.  
**Error `400`:** already reposted, blocked, or trying to repost your own post.  
**Error `404`:** post not found.

---

#### `DELETE /post/:id/repost` 
Removes the repost and decrements `repostsCount` on the original.

**Auth:** Access Token  
**Path param:** `id` — UUID of the original post.  
**Response `200`:** no body.  
**Error `400`:** you haven't reposted this post.

---

#### `GET /post/:id/likes`
Returns the list of users who liked a post.

**Path param:** `id` — UUID of the post.  
**Response `200`:** array of user objects.  
**Error `404`:** post not found.

---

#### `POST /post/:id/likes` 
Like a post. Increments `likesCount`.

**Auth:** Access Token  
**Path param:** `id` — UUID of the post.  
**Response `200`:** no body.  
**Error `400`:** already liked, own post, or blocked.  
**Error `404`:** post not found.

---

#### `DELETE /post/:id/likes` 
Unlike a post. Decrements `likesCount`.

**Auth:** Access Token  
**Path param:** `id` — UUID of the post.  
**Response `200`:** no body.  
**Error `400`:** not liked yet, or blocked.  
**Error `404`:** post not found.

---

#### `GET /post/:id/replies`
Returns all posts that are direct replies to the given post.

**Path param:** `id` — UUID of the post.  
**Response `200`:** array of post objects.

---

### Users — `/user`

User objects look like:
```json
{
  "id": "uuid",
  "name": "John Doe",
  "tag": "john_doe",
  "image": "http://localhost:3000/media/uuid",
  "following": [...],
  "followers": [...]
}
```
`email`, `password`, `active`, `refresh_token`, and hash fields are always hidden from responses.

---

#### `GET /user/feed` 
Returns a scored, time-decayed feed. Posts from muted/blocked users are excluded. Each item includes a `score` alongside the post.

**Auth:** Access Token  
**Response `200`:**
```json
[
  { "score": 42.7, "post": { ...post object... } },
  { "score": 18.1, "post": { ...post object... } }
]
```
Scoring factors: `likesCount`, `replyCount × 3`, `repostsCount × 5`, follow bonus (+100), liked-author bonus, time decay `score / (ageHours + 2)²`.

---

#### `GET /user/likes` 
Returns all posts the authenticated user has liked.

**Auth:** Access Token  
**Response `200`:** array of post objects.

---

#### `POST /user/changeName` 
Update the authenticated user's display name (not their unique `tag`).

**Auth:** Access Token  
**Request body (`application/json`):**
```json
{ "newName": "Jane Doe" }
```
**Response `200`:** no body.

---

#### `POST /user/changePicture` 
Set a new profile picture. The media must be an image, owned by the user, and not already attached to a post.

**Auth:** Access Token  
**Request body (`application/json`):**
```json
{ "mediaId": "uuid-of-image-media" }
```
**Response `200`:** no body.  
**Error `400`:** not an image, not owned, or already tied to a post.  
**Error `404`:** media not found.

---

#### `GET /user/:id`
Get a user's public profile.

**Path param:** `id` — UUID of the user.  
**Response `200`:** user object with `followers` and `following` populated.  
**Response `404`:** user not found.

---

#### `GET /user/:id/posts`
Get all posts authored by a user.

**Path param:** `id` — UUID of the user.  
**Response `200`:** array of post objects (with media, author, repliesTo, reposts).  
**Error `404`:** user not found.

---

#### `GET /user/:id/followers` / `GET /user/:id/following`
List followers or accounts the user follows.

**Path param:** `id` — UUID of the user.  
**Response `200`:** array of user objects (with `image` populated).

---

#### `POST /user/:id/follow`  · `DELETE /user/:id/follow` 
Follow or unfollow a user. Blocking state is checked on both sides.

**Auth:** Access Token  
**Path param:** `id` — UUID of the target user.  
**Response `200`:** no body.  
**Error `400`:** blocked, or targeting yourself.  
**Error `404`:** user not found.

---

#### `POST /user/:id/block`  · `DELETE /user/:id/block` 
Block or unblock a user. Blocking also removes the blocked user from your following list.

**Auth:** Access Token  
**Path param:** `id` — UUID of the target user.  
**Response `200`:** no body.  
**Error `400`:** already blocked / not blocked, or targeting yourself.

---

#### `POST /user/:id/mute`  · `DELETE /user/:id/mute` 
Mute or unmute a user (they disappear from your feed without them knowing).

**Auth:** Access Token  
**Path param:** `id` — UUID of the target user.  
**Response `200`:** no body.

---

### Media — `/media`

#### `POST /media/upload` 
Upload an image or video file. The file is saved to the `uploads/` directory and a Media record is created.

**Auth:** Access Token **or** pre-register token (from `GET /auth/preRegister`).  
**Content-Type:** `multipart/form-data`  
**Form field:** `file` — the binary file (max **15 MB**, must be `image/*` or `video/*`).  

**Response `201`:** Media object:
```json
{
  "id": "uuid",
  "url": "http://localhost:3000/media/uuid",
  "mimeType": "image/jpeg",
  "owner": { "id": "uuid", ... }
}
```
If uploaded with a pre-register token, `owner` is `null` until sign-up assigns it.  
**Error `401`:** missing or invalid token.

---

#### `GET /media/:id`
Streams the actual file bytes with the correct `Content-Type` header. Use this URL directly in `<img>` or `<video>` tags.

**Path param:** `id` — UUID of the media record, or `default` for the default profile picture.  
**Response `200`:** binary file stream (`image/jpeg`, `video/mp4`, etc.).  
**Error `404`:** media not found.

---

### Hashtags — `/hashtag`

Hashtag objects look like:
```json
{ "id": "uuid", "name": "nestjs", "popularity": 3.14 }
```

#### `GET /hashtag/all`
Returns every hashtag in the database.

**Response `200`:** array of hashtag objects.

---

#### `GET /hashtag/trending`
Returns the top **5** hashtags ordered by `popularity` descending. Popularity is recalculated every minute by a cron job:

```
popularity = (posts_in_past_hour / (avg_posts_per_hour_past_day + 1)) × log₂(unique_users + 1)
```

**Response `200`:** array of up to 5 hashtag objects.

---

#### `GET /hashtag/name/:name`
Returns all posts tagged with the given hashtag.

**Path param:** `name` — hashtag text **without** the `#` symbol.  
**Response `200`:** array of post objects (with media populated). Returns `[]` if the hashtag doesn't exist.
