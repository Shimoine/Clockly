import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav'
import { FaGithub } from 'react-icons/fa';

function MyNavbar() {
  return (
    <div>
      <Navbar bg="light">
        <Navbar.Brand href="/clockly/home" style={{ marginLeft: '5px' }}>Clockly</Navbar.Brand>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="/calendar">calendar</Nav.Link>
            <Nav.Link href="/list">list</Nav.Link>
            <Nav.Link href="/make">make rule</Nav.Link>
            <Nav.Link href="/settings">settings</Nav.Link>
          </Nav>
          <div style={{ flexGrow: 1 }}></div>
          <Nav className="ml-auto">
          
            <Nav.Link href="https://github.com/Shimoine/Clockly" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', marginRight: '20px' }}>
            <FaGithub size={20} style={{ marginRight: '5px' , transform: 'translateY(-2px)' }}/>
              GitHub
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}
export default MyNavbar;
