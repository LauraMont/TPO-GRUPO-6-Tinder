import "./linkText.css";

function LinkText({ children, href = "#" }) {
  return (
    <a href={href} className="link-text">
      {children}
    </a>
  );
}

export default LinkText;