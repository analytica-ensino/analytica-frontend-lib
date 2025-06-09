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
export {
  Button
};
