import "./button.css";

import { Link } from "react-router-dom";

function Button({
  children,
  onClick,
  href,
  type = "button",
}) {

  // SI TIENE HREF → REDIRECCIONA
  if (href) {
    return (
      <Link
        to={href}
        className="custom-button link-button"
      >
        {children}
      </Link>
    );
  }

  // SI NO → BOTÓN NORMAL
  return (
    <button
      type={type}
      className="custom-button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;