import React from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { useScrollToElement } from "../hooks/useScrollToElement";

function Layout({ children }) {
  useScrollToElement();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Navigation />
      {children}
      <Footer />
    </div>
  );
}

export default Layout; 