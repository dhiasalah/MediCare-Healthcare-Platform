import Cookies from "js-cookie";

// Cookie names
export const TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

// Cookie options
const cookieOptions = {
  secure: process.env.NODE_ENV === "production", // Only secure in production
  sameSite: "lax" as const,
  path: "/",
};

export const cookieStorage = {
  // Set tokens
  setTokens: (accessToken: string, refreshToken: string) => {
    Cookies.set(TOKEN_COOKIE, accessToken, {
      ...cookieOptions,
      expires: 1, // 1 day for access token
    });
    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...cookieOptions,
      expires: 7, // 7 days for refresh token
    });
  },

  // Get access token
  getAccessToken: (): string | undefined => {
    return Cookies.get(TOKEN_COOKIE);
  },

  // Get refresh token
  getRefreshToken: (): string | undefined => {
    return Cookies.get(REFRESH_TOKEN_COOKIE);
  },

  // Clear all tokens
  clearTokens: () => {
    Cookies.remove(TOKEN_COOKIE, { path: "/" });
    Cookies.remove(REFRESH_TOKEN_COOKIE, { path: "/" });
  },

  // Check if tokens exist
  hasTokens: (): boolean => {
    return !!(Cookies.get(TOKEN_COOKIE) && Cookies.get(REFRESH_TOKEN_COOKIE));
  },
};
