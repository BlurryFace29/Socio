'use client';

import { useState, useEffect, FC } from 'react';
import CardContainer from '@/components/CardContainer';
import { getCsrfToken, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAccount, useNetwork, useSignMessage } from 'wagmi';
import { ExtendedSiweMessage } from '@/utils/ExtendedSiweMessage';
import QRCode from "react-qr-code";
import { io } from "socket.io-client";
import Modal from 'react-modal';
import { ClipLoader } from 'react-spinners';

const SignupPage: FC = () => {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [sessionId, setSessionId] = useState('');
  const [qrCodeData, setQrCodeData] = useState();
  const [isHandlingVerification, setIsHandlingVerification] = useState(false);
  const [verificationCheckComplete, setVerificationCheckComplete] = useState(false);
  const [verificationMessage, setVerfificationMessage] = useState('');
  const [socketEvents, setSocketEvents] = useState<any[]>([]);

  const { signMessageAsync } = useSignMessage();
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();
  // const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const publicServerURL = "https://verifier.blockto.in";
  const localServerURL = "http://localhost:8080";

  const serverUrl = window.location.href.startsWith("https")
    ? publicServerURL
    : localServerURL;

  const socket = io(serverUrl);

  useEffect(() => {
    socket.on("connect", () => {
      setSessionId(socket.id);

      // only watch this session's events
      socket.on(socket.id, (arg) => {
        setSocketEvents((socketEvents) => [...socketEvents, arg]);
      });
    });
  }, []);

  // socket event side effects
  useEffect(() => {
    if (socketEvents.length) {
      const currentSocketEvent = socketEvents[socketEvents.length - 1];

      if (currentSocketEvent.fn === "handleVerification") {
        if (currentSocketEvent.status === "IN_PROGRESS") {
          setIsHandlingVerification(true);
        } else {
          setIsHandlingVerification(false);
          setVerificationCheckComplete(true);
          if (currentSocketEvent.status === "DONE") {
            setVerfificationMessage("✅ Verified proof");
            setTimeout(() => {
              reportVerificationResult(true);
            }, 2000);
            socket.close();
          } else {
            setVerfificationMessage("❌ Error verifying VC");
          }
        }
      }
    }
  }, [socketEvents]);

  // callback, send verification result back to app
  const reportVerificationResult = (result: boolean) => {
    handleSignUp(result, true);
  };

  function openInNewTab(url: string) {
    const win = window.open(url, "_blank");
    if (win) {
      win.focus();
    } else {
      // Handle the case where the window did not open
      console.error("Failed to open the new window");
    }
  }

  const handleSignUp = async (result: boolean, isVerified: boolean) => {
    try {
      if (result) {
        const callbackUrl = '/';
        const message = new ExtendedSiweMessage({
          domain: window.location.host,
          address: address,
          name: name,
          username: username,
          statement: 'Sign up with Polygon to Socio.',
          isVerified,
          uri: window.location.origin,
          version: '1',
          chainId: chain?.id,
          nonce: await getCsrfToken(),
        });
        const signature = await signMessageAsync({
          message: message.prepareMessage(),
        });
        signIn('credentials', {
          message: JSON.stringify(message),
          redirect: false,
          signature,
          callbackUrl,
        });
        router.push('/');
      }
    } catch (error) {
      console.log(error);
    }
  };

  function handleSignUpButton() {
    handleSignUp(true, false);
  }

  const getQrCodeApi = (sessionId: string, name: string) =>
    serverUrl + `/api/get-auth-qr?sessionId=${sessionId}&fullName=${encodeURIComponent(name)}`;

  const handleProveAccessRights = async () => {
    const fetchQrCode = async () => {
      const response = await fetch(getQrCodeApi(sessionId, name));
      const data = await response.text();
      return JSON.parse(data);
    };

    if (sessionId) {
      fetchQrCode().then(setQrCodeData).catch(console.error);
      // onOpen();
      setModalIsOpen(true);
    }
  };

  const customStyles = {
    content: {
      top: '45%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '18.5%',
      border: '1px solid #ccc',
      borderRadius: '10px',
      padding: '20px'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0)'
    }
  };

  return (
    <>
      <CardContainer>
        <div className="flex items-baseline gap-2 justify-center">
          <h1 className="text-2xl font-bold md:text-4xl">Socio</h1>
          {/* <h2 className="text-xs">
            Ensuring Content Authenticity in the Age of Deepfakes
          </h2> */}
        </div>
      </CardContainer>

      <CardContainer>
        <div className="form-control w-full">
          <input
            autoFocus={true}
            type="text"
            placeholder="Write your full name"
            className="input-bordered input-primary input w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-control w-full">
          <input
            autoFocus={true}
            type="text"
            placeholder="Choose your username"
            className="input-bordered input-primary input w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <button
          className="btn-primary btn"
          onClick={handleSignUpButton}
          disabled={!name || !username}
        >
          SignUp without Verifying
        </button>

        {sessionId ? (
          <button
            className="btn-primary btn"
            onClick={handleProveAccessRights}
            disabled={!name || !username}
          >
            Verify Using Polygon ID
          </button>
        ) : (
          <ClipLoader color={"#553C9A"} size={30} />
        )}

        {qrCodeData && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            style={customStyles}
          >
            {isHandlingVerification && (
              <div style={{ backgroundColor: 'white', padding: '20px'}}>
                <h1 style={{ color: 'black', fontWeight: 600 }}>Authenticating...</h1>
                <ClipLoader color={"#553C9A"} size={30} />
              </div>
            )}
            {qrCodeData && !isHandlingVerification && !verificationCheckComplete && (
              <>
                <h1 style={{ color: 'black', fontWeight: 600 }}>Scan this QR code from your Polygon ID Wallet App to prove your identity</h1>
                <div style={{ backgroundColor: 'white', padding: '20px' }}>
                  <QRCode value={JSON.stringify(qrCodeData)} />
                </div>
              </>
            )}
          </Modal>
        )}
      </CardContainer>
    </>
  );
};

export default SignupPage;
