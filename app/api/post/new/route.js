import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/utils/database';
import User from '@/models/user';

const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK(process.env.PINATA_KEY, process.env.PINATA_SECRET);

export const POST = async (req) => {
  await connectToDB();

  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: session missing' }),
      { status: 401 }
    );
  }

  if (!session.user.address) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: user.address missing' }),
      { status: 401 }
    );
  }

  const { postData } = await req.json();
  const { content, files, replyingTo } = postData;
  console.log('Post Data:', postData);

  if (!postData) {
    return new Response(JSON.stringify({ error: 'Content is required' }), {
      status: 400,
    });
  }

  const currentTime = Date.now();

  try {
    const pinData = {
      content,
      files,
    };

    if (replyingTo) {
      let updatedReplyingTo = [replyingTo];

      const user = await User.findOne({ address: replyingTo.address });
      if (user) {
        replyingTo.username = user.username;

        const response = await fetch(
          `${process.env.PINATA_GATEWAY}/${replyingTo.cid}`
        );
        if (response.ok) {
          const fetchedContent = await response.json();
          if (fetchedContent.replyingTo) {
            updatedReplyingTo = [
              ...updatedReplyingTo,
              ...fetchedContent.replyingTo,
            ];
            updatedReplyingTo = updatedReplyingTo.filter(
              (item, index, self) =>
                index ===
                self.findIndex(
                  (t) => t.cid === item.cid && t.address === item.address
                )
            );
          }
        }
      }
      pinData.replyingTo = updatedReplyingTo;
    }

    const result = await pinata.pinJSONToIPFS(pinData, {
      pinataMetadata: {
        keyvalues: {
          type: 'post',
          address: session.user.address,
          timestamp: currentTime,
        },
      },
    });

    if (result.IpfsHash) {
      let postCreationData = {
        creator: session.user.id,
        cid: result.IpfsHash,
        timestamp: currentTime,
      };

      if (pinData.replyingTo) {
        postCreationData.replyingTo = pinData.replyingTo.map((reply) => ({
          cid: reply.cid,
          address: reply.address,
        }));
      }

      return new Response(JSON.stringify({ success: true, postCreationData }), {
        status: 200,
      });
    } else {
      return new Response(
        JSON.stringify({ error: 'Failed to upload to IPFS' }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    return new Response('Failed to upload to Pinata', { status: 500 });
  }
};
