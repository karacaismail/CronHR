/** Herhangi bir nesne satır olabilir; hücreler anahtarla okunur. */
export type Row = object & Record<string, unknown>;

export type ColumnType = "text" | "enum" | "number" | "date" | "badge" | "person" | "meter" | "money";

export interface ColumnDef {
  readonly key: string;
  readonly label: string;
  readonly type: ColumnType;
  /** enum için değer listesi; badge/meter için ton eşlemesi tablePresets'te. */
  readonly options?: readonly string[];
  readonly sortable?: boolean;
  readonly filter?: boolean;
  /** Kart modunda birincil satır olarak göster. */
  readonly primary?: boolean;
  /** Alt bilgi olarak gösterilecek ikinci alan (person tipi için). */
  readonly subKey?: string;
  readonly align?: "start" | "end";
  readonly width?: string;
  /** Kart modunda gizle. */
  readonly hideOnCards?: boolean;
}

export interface NumberRange {
  min?: number;
  max?: number;
}

export type FilterValue = string[] | NumberRange;

export interface TableQuery {
  search: string;
  filters: Record<string, FilterValue>;
  sort?: { key: string; dir: "asc" | "desc" };
}

export type SortDir = "asc" | "desc";
