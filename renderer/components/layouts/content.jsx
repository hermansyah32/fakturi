import React from "react";

const Content = ({ children, ...props }) => {
  return (
    <div className="p-6 text-black min-h-0 mb-6">
      <div className="w-full">{children}</div>
    </div>
  );
};

export default Content;
