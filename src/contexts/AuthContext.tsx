import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { getCreditStatus, type CreditStatus } from "@/lib/credit-packages";

interface WalletState {
  credits: number;
  overdraftLimit: number;
  status: CreditStatus;
  autoRechargeEnabled: boolean;
  autoRechargeThreshold: number;
  autoRechargePackage: string | null;
  loading: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: { id: string; full_name: string | null; email: string | null; org_id: string | null } | null;
  roles: string[];
  wallet: WalletState;
  refreshWallet: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, loading: true, profile: null, roles: [],
  wallet: { credits: 0, overdraftLimit: -10, status: "paused", autoRechargeEnabled: false, autoRechargeThreshold: 10, autoRechargePackage: null, loading: true },
  refreshWallet: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [wallet, setWallet] = useState<WalletState>({
    credits: 0, overdraftLimit: -10, status: "paused", autoRechargeEnabled: false, autoRechargeThreshold: 10, autoRechargePackage: null, loading: true,
  });

  const checkWallet = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-wallet");
      if (error) throw error;
      setWallet({
        credits: data.credits ?? 0,
        overdraftLimit: data.overdraft_limit ?? -10,
        status: getCreditStatus(data.credits ?? 0),
        autoRechargeEnabled: data.auto_recharge_enabled ?? false,
        autoRechargeThreshold: data.auto_recharge_threshold ?? 10,
        autoRechargePackage: data.auto_recharge_package ?? null,
        loading: false,
      });
    } catch {
      setWallet(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        setTimeout(() => {
          fetchProfile(nextSession.user.id);
          fetchRoles(nextSession.user.id);
          checkWallet();
        }, 0);
      } else {
        setProfile(null);
        setRoles([]);
        setWallet({ credits: 0, overdraftLimit: -10, status: "paused", autoRechargeEnabled: false, autoRechargeThreshold: 10, autoRechargePackage: null, loading: false });
      }

      setLoading(false);
    });

    return () => authSub.unsubscribe();
  }, [checkWallet]);

  // Auto-refresh wallet every 60s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkWallet, 60000);
    return () => clearInterval(interval);
  }, [user, checkWallet]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, org_id")
      .eq("user_id", userId)
      .single();
    if (!error) setProfile(data);
  };

  const fetchRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (!error) setRoles(data?.map((r: any) => r.role) ?? []);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, roles, wallet, refreshWallet: checkWallet, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
