import { useContext, useState } from 'react'
import { Nav, Navbar, Form, FormControl, Button } from 'react-bootstrap'
import { UserProfileContext } from '../../contexts/UserProfile.Context';

export default function Header() {
  const { logout, user } = useContext(UserProfileContext);

  // Here Items are not coming Inline
  return (
    <div className="outer-header">
      <Navbar className="inner-header" bg='light' expand='sm'>
        <Navbar.Brand href='/'>
          <img
            src='/MyLivingCityIcon.png'
            width='30'
            height='30'
            className='d-inline-block alight-top'
            alt="My Living City Logo"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='ml-auto'>
            <Nav.Link href='/'>Home</Nav.Link>
            <Nav.Link href='/ideas'>Ideas</Nav.Link>
            {user ? (
              <>
                {/* <Navbar.Text> Fake Name</Navbar.Text> */}
                <Nav.Link href='/submit'>Submit Idea</Nav.Link>
                <Nav.Link href='/profile'>Profile</Nav.Link>
                <Nav.Link onClick={() => logout()}>Log out</Nav.Link>
              </>
            ) : (
              <Nav.Link href='/login'>Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}
