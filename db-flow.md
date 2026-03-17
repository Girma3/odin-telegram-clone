# This is the database flow looks like keeps everything **anchored on Users and Groups**, with Posts as the central content unit, and Notifications acting as the “signal system” that tells Users what’s happening in real time.

User (Hub)
│
├── Profile (identity info: bio, avatar, etc.)
├── OwnedGroups → Groups (Container)
│ │
│ ├── Profile (group identity: description, avatar, etc.)
│ ├── Members → GroupMembers (link between User & Group)
│ └── Posts (Content)
│ │
│ ├── Comments (Activity)
│ │ └── Replies (self-relation: threaded comments)
│ ├── Reactions (Activity: emoji markers)
│ └── Notifications (Signal Layer: tied to Post activity)
│
├── Posts (authored directly by User)
│ ├── Comments
│ ├── Reactions
│ └── Notifications
│
├── PrivateChats (Direct Channel)
│ ├── senderId → User
│ ├── receiverId → User
│ └── Notifications (Signal Layer: message alerts)
│
└── Notifications (Signal Layer)
├── Always tied to a User (recipient)
├── Optionally references:
│ ├── Post
│ ├── Comment
│ ├── Reaction
│ └── PrivateChat
└── read flag for WebSocket delivery tracking

---

### Database Flow Description

- **The Hub (User)**  
  A user is the central actor. They own a `Profile`, can be the **Owner** of a Group, the **Author** of Posts, the **Sender/Receiver** of PrivateChats, and the **Recipient** of Notifications.
  - Relations: `Profile`, `Groups`, `Posts`, `Comments`, `Reactions`, `PrivateChats`, `Notifications`.

- **The Container (Groups)**  
  Groups are collective spaces. Each Group has its own `Profile`, is owned by a User, and contains Posts. Membership is tracked via `GroupMembers`.
  - Relations: `Profile`, `GroupMembers`, `Posts`.

- **The Content (Posts)**  
  Posts are the main unit of interaction inside Groups. They can contain text or images. Posts belong to a Group and are authored by a User.
  - Relations: `Comments`, `Reactions`, `Notifications`.

- **The Activity (Comments & Reactions)**
  - **Comments**: Threaded replies that hang off Posts. Each comment is authored by a User and can have child replies.
  - **Reactions**: Emoji markers tied directly to a Post. Each reaction is made by a User.
  - Both activities are **post-centric** — they don’t connect directly to Groups, preserving hierarchy.

- **The Direct Channel (PrivateChats)**  
  PrivateChats are 1-to-1 messages between Users. They bypass Groups entirely. Each message has a `read` flag for delivery tracking.
  - Relations: `sender`, `receiver`, `Notifications`.

- **The Identity Layer (Profile)**  
  Profiles provide structured identity information for both Users and Groups. They store bio, avatar, and other metadata.
  - Relations: `User` ↔ `Profile`, `Group` ↔ `Profile`.

- **The Signal Layer (Notifications)**  
  Notifications are lightweight activity signals. They are always tied to a User (the recipient) and optionally reference a Post, Comment, Reaction, or PrivateChat.
  - They respect hierarchy: if a notification is about a Comment or Reaction, you can traverse back to the Post (and then to the Group).
  - Each notification has a `read` flag for WebSocket delivery and client acknowledgment.

---
