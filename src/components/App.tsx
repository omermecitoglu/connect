import React from "react";
import Container from "react-bootstrap/Container";
import { identifyUser } from "~/redux/features/user";
import { useAppDispatch, useAppSelector } from "~/redux/hooks";
import Chat from "./Chat";

const App = () => {
  const originUserId = useAppSelector(state => state.user.id);
  const dispatch = useAppDispatch();

  const login = () => {
    dispatch(identifyUser({
      id: "xxxxxxxxx",
      avatar: "",
      name: "",
    }));
  };

  return (
    <Container fluid className="py-3 vh-100">
      {originUserId ? (
        <Chat
          originUserId={originUserId}
        />
      ) : (
        <div onClick={login}>
            You are not logged in
        </div>
      )}
    </Container>
  );
};

export default App;
