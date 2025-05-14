import { useState } from "react";

export default function InfoIcon({info}: {info: string}) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        className="cursor-pointer"
        onClick={() => setShowInfo(!showInfo)}
      >
        <svg className="w-[30px] h-[30px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
        </svg>

      </div>

      {showInfo && (
        <div className="absolute right-0 top-full mt-2 bg-gray-700 text-white text-sm px-2 py-1 rounded shadow-md z-10 w-64">
          {info}
        </div>
      )}
    </div>
  );
}
