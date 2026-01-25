import { axiosClient } from '../../../lib/axios';
import type { LoginCredentials, AuthResponse } from '../types';

export const loginWithEmailAndPassword = async (data: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/Auth/login', data);
    // Interceptor returns response.data, so we cast it.
    return response as unknown as AuthResponse;
};
