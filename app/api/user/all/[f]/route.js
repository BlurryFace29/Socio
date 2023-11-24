import { connectToDB } from '@/utils/database';
import User from '@/models/user';

export const GET = async (req, { params }) => {
  try {
    await connectToDB();
    const users = await User.find();

    if (!users) return new Response('Users not found', { status: 404 });

    // const headers = new Headers({
    //   'Cache-Control': 'no-cache, no-store, must-revalidate',
    // });

    return new Response(JSON.stringify(users), {
      status: 200,
      // headers: headers,
    });
  } catch (error) {
    return new Response('Failed to get users', { status: 500 });
  }
};

// we still have to figure out how to get solve the caching problem in static get routes
// using a dynamic route was kind of a hack to get around this
