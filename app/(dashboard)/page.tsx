'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Feed from '@/components/Feed';
import NewPostForm from '@/components/NewPostForm';
import { useSession } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';

const HomeFeed = () => {
  const { data: session } = useSession() || {};

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prevPage) => prevPage + 1);
          }
        },
        { rootMargin: '100px' }
      );
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  function debounce(fn: Function, delay: number) {
    let timer: NodeJS.Timeout;
    return function (...args: any) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  }

  useEffect(() => {
    async function fetchAllPosts() {
      try {
        const response = await fetch(`/api/post/all/${page}`, {
          cache: 'no-store',
        });
        const fetchedPosts = await response.json();

        if (!response.ok) {
          console.error('Failed to fetch posts!');
          if (page === 1) {
            setIsEmpty(true);
          }
          return;
        }

        setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
        setHasMore(fetchedPosts.length > 0);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        if (page === 1) {
          setIsEmpty(true);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchAllPosts();
  }, [page]);

  useEffect(() => {
    const debouncedHandleScroll = debounce(() => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 500 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    }, 100); // 100ms delay

    window.addEventListener('scroll', debouncedHandleScroll);
    return () => window.removeEventListener('scroll', debouncedHandleScroll);
  }, [loading, hasMore]);

  if (loading) {
    return (
      <div className="flex items-center space-x-5 ml-2 mt-4">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-[500px]" />
          <Skeleton className="h-4 w-[450px]" />
        </div>
      </div>
    );
  }

  return (
    <>
      {session?.user ? (
        <div className="hidden md:block">
          <NewPostForm />
        </div>
      ) : null}
      <div style={{ overflowY: 'hidden' }}>
        <Feed posts={posts} isEmpty={isEmpty} />
      </div>
      <div
        ref={lastPostElementRef}
        style={{ height: '20px', background: 'transparent' }}
      />
    </>
  );
};

export default HomeFeed;
