// app/quantframe/daily/layout.tsx
// Pyodide is now loaded globally via PyodideProvider in quantframe layout

export default function DailyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
