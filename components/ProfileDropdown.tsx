import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

type User = {
  _id: string;
  address: string;
  username: string;
  timestamp: Date;
  bio?: string;
  email?: string;
  name?: string;
  profilePicture?: string;
  website?: string;
};

const ProfileDropdown = ({
  address,
  profile,
}: {
  address: string;
  profile: User;
}) => {
  return (
    <div className="ml-auto absolute right-3 transform -translate-y-1/2">
      <div className="dropdown-left dropdown">
        <label
          tabIndex={0}
          className="btn-ghost btn-circle btn m-1 text-neutral-500"
        >
          <EllipsisHorizontalIcon width={24} />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu rounded-box w-40 bg-base-100 p-2 shadow-lg shadow-black"
        >
          <li>
            <button
              className="text-start text-xs"
              onClick={() =>
                navigator.clipboard.writeText(`${location.origin}/${address}`)
              }
            >
              Copy Link
            </button>
          </li>
          <li>
            <button
              className="text-start text-xs"
              onClick={() => navigator.clipboard.writeText(address)}
            >
              Copy Address
            </button>
          </li>
          <li>
            <button
              className="text-start text-xs"
              onClick={() =>
                navigator.clipboard.writeText(JSON.stringify(profile))
              }
            >
              Copy Profile Data
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileDropdown;
