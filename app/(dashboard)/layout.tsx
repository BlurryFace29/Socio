'use client';

import NavSidebar from '@/components/NavSidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex justify-center">
        <div className="flex w-full max-w-screen-xl justify-between relative">
          <NavSidebar />
          <section className="pb-16 md:pb-0 relative flex h-full w-full flex-col md:w-full lg:w-1/2">
            <Header />
            <div className="overflow-x-hidden">{children}</div>
          </section>
          <aside className="hidden sticky top-0 right-0 flex-col gap-4 z-20 px-10 py-5 lg:flex lg:w-80 h-screen max-h-screen">
            <ConnectButton showBalance={false} chainStatus="icon" />
          </aside>
          <Footer />
        </div>
      </main>
    </>
  );
}
