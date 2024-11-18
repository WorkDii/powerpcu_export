import { QueryMap } from "../../../lib/type.ts";
import { uploadDeleteItems } from "./delete.ts";
import { uploadNewItems } from "./newItem.ts";
import { uploadUpdateItems } from "./update.ts";

export const uploadData = async (queryMap: QueryMap) => {
  await uploadNewItems(queryMap);
  // await uploadUpdateItems(queryMap);
  // await uploadDeleteItems(queryMap);
};
