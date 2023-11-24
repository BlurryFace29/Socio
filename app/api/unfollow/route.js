import { connectToDB } from '@/utils/database';
import Follow from '@/models/follow';
import Unfollow from '@/models/unfollow';

export const POST = async (req) => {
  try {
    const { followerId, followingId } = await req.json();

    if (!followerId || !followingId) {
      return new Response('Required parameters missing', { status: 400 });
    }

    await connectToDB();

    const followedRelation = await Follow.findOneAndDelete({
      followerId,
      followingId,
    });
    if (!followedRelation) {
      return new Response('Follow relationship not found', { status: 404 });
    }

    const newUnfollow = new Unfollow({
      followerId,
      followingId,
      followTime: followedRelation.timestamp,
    });
    await newUnfollow.save();

    return new Response('Unfollowed successfully', { status: 200 });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
};
