import Embed from './index';
import Link from 'next/link';

const Hashtag: Embed = {
  regex: /(?<=\s|^)(#\w+)/g,
  Component: ({ match, index, }) => {
    return (
      <Link
        key={match + index}
        href={`/search/${encodeURIComponent(match)}`}
        className="text-iris-blue hover:underline"
      >
        {' '}{match}{' '}
      </Link>
    );
  }
}

export default Hashtag;
