import { connectToDB } from '@/utils/database';
import Post from '@/models/post';

export const GET = async (req, { params }) => {
  try {
    await connectToDB();

    const repliedPosts = await Post.find({ "replyingTo.cid": params.cid });

    if (!repliedPosts || repliedPosts.length === 0) {
      return new Response("No posts found replying to the given CID", { status: 404 });
    }

    const postsWithContent = await Promise.all(repliedPosts.map(async (post) => {
      const response = await fetch(`${process.env.PINATA_GATEWAY}/${post.cid}`);
      const content = await response.json();
      return {
        post: {
          _id: post._id,
          creator: post.creator,
          signature: post.signature,
          cid: post.cid,
          timestamp: post.timestamp,
          replyingTo: post.replyingTo
        },
        content
      };
    }));
    
    return new Response(JSON.stringify(postsWithContent), { status: 200 });
  } catch (error) {
      return new Response("Failed to fetch replied posts", { status: 500 });
  }
}
