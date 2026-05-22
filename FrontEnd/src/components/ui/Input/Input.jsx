import "./input.css";

function Input({
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
}) {
  return (
    <div className="input-container">
      {icon && <span className="input-icon">{icon}</span>}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="custom-input"
      />
    </div>
  );
}

export default Input;