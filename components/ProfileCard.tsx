import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProfileDropdown from '@/components/ProfileDropdown';
import { CalendarDaysIcon, LinkIcon } from '@heroicons/react/24/outline';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type SessionUser = {
  name: string;
  email?: string;
  image?: string;
  address: string;
  id: string;
};

type User = {
  _id: string;
  address: string;
  username: string;
  timestamp: Date;
  bio?: string;
  email?: string;
  name?: string;
  profilePicture?: string;
  website?: string;
  isVerified?: boolean;
};

type SessionData = {
  user: SessionUser;
  expires: string;
};

const ProfileCard = ({ profileAddress }: { profileAddress: string }) => {
  const { data: session } = useSession() as { data: SessionData | null };

  const [isMyProfile, setIsMyProfile] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState(false);
  const [followCounts, setFollowCounts] = useState<{
    followers: string[];
    following: string[];
  } | null>(null);

  const handleFollow = async () => {
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followerId: session?.user?.id,
          followingId: profile?._id,
        }),
      });

      if (response.ok) {
        setIsFollowing(true);
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnfollow = async () => {
    try {
      const response = await fetch('/api/unfollow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followerId: session?.user?.id,
          followingId: profile?._id,
        }),
      });

      if (response.ok) {
        setIsFollowing(false);
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnfollowConfirm = async () => {
    handleUnfollow();
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      // day: 'numeric',
      timeZone: 'Asia/Kolkata',
    };
    return new Intl.DateTimeFormat('en-IN', options).format(new Date(date));
  };

  function removeHttp(url: string) {
    return url.replace(/(^\w+:|^)\/\//, '');
  }

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/user/${profileAddress}`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch profile for address: ${profileAddress}`
          );
        }
        const data = await response.json();

        if (JSON.stringify(data) !== JSON.stringify(profile)) {
          setProfile(data);
        }

      } catch (error) {
        console.error(error);
      }
    }

    async function fetchFollowingStatus() {
      if (profile && profile._id) {
        try {
          const response = await fetch(
            `/api/follow/isfollowing/${session?.user?.id}:${profile._id}`
          );
          const data = await response.json();
          setIsFollowing(data.isFollowing);
        } catch (error) {
          console.error('Failed to fetch following status:', error);
        }
      }
    }

    async function fetchFollowCounts() {
      if (profile && profile._id) {
        try {
          const res = await fetch(`/api/follow/count/${profile._id}:both`);
          const data = await res.json();
          setFollowCounts(data);
        } catch (error) {
          console.error('Failed to fetch follow counts:', error);
        }
      }
    }

    if (session?.user?.address === profileAddress) {
      setIsMyProfile(true);
    } else {
      setIsMyProfile(false);
    }
    fetchProfile().then(() => {
      fetchFollowingStatus();
      fetchFollowCounts();
    });
  }, [profileAddress, session, profile]);

  if (!profile) {
    return null;
  }

  return (
    <>
      <div
        className="mb-4 h-52 bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(120deg, #010101 0%, #1f0f26 50%, #010101 100%)',
        }}
      ></div>
      <div className="p-4 relative">
        <div className="flex gap-4 mb-2">
          <div className="flex flex-col w-32">
            <Avatar className="w-32 h-32 cursor-pointer rounded-full border border-solid border-4 border-black -mt-24">
              <AvatarImage
                src={profile?.profilePicture || '/default.png'}
                alt="pfp"
              />
              <AvatarFallback>PFP</AvatarFallback>
            </Avatar>
            {profile?.name ? (
              <>
                {profile?.isVerified ? (
                  <div className="text-xl font-bold mt-2 -mb-1 flex relative">
                    {profile.name}
                    <img
                      src="/verified.png"
                      className="h-7 w-7 ml-1"
                    />
                  </div>
                ): (
                  <div className="text-xl font-bold mt-2 -mb-1">{profile.name}</div>
                )}
                <div className="text-zinc-500 mt-1">@{profile.username}</div>
              </>
            ) : (
              profile?.username && (
                <>
                  {profile?.isVerified ? (
                    <div className="text-xl font-bold mt-2 -mb-1 flex relative">
                      {profile.username}
                      <img
                        src="/verified.png"
                        className="h-7 w-7 ml-1"
                      />
                    </div>
                  ): (
                    <div className="text-xl font-bold mt-2">{profile.username}</div>
                  )}
                  <div className="text-xl font-bold mt-2">{profile.username}</div>
                </>
              )
            )}
          </div>
          <div className="flex flex-col gap-3">
            {isMyProfile ? (
              <Link
                href="/profile/edit"
                className="btn btn-sm gap-2 absolute right-16 transform -translate-y-1/2"
              >
                Edit profile
              </Link>
            ) : isFollowing ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="btn btn-sm gap-2 absolute right-16 transform -translate-y-1/2"
                  >
                    {isHovered ? 'Unfollow' : 'Following'}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Unfollow @{profile.username}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Wouldn't unfollow if I were you!
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUnfollowConfirm}>
                      Yes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <button
                onClick={handleFollow}
                className="btn btn-sm gap-2 absolute right-16 transform -translate-y-1/2"
              >
                Follow
              </button>
            )}
            <ProfileDropdown address={profileAddress} profile={profile || {}} />
          </div>
        </div>

        {profile?.bio && <p className="text-sm mt-2 mb-3">{profile.bio}</p>}

        <div className="mt-1 flex items-center space-x-3 text-sm">
          {profile?.website && (
            <div className="flex items-center space-x-1">
              <LinkIcon className="h-4 w-4 text-violet-500" />
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-500 hover:underline"
              >
                {removeHttp(profile.website)}
              </a>
            </div>
          )}

          {profile?.timestamp && (
            <div className="flex items-center space-x-1">
              <CalendarDaysIcon className="h-4 w-4 text-zinc-500" />
              <span className="text-zinc-500">
                Joined {formatDate(profile.timestamp)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center space-x-3 text-sm">
          {followCounts && (
            <>
              <div className="flex items-center space-x-1">
                <span className="text-zinc-500">{`${followCounts.following.length} Following`}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-zinc-500">{`${followCounts.followers.length} Followers`}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileCard;
