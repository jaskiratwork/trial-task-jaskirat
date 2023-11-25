import React from 'react';
import { useRouter } from 'next/router';

function NFTDisplayBox({ session_id, userAddress, title }) {
  return (
<div className="nft-display-box border border-blue-500 p-4 rounded-md shadow-md my-4 bg-gradient-to-r from-blue-100 to-white">
  
  <p className="text-gray-800 mb-2 text-xl"><strong>Title:</strong> {title}</p>
  <p className="w-60 text-gray-800 mb-4 text-sm font-semibold truncate">User Address: {userAddress}</p>
  
</div>

  );
}

export default NFTDisplayBox;
