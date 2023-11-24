import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type Props = { urlPostId: string, replies: number };

const Reactions = ({ urlPostId, replies }: Props) => {

  return (
    <>
      <hr className="-mx-4 opacity-10" />

      <div className="-m-4 flex flex-wrap">
        <Link href={`/${urlPostId}`} className="btn-ghost hover:bg-transparent text-neutral-500 hover:text-iris-blue btn w-1/4 content-center gap-2 rounded-none p-2">
          <ChatBubbleOvalLeftIcon width={18} />
          {replies > 0 && replies}
        </Link>
      </div>
    </>
  )
}

export default Reactions;
