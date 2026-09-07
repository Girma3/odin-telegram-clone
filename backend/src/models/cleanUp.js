import cron from "node-cron";
import PrismaGlobal from "./pool.js";

// This cron expression runs every mid night
cron.schedule(" 0 0 * * *", async () => {
  console.log("🔄 Starting database cleanup cron job...");

  try {
    // 1. Calculate the cutoff date (e.g., 30 days ago)
    const retentionDays = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // 2. Find all groups that have been soft-deleted longer than 30 days
    const expiredGroups = await PrismaGlobal.groups.findMany({
      where: {
        isDeleted: true,
        deletedAt: {
          lte: cutoffDate, // Less than or equal to the cutoff date
        },
      },
      select: { id: true },
    });

    if (expiredGroups.length === 0) {
      console.log("✅ No expired groups to clean up.");
      return;
    }

    console.log(`🗑️ Found ${expiredGroups.length} expired groups. Purging...`);

    // 3. Loop through and safely hard-delete each group using your transaction logic
    for (const group of expiredGroups) {
      await PrismaGlobal.$transaction([
        // Delete related data first to respect SQL foreign key constraints
        PrismaGlobal.groupMembers.deleteMany({ where: { groupId: group.id } }),
        PrismaGlobal.posts.deleteMany({ where: { groupId: group.id } }),
        PrismaGlobal.profile.deleteMany({ where: { groupId: group.id } }),
        // Finally, hard delete the group row
        PrismaGlobal.groups.delete({ where: { id: group.id } }),
      ]);
    }

    console.log("✨ Cron cleanup completed successfully.");
  } catch (error) {
    console.error("❌ Error running cleanup cron job:", error);
  }
});
