'use client';

import { useState } from 'react';

import Spinner from '../Spinner';
import HyperText from '@/components/HyperText';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const MSG_TRUNCATE_LENGTH = 500;
const MSG_TRUNCATE_LINES = 8;

type File = {
  cid: string;
  fileType: string;
};

const isTooLong = (content: string) => {
  return (
    content?.length > MSG_TRUNCATE_LENGTH ||
    content.split('\n').length > MSG_TRUNCATE_LINES
  );
};

const PostContent = ({
  content,
  files,
  post_cid,
  standalone,
}: {
  content: string;
  files: File[];
  post_cid: string;
  standalone: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(standalone);

  const tooLong = !standalone && isTooLong(content);
  const displayedContent =
    isExpanded || !tooLong
      ? content
      : content.slice(0, MSG_TRUNCATE_LENGTH) + '...';

  const router = useRouter();

  const handleImageClick = () => {
    router.push(`/post${post_cid}`);
  };

  return (
    <>
      {files?.map((file, index) => {
        if (file.fileType === 'image') {
          return (
            <div
              key={file.cid + index}
              className="relative max-h-[400px] h-[350px] mb-3 mt-3 flex rounded-md overflow-hidden"
            >
              <Image
                src={`https://ivory-eligible-hamster-305.mypinata.cloud/ipfs/${file.cid}`}
                alt="Embedded content"
                layout="fill"
                objectFit="contain"
                objectPosition="left"
                onClick={() => handleImageClick()}
              />
            </div>
          );
        } else if (file.fileType === 'video') {
          return (
            <div key={file.cid + index} className="mb-3 mt-3">
              <video controls width="100%">
                <source
                  src={`https://ivory-eligible-hamster-305.mypinata.cloud/ipfs/${file.cid}`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
          );
        }
        return null;
      })}

      <div
        className={`whitespace-pre-wrap ${standalone ? 'text-lg' : 'text-md'}`}
      >
        <HyperText>{displayedContent}</HyperText>
      </div>

      {tooLong && (
        <button
          className="text-iris-blue hover:underline"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </>
  );
};

export default PostContent;
