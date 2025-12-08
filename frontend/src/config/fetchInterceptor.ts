import { buildApiPath } from "./api";
import { toast } from "react-toastify";

// Store original fetch
const originalFetch = window.fetch;

// Mutex for refreshing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      if (token) prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupFetchInterceptor = () => {
  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : input.url;

    // Skip interception for refresh token endpoint to avoid loops
    if (url.includes("/refresh-token")) {
      return originalFetch(input, init);
    }

    const response = await originalFetch(input, init);

    if (response.status === 429) {
      toast.error("Muitas requisições. Por favor, aguarde alguns instantes.");
      return response;
    }

    // Clone response to check body without consuming it for the caller
    const clonedResponse = response.clone();
    let isJwtExpired = false;

    if (response.status === 401) {
      isJwtExpired = true;
    } else if (response.status === 500) {
      try {
        const body = await clonedResponse.json();
        if (
          body &&
          (body.details === "jwt expired" || body.message === "jwt expired")
        ) {
          isJwtExpired = true;
        }
      } catch (e) {
        // ignore json parse error
      }
    }

    if (isJwtExpired) {
      if (isRefreshing) {
        // Return a promise that resolves when refreshing is done
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string) => {
              // Retry original request with new token
              const newHeaders = new Headers(init?.headers);
              newHeaders.set("Authorization", `Bearer ${newToken}`);
              resolve(originalFetch(input, { ...init, headers: newHeaders }));
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        isRefreshing = false;
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return response;
      }

      try {
        // Call refresh endpoint using originalFetch to avoid interception
        const refreshUrl = buildApiPath("/api/v1/auth/refresh-token");
        const refreshResponse = await originalFetch(refreshUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem("token", data.token);
          if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
          }

          // Notify app
          window.dispatchEvent(
            new CustomEvent("auth:token-refreshed", { detail: data.token })
          );

          // Process queue
          processQueue(null, data.token);
          isRefreshing = false;

          // Retry current request
          const newHeaders = new Headers(init?.headers);
          newHeaders.set("Authorization", `Bearer ${data.token}`);
          return originalFetch(input, { ...init, headers: newHeaders });
        } else {
          throw new Error("Refresh failed");
        }
      } catch (error) {
        processQueue(error, null);
        isRefreshing = false;
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return response; // Return original 401 response
      }
    }

    return response;
  };
};
