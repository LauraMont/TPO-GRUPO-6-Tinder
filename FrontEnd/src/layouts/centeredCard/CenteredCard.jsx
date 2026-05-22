import "./centeredCardLayout.css";

function CenteredCardLayout({ children }) {
  return (
    <div className="centered-layout">
      {children}
    </div>
  );
}

export default CenteredCardLayout;