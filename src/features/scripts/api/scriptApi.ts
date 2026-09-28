import { axiosClient, getResponseData } from "../../../lib/axios";
import type { 
  Script, 
  PaginatedResponse, 
  ScriptStatus,
  ScriptListFilterDto,
  CreateScriptDto,
  UpdateScriptDto
} from "./types";

export const getScripts = async (
  filters: ScriptListFilterDto
): Promise<PaginatedResponse<Script>> => {
  const params: Record<string, any> = {
    pageNumber: filters.pageNumber,
    pageSize: filters.pageSize,
  };
  
  if (filters.searchKeyword) {
    params.searchKeyword = filters.searchKeyword;
  }
  if (filters.community && filters.community !== "All") {
    params.community = filters.community;
  }
  if (filters.status && filters.status !== "All") {
    params.status = filters.status;
  }
  
  return getResponseData(axiosClient.get("/admin/scripts", { params }));
};

export const getScriptById = async (id: string): Promise<Script> => {
  return getResponseData(axiosClient.get(`/admin/scripts/${id}`));
};

export const createScript = async (data: CreateScriptDto): Promise<Script> => {
  return getResponseData(axiosClient.post("/admin/scripts", data));
};

export const updateScript = async (id: string, data: UpdateScriptDto): Promise<Script> => {
  return getResponseData(axiosClient.put(`/admin/scripts/${id}`, data));
};

export const duplicateScript = async (id: string): Promise<Script> => {
  return getResponseData(axiosClient.post(`/admin/scripts/${id}/duplicate`));
};

export const updateScriptsStatus = async (
  ids: string[] | number[], 
  status: ScriptStatus
): Promise<void> => {
  return getResponseData(
    axiosClient.put("/admin/scripts/bulk-status", {
      scriptIds: ids.map(id => Number(id)),
      status,
    })
  );
};

export const deleteScripts = async (ids: string[] | number[]): Promise<void> => {
  return getResponseData(
    axiosClient.delete("/admin/scripts/bulk-delete", {
      data: {
        scriptIds: ids.map(id => Number(id)),
      }
    })
  );
};

export const translateScriptPreview = async (
  content: string, 
  targetLanguage: string,
  highlightPhrase?: string
): Promise<{ translatedText: string, translatedHighlight?: string | null }> => {
  return getResponseData(
    axiosClient.post("/admin/scripts/preview-translate", {
      content,
      targetLanguage,
      highlightPhrase
    })
  );
};

export const suggestGrammar = async (
  content: string
): Promise<{ suggestedContent: string; explanation: string }> => {
  return getResponseData(
    axiosClient.post("/admin/scripts/grammar-suggest", {
      content
    })
  );
};
