import {
  format,
  parseISO,
  differenceInDays,
  formatDistanceToNow,
} from "date-fns";
//2026-04-06T10:38:29.522Z
//format date
function formatDate(date) {
  return format(parseISO(date), "yyyy-MM-dd");
}
const getTheTime = (date) =>
  format(parseISO(date), "hh:mm a", { hour12: true });

function dateDifferenceFromNow(date) {
  return differenceInDays(new Date(), parseISO(date));
}
function getMonthAndYear(date) {
  return format(parseISO(date), "MMM yyyy");
}
function formatCommentTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  // Check if the comment is older than 7 days
  if (differenceInDays(now, date) > 7) {
    // Returns something clean like "Mar 2, 2026"
    return format(date, "MMM d, yyyy");
  }

  // Returns relative time like "5 minutes ago" or "2 days ago"
  return formatDistanceToNow(date, { addSuffix: true });
}

export {
  formatDate,
  dateDifferenceFromNow,
  getTheTime,
  getMonthAndYear,
  formatCommentTime,
};
