"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Button: () => Button
});
module.exports = __toCommonJS(index_exports);

// src/components/Button.tsx
var Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  let variantClasses = "";
  let sizeClasses = "";
  switch (variant) {
    case "secondary":
      variantClasses = "bg-gray-200 hover:bg-gray-300 text-black";
      break;
    case "danger":
      variantClasses = "bg-red-600 hover:bg-red-700 text-white";
      break;
    case "primary":
    default:
      variantClasses = "bg-blue-600 hover:bg-blue-700 text-white";
      break;
  }
  switch (size) {
    case "sm":
      sizeClasses = "text-sm px-3 py-1.5";
      break;
    case "lg":
      sizeClasses = "text-lg px-5 py-3";
      break;
    case "md":
    default:
      sizeClasses = "text-base px-4 py-2";
      break;
  }
  const baseClasses = "rounded font-medium focus:outline-none focus:ring transition";
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      className: `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`,
      ...props
    },
    children
  );
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Button
});
