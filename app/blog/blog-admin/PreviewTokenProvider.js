"use client";

import { createContext, useContext } from "react";

const PreviewTokenContext = createContext("");

export function PreviewTokenProvider({ token, children }) {
  return (
    <PreviewTokenContext.Provider value={token ?? ""}>
      {children}
    </PreviewTokenContext.Provider>
  );
}

export function usePreviewToken() {
  return useContext(PreviewTokenContext);
}
