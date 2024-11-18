import { QueryMap } from "../../../lib/type.ts";
import { uploadNewItem } from "./newItem.ts";

// uploadNewItem("test");

export const uploadData = async (queryMap: QueryMap) => {
  await uploadNewItem(queryMap);
};
