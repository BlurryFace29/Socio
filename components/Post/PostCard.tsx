'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CardContainer from '@/components/CardContainer';
import PostContent from '@/components/Post/PostContent';
import RelativeTime from '@/components/RelativeTime';
import Spinner from '@/components/Spinner';
import { Skeleton } from '@/components/ui/skeleton';
import NewPostForm from '@/components/NewPostForm';
import Reactions from './Reactions';
import Dropdown from './Dropdown';

import { useRouter } from 'next/navigation';
import { MouseEventHandler, useMemo, useState, useEffect } from 'react';

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

type Props = {
  post: Post;
  content: Content;
  showReplies?: number;
  standalone?: boolean;
  asReply?: boolean;
  asRepliedMessage?: boolean;
  asInlineQuote?: boolean;
  showReplyForm?: boolean;
};

type RepliedPosts = {
  post: Post;
  content: Content;
};

const PostCard = ({
  post,
  content,
  showReplies,
  standalone,
  asReply,
  asRepliedMessage,
  asInlineQuote,
  showReplyForm,
}: Props) => {
  const router = useRouter();
  const [repliedPosts, setRepliedPosts] = useState<RepliedPosts[]>([]);
  const [replyingToPostData, setReplyingToPostData] =
    useState<RepliedPosts | null>(null);

  const replyingToPost = content?.replyingTo?.[0]?.cid;
  const replyingToUsers: ReplyingTo[] = (content?.replyingTo || []).filter(
    (user, index, self) =>
      index === self.findIndex((t) => t.username === user.username)
  );

  const urlPostId = 'post' + post.cid;

  const onClick: MouseEventHandler = (e) => {
    if (standalone) return;
    const target = e.target as HTMLElement;
    const selectors = [
      'a',
      'button',
      '.btn',
      'video',
      'audio',
      'input',
      'textarea',
      'iframe',
      'img',
    ];

    const isMatch = selectors.some((selector) => target.closest(selector));

    if (!isMatch) {
      e.preventDefault();
      router.push(`/${urlPostId}`);
    }
  };

  const fetchRepliedPosts = async (cid: string) => {
    try {
      const response = await fetch(`/api/content/${cid}`);

      if (!response.ok) {
        setRepliedPosts([]);
        return;
      }

      const data: RepliedPosts[] = await response.json();
      const sortedData = data.sort(
        (a, b) =>
          new Date(a.post.timestamp).getTime() -
          new Date(b.post.timestamp).getTime()
      );
      setRepliedPosts(sortedData);
    } catch (error) {
      console.error('Error fetching replied posts:', error);
    }
  };

  const fetchReplyingToPost = async (cid: string) => {
    try {
      const response = await fetch(`/api/replyingto/${cid}`);
      if (response.ok) {
        const data: RepliedPosts = await response.json();
        setReplyingToPostData(data);
      }
    } catch (error) {
      console.error('Error fetching replying to post:', error);
    }
  };

  useEffect(() => {
    if (showReplies) {
      fetchRepliedPosts(post.cid);
    }
    if (standalone && replyingToPost) {
      fetchReplyingToPost(replyingToPost);
    }
  }, [post.cid, replyingToPost, standalone, showReplies]);

  if (!content) {
    return (
      <CardContainer>
        <div className="flex items-center space-x-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </CardContainer>
    );
  }

  return (
    <>
      {standalone && replyingToPostData ? (
        <PostCard
          post={replyingToPostData.post}
          content={replyingToPostData.content}
          asRepliedMessage={true}
          showReplies={0}
        />
      ) : (
        ''
      )}
      <CardContainer>
        <div
          className={`flex flex-col gap-2 ${
            standalone ? '' : 'cursor-pointer'
          }`}
          onClick={onClick}
        >
          <div className="flex items-center gap-2">
            <Link
              prefetch={false}
              href={`/${post.creator.address}`}
              className="flex items-center gap-3"
            >
              {post.creator.profilePicture ? (
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.creator.profilePicture} />
                  <AvatarFallback>PFP</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/default.png" />
                  <AvatarFallback>PFP</AvatarFallback>
                </Avatar>
              )}

              <div className="flex items-center gap-3">
                {post.creator.username && (
                  <h4 className="font-bold leading-5">
                    {post.creator.username.length > 25
                      ? post.creator.username.slice(0, 10) +
                        '...' +
                        post.creator.username.slice(-15)
                      : post.creator.username}
                  </h4>
                )}

                {post.timestamp && (
                  <div className="text-xs leading-5 opacity-50">
                    <RelativeTime date={new Date(post.timestamp)} />
                  </div>
                )}
              </div>
            </Link>

            <Dropdown
              urlPostId={urlPostId}
              content={content}
              verificationId={post.verificationId}
              address={post.creator.address}
              signature={post.signature}
            />
          </div>

          {replyingToPost && replyingToUsers && replyingToUsers.length ? (
            <small className="opacity-50 flex items-center gap-1">
              Replying to
              {replyingToUsers.slice(0, 3).map((user) => (
                <Link
                  prefetch={false}
                  href={`/${user.address}`}
                  key={`${post.cid}replyingTo${user.address}`}
                >
                  <span>{user.username}</span>
                </Link>
              ))}
              {replyingToUsers.length > 3 ? (
                <span className="opacity-50">
                  {' '}
                  and {replyingToUsers.length - 3} more
                </span>
              ) : (
                ''
              )}
            </small>
          ) : (
            ''
          )}

          <div className="flex flex-col gap-2 break-words">
            <PostContent
              content={content.content}
              files={content.files}
              post_cid={post.cid}
              standalone={standalone || false}
            />
          </div>
        </div>

        {!asInlineQuote ? (
          <Reactions urlPostId={urlPostId} replies={repliedPosts.length} />
        ) : (
          ''
        )}
      </CardContainer>
      {showReplyForm ? (
        <>
          <NewPostForm
            placeholder="Write your reply"
            replyingTo={{ address: post.creator.address, cid: post.cid }}
          />
          <hr className="-mx-4 mt-2 opacity-10" />
        </>
      ) : (
        ''
      )}
      {showReplies && repliedPosts.length
        ? repliedPosts.map((repliedPost) => (
            <PostCard
              post={repliedPost.post}
              content={repliedPost.content}
              key={repliedPost.post._id}
              showReplies={0}
              asReply={true}
            />
          ))
        : ''}
    </>
  );
};

export default PostCard;
