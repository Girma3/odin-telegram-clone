import { format, parseISO, differenceInDays } from "date-fns";
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

export { formatDate, dateDifferenceFromNow, getTheTime, getMonthAndYear };
