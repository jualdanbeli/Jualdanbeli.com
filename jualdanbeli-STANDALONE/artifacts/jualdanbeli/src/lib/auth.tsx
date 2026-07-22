import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGetMe, User } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("token"));
  const queryClient = useQueryClient();

  const setToken = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setTokenState(newToken);
  };

  const clearToken = () => {
    localStorage.removeItem("token");
    setTokenState(null);
    queryClient.clear();
  };

  const { data: user = null, isLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    } as any
  });

  useEffect(() => {
    if (error) {
      clearToken();
    }
  }, [error]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading && !!token,
        token,
        setToken,
        clearToken,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
