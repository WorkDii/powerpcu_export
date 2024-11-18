import { QueryMap } from "../../../lib/type.ts";
import { uploadDeleteItems } from "./delete.ts";
import { uploadNewItems } from "./newItem.ts";
import { uploadUpdateItems } from "./update.ts";

export const uploadData = async (queryMap: QueryMap) => {
  try {
    console.time(`uploadData ${queryMap.target_table}`);
    await uploadNewItems(queryMap);
    await uploadUpdateItems(queryMap);
    await uploadDeleteItems(queryMap);
  } catch (error) {
    throw error;
  } finally {
    console.timeEnd(`uploadData ${queryMap.target_table}`);
  }
};
