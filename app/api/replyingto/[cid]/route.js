import { connectToDB } from '@/utils/database';
import Post from '@/models/post';

export const GET = async (req, { params }) => {
  try {
    await connectToDB();

    const post = await Post.findOne({ cid: params.cid }).populate('creator');
    if (!post) return new Response('Post not found', { status: 404 });

    const response = await fetch(`${process.env.PINATA_GATEWAY}/${params.cid}`);
    if (!response.ok) {
      return new Response('Failed to fetch content from Pinata', {
        status: 500,
      });
    }
    const content = await response.json();

    return new Response(JSON.stringify({ post, content }), { status: 200 });
  } catch (error) {
    return new Response('Failed to fetch post', { status: 500 });
  }
};
