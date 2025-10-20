import { NavDropdown, Nav, Navbar, Container } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClosets } from '../hooks/useClosets';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseClient';

export default function Navigation() {
  const { user }   = useAuth();
  const { closets, loading } = useClosets(user?.uid);
  const navigate   = useNavigate();
  const params     = new URLSearchParams(useLocation().search);
  const selected   = params.get('closet') || '';

    async function createCloset(name) {
      if (!user || !name) return;
      const ref = doc(db, 'users', user.uid, 'closets', name);
      await setDoc(ref, { createdAt: serverTimestamp() });
    }

  return (
    <Navbar className="bg-body-tertiary custom-navbar">
      <Container>
        <Navbar.Brand href="/">My Closet App</Navbar.Brand>
        <Nav className="me-auto">
          <NavDropdown title="Closets" id="nav-closets-dropdown">
            {loading && <NavDropdown.Item disabled>Loading…</NavDropdown.Item>}
            {!loading && closets.map(name => (
              <NavDropdown.Item
                key={name}
                active={name === selected}
                onClick={() => navigate(`/home/?closet=${encodeURIComponent(name)}`)}
              >
                {name}
              </NavDropdown.Item>
            ))}
            <NavDropdown.Divider />
            <NavDropdown.Item
             onClick={async () => {
               const name = prompt('New closet name:');
               if (!name) return;
               try {
                 await createCloset(name);
                 // immediately navigate into it
                 navigate(`/home/?closet=${encodeURIComponent(name)}`);
               } catch (e) {
                 console.error('Could not create closet', e);
                 alert('Error creating closet');
               }
             }}
            >
              + New Closet
            </NavDropdown.Item>
          </NavDropdown>
          <Nav.Link href="/outfits">Outfits</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
}
