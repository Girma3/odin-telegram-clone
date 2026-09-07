import prismaGlobal from "./pool.js";
const prisma = prismaGlobal;

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data
  console.log("🧹 Cleaning existing data...");
  await prisma.notifications.deleteMany();
  await prisma.reactions.deleteMany();
  await prisma.comments.deleteMany();
  await prisma.posts.deleteMany();
  await prisma.groupMembers.deleteMany();
  await prisma.groups.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.privateChats.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  console.log("👥 Creating users...");
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: "john_doe",
        email: "john@example.com",
        status: "ONLINE",
      },
    }),
    prisma.user.create({
      data: {
        username: "jane_smith",
        email: "jane@example.com",
        status: "ONLINE",
      },
    }),
    prisma.user.create({
      data: {
        username: "mike_wilson",
        email: "mike@example.com",
        status: "OFFLINE",
      },
    }),
    prisma.user.create({
      data: {
        username: "sarah_jones",
        email: "sarah@example.com",
        status: "ONLINE",
      },
    }),
    prisma.user.create({
      data: {
        username: "david_brown",
        email: "david@example.com",
        status: "ONLINE",
      },
    }),
    prisma.user.create({
      data: {
        username: "emily_davis",
        email: "emily@example.com",
        status: "OFFLINE",
      },
    }),
    prisma.user.create({
      data: {
        username: "chris_miller",
        email: "chris@example.com",
        status: "ONLINE",
      },
    }),
    prisma.user.create({
      data: {
        username: "amanda_taylor",
        email: "amanda@example.com",
        status: "ONLINE",
      },
    }),
    prisma.user.create({
      data: {
        username: "james_anderson",
        email: "james@example.com",
        status: "OFFLINE",
      },
    }),
    prisma.user.create({
      data: {
        username: "lisa_thomas",
        email: "lisa@example.com",
        status: "ONLINE",
      },
    }),
    prisma.user.create({
      data: {
        username: "robert_jackson",
        email: "robert@example.com",
        status: "ONLINE",
      },
    }),
    prisma.user.create({
      data: {
        username: "jennifer_white",
        email: "jennifer@example.com",
        status: "OFFLINE",
      },
    }),
    prisma.user.create({
      data: {
        username: "daniel_harris",
        email: "daniel@example.com",
        status: "ONLINE",
      },
    }),
    prisma.user.create({
      data: {
        username: "jessica_martin",
        email: "jessica@example.com",
        status: "ONLINE",
      },
    }),
    prisma.user.create({
      data: {
        username: "matthew_garcia",
        email: "matthew@example.com",
        status: "OFFLINE",
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create Profiles for users
  console.log("📝 Creating user profiles...");
  const userProfiles = await Promise.all(
    users.map((user, index) =>
      prisma.profile.create({
        data: {
          bio: `Hi, I'm ${user.username}! Welcome to my profile.`,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
          location: [
            "New York",
            "Los Angeles",
            "Chicago",
            "Houston",
            "Phoenix",
          ][index % 5],
          website: `https://${user.username}.example.com`,
          userId: user.id,
        },
      }),
    ),
  );
  console.log(`✅ Created ${userProfiles.length} user profiles`);

  // Create Groups
  console.log("👥 Creating groups...");
  const groups = await Promise.all([
    prisma.groups.create({
      data: {
        name: "Tech Enthusiasts",
        ownerId: users[0].id,
      },
    }),
    prisma.groups.create({
      data: {
        name: "Book Club",
        ownerId: users[1].id,
      },
    }),
    prisma.groups.create({
      data: {
        name: "Fitness Warriors",
        ownerId: users[2].id,
      },
    }),
  ]);
  console.log(`✅ Created ${groups.length} groups`);

  // Create Profiles for groups
  console.log("📝 Creating group profiles...");
  const groupProfiles = await Promise.all(
    groups.map((group) =>
      prisma.profile.create({
        data: {
          bio: `Welcome to ${group.name}! A community for like-minded people.`,
          avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${group.name}`,
          location: "Online",
          website: `https://${group.name.toLowerCase().replace(" ", "-")}.example.com`,
          groupId: group.id,
        },
      }),
    ),
  );
  console.log(`✅ Created ${groupProfiles.length} group profiles`);

  // Create Group Members (5 members per group)
  console.log("👤 Creating group memberships...");
  const groupMemberships = [];

  // Group 1: Tech Enthusiasts - users[0] to users[4]
  for (let i = 0; i < 5; i++) {
    const membership = await prisma.groupMembers.create({
      data: {
        groupId: groups[0].id,
        userId: users[i].id,
      },
    });
    groupMemberships.push(membership);
  }

  // Group 2: Book Club - users[5] to users[9]
  for (let i = 5; i < 10; i++) {
    const membership = await prisma.groupMembers.create({
      data: {
        groupId: groups[1].id,
        userId: users[i].id,
      },
    });
    groupMemberships.push(membership);
  }

  // Group 3: Fitness Warriors - users[10] to users[14]
  for (let i = 10; i < 15; i++) {
    const membership = await prisma.groupMembers.create({
      data: {
        groupId: groups[2].id,
        userId: users[i].id,
      },
    });
    groupMemberships.push(membership);
  }

  console.log(`✅ Created ${groupMemberships.length} group memberships`);

  // Create Posts for each group
  console.log("📝 Creating posts...");
  const posts = [];

  // Posts for Tech Enthusiasts
  const techPosts = await Promise.all([
    prisma.posts.create({
      data: {
        text: "Just finished building my first React app! The component-based architecture is amazing. 🚀",
        userId: users[0].id,
        groupId: groups[0].id,
      },
    }),
    prisma.posts.create({
      data: {
        text: "Anyone else excited about the new JavaScript features in ES2024? The pipeline operator looks promising!",
        userId: users[1].id,
        groupId: groups[0].id,
      },
    }),
    prisma.posts.create({
      data: {
        text: "Tips for debugging Node.js applications: Use the built-in debugger, add proper logging, and always check your async/await error handling.",
        userId: users[2].id,
        groupId: groups[0].id,
      },
    }),
    prisma.posts.create({
      data: {
        text: "Just deployed my first Docker container! The learning curve was worth it. 🐳",
        userId: users[3].id,
        groupId: groups[0].id,
      },
    }),
    prisma.posts.create({
      data: {
        text: "What are your favorite VS Code extensions? I cant live without Prettier and ESLint!",
        userId: users[4].id,
        groupId: groups[0].id,
      },
    }),
  ]);
  posts.push(...techPosts);

  // Posts for Book Club
  const bookPosts = await Promise.all([
    prisma.posts.create({
      data: {
        text: 'Just finished reading "Atomic Habits" by James Clear. Highly recommend it for anyone looking to build better habits! 📚',
        userId: users[5].id,
        groupId: groups[1].id,
      },
    }),
    prisma.posts.create({
      data: {
        text: 'Currently reading "The Midnight Library" by Matt Haig. The concept of exploring different life paths is fascinating.',
        userId: users[6].id,
        groupId: groups[1].id,
      },
    }),
    prisma.posts.create({
      data: {
        text: 'Book recommendation: "Project Hail Mary" by Andy Weir. If you liked The Martian, youll love this!',
        userId: users[7].id,
        groupId: groups[1].id,
      },
    }),
    prisma.posts.create({
      data: {
        text: "What genre do you prefer? Im a big fan of sci-fi and fantasy, but trying to branch out into literary fiction.",
        userId: users[8].id,
        groupId: groups[1].id,
      },
    }),
    prisma.posts.create({
      data: {
        text: 'Just started "Dune" by Frank Herbert. The world-building is incredible! 🏜️',
        userId: users[9].id,
        groupId: groups[1].id,
      },
    }),
  ]);
  posts.push(...bookPosts);

  // Posts for Fitness Warriors
  const fitnessPosts = await Promise.all([
    prisma.posts.create({
      data: {
        text: "Just completed my first marathon! 26.2 miles of pure determination. 🏃‍♂️🏅",
        userId: users[10].id,
        groupId: groups[2].id,
      },
    }),
    prisma.posts.create({
      data: {
        text: "Morning workout done! Remember: consistency beats intensity every time. 💪",
        userId: users[11].id,
        groupId: groups[2].id,
      },
    }),
    prisma.posts.create({
      data: {
        text: "Sharing my meal prep routine: grilled chicken, brown rice, and steamed veggies. Simple but effective!",
        userId: users[12].id,
        groupId: groups[2].id,
      },
    }),
    prisma.posts.create({
      data: {
        text: "Tips for staying motivated: Set small achievable goals, track your progress, and find a workout buddy!",
        userId: users[13].id,
        groupId: groups[2].id,
      },
    }),
    prisma.posts.create({
      data: {
        text: "Just hit a new PR on deadlifts! 315 lbs! Hard work pays off. 🎯",
        userId: users[14].id,
        groupId: groups[2].id,
      },
    }),
  ]);
  posts.push(...fitnessPosts);

  console.log(`✅ Created ${posts.length} posts`);

  // Create Comments on posts
  console.log("💬 Creating comments...");
  const comments = [];

  // Comments on Tech Enthusiasts posts
  const techComments = await Promise.all([
    prisma.comments.create({
      data: {
        text: "Congrats! React is such a powerful library. What was the most challenging part?",
        postId: techPosts[0].id,
        userId: users[1].id,
      },
    }),
    prisma.comments.create({
      data: {
        text: "The pipeline operator will be a game-changer for functional programming in JS!",
        postId: techPosts[1].id,
        userId: users[2].id,
      },
    }),
    prisma.comments.create({
      data: {
        text: "Great tips! I also recommend using breakpoints in Chrome DevTools.",
        postId: techPosts[2].id,
        userId: users[3].id,
      },
    }),
    prisma.comments.create({
      data: {
        text: "Docker is amazing for development consistency. Have you tried Docker Compose yet?",
        postId: techPosts[3].id,
        userId: users[4].id,
      },
    }),
    prisma.comments.create({
      data: {
        text: "I love GitLens for VS Code! It shows git blame annotations inline.",
        postId: techPosts[4].id,
        userId: users[0].id,
      },
    }),
  ]);
  comments.push(...techComments);

  // Comments on Book Club posts
  const bookComments = await Promise.all([
    prisma.comments.create({
      data: {
        text: "Atomic Habits changed my life! The 1% improvement rule is so simple yet powerful.",
        postId: bookPosts[0].id,
        userId: users[6].id,
      },
    }),
    prisma.comments.create({
      data: {
        text: "The Midnight Library is on my reading list! How far along are you?",
        postId: bookPosts[1].id,
        userId: users[7].id,
      },
    }),
    prisma.comments.create({
      data: {
        text: "Project Hail Mary is fantastic! The science in it is so well-researched.",
        postId: bookPosts[2].id,
        userId: users[8].id,
      },
    }),
    prisma.comments.create({
      data: {
        text: 'I love fantasy too! Have you read "The Name of the Wind" by Patrick Rothfuss?',
        postId: bookPosts[3].id,
        userId: users[9].id,
      },
    }),
    prisma.comments.create({
      data: {
        text: "Dune is a masterpiece! The political intrigue is as compelling as the sci-fi elements.",
        postId: bookPosts[4].id,
        userId: users[5].id,
      },
    }),
  ]);
  comments.push(...bookComments);

  // Comments on Fitness Warriors posts
  const fitnessComments = await Promise.all([
    prisma.comments.create({
      data: {
        text: "Thats incredible! How long did you train for it?",
        postId: fitnessPosts[0].id,
        userId: users[11].id,
      },
    }),
    prisma.comments.create({
      data: {
        text: "So true! I try to work out at the same time every day to build the habit.",
        postId: fitnessPosts[1].id,
        userId: users[12].id,
      },
    }),
    prisma.comments.create({
      data: {
        text: "Meal prep is key! I usually prep on Sundays for the whole week.",
        postId: fitnessPosts[2].id,
        userId: users[13].id,
      },
    }),
    prisma.comments.create({
      data: {
        text: "Having a workout buddy makes such a difference! We keep each other accountable.",
        postId: fitnessPosts[3].id,
        userId: users[14].id,
      },
    }),
    prisma.comments.create({
      data: {
        text: "315 lbs is beast mode! Whats your next goal?",
        postId: fitnessPosts[4].id,
        userId: users[10].id,
      },
    }),
  ]);
  comments.push(...fitnessComments);

  console.log(`✅ Created ${comments.length} comments`);

  // Create Nested Comments (replies to comments)
  console.log("💬 Creating nested comments (replies)...");
  const nestedComments = await Promise.all([
    // Reply to first tech comment
    prisma.comments.create({
      data: {
        text: "State management was tricky at first, but Redux helped a lot!",
        postId: techPosts[0].id,
        userId: users[0].id,
        parentId: techComments[0].id,
      },
    }),
    // Reply to second tech comment
    prisma.comments.create({
      data: {
        text: "Cant wait to see how it simplifies data transformation pipelines!",
        postId: techPosts[1].id,
        userId: users[4].id,
        parentId: techComments[1].id,
      },
    }),
    // Reply to first book comment
    prisma.comments.create({
      data: {
        text: "The habit stacking technique is my favorite part!",
        postId: bookPosts[0].id,
        userId: users[8].id,
        parentId: bookComments[0].id,
      },
    }),
    // Reply to second book comment
    prisma.comments.create({
      data: {
        text: "Im about halfway through. The parallel lives concept is mind-bending!",
        postId: bookPosts[1].id,
        userId: users[6].id,
        parentId: bookComments[1].id,
      },
    }),
    // Reply to first fitness comment
    prisma.comments.create({
      data: {
        text: "I trained for 6 months. The long runs on weekends were the hardest part.",
        postId: fitnessPosts[0].id,
        userId: users[10].id,
        parentId: fitnessComments[0].id,
      },
    }),
    // Reply to second fitness comment
    prisma.comments.create({
      data: {
        text: "Same here! 6 AM workouts have become my favorite part of the day.",
        postId: fitnessPosts[1].id,
        userId: users[14].id,
        parentId: fitnessComments[1].id,
      },
    }),
  ]);
  comments.push(...nestedComments);

  console.log(`✅ Created ${nestedComments.length} nested comments`);

  // Create Reactions on posts
  console.log("❤️ Creating reactions...");
  const reactions = [];

  // Reactions for Tech Enthusiasts posts
  const techReactions = await Promise.all([
    prisma.reactions.create({
      data: {
        emoji: "👍",
        postId: techPosts[0].id,
        userId: users[1].id,
      },
    }),
    prisma.reactions.create({
      data: {
        emoji: "🚀",
        postId: techPosts[0].id,
        userId: users[2].id,
      },
    }),
    prisma.reactions.create({
      data: {
        emoji: "❤️",
        postId: techPosts[1].id,
        userId: users[3].id,
      },
    }),
    prisma.reactions.create({
      data: {
        emoji: "👍",
        postId: techPosts[2].id,
        userId: users[4].id,
      },
    }),
    prisma.reactions.create({
      data: {
        emoji: "🎉",
        postId: techPosts[3].id,
        userId: users[0].id,
      },
    }),
    prisma.reactions.create({
      data: {
        emoji: "👍",
        postId: techPosts[4].id,
        userId: users[1].id,
      },
    }),
  ]);
  reactions.push(...techReactions);

  // Reactions for Book Club posts
  const bookReactions = await Promise.all([
    prisma.reactions.create({
      data: {
        emoji: "📚",
        postId: bookPosts[0].id,
        userId: users[6].id,
      },
    }),
    prisma.reactions.create({
      data: {
        emoji: "❤️",
        postId: bookPosts[0].id,
        userId: users[7].id,
      },
    }),
    prisma.reactions.create({
      data: {
        emoji: "👍",
        postId: bookPosts[1].id,
        userId: users[8].id,
      },
    }),
    prisma.reactions.create({
      data: {
        emoji: "🚀",
        postId: bookPosts[2].id,
        userId: users[9].id,
      },
    }),
    prisma.reactions.create({
      data: {
        emoji: "👍",
        postId: bookPosts[3].id,
        userId: users[5].id,
      },
    }),
    prisma.reactions.create({
      data: {
        emoji: "🏜️",
        postId: bookPosts[4].id,
        userId: users[6].id,
      },
    }),
  ]);
  reactions.push(...bookReactions);

  // Reactions for Fitness Warriors posts
  const fitnessReactions = await Promise.all([
    prisma.reactions.create({
      data: {
        emoji: "🏅",
        postId: fitnessPosts[0].id,
        userId: users[11].id,
      },
    }),
    prisma.reactions.create({
      data: {
        emoji: "💪",
        postId: fitnessPosts[0].id,
        userId: users[12].id,
      },
    }),
    prisma.reactions.create({
      data: {
        emoji: "👍",
        postId: fitnessPosts[1].id,
        userId: users[13].id,
      },
    }),
    prisma.reactions.create({
      data: {
        emoji: "❤️",
        postId: fitnessPosts[2].id,
        userId: users[14].id,
      },
    }),
    prisma.reactions.create({
      data: {
        emoji: "🎯",
        postId: fitnessPosts[3].id,
        userId: users[10].id,
      },
    }),
    prisma.reactions.create({
      data: {
        emoji: "🔥",
        postId: fitnessPosts[4].id,
        userId: users[11].id,
      },
    }),
  ]);
  reactions.push(...fitnessReactions);

  console.log(`✅ Created ${reactions.length} reactions`);

  // Summary
  console.log("\n📊 Seed Summary:");
  console.log("================");
  console.log(`👥 Users: ${users.length}`);
  console.log(`📝 User Profiles: ${userProfiles.length}`);
  console.log(`🏢 Groups: ${groups.length}`);
  console.log(`📝 Group Profiles: ${groupProfiles.length}`);
  console.log(`👤 Group Memberships: ${groupMemberships.length}`);
  console.log(`📄 Posts: ${posts.length}`);
  console.log(`💬 Comments: ${comments.length}`);
  console.log(`💬 Nested Comments: ${nestedComments.length}`);
  console.log(`❤️ Reactions: ${reactions.length}`);
  console.log("================");
  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
