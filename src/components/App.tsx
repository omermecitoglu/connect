import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Chat from "~/components/Chat";
import Loading from "~/components/Loading";
import Login from "~/components/Login";
import Network from "~/components/Network";
import { getAllContacts } from "~/core/contacts";
import { connectDatabase } from "~/core/database";
import DatabaseContext from "~/core/database/context";
import { getLatestMessages } from "~/core/messages";
import useNavigatorOnLine from "~/hooks/useNavigatorOnLine";
import { loadContacts } from "~/redux/features/contacts";
import { loadMessages } from "~/redux/features/messages";
import { initPeer, killPeer } from "~/redux/features/network";
import { useAppDispatch, useAppSelector } from "~/redux/hooks";

const App = () => {
  const isOnline = useNavigatorOnLine();
  const [database, setDatabase] = useState<IDBDatabase | null>(null);
  const userId = useAppSelector(state => state.user.id);
  const contactsLoaded = useAppSelector(state => state.contacts.loaded);
  const messagesLoaded = useAppSelector(state => state.messages.loaded);
  const peer = useAppSelector(state => state.network.peer);
  const dispatch = useAppDispatch();

  // connect IndexedDB

  useEffect(() => {
    connectDatabase("chat").then(d => setDatabase(d)).catch(console.error);
  }, []);

  // load contacts from db

  useEffect(() => {
    if (database && !contactsLoaded) {
      getAllContacts(database).then(contacts => dispatch(loadContacts(contacts))).catch(console.error);
    }
  }, [database, contactsLoaded]);

  // load messages from db

  useEffect(() => {
    if (database && !messagesLoaded) {
      getLatestMessages(database, 10, null).then(messages => dispatch(loadMessages(messages))).catch(console.error);
    }
  }, [database, messagesLoaded]);

  // connect to network

  useEffect(() => {
    if (!isOnline || !userId) return;
    dispatch(initPeer(userId));
    return () => {
      dispatch(killPeer());
    };
  }, [isOnline, userId]);

  return (
    <Container fluid={!!userId} className="py-3 vh-100">
      {userId ? (
        (database && contactsLoaded && messagesLoaded) ? (
          <DatabaseContext.Provider value={database}>
            {isOnline && peer && <Network peer={peer} />}
            <Chat
              originUserId={userId}
            />
          </DatabaseContext.Provider>
        ) : (
          <Loading />
        )
      ) : (
        <Login />
      )}
    </Container>
  );
};

export default App;
