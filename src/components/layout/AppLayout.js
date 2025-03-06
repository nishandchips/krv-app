export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[var(--background)] flex-col">
      <DynamicBackground unsplashAccessKey={process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY} />
      <Header />
      <ViewModeToggle />
      <main className="flex-1 px-4 md:px-0 pt-4">
        {children}
      </main>
    </div>
  );
} 