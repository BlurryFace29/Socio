import { connectToDB } from '@/utils/database';
import Post from '@/models/post';
import User from '@/models/user';

export const GET = async (req, { params }) => {
  try {
    await connectToDB();

    const user = await User.findOne({ address: params.address });
    if (!user) return new Response('User not found', { status: 404 });

    const posts = await Post.find({ creator: user._id }).populate('creator');
    if (!posts.length)
      return new Response('No posts found for this user', { status: 404 });

    return new Response(JSON.stringify(posts), { status: 200 });
  } catch (error) {
    return new Response('Failed to fetch posts', { status: 500 });
  }
};
