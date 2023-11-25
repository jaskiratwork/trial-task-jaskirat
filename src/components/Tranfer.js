import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import sha256 from "crypto-js/sha256";
import { RiFileCopy2Fill, RiFileCopy2Line } from "react-icons/ri";

function SwapSession({
  // sessionID,
  generateSessionId,
  userAddress,
  tokenContractAddress,
  tokenId,
  title,
}) {
  const [exchangeStore, setExchangeStore] = useState("URL");
  const [pageLoading, setPageLoading] = useState(false);
  const [issue, setIssue] = useState("");
  const [found, setFound] = useState(false);

  const handleCopyClick = () => {
    if (exchangeStore) {
      navigator.clipboard
        .writeText(exchangeStore)
        .then(() => {
          setFound(true);
          setTimeout(() => {
            setFound(false);
          }, 2000); // Reset found state to false after 2 seconds
        })
        .catch(() => setIssue("Failed to copy URL to clipboard-------->"));
    }
  };

  const createIdentity = async () => {
    try {
      setPageLoading(true);
      const id = await generateSessionId();
      setExchangeStore(id);
    } catch (error) {
      console.error(error.message);
    } finally {
      setPageLoading(false);
    }
  };

  // Use useEffect to log the updated exchangeStore after the state has been updated
  useEffect(() => {
    console.log("Updated URL-------->", exchangeStore);
  }, [exchangeStore]);
  
  useEffect(() => {
    console.log("exchangeStore-------->", exchangeStore);
    if (issue) {
      alert(issue);
      setIssue("");
    }
  }, [issue]);

  return (
    <div className="flex flex-col overflow-hidden items-center w-96">
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full focus:outline-none focus:shadow-outline-blue transition duration-300"
        onClick={createIdentity}
        disabled={pageLoading}
      >
        {pageLoading ? "Creating Session..." : "Create Swap Session"}
      </button>

      {exchangeStore && (
        <div className="flex flex-col items-center space-y-4 mt-5">
          <div className="bg-white p-4 rounded-md shadow-md">
            <QRCodeSVG value={exchangeStore} size={150} />
          </div>

          <div className="text-center">
            <p className="mb-2 font-semibold text-lg">Session URL:</p>
            <div className="flex items-center space-x-2 border p-2 rounded-full">
              <input
                type="url"
                value={exchangeStore}
                readOnly
                className="  rounded-md bg-transparent py-2 px-4 focus:outline-none w-full"
              />
              <span
                role="button"
                className="cursor-pointer text-blue-200 hover:underline"
                onClick={handleCopyClick}
              >
                {found ? (
                  <RiFileCopy2Fill size={20} />
                ) : (
                  <RiFileCopy2Line size={20} />
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {issue && <p className="text-red-500">{issue}</p>}
    </div>
  );
}

export default SwapSession;
