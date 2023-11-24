'use client';

import { usePathname } from 'next/navigation';
import Modal from '@/components/modal/Modal';
import NewPostForm from '@/components/NewPostForm';
import { useSession } from 'next-auth/react';

import {
  Cog8ToothIcon,
  HomeIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import {
  Cog8ToothIcon as Cog8ToothIconFull,
  HomeIcon as HomeIconFull,
  InformationCircleIcon as InformationCircleIconFull,
  ShieldCheckIcon as ShieldCheckIconFull,
  PlusIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';

export default function NavSidebar() {
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const { data: session } = useSession() || {};
  const loggedIn = !!session?.user;
  const address = session?.user ? (session.user as any).address : '';
  const username = session?.user ? (session.user as any).username : '';
  const pathname = usePathname();

  const APPLICATIONS = [
    { url: '/', text: 'Home', icon: HomeIcon, activeIcon: HomeIconFull },
    {
      url: '/settings',
      text: 'Settings',
      loggedInOnly: true,
      icon: Cog8ToothIcon,
      activeIcon: Cog8ToothIconFull,
    },
    {
      url: 'https://verify.blockto.in',
      text: 'Verify',
      icon: ShieldCheckIcon,
      activeIcon: ShieldCheckIconFull,
    },
    {
      url: '/about',
      text: 'About',
      icon: InformationCircleIcon,
      activeIcon: InformationCircleIconFull,
    },
  ];

  return (
    <aside className="sticky top-0 z-20 h-screen max-h-screen hidden md:w-16 lg:w-64 flex-col px-2 py-4 md:flex justify-between">
      <div>
        <nav className="space-y-2 lg:space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-2 mb-4 ml-[-4px]"
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src="/img/icon128.png" />
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
            <h1 className="hidden lg:flex text-3xl">Socio</h1>
          </Link>
          {APPLICATIONS.map((a, index) => {
            if (a.loggedInOnly && !loggedIn) return null;
            const isActive = a.url === pathname;
            const Icon = isActive ? a.activeIcon : a.icon;
            return (
              <div key={index}>
                {a.url.startsWith('http') ? (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex w-auto flex items-center space-x-4 p-3 rounded-full transition-colors duration-200 hover:bg-neutral-900`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className={`hidden lg:flex`}>{a.text}</span>
                    {a.text === 'Messages' && (
                      <span className="flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                        2
                      </span>
                    )}
                  </a>
                ) : (
                  <Link
                    href={a.url}
                    className={`inline-flex w-auto flex items-center space-x-4 p-3 rounded-full transition-colors duration-200 hover:bg-neutral-900`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className={`hidden lg:flex`}>{a.text}</span>
                    {a.text === 'Messages' && (
                      <span className="flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                        2
                      </span>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
        {loggedIn ? (
          <div className="flex lg:flex-row md:flex-col gap-2 mt-4">
            <div
              onClick={() => setShowNewPostModal(true)}
              className="btn btn-primary sm:max-md:btn-circle gap-3"
            >
              <PlusIcon width={20} height={20} className="text-white" />
              <div className="hidden lg:block text-white">New Post</div>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
      {loggedIn ? (
        <div>
          <Link
            href={`/${address}`}
            className="btn btn-ghost md:max-lg:btn-circle gap-1"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage
                src={session?.user?.image || '/default.png'}
                alt="pfp"
              />
              <AvatarFallback>PFP</AvatarFallback>
            </Avatar>
            <div className="hidden lg:block ml-2">
              <span style={{ textTransform: 'none' }}>{username}</span>
            </div>
          </Link>
        </div>
      ) : (
        ''
      )}
      {loggedIn && showNewPostModal ? (
        <Modal
          showContainer={true}
          onClose={() => setShowNewPostModal(false)}
          width={{ md: '2/5' }}
        >
          <div className="flex flex-col gap-4 bg-black w-full rounded-lg border-2 border-gray-500">
            <NewPostForm onSubmit={() => setShowNewPostModal(false)} />
          </div>
        </Modal>
      ) : (
        ''
      )}
    </aside>
  );
}
