import "@std/dotenv/load";
import { directusClientAdmin } from "../lib/api.ts";
import {
  createCollection,
  createField,
  deleteCollection,
  updatePolicy,
} from "@directus/sdk";
import { pool } from "../lib/db.ts";
import { RowDataPacket } from "mysql2";

function getCollection(collection: string): any {
  return {
    collection,
    fields: [
      {
        field: "PRIMARY_KEY_HASH",
        type: "string",
        meta: {
          interface: "input",
          readonly: false,
          hidden: false,
        },
        schema: {
          is_primary_key: true,
          length: 255,
          has_auto_increment: false,
        },
      },
      {
        field: "user_created",
        type: "uuid",
        meta: {
          special: ["user-created"],
          interface: "select-dropdown-m2o",
          options: {
            template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
          },
          display: "user",
          readonly: true,
          hidden: true,
          width: "half",
        },
        schema: {},
      },
      {
        field: "date_created",
        type: "timestamp",
        meta: {
          special: ["date-created"],
          interface: "datetime",
          readonly: true,
          hidden: true,
          width: "half",
          display: "datetime",
          display_options: {
            relative: true,
          },
        },
        schema: {},
      },
      {
        field: "user_updated",
        type: "uuid",
        meta: {
          special: ["user-updated"],
          interface: "select-dropdown-m2o",
          options: {
            template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
          },
          display: "user",
          readonly: true,
          hidden: true,
          width: "half",
        },
        schema: {},
      },
      {
        field: "date_updated",
        type: "timestamp",
        meta: {
          special: ["date-updated"],
          interface: "datetime",
          readonly: true,
          hidden: true,
          width: "half",
          display: "datetime",
          display_options: {
            relative: true,
          },
        },
        schema: {},
      },
    ],
    schema: {},
    meta: {
      singleton: false,
    },
  };
}

function getFields(field: string, type: string) {
  if (type === "char" || type === "varchar" || type === "binary") {
    return {
      type: "string",
      meta: {
        interface: "input",
        special: null,
      },
      field,
    };
  } else if (type === "int" || type === "tinyint") {
    return {
      type: "integer",
      meta: {
        interface: "input",
        special: null,
      },
      field,
    };
  } else if (type === "bigint") {
    return {
      type: "bigInteger",
      meta: {
        interface: "input",
        special: null,
      },
      field,
    };
  } else if (type === "decimal" || type === "double") {
    return {
      type: "decimal",
      meta: {
        interface: "input",
        special: null,
      },
      field,
    };
  } else {
    throw new Error("Invalid field type");
  }
}

const listTablef43 = async () => {
  try {
    const [rows] = await pool.query<{ table_name: string } & RowDataPacket[]>(`
      SELECT table_name 
      FROM information_schema.tables
      where table_name like 'f43%_data'
      ORDER BY table_name;
    `);
    return rows.map((row) => row.table_name);
  } catch (error) {
    console.error("Error listing tables:", error);
    throw error;
  }
};

const listColumnFromTable = async (table: string) => {
  const [rows] = await pool.query<
    ({
      NUMERIC_PRECISION: number;
      NUMERIC_SCALE: number;
      DATA_TYPE: string;
      TABLE_NAME: string;
      COLUMN_NAME: string;
    } & RowDataPacket)[]
  >(
    `
    SELECT NUMERIC_PRECISION, NUMERIC_SCALE, DATA_TYPE, TABLE_NAME, COLUMN_NAME FROM information_schema.columns WHERE table_name = ?
  `,
    [table]
  );
  return rows;
};

async function createCollectionFromTable() {
  try {
    const tables = await listTablef43();
    for (const table of tables) {
      const targetTable = table.replace("_data", "");
      try {
        await directusClientAdmin?.request(deleteCollection(targetTable));
        await directusClientAdmin?.request(
          createCollection(getCollection(targetTable))
        );

        const columns = await listColumnFromTable(table);
        for (const column of columns) {
          if (column.COLUMN_NAME === "PRIMARY_KEY_HASH") continue;
          await directusClientAdmin?.request(
            createField(
              targetTable,
              getFields(column.COLUMN_NAME, column.DATA_TYPE)
            )
          );
        }
        await directusClientAdmin?.request(
          createField(targetTable, getFields("DELETE_FLAG", "int"))
        );
        console.log(`${targetTable} migrated`);
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    console.log("All tables migrated");
  }
}

async function addPolicyToCollection() {
  const tables = await listTablef43();

  for (const table of tables) {
    const collection = table.replace("_data", "");
    try {
      const policy = await directusClientAdmin?.request(
        updatePolicy("ab96a0b9-59b3-4bd0-9aaf-6bfe279c56f6", {
          permissions: {
            create: [
              {
                permissions: null,
                validation: null,
                fields: ["*"],
                presets: null,
                collection,
                action: "create",
              },
              {
                permissions: {
                  _and: [
                    {
                      PCUCODE: {
                        _eq: "$CURRENT_USER.ou",
                      },
                    },
                  ],
                },
                validation: null,
                fields: null,
                presets: null,
                collection,
                action: "read",
              },
              {
                permissions: {
                  _and: [
                    {
                      PCUCODE: {
                        _eq: "$CURRENT_USER.ou",
                      },
                    },
                  ],
                },
                validation: null,
                fields: null,
                presets: null,
                collection,
                action: "update",
              },
            ],
            update: [],
            delete: [],
          },
        } as any)
      );
      console.log("policy updated", policy);
    } catch (error) {
      console.log(error);
    }
  }
}
