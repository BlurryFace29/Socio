import { connectToDB } from '@/utils/database';
import Follow from '@/models/follow';

export const POST = async (req) => {
  try {
    const { followerId, followingId } = await req.json();

    if (!followerId || !followingId) {
      return new Response('Required parameters missing', { status: 400 });
    }

    await connectToDB();

    const newFollow = new Follow({ followerId, followingId });
    await newFollow.save();

    return new Response('Followed successfully', { status: 200 });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
};
