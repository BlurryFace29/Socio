import { connectToDB } from '@/utils/database';
import Follow from '@/models/follow';

export const GET = async (req, { params }) => {
  try {
    await connectToDB();
    console.log('isfollowing recieved a request');

    const [followerId, followingId] = params.ids.split(':');

    const isFollowing = await Follow.findOne({ followerId, followingId });

    return new Response(JSON.stringify({ isFollowing: !!isFollowing }), {
      status: 200,
    });
  } catch (error) {
    return new Response('Failed to check following status', { status: 500 });
  }
};
