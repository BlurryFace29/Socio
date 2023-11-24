import { connectToDB } from '@/utils/database';
import Post from '@/models/post';
import User from '@/models/user';

export const GET = async (req, { params }) => {
  try {
    await connectToDB();

    const limit = 10;
    const posts = await Post.find()
      .sort({ timestamp: -1 })
      .skip((params.page - 1) * limit)
      .limit(limit)
      .populate('creator');

    console.log('Page: ', params.page, '|', 'Returned Count: ', posts.length);

    if (!posts) return new Response('Posts not found', { status: 404 });

    return new Response(JSON.stringify(posts), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Failed to get posts', { status: 500 });
  }
};
