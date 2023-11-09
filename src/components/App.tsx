import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Chat from "./Chat";

const App = () => {
  const [originUserId, setOriginUserId] = useState<string | null>(null);

  return (
    <Container fluid className="py-3 vh-100">
      {originUserId ? (
        <Chat
          originUserId={originUserId}
        />
      ) : (
        <div onClick={() => setOriginUserId("dummy_user")}>
          You are not logged in
        </div>
      )}
    </Container>
  );
};

export default App;
