'use client';

import Link from 'next/link';
import { ArrowLeftIcon, Cog8ToothIcon } from '@heroicons/react/24/solid';
import { usePathname, useParams, useRouter } from 'next/navigation';
import React, { MouseEventHandler } from 'react';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import Image from 'next/image';

import { useAccount, useNetwork, useSignMessage } from 'wagmi';
import { ExtendedSiweMessage } from '@/utils/ExtendedSiweMessage';

const navigateBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  window.history.back();
};

const NotLoggedInHeader = ({ onLoginClick }: { onLoginClick: () => void }) => {
  return (
    <>
      <div className="flex items-center md:hidden gap-2 p-3 text-2xl">
        <Image
          src="/img/icon128.png"
          alt="Socio Icon"
          width={36}
          height={36}
          className="rounded-full"
        />
        Socio
      </div>
      <div className="w-full flex items-center justify-end gap-2 p-2 h-14">
        <button
          type="button"
          onClick={onLoginClick}
          className="btn btn-sm btn-primary text-white"
        >
          Log In
        </button>
      </div>
    </>
  );
};

const HomeHeader = () => {
  return (
    <>
      <div className="flex items-center md:hidden gap-2 px-4 p-3 text-2xl mr-3">
        <Image
          src="/img/icon128.png"
          alt="Socio Icon"
          width={36}
          height={36}
          className="rounded-full"
        />
        Socio
      </div>
      <div className="hidden md:flex w-full flex items-center justify-center gap-2 p-3 mr-16 md:mr-0 h-14">
        Home
      </div>
    </>
  );
};

const BackNavHeader = () => {
  const pathname = usePathname();
  const params = useParams();
  const { data: session } = useSession() || {};

  const isMyProfile =
    pathname.startsWith('/0x') &&
    params.address === (session?.user as any).address;

  return (
    <>
      <div className="p-2">
        <a href="components/Header#" onClick={navigateBack}>
          <ArrowLeftIcon width={24} />
        </a>
      </div>
      {isMyProfile && (
        <div className="md:hidden flex items-center gap-2 p-3">
          <Link href="/settings">
            <Cog8ToothIcon width={28} />
          </Link>
        </div>
      )}
    </>
  );
};

const scrollUp: MouseEventHandler = (e) => {
  const target = e.target as HTMLElement;
  const selectors = ['a', 'input', 'button', '.btn'];

  const isMatch = selectors.some((selector) => target.closest(selector));

  if (!isMatch) {
    window.scrollTo(0, 0);
  }
};

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = (useSession() || {}) as any;

  const { signMessageAsync } = useSignMessage();
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();

  const handleSignIn = React.useCallback(async () => {
    try {
      if (!address) {
        console.log('Ethereum account is not available.');
        return;
      }

      const userResponse = await fetch(`/api/user/${address}`);
      if (userResponse.status === 404) {
        router.push('/signup');
        return;
      }

      const callbackUrl = '/';
      const message = new ExtendedSiweMessage({
        domain: window.location.host,
        address: address,
        statement: 'Sign in with Polygon to Socio.',
        uri: window.location.origin,
        version: '1',
        chainId: chain?.id,
        nonce: await getCsrfToken(),
      });
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });
      signIn('credentials', {
        message: JSON.stringify(message),
        redirect: false,
        signature,
        callbackUrl,
      });
    } catch (error) {
      console.log(error);
    }
  }, [address, router, chain?.id, signMessageAsync]);

  let content;
  if (!session?.user?.address && isConnected) {
    content = <NotLoggedInHeader onLoginClick={handleSignIn} />;
  } else if (pathname.length <= 1) {
    content = <HomeHeader />;
  } else {
    content = <BackNavHeader />;
  }

  return (
    <div className="sticky top-0 z-10 w-full cursor-pointer" onClick={scrollUp}>
      <div className="w-full bg-base-200 bg-black md:bg-opacity-50 md:shadow-lg md:backdrop-blur-lg">
        <div className="flex w-full items-center justify-between">
          {content}
        </div>
      </div>
    </div>
  );
};

export default Header;
