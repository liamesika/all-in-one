export const metadata = {
  title: 'E-commerce',
  description: 'Dashboard',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh">{children}</div>;
}
