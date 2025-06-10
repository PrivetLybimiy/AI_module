export const refreshAccessToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      return null;
    }

    const response = await fetch(`${API_URL}/api/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("access_token", data.access);
      return data.access;
    } else {
      console.error("Refresh token error:", data);
      return null;
    }
  } catch (err) {
    console.error("Refresh token error:", err);
    return null;
  }
};