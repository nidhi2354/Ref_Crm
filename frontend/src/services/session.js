// Session helpers: expired token handling

const MESSAGE_KEY = "authMessage";

export const SESSION_EXPIRED_MESSAGE =
  "Your session has expired. Please log in again.";

// Token ke andar ka "exp" (seconds) padh ke dekhta hai ki expire hua ya nahi.
// Token padha na ja sake to expired nahi maante, server khud decide karega.
export function isTokenExpired(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload));

    return typeof exp === "number" && exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

export function clearSession() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
}

// Clear the login and leave a message for the login page
export function expireSession() {
  clearSession();

  try {
    sessionStorage.setItem(MESSAGE_KEY, SESSION_EXPIRED_MESSAGE);
  } catch {
    // Message is optional
  }
}

// Clear the login and send the user to the login page
export function handleSessionExpired() {
  expireSession();

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

export function readAuthMessage() {
  try {
    return sessionStorage.getItem(MESSAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function clearAuthMessage() {
  try {
    sessionStorage.removeItem(MESSAGE_KEY);
  } catch {
    // Nothing to clear
  }
}

// 401 on a request that carried a token = expired / invalid session.
// A 401 from the login request itself (wrong password) is left alone.
export function installSessionInterceptor(instance) {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const config = error.config || {};
      const hadToken = Boolean(
        config.headers?.Authorization || config.headers?.get?.("Authorization")
      );
      const isLogin = String(config.url || "").includes("/users/login");

      if (error.response?.status === 401 && hadToken && !isLogin) {
        handleSessionExpired();
      }

      return Promise.reject(error);
    }
  );
}
