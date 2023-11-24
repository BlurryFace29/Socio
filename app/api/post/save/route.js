import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import Post from '@/models/post';
import { Wallet, ethers } from 'ethers';

const contractABI = [
  'function storeContent(string memory _cid, bytes memory _signature, address _userAddress) public',
  'event ContentStored(bytes indexed signature, string cid, address indexed userAddress, bytes20 indexed verificationId)',
];

const provider = new ethers.JsonRpcProvider(process.env.TRON_RPC_URL);
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  process.env.ContentAuthenticator_ADDRESS,
  contractABI,
  wallet
);

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

  const { postCreationData, signature } = await req.json();

  if (!postCreationData || !signature) {
    return new Response(
      JSON.stringify({ error: 'postCreationData and signature are required' }),
      { status: 400 }
    );
  }

  try {
    const bytesSignature = ethers.getBytes(signature);

    const tx = await contract.storeContent(
      postCreationData.cid,
      bytesSignature,
      session.user.address
    );

    const receipt = await tx.wait();

    const iface = new ethers.Interface(contractABI);

    let event;
    for (const log of receipt.logs) {
      const parsed = iface.parseLog(log);
      if (parsed.name === 'ContentStored') {
        event = parsed;
        break;
      }
    }

    if (event) {
      console.log('Event:', event);
      const verificationId = event.args.verificationId;

      postCreationData.signature = signature;
      postCreationData.verificationId = ethers
        .hexlify(verificationId)
        .substring(2);

      await Post.create(postCreationData);
      return new Response(
        JSON.stringify({
          success: true,
          cid: postCreationData.cid,
          verificationId,
        }),
        { status: 200 }
      );
    } else {
      throw new Error('VerificationId not received');
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response('Failed to save post', { status: 500 });
  }
};
