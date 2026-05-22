import { Header } from "@/components/Header";
import { RequireAuth } from "@/components/RequireAuth";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <Header />
      {children}
    </RequireAuth>
  );
}
