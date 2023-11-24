import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/utils/database';
import User from '@/models/user';

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

  try {
    const { data } = await req.json();

    if (!data) {
      console.log('No data provided for update');
      return new Response(
        JSON.stringify({ error: 'No data provided for update' }),
        { status: 400 }
      );
    }

    const cleanedData = Object.fromEntries(
      Object.entries(data)
        .map(([key, value]) => {
          if (key === 'address' || key === 'timestamp') {
            return;
          }

          if (typeof value === 'string') {
            if (value.trim() === '') {
              if (key === 'username') {
                return;
              }
              return [key, null];
            }
            return [key, value.trim()];
          }

          return [key, value];
        })
        .filter((entry) => entry)
    );

    await User.findOneAndUpdate(
      { address: session.user.address },
      { $set: cleanedData },
      { new: true }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User data updated successfully',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user data:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update user data' }),
      { status: 500 }
    );
  }
};
