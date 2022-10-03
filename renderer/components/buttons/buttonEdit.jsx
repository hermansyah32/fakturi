import React from "react";
import { getProps } from "../../helper/validator";

const ButtonEdit = ({ children, ...props }) => {
  return (
    <button
      type="button"
      className="inline-flex w-full justify-center rounded-md border border-transparent px-2 py-1 text-base text-white font-medium shadow-sm bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 sm:ml-3 sm:w-auto sm:text-sm"
      onClick={props.onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="#ffffff"
      >
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
      {getProps(children, "")}
    </button>
  );
};

export default ButtonEdit;
