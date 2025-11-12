import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "@/lib/api";
import { getErrorMessage } from "@/lib/errorHandler";
import { cookieStorage } from "@/lib/cookies";
import { showToast } from "@/hooks/useToast";

export type UserType = "doctor" | "patient" | "admin" | null;

interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  user_type: "doctor" | "patient" | "admin";
  specialization?: string;
  medical_license_number?: string;
  password_needs_reset?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  userType: UserType;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      userType: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          console.log("Attempting login for:", email);
          const response = await authAPI.login(email, password);
          console.log("Login response:", response);

          if (
            response.tokens?.access &&
            response.tokens?.refresh &&
            response.user
          ) {
            // Store tokens in cookies (only on client side)
            if (typeof window !== "undefined") {
              cookieStorage.setTokens(
                response.tokens.access,
                response.tokens.refresh
              );
              console.log("Tokens stored in cookies");
            }

            const authUser: AuthUser = {
              id: response.user.id,
              username: response.user.username,
              email: response.user.email,
              first_name: response.user.first_name,
              last_name: response.user.last_name,
              full_name:
                response.user.full_name ||
                `${response.user.first_name} ${response.user.last_name}`.trim(),
              user_type: response.user.user_type,
              specialization: response.user.specialization,
              medical_license_number: response.user.medical_license_number,
            };

            console.log("Setting auth user:", authUser);
            set({
              user: authUser,
              isAuthenticated: true,
              userType: response.user.user_type,
              isLoading: false,
              error: null,
            });

            // Small delay to ensure state is set before returning
            await new Promise((resolve) => setTimeout(resolve, 100));
            console.log("Login successful, returning user:", authUser);
            showToast.success(
              "Connexion réussie",
              `Bienvenue ${authUser.full_name}!`
            );
            return authUser;
          }

          console.log("Login failed: missing tokens or user data");
          const errorMsg = "Login failed";
          set({ isLoading: false, error: errorMsg });
          showToast.error("Échec de connexion", "Vérifiez vos identifiants");
          return null;
        } catch (error: unknown) {
          console.error("Login error:", error);
          const errorMessage = getErrorMessage(error);
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            userType: null,
          });
          showToast.error("Erreur de connexion", errorMessage);
          return null;
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          await authAPI.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Clear auth state regardless of API call result
          set({
            user: null,
            isAuthenticated: false,
            userType: null,
            isLoading: false,
            error: null,
          });
          showToast.success("Déconnexion réussie", "À bientôt !");
        }
      },

      setUser: (user: AuthUser) => {
        set({
          user,
          isAuthenticated: true,
          userType: user.user_type,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        if (typeof window === "undefined") return false;

        // Migrate from localStorage to cookies if needed
        const localAccessToken = localStorage.getItem("access_token");
        const localRefreshToken = localStorage.getItem("refresh_token");
        if (localAccessToken && localRefreshToken) {
          cookieStorage.setTokens(localAccessToken, localRefreshToken);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }

        const token = cookieStorage.getAccessToken();
        if (!token) {
          set({ isAuthenticated: false, user: null, userType: null });
          return false;
        }

        try {
          console.log("checkAuth: Making API call to getProfile...");
          set({ isLoading: true });
          const response = await authAPI.getProfile();
          console.log("checkAuth: Profile response:", response);

          // Handle both response.user and direct response formats
          const userData = response.user || response;

          if (userData && userData.id) {
            const authUser: AuthUser = {
              id: userData.id,
              username: userData.username,
              email: userData.email,
              first_name: userData.first_name,
              last_name: userData.last_name,
              full_name:
                userData.full_name ||
                `${userData.first_name} ${userData.last_name}`.trim(),
              user_type: userData.user_type,
              specialization: userData.specialization,
              medical_license_number: userData.medical_license_number,
            };

            console.log("checkAuth: Setting authenticated user:", authUser);
            set({
              user: authUser,
              isAuthenticated: true,
              userType: userData.user_type,
              isLoading: false,
            });
            return true;
          }

          console.log("checkAuth: No user data found in response:", {
            hasUser: !!response.user,
            hasId: !!userData?.id,
          });
          set({
            isAuthenticated: false,
            user: null,
            userType: null,
            isLoading: false,
          });
          return false;
        } catch (error) {
          console.error("checkAuth: API call failed:", error);
          set({
            isAuthenticated: false,
            user: null,
            userType: null,
            isLoading: false,
          });
          if (typeof window !== "undefined") {
            cookieStorage.clearTokens();
          }
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        userType: state.userType,
      }),
      skipHydration: false,
    }
  )
);
