export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-enter h-full w-full">{children}</div>;
}
