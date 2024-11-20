export interface Ou {
  code5: string;
  user_created: string;
  date_created: Date;
  user_updated?: string;
  date_updated?: Date;
  name: string;
  code9: string;
  district: string;
  subdistrict: string;
  note?: string;
  export_every_hours: number;
  query_map: QueryMapOu[];
}

export interface QueryMapOu {
  query_map_id?: QueryMap;
}

export interface QueryMap {
  id: string;
  user_created: string;
  date_created: Date;
  user_updated?: string;
  date_updated?: Date;
  is_active: boolean;
  target_table: string;
  version: string;
  query: string;
  field_primary_key: string;
}
