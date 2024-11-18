import { QueryMap } from "../../lib/type.ts";

const TARGET_DB = "data_hinfo";
export const getTableName = (queryMap: QueryMap) => {
  return {
    data: `${TARGET_DB}.${queryMap.target_table}_data`,
    sync: `${TARGET_DB}.${queryMap.target_table}_sync`,
    temp: `${TARGET_DB}.${queryMap.target_table}_data_temp`,
    target_db: TARGET_DB,
  };
};
