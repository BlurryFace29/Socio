import { connectToDB } from '@/utils/database';
import Follow from '@/models/follow';

export const GET = async (req, { params }) => {
  try {
    const [address, type] = params.query.split(':');

    if (!type || !address) {
      return new Response('Required parameters missing', { status: 400 });
    }

    if (!['followers', 'following', 'both'].includes(type)) {
      return new Response('Invalid type provided', { status: 400 });
    }

    await connectToDB();

    let results = {};

    if (type === 'followers' || type === 'both') {
      const followers = await Follow.find({ followingId: address });
      results.followers = followers.map((f) => f.followerId);
    }

    if (type === 'following' || type === 'both') {
      const following = await Follow.find({ followerId: address });
      results.following = following.map((f) => f.followingId);
    }

    return new Response(JSON.stringify(results), { status: 200 });
  } catch (error) {
    console.error(error.message);
    return new Response(error.message, { status: 500 });
  }
};
