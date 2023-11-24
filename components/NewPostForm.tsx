'use client';

import React, { useState } from 'react';
import Avatar from '@/components/Avatar';
import Upload from '@/components/Upload';
import CardContainer from '@/components/CardContainer';
import Link from 'next/link';
import {
  PaperClipIcon,
  PhotoIcon,
  VideoCameraIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { useSignMessage } from 'wagmi';

type ReplyingTo = {
  address: string;
  cid: string;
};

interface Props {
  onSubmit?: (event: Event) => void;
  replyingTo?: ReplyingTo;
  placeholder?: string;
}

type UploadedFile = {
  cid: string;
  name: string;
  fileType: 'image' | 'video';
};

const NewPostForm: React.FC<Props> = ({
  onSubmit,
  replyingTo,
  placeholder,
}) => {
  const { data: session } = useSession() || {};
  const [postText, setPostText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const textAreaRef = React.useRef(null);
  const { signMessageAsync } = useSignMessage();

  const updateTextAreaHeight = () => {
    if (!textAreaRef.current) return;
    const current = textAreaRef.current as HTMLTextAreaElement;
    current.style.height = 'inherit';
    current.style.height = `${current.scrollHeight}px`;
  };

  const handlePostTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
    updateTextAreaHeight();
  };

  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFiles([...uploadedFiles, file]);
  };

  const handleRemoveFile = (cid: string) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.filter((file) => file.cid !== cid)
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPosting(true);

    const postData = {
      content: postText,
      files: uploadedFiles,
      ...(replyingTo && { replyingTo }),
    };

    try {
      const response = await fetch('/api/post/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postData }),
      });

      const data = await response.json();

      if (data.success) {
        const signature = await signMessageAsync({
          message: data.postCreationData.cid,
        });

        const saveResponse = await fetch('/api/post/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postCreationData: data.postCreationData,
            signature,
          }),
        });

        const saveData = await saveResponse.json();

        if (saveData.success) {
          console.log('Successfully posted:', data.postCreationData.cid);
          setPostText('');
          setUploadedFiles([]);
          onSubmit?.(data);
        } else {
          console.error('Error saving post:', saveData.error);
        }
      } else {
        console.error('Error posting:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const myAddress = (session?.user as any)?.address || '';

  return (
    <CardContainer>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-start">
          <Link href={`/${myAddress}`} className="mr-4">
            <Avatar picture={session?.user?.image || ''} />
          </Link>
          <div className="flex-grow">
            <textarea
              ref={textAreaRef}
              onFocus={() => setIsExpanded(true)}
              id="postText"
              name="postText"
              value={postText}
              onChange={handlePostTextChange}
              className="p-2 mt-1 w-full h-12 bg-black focus:ring-blue-500 focus:border-blue-500 block w-full text-lg border-gray-700 rounded-md text-white"
              placeholder={placeholder || "What's on your mind?"}
            />
          </div>
        </div>
        {isExpanded && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-start items-center space-x-2">
              <Upload
                onFileUpload={handleFileUpload}
                onError={(e) => setUploadError(e)}
              >
                <button
                  className="btn btn-ghost btn-circle"
                  onClick={(e) => e.preventDefault()}
                >
                  <PaperClipIcon width={24} />
                </button>
              </Upload>
              {uploadedFiles.map((file) => (
                <div key={file.cid} className="flex items-center space-x-1">
                  {file.fileType === 'image' ? (
                    <PhotoIcon width={20} />
                  ) : (
                    <VideoCameraIcon width={20} />
                  )}
                  <span className="text-sm">{file.name}</span>
                  <button
                    onClick={() => handleRemoveFile(file.cid)}
                    className="text-purple-500 hover:text-purple-600"
                  >
                    <XMarkIcon width={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                isPosting ||
                (postText.length === 0 && uploadedFiles.length === 0)
              }
            >
              {isPosting ? 'Posting...' : 'Post'}
            </button>
          </div>
        )}
        {uploadError && <p className="text-warning">{uploadError}</p>}
      </form>
    </CardContainer>
  );
};

export default NewPostForm;
