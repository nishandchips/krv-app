export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[var(--background)] flex-col">
      <DynamicBackground />
      <Header />
      <ViewModeToggle />
      <main className="flex-1 px-4 md:px-0 pt-4">
        {children}
      </main>
    </div>
  );
} 