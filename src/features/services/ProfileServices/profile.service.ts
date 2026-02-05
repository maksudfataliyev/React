import { ApiResponse } from "@/shared";
import { authHttp } from "./httpClient";
import type { UpdateClientRequestDTO, ClientProfileResponseDTO } from "@/features/services/ProfileServices/DTOs/profile.interfaces";


// Client profile
export async function getClientProfile(): Promise<ApiResponse<ClientProfileResponseDTO>> {
  const response = await authHttp.get<ApiResponse<ClientProfileResponseDTO>>(`/getProfile`);
  return response.data;
}

export async function editClientProfile(payload: UpdateClientRequestDTO): Promise<ApiResponse<ClientProfileResponseDTO>> {
  const response = await authHttp.put<ApiResponse<ClientProfileResponseDTO>>(`/updateProfile`, payload);
  return response.data;
}

// Get profile along with products for a client
export async function getProfileWithProducts(clientId: string): Promise<ApiResponse<any>> {
  const response = await authHttp.get<ApiResponse<any>>(`/getProfileWithProducts/${clientId}`);
  return response.data;
}

