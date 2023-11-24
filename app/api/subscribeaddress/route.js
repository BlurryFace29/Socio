import User from '@/models/user';

export const POST = async (req) => {
  const { userId, subscribeAddress } = await req.json();

  if (!subscribeAddress) {
    return new Response(JSON.stringify({ error: 'Subscribe address is required' }), { status: 400 });
  }
  
  try {
    const user = await User.findById(userId);

    user.subscribeAddress = subscribeAddress;
    await user.save();

    return new Response(JSON.stringify({ message: 'Successfully updated user subscription details' }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
