'use client';

import { memo, useState, useEffect } from 'react';

import PostCard from '@/components/Post/PostCard';
import { Skeleton } from '@/components/ui/skeleton';

type ReplyingToDB = {
  address: string;
  cid: string;
};

type Post = {
  _id: string;
  creator: {
    _id: string;
    email: string;
    username: string;
    address: string;
    profilePicture: string;
  };
  signature: string;
  verificationId: string;
  cid: string;
  timestamp: Date;
  replyingTo?: ReplyingToDB[];
};

type File = {
  cid: string;
  fileType: string;
};

type ReplyingTo = {
  address: string;
  username: string;
  cid: string;
};

type Content = {
  content: string;
  files: File[];
  replyingTo?: ReplyingTo[];
};

type AllPostData = {
  post: Post;
  content: Content;
};

const Post = ({ params }: { params: { address: string } }) => {
  const cid = params.address.substring(4);

  const [postData, setPostData] = useState<AllPostData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPost = async (cid: string) => {
    try {
      const response = await fetch(`/api/replyingto/${cid}`);
      if (response.ok) {
        const data: AllPostData = await response.json();
        setPostData(data);
      }
    } catch (error) {
      console.error('Error fetching replying to post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cid) {
      fetchPost(cid);
    }
  }, [cid]);

  if (isLoading) {
    return (
      <>
        <div className="flex items-center space-x-4 mt-6 ml-3 mb-6">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
        <div className="flex flex-col ml-3">
          <Skeleton className="h-3.5 w-[250px] mb-3" />
          <Skeleton className="h-3 w-[225px] mb-4" />
          <Skeleton className="h-2.5 w-[200px] mb-4" />
        </div>
      </>
    );
  }

  if (!postData) return <p>No post corresponding to this cid</p>;

  return (
    <>
      {!!postData?.post?.cid && (
        <PostCard
          key={postData.post.cid}
          post={postData.post}
          content={postData.content}
          showReplies={Infinity}
          standalone={true}
          showReplyForm={!!postData?.post?.creator?.address}
        />
      )}
    </>
  );
};

export default memo(Post);
