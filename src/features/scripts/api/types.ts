export type ScriptStatus = "Published" | "Draft";
export const ScriptStatusNames = {
  "Published": "Published",
  "Draft": "Draft",
};

export interface ScriptHighlight {
  id: number;
  phrase: string;
  note?: string;
}

export interface ScriptHighlightCreate {
  phrase: string;
  note?: string;
}

export type LanguageType = "Chinese" | "English" | "Vietnamese" | "Japanese"; 

export interface Script {
  id: number;
  title: string;
  topic?: string;
  content: string;
  highlightPhrase?: string;
  isParagraphTranslationEnabled: boolean;
  defaultTranslationLanguage: LanguageType;
  translateHighlightPhrase: boolean;
  allowTranslationErrorReports: boolean;
  autoIpa: boolean;
  showOnHome: boolean;
  status: ScriptStatus;
  displayOrder: number;
  createdAt: string; // ISO date string
  
  communities: LanguageType[];
  highlights: ScriptHighlight[];
}

export interface PaginatedResponse<T> {
  data: T[];
  totalRecords: number;
  page: number;
  pageSize: number;
  additionalData: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }
}

export interface CreateScriptDto {
  title: string;
  topic?: string;
  content: string;
  highlightPhrase?: string;
  isParagraphTranslationEnabled: boolean;
  defaultTranslationLanguage: LanguageType;
  translateHighlightPhrase: boolean;
  allowTranslationErrorReports: boolean;
  autoIpa: boolean;
  showOnHome: boolean;
  status: ScriptStatus;
  displayOrder: number;
  communities: LanguageType[];
  highlights: ScriptHighlightCreate[];
}

export interface UpdateScriptDto extends CreateScriptDto {
}

export interface ScriptListFilterDto {
  searchKeyword?: string;
  community?: LanguageType | "All";
  status?: ScriptStatus | "All";
  pageNumber: number;
  pageSize: number;
}
