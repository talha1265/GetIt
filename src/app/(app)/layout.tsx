import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex h-dvh max-w-[480px] flex-col overflow-hidden bg-background shadow-[0_0_60px_-20px_rgba(0,0,0,0.25)] sm:my-0">
      <TopBar />
      <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
