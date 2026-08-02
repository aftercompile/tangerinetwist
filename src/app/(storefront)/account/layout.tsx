import { Metadata } from "next";

// Applies to every /account/* route (dashboard, login, signup, order detail,
// password reset/update) without needing to touch each page individually —
// most of those pages are client components, which can't export `metadata`
// themselves. None of this is content that should appear in search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
