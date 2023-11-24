'use client';

import { memo, useState, useEffect } from 'react';
import ProfileCard from '@/components/ProfileCard';
import Feed from '@/components/Feed';
import { Skeleton } from '@/components/ui/skeleton';

const Profile = ({ params }: { params: { address: string } }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch(`/api/post/${params.address}`);
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [params.address]);

  if (loading) {
    return (
      <div className="flex flex-col ml-4 mt-32">
        <Skeleton className="h-32 w-32 rounded-full mb-4" />
        <div>
          <Skeleton className="h-4 w-[110px] mb-3" />
          <Skeleton className="h-3.5 w-[95px] mb-4" />
          <Skeleton className="h-2.5 w-[250px] mb-4" />
          <div className="flex space-x-4">
            <Skeleton className="h-2.5 w-[90px]" />
            <Skeleton className="h-2.5 w-[120px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 -mt-4">
        <ProfileCard profileAddress={params.address} />
      </div>
      <Feed posts={posts} />
    </>
  );
};

export default memo(Profile);
