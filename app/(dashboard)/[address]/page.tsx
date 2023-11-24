import Post from '@/app/(dashboard)/post/[address]/page';
import Profile from '@/app/(dashboard)/profile/[address]/page';

export default function Address({params}: {params: {address: string}}) {
  if (params.address.startsWith('post')) {
    return <Post params={params} />;
  } else {
    return <Profile params={params} />;
  }
}