// app/quantframe/problems/coding/layout.tsx
// Pyodide is now loaded globally via PyodideProvider in quantframe layout

import { ProblemLayoutWrapper } from '../components/problem-layout-wrapper'

export default function CodingProblemsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProblemLayoutWrapper problemType="coding">
      {children}
    </ProblemLayoutWrapper>
  )
}