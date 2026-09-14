import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { msalInstance, loginRequest } from "./msalConfig";

interface User {
  name: string;
  email: string;
  givenName?: string;
}

const UserContext = createContext<User | null>(null);
export const useUser = () => useContext(UserContext);

const ADMIN_EMAILS = ["onuma@fgcsg.com"];
export const isAdmin = (user: User | null): boolean => {
  if (!user?.email) return false;
  return ADMIN_EMAILS.some(e => user.email.toLowerCase() === e.toLowerCase());
};

function AuthGate({ children }: { children: ReactNode }) {
  const { instance, inProgress, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (inProgress !== InteractionStatus.None) return;
    if (!isAuthenticated) {
      instance.loginRedirect(loginRequest).catch(console.error);
      return;
    }
    const account = accounts[0];
    instance.acquireTokenSilent({ ...loginRequest, account }).then(res => {
      fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${res.accessToken}` },
      })
        .then(r => r.json())
        .then(data => {
          setUser({
            name: data.displayName,
            email: data.mail || data.userPrincipalName,
            givenName: data.givenName,
          });
          setLoading(false);
        });
    }).catch(() => instance.loginRedirect(loginRequest));
  }, [isAuthenticated, inProgress, instance, accounts]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center p-10 rounded-2xl bg-slate-800">
          <div className="text-4xl mb-4">🔐</div>
          <div className="text-white font-bold text-lg mb-2">FGC 投資家適格性審査</div>
          <div className="text-slate-400 text-sm mb-6">Microsoft 365アカウントで認証中...</div>
          <div className="h-1 w-12 bg-blue-500 rounded mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthGate>{children}</AuthGate>
    </MsalProvider>
  );
}
