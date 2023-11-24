import {
  FC,
  MouseEventHandler,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import 'daisyui';

type Props = {
  onClose?: () => void;
  justifyContent?: string;
  showContainer?: boolean;
  centerVertically?: boolean;
  width?: {
    default?: string;
    md?: string;
  };
  height?: string;
  children?: ReactNode;
};

const Modal: FC<Props> = ({
  width = { default: 'full', md: '1/2' },
  height = 'auto',
  showContainer,
  children,
  onClose,
}) => {
  console.log('Modal.tsx: showContainer:', showContainer);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    },
    [onClose]
  );

  const handleOverlayClick: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    onClose?.();
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const responsiveWidth = `w-${width.default} md:w-${width.md}`;

  const content = showContainer ? (
    <div
      // className="bg-black rounded-lg shadow-lg p-5 border border-gray-700 w-full md:w-1/2"
      className={`bg-black rounded-lg shadow-lg p-5 border border-gray-700 ${responsiveWidth} ${
        height !== 'auto' ? `h-${height}` : ''
      }`}
      onClick={(e) => handleContainerClick(e)}
    >
      {children}
    </div>
  ) : (
    children
  );

  return (
    <div
      className="fixed top-0 left-0 z-40 w-full h-full bg-black bg-opacity-80 flex items-center justify-center overflow-y-auto overflow-x-hidden p-5"
      onClick={handleOverlayClick}
    >
      <div className="flex flex-col items-center w-full">{content}</div>
    </div>
  );
};

export default Modal;
