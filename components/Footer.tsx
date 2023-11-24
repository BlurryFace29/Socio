'use client';

import {
  HomeIcon,
  PaperAirplaneIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconFull,
  PaperAirplaneIcon as PaperAirplaneIconFull,
  PlusCircleIcon as PlusCircleIconFull,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const { data: session } = useSession() || {};
  const address = session?.user ? (session.user as any).address : '';
  const pathname = usePathname();

  if (!address) return null;

  return (
    <div className="fixed md:hidden bottom-0 z-10 w-full bg-base-200 pb-safe-area-inset-bottom">
      <div className="flex w-full h-full items-stretch">
        <Link
          href="/"
          className="flex-grow flex items-center justify-center p-3"
        >
          {pathname === '/' ? (
            <HomeIconFull className="h-6 w-6" />
          ) : (
            <HomeIcon className="h-6 w-6" />
          )}
        </Link>
        <Link
          href="/post"
          className="flex-grow flex items-center justify-center p-3"
        >
          {pathname === '/post' ? (
            <PlusCircleIconFull className="h-6 w-6" />
          ) : (
            <PlusCircleIcon className="h-6 w-6" />
          )}
        </Link>
        <a
          href="https://verify.blockto.in"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-grow flex items-center justify-center p-3"
        >
          <PaperAirplaneIcon className="h-6 w-6" />
        </a>
        {address && (
          <Link
            href={`/${address}`}
            className="flex-grow flex items-center justify-center p-3"
          >
            <div
              className={`flex border-2 ${
                pathname === `/${address}`
                  ? 'border-white rounded-full'
                  : 'border-transparent'
              }`}
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={session?.user?.image || ''} />
                <AvatarFallback>PFP</AvatarFallback>
              </Avatar>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Footer;
