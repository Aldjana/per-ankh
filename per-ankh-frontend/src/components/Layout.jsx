import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <Sidebar />

      <div className="min-h-screen lg:ml-[280px]">
        <Navbar />

        <main className="px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}