import { createContext, useContext } from "react";

// Admin jab kisi Sales user ka dashboard dekhta hai, to yahan salesUserId
// aur readOnly = true hota hai. Normal Sales user ke liye default (khaali).
const SalesScopeContext = createContext({
  salesUserId: null,
  readOnly: false,
});

export const SalesScopeProvider = SalesScopeContext.Provider;

export const useSalesScope = () => useContext(SalesScopeContext);

// API params: admin view mein salesUserId add hota hai, warna kuch nahi
export const scopeParams = (scope) =>
  scope.salesUserId ? { salesUserId: scope.salesUserId } : {};
