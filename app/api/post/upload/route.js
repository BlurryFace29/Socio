const { Readable } = require('stream');
const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK(process.env.PINATA_KEY, process.env.PINATA_SECRET);

export const POST = async (req) => {
  const data = await req.formData();
  const file = data.get('file');
  const fileType = data.get('fileType');

  if (!file) {
    return new Response(JSON.stringify({ error: 'File is required' }), {
      status: 400,
    });
  }

  if (fileType !== 'image' && fileType !== 'video') {
    return new Response(
      JSON.stringify({ error: 'Only image and video files are allowed' }),
      { status: 400 }
    );
  }

  const fileName = file.name || '0xdefault';

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    const result = await pinata.pinFileToIPFS(readableStream, {
      pinataMetadata: {
        name: fileName,
        keyvalues: {
          type: 'upload',
          fileType: fileType,
        },
      },
    });

    if (result.IpfsHash) {
      return new Response(
        JSON.stringify({ success: true, ipfsHash: result.IpfsHash }),
        { status: 200 }
      );
    } else {
      throw new Error('Failed to upload to IPFS');
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response('Failed to upload file', { status: 500 });
  }
};
