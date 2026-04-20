export default function Footer() {
  return (
    <div
      style={{
        bottom: 0,
        textAlign: "center",
        backgroundColor: "transparent",
        position: "relative",
      }}
      className="footer-copyright text-center w-100 ml-0 push"
    >
      <p className="fluid">
        COPYRIGHT &#169; MY LIVING CITY {new Date().getFullYear()}
      </p>
    </div>
  );
}
