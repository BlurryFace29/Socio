import Embed from "./index";
import Modal from "../modal/Modal";
import { MouseEventHandler, useState } from "react";
import Image from 'next/image';

const EmbedImage: Embed = {
  regex: /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp)(?:\?\S*)?)/gi,
  Component: ({ match, index }) => {
    const [showModal, setShowModal] = useState(false);
    const onClick: MouseEventHandler<HTMLElement> = (e) => {
      e.stopPropagation();
      setShowModal(true);
    }
    return (
      <>
        <div
          key={match + index}
          className="relative w-full overflow-hidden object-contain my-2"
          style={{ height: '70vh' }}
        >
          <Image 
            onClick={onClick} 
            className="rounded cursor-pointer" 
            src={`https://imgproxy.iris.to/insecure/plain/${match}`}
            alt=""
            layout="fill"
            objectFit="contain"
          />
        </div>
        {showModal ? (
          <Modal onClose={() => setShowModal(false)}>
            <div className="relative h-[90vh] w-[90vw]">
              <Image 
                className="rounded" 
                src={`https://imgproxy.iris.to/insecure/plain/${match}`} 
                alt=""
                layout="fill"
                objectFit="contain"
              />
            </div>
          </Modal>
        ) : ''}
      </>
    );
  },
}

export default EmbedImage;


// import Embed from "./index";
// import Modal from "../modal/Modal";
// import {MouseEventHandler, useState} from "react";

// const Image: Embed = {
//   regex: /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp)(?:\?\S*)?)/gi,
//   component: ({ match, index }) => {
//     // dis bad?
//     // eslint-disable-next-line react-hooks/rules-of-hooks
//     const [showModal, setShowModal] = useState(false);
//     const onClick: MouseEventHandler<HTMLElement> = (e) => {
//       e.stopPropagation();
//       setShowModal(true);
//     }
//     return (
//       <>
//         <div
//           key={match + index}
//           className="relative w-full overflow-hidden object-contain my-2"
//         >
//           <img onClick={onClick} className="rounded max-h-[70vh] md:max-h-96 max-w-full cursor-pointer" src={
//             `https://imgproxy.iris.to/insecure/plain/${match}`
//           } />
//         </div>
//         {showModal ? (
//           <Modal onClose={() => setShowModal(false)}>
//             <img className="rounded max-h-[90vh] max-w-[90vw]" src={
//               `https://imgproxy.iris.to/insecure/plain/${match}`
//             } />
//           </Modal>
//         ) : ''}
//       </>
//     );
//   },
// }

// export default Image;