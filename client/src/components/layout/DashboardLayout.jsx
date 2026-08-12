import { useState } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-zinc-900">

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main application */}
      <div className="lg:pl-72">

        {/* Topbar */}
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Page content */}
        <main
          className="
            min-h-[calc(100vh-5rem)]
            px-5 py-6
            sm:px-6
            lg:px-8
            lg:py-8
          "
        >
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;