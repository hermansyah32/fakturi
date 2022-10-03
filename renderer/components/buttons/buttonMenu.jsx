import React from "react";
import { getProps } from "../../helper/validator";

const ButtonMenu = ({ title, description, image }) => {
  return (
    <div className="cursor-pointer rounded-md shadow p-4 bg-blue-500 hover:bg-blue-600">
      <img className="mx-auto" src={getProps(image, "")} />
      <h2 className="mb-2 font-bold text-center">{getProps(title, "")}</h2>
      <p className={`text-white`}>{getProps(description, "")}</p>
    </div>
  );
};

export default ButtonMenu;
