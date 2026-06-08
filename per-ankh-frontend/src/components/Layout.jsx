import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children, fullWidth = false, hideNavbar = false }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-slate-900">
      <Sidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="min-h-screen lg:ml-[72px] flex flex-col">
        {!hideNavbar && (
          <Navbar onMenuOpen={() => setMobileNavOpen(true)} />
        )}

        <main
          className={`flex-1 ${
            hideNavbar ? "" : "px-4 sm:px-6 lg:px-8 py-5 sm:py-6"
          } ${fullWidth ? "max-w-none" : "max-w-[1600px]"}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
