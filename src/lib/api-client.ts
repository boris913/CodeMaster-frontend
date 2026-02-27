import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

export interface ApiResponse<T = unknown> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Interface pour les callbacks du store (évite l'import circulaire)
interface TokenCallbacks {
  onRefreshSuccess: (accessToken: string) => void;
  onRefreshFailure: () => void;
}

class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }> = [];

  // ✅ L'accessToken est stocké EN MÉMOIRE uniquement (plus de localStorage)
  private accessToken: string | null = null;

  // Callbacks injectés depuis le authStore pour éviter l'import circulaire
  private callbacks: TokenCallbacks | null = null;

  private constructor() {
    this.client = axios.create({
      // ✅ Assure-toi que NEXT_PUBLIC_API_URL = http://localhost:5000/api/v1
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      // ✅ CRITIQUE : envoie automatiquement le cookie httpOnly au backend
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Permet au authStore d'injecter ses callbacks une seule fois au démarrage.
   * Évite l'import circulaire ApiClient ↔ authStore.
   */
  public registerCallbacks(callbacks: TokenCallbacks): void {
    this.callbacks = callbacks;
  }

  // ✅ Méthodes publiques pour gérer l'accessToken en mémoire
  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  public clearAccessToken(): void {
    this.accessToken = null;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  private processQueue(error: unknown, token: string | null = null): void {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else if (token) {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private setupInterceptors(): void {
    // ✅ Request interceptor — injecte l'accessToken depuis la mémoire
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error: unknown) => Promise.reject(error)
    );

    // ✅ Response interceptor — gère le refresh via cookie httpOnly
    this.client.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        if (!axios.isAxiosError(error)) return Promise.reject(error);

        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          // Si un refresh est déjà en cours, on met la requête en file d'attente
          if (this.isRefreshing) {
            return new Promise<string>((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.client(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // ✅ Le refreshToken vient du cookie httpOnly automatiquement
            // grâce à withCredentials: true — on n'envoie rien dans le body
            const { data } = await axios.post<{ accessToken: string }>(
              `${this.client.defaults.baseURL}/auth/refresh`,
              {}, // Body vide
              { withCredentials: true }
            );

            const { accessToken } = data;

            // ✅ Stocker le nouveau token en mémoire
            this.accessToken = accessToken;

            // ✅ Informer le authStore du nouveau token
            this.callbacks?.onRefreshSuccess(accessToken);

            this.processQueue(null, accessToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.accessToken = null;

            // ✅ Informer le authStore de la déconnexion
            this.callbacks?.onRefreshFailure();

            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ── Méthodes HTTP ──────────────────────────────────────────────────────────

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  async uploadFile(url: string, file: File, fieldName = 'file'): Promise<AxiosResponse> {
    const formData = new FormData();
    formData.append(fieldName, file);
    return this.client.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}

export const apiClient = ApiClient.getInstance();