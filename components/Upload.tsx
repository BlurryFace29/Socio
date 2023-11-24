'use client';
import { useState, ChangeEvent, useRef, ReactNode } from 'react';

type UploadedFile = {
  cid: string;
  name: string;
  fileType: 'image' | 'video';
};

type Props = {
  onFileUpload?: (file: UploadedFile) => void;
  onError?: (error: string) => void;
  children?: ReactNode;
}

const Upload = (props: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };  

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length) {
      const file = files[0];
      const fileType = file.type.split('/')[0];
      console.log("FILE TYPE: ", fileType)

      if (fileType !== 'image' && fileType !== 'video') {
        props.onError?.('Only image and video files are allowed.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      console.log("FILE RECIEVED: ", files[0])

      try {
        const response = await fetch('/api/post/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success && data.ipfsHash && props.onFileUpload) {
          const ipfsLink = `https://ivory-eligible-hamster-305.mypinata.cloud/ipfs/${data.ipfsHash}`;
          console.log('Upload success:', ipfsLink);
          props.onFileUpload({ cid: data.ipfsHash, name: file.name, fileType});
          resetInput();
        } else if (data.error && props.onError) {
          props.onError(data.error);
          resetInput();
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        props.onError?.('Upload failed: ' + error.message);
        resetInput();
      }
    }
  };

  return (
    <div className="inline-block" onClick={() => inputRef.current?.click()}>
      {props.children ? props.children : (
        <button className="btn btn-ghost btn-circle" onClick={(e) => e.preventDefault()}/>
      )}
      <input ref={inputRef} className="hidden" type="file" accept="image/*,video/*" onChange={handleFileUpload} />
    </div>
  );
};

export default Upload;
