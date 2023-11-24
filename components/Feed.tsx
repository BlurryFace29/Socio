import { memo, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import EmbedImage from '@/components/embed/Image';
import Video from '@/components/embed/Video';
import ProxyImg from '@/components/ProxyImg';
import { Bars3Icon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';

import PostCard from '@/components/Post/PostCard';
import Modal from '@/components/modal/Modal';

const PAGE_SIZE = 6;
const LOAD_MORE_MARGIN = '0px 0px 2000px 0px';

const VideoIcon = (
  <svg width="18" viewBox="0 0 122.88 111.34" fill="currentColor">
    <path d="M23.59,0h75.7a23.68,23.68,0,0,1,23.59,23.59V87.75A23.56,23.56,0,0,1,116,104.41l-.22.2a23.53,23.53,0,0,1-16.44,6.73H23.59a23.53,23.53,0,0,1-16.66-6.93l-.2-.22A23.46,23.46,0,0,1,0,87.75V23.59A23.66,23.66,0,0,1,23.59,0ZM54,47.73,79.25,65.36a3.79,3.79,0,0,1,.14,6.3L54.22,89.05a3.75,3.75,0,0,1-2.4.87A3.79,3.79,0,0,1,48,86.13V50.82h0A3.77,3.77,0,0,1,54,47.73ZM7.35,26.47h14L30.41,7.35H23.59A16.29,16.29,0,0,0,7.35,23.59v2.88ZM37.05,7.35,28,26.47H53.36L62.43,7.38v0Zm32,0L59.92,26.47h24.7L93.7,7.35Zm31.32,0L91.26,26.47h24.27V23.59a16.32,16.32,0,0,0-15.2-16.21Zm15.2,26.68H7.35V87.75A16.21,16.21,0,0,0,12,99.05l.17.16A16.19,16.19,0,0,0,23.59,104h75.7a16.21,16.21,0,0,0,11.3-4.6l.16-.18a16.17,16.17,0,0,0,4.78-11.46V34.06Z" />
  </svg>
);

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
  isEmpty?: boolean;
  posts: Post[];
  loadMore?: () => void;
  showDisplayAs?: boolean;
};

type DisplayAs = 'feed' | 'grid';

type ImageOrVideo = {
  type: 'image' | 'video';
  url: string;
};

const Feed = ({ isEmpty, posts, loadMore, showDisplayAs }: Props) => {
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [contents, setContents] = useState<Content[]>([]);
  const [displayAs, setDisplayAs] = useState('feed' as DisplayAs);
  const [modalItemIndex, setModalImageIndex] = useState(null as number | null);
  const lastElementRef = useRef(null);

  useEffect(() => {
    if (posts.length < PAGE_SIZE) {
      return;
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        if (displayCount < posts.length) {
          setDisplayCount((prevCount) => prevCount + PAGE_SIZE);
        } else {
          loadMore?.();
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.0,
      rootMargin: LOAD_MORE_MARGIN,
    });

    const observeLastElement = () => {
      if (lastElementRef.current) {
        observer.observe(lastElementRef.current);
      }
    };

    observeLastElement();

    return () => {
      observer.disconnect();
    };
  }, [posts, displayCount, loadMore]);

  useEffect(() => {
    const fetchContents = async () => {
      const fetchedContents: Content[] = [];

      for (let i = 0; i < posts.length; i++) {
        try {
          const response = await fetch(
            `https://ivory-eligible-hamster-305.mypinata.cloud/ipfs/${posts[i].cid}`
          );
          const data: Content = await response.json();
          fetchedContents[i] = data;
        } catch (error) {
          console.error('Error fetching post content:', error);
          fetchedContents[i] = { content: '', files: [] };
        }
      }

      setContents(fetchedContents);
    };

    fetchContents();
  }, [posts]);

  const imagesAndVideos = useMemo(() => {
    const results = posts
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .flatMap((post, index) => {
        const postFiles = contents[index]?.files;
        console.log('Post files:', postFiles);
        if (!postFiles || postFiles.length === 0) return [];

        return postFiles.map((file) => ({
          type: file.fileType,
          url: `https://ivory-eligible-hamster-305.mypinata.cloud/ipfs/${file.cid}`,
        }));
      })
      .slice(0, displayCount);

    console.log('Results:', results);
    return results;
  }, [posts, contents, displayCount]) as ImageOrVideo[];

  const goToPrevImage = useCallback(() => {
    if (modalItemIndex === null) return;
    const prevImageIndex =
      (modalItemIndex - 1 + imagesAndVideos.length) % imagesAndVideos.length;
    setModalImageIndex(prevImageIndex);
  }, [modalItemIndex, imagesAndVideos.length]);

  const goToNextImage = useCallback(() => {
    if (modalItemIndex === null) return;
    const nextImageIndex = (modalItemIndex + 1) % imagesAndVideos.length;
    setModalImageIndex(nextImageIndex);
  }, [modalItemIndex, imagesAndVideos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextImage();
      } else if (e.key === 'ArrowLeft') {
        goToPrevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalItemIndex, goToNextImage, goToPrevImage]);

  if (isEmpty) return <p>No Posts</p>;

  const renderDisplayAsSelector = () => {
    if (showDisplayAs === false) return null;
    return (
      <div className="flex mb-px">
        <button
          className={`rounded-sm flex justify-center flex-1 p-3 ${
            displayAs === 'feed' ? 'bg-neutral-800' : 'hover:bg-neutral-900'
          }`}
          onClick={() => {
            setDisplayCount(PAGE_SIZE);
            setDisplayAs('feed');
          }}
        >
          <Bars3Icon width={24} height={24} />
        </button>
        <button
          className={`rounded-sm flex justify-center flex-1 p-3 ${
            displayAs === 'grid' ? 'bg-neutral-800' : 'hover:bg-neutral-900'
          }`}
          onClick={() => {
            setDisplayCount(PAGE_SIZE);
            setDisplayAs('grid');
          }}
        >
          <Squares2X2Icon width={24} height={24} />
        </button>
      </div>
    );
  };

  const renderGrid = () => {
    return (
      <div className="grid grid-cols-3 gap-px">
        {imagesAndVideos.map((item, index) => renderGridItem(item, index))}
      </div>
    );
  };

  const renderGridItem = (
    item: { url: string; type: 'image' | 'video' },
    index: number
  ) => {
    const url =
      item.type === 'video'
        ? `https://imgproxy.iris.to/thumbnail/638/${item.url}`
        : item.url;
    return (
      <div
        key={`feed${url}${index}`}
        className="aspect-square cursor-pointer relative bg-neutral-300 hover:opacity-80"
        ref={index === imagesAndVideos.length - 1 ? lastElementRef : null}
        onClick={() => {
          setModalImageIndex(index);
        }}
      >
        <ProxyImg
          square={true}
          width={319}
          src={url}
          alt=""
          className="w-full h-full object-cover"
        />
        {item.type === 'video' && (
          <div className="absolute top-0 right-0 m-2 shadow-md shadow-gray-500 ">
            {VideoIcon}
          </div>
        )}
      </div>
    );
  };

  const renderImageModal = () => {
    return modalItemIndex !== null ? (
      <Modal onClose={() => setModalImageIndex(null)}>
        <div className="relative w-full h-full flex justify-center">
          {imagesAndVideos[modalItemIndex].type === 'video' ? (
            <video
              className="rounded max-h-[90vh] max-w-[90vw] object-contain"
              src={imagesAndVideos[modalItemIndex].url}
              controls
              muted
              autoPlay
              loop
              poster={`https://imgproxy.iris.to/thumbnail/638/${imagesAndVideos[modalItemIndex].url}`}
            />
          ) : (
            <div
              style={{ width: '100%', height: '70vh', overflow: 'hidden' }}
              className="rounded-lg"
            >
              <Image
                className="object-contain"
                src={imagesAndVideos[modalItemIndex].url}
                alt="Modal Image"
                layout="fill"
              />
            </div>
          )}
          <div className="flex items-center justify-between w-full h-full absolute bottom-0 left-0 right-0">
            <div
              className="p-4"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevImage();
              }}
            >
              <button className="btn btn-circle btn-sm opacity-25 mr-2 flex-shrink-0">
                <ChevronLeftIcon width={20} />
              </button>
            </div>
            <div
              className="p-4 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                goToNextImage();
              }}
            >
              <button className="btn btn-circle btn-sm opacity-25 ml-2 flex-shrink-0">
                <ChevronRightIcon width={20} />
              </button>
            </div>
          </div>
        </div>
      </Modal>
    ) : (
      ''
    );
  };

  return (
    <>
      {renderDisplayAsSelector()}
      {renderImageModal()}
      <div>
        {displayAs === 'grid'
          ? renderGrid()
          : posts
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              )
              .slice(0, displayCount)
              .map((post, index, self) => {
                const isLastElement = index === self.length - 1;
                return (
                  <div
                    key={`global${post._id}${index}`}
                    ref={isLastElement ? lastElementRef : null}
                  >
                    <PostCard post={post} content={contents[index]} />
                  </div>
                );
              })}
      </div>
    </>
  );
};

export default memo(Feed);
