import React from "react";

const StaticCard = ({ children, ...props }) => {
  return (
    <div className="w-full mx-auto bg-white rounded-sm mb-6">
      <div className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-white bg-gray-800 rounded-t-lg focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
        {props.title}
      </div>
      <div className="px-4 pt-4 pb-2 text-sm text-gray-500">{children}</div>
    </div>
  );
};

export default StaticCard;
