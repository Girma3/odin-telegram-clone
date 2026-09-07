const apiUrl = import.meta.env.VITE_API_URL;

/* ------------------ TOKEN HELPERS ------------------ */

const setTokens = ({ accessToken, refreshToken }) => {
  if (typeof window !== "undefined") {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  }
};

const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};

const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }

  return null;
};

const getRefreshToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken");
  }
  return null;
};

/* ------------------ REFRESH TOKEN LOGIC ------------------ */

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${apiUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = await res.json();
  setTokens(data);
  return data.accessToken;
}

/* ------------------ AUTHENTICATED FETCH WRAPPER ------------------ */

async function fetchWithAuth(url, options = {}) {
  let accessToken = getAccessToken();

  // 1. Try request with current access token
  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
      "Content-Type": "application/json",
    },
  });

  // 2. If access token expired → try refresh
  if (res.status === 401) {
    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
      return res; // still 401
    }

    // 3. Retry original request with new access token
    res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  return res;
}

/* ------------------ AUTH ACTIONS ------------------ */

const login = async ({ username, email }) => {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");

  setTokens(data);
  return data;
};

const signup = async ({ username, email }) => {
  const response = await fetch(`${apiUrl}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email }),
  });
  const data = await response.json();

  if (!response.ok) throw new Error(data.message || "Signup failed");
  await setTokens(data);
  return data;
};

const logout = async () => {
  const refreshToken = getRefreshToken();

  const response = await fetch(`${apiUrl}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: refreshToken }),
  });

  clearTokens();
  return response.json();
};

/* ------------------ CURRENT USER ------------------ */

const getCurrentUser = async () => {
  const res = await fetchWithAuth(`${apiUrl}/auth/protected`, {
    method: "GET",
  });
  if (!res.ok) return { user: null };

  return res.json();
};

export {
  login,
  signup,
  logout,
  getCurrentUser,
  clearTokens,
  setTokens,
  getAccessToken,
  getRefreshToken,
  refreshAccessToken,
  fetchWithAuth,
};
