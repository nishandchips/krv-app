export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[var(--background)] flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
      <DynamicBackground unsplashAccessKey={process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY} />
      <Header />
      <ViewModeToggle />
      <main className="flex-1 overflow-y-auto px-4 md:px-0 pt-4">
        {children}
      </main>
    </div>
  );
} 