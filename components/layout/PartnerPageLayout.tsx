"use client";

import MobileHeader from "@/components/mobile/MobileHeader";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import DashboardNav from "@/components/layout/DashboardNav";
import PageShell from "@/components/layout/PageShell";

type PartnerPageLayoutProps = {
  eyebrow: string;
  title: string;
  description?: string;
  backHref?: string;
  children: React.ReactNode;
};

export default function PartnerPageLayout({
  eyebrow,
  title,
  description,
  backHref = "/client",
  children,
}: PartnerPageLayoutProps) {
  return (
    <>
      <MobileHeader title={title} subtitle="UNION" />

      <PageShell
        eyebrow={eyebrow}
        title={title}
        description={description}
        backHref={backHref}
      >
        <DashboardNav active="partner" variant="partner" />

        {children}
      </PageShell>

      <MobileBottomNav active="referrals" />
    </>
  );
}