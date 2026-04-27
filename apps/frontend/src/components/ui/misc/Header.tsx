import { UserProfileContext } from "@/contexts/UserProfileContext";
import { memo, useContext, useState } from "react";
import { NavDropdown, Nav, Navbar } from "react-bootstrap";

function Header() {
  const { logout, user, token } = useContext(UserProfileContext);
  const [stripeStatus] = useState("");

  return (
    <div className="outer-header">
      {stripeStatus !== "" && stripeStatus !== "active" && (
        <Nav
          style={{
            backgroundColor: "#f7e4ab",
            justifyContent: "center",
            padding: "0.2rem",
            textAlign: "center",
          }}
        >
          <p>
            You have not paid your account payment. To upgrade your account,
            please go to the <a href="/profile">profile</a> section.
          </p>
        </Nav>
      )}

      <Navbar
        style={{ backgroundColor: "#549762" }}
        className="inner-header"
        expand="sm"
      >
        <Navbar.Brand href="/">
          <img
            src="/MyLivingCityIcon-Transparent.png"
            width="30"
            height="30"
            className="d-inline-block align-top logo-text-white"
            alt="My Living City Logo"
          />
          <img
            src="/MyLivingCity_Logo_NameOnly.png"
            height="30"
            className="d-inline-block align-top ml-2 logo-text-white"
            alt="App Name"
          />
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          style={{ background: "white" }}
        />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/ideas">Conversations</Nav.Link>

            <NavDropdown title="Profile" id="profile-dropdown">
              <Nav.Link href="/profile">User Profile</Nav.Link>
              <Nav.Link href="/public-profiles">Public Profiles</Nav.Link>
            </NavDropdown>

            <Nav.Link href="https://mylivingcity.org/community-discussion-platform-help-pages/">
              Help
            </Nav.Link>

            {user ? (
              <>
                <Nav.Link onClick={() => logout()}>Log out</Nav.Link>
              </>
            ) : (
              <Nav.Link href="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}

export default memo(Header);
