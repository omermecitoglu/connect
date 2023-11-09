import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Chat from "./Chat";
import Providers from "./Providers";

const App = () => {
  const [originUserId, setOriginUserId] = useState<string | null>(null);

  return (
    <Providers>
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
    </Providers>
  );
};

export default App;
