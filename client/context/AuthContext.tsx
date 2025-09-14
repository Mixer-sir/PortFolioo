import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface User {
  id: string;
  email: string;
  username: string;
}
interface AuthState {
  user: User | null;
  token: string | null;
}
interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({ user: null, token: null });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) setState({ token, user: JSON.parse(user) });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      login: (token: string, user: User) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setState({ token, user });
      },
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setState({ token: null, user: null });
      },
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
