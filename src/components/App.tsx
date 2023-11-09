import React from "react";
import Container from "react-bootstrap/Container";
import { useAppSelector } from "~/redux/hooks";
import Chat from "./Chat";
import Login from "./Login";

const App = () => {
  const originUserId = useAppSelector(state => state.user.id);

  return (
    <Container fluid={!!originUserId} className="py-3 vh-100">
      {originUserId ? (
        <Chat
          originUserId={originUserId}
        />
      ) : (
        <Login />
      )}
    </Container>
  );
};

export default App;
