import { addHours } from "date-fns";

function isDateValid(dateStr: string) {
  return !isNaN(new Date(dateStr).getTime());
}

export const isShouldExecuteExport = async (export_every_hours: number) => {
  try {
    const data = await Deno.readTextFile("./export/latest_execute_time.txt");
    if (!isDateValid(data)) {
      throw new Error("latest execute time is not a date");
    }
    const latestExecuteTime = new Date(data);
    const compareTime = addHours(new Date(), export_every_hours * -1);
    return latestExecuteTime < compareTime ? true : false;
  } catch (error) {
    return true;
  }
};
