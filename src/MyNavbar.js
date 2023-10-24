import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav'

function MyNavbar() {
  return (
    <div>
      <Navbar bg="light">
        <Navbar.Brand href="/clockly/home">Clockly</Navbar.Brand>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="/calendar">calendar</Nav.Link>
            <Nav.Link href="/list">list</Nav.Link>
            <Nav.Link href="/make">make rule</Nav.Link>
            <Nav.Link href="/settings">settings</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}
export default MyNavbar;
