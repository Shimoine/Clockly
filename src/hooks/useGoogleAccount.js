import { useEffect, useState } from "react";

import {
  checkAuthStatus,
  getGoogleAccount,
  logoutGoogleAccount,
  startGoogleAuth,
} from "@/lib/api";

const GOOGLE_ACCOUNT_SESSION_KEY = "googleAccount";

function loadCachedGoogleAccount() {
  try {
    const cached = sessionStorage.getItem(GOOGLE_ACCOUNT_SESSION_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function cacheGoogleAccount(account) {
  if (!account) return;
  sessionStorage.setItem(GOOGLE_ACCOUNT_SESSION_KEY, JSON.stringify(account));
}

function clearCachedGoogleAccount() {
  sessionStorage.removeItem(GOOGLE_ACCOUNT_SESSION_KEY);
}

export function useGoogleAccount() {
  const cachedAccount = loadCachedGoogleAccount();
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(cachedAccount));
  const [account, setAccount] = useState(cachedAccount);

  useEffect(() => {
    checkAuthStatus().then((authenticated) => {
      setIsAuthenticated(authenticated);
      if (authenticated) {
        getGoogleAccount().then((googleAccount) => {
          if (!googleAccount) return;
          setAccount(googleAccount);
          cacheGoogleAccount(googleAccount);
        });
      } else {
        setAccount(null);
        clearCachedGoogleAccount();
      }
    });
  }, []);

  const login = () => {
    startGoogleAuth();
  };

  const logout = async () => {
    clearCachedGoogleAccount();
    await logoutGoogleAccount();
    window.location.reload();
  };

  return { account, isAuthenticated, login, logout };
}

export default useGoogleAccount;
