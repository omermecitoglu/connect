import React, { useEffect, useState } from "react";
import Connection from "~/components/Connection";
import { addConnection, removeConnection, resetConnections } from "~/redux/features/network";
import { useAppDispatch, useAppSelector } from "~/redux/hooks";
import type { DataConnection, Peer, PeerError } from "peerjs";

type NetworkProps = {
  peer: Peer,
};

const Network = ({
  peer,
}: NetworkProps) => {
  const [connected, setConnected] = useState(false);
  const contacts = useAppSelector(state => state.contacts.collection);
  const connections = useAppSelector(state => state.network.connections);
  const dispatch = useAppDispatch();

  // handle peer connections

  useEffect(() => {
    const onConnect = (id: string) => {
      console.log("I am " + id);
      setConnected(true);
    };

    const handleIncomingConnections = (connection: DataConnection) => {
      dispatch(addConnection(connection));
    };

    const onDisconnect = (id: string) => {
      console.log("i'm disconnected from the peer server! id:" + id);
    };

    const onClose = () => {
      console.log("closed!");
      setConnected(false);
      dispatch(resetConnections());
    };

    const onError = (error: PeerError<string>) => {
      switch (error.type) {
        case "peer-unavailable": {
          const match = error.message.match(/([a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12})/);
          if (match && match[0]) {
            dispatch(removeConnection(match[0]));
          }
          break;
        }
        default:
          alert(error.message);
          break;
      }
    };

    peer.on("open", onConnect);
    peer.on("connection", handleIncomingConnections);
    peer.on("disconnected", onDisconnect);
    peer.on("close", onClose);
    peer.on("error", onError);

    return () => {
      peer.off("open", onConnect);
      peer.off("connection", handleIncomingConnections);
      peer.off("disconnected", onDisconnect);
      peer.off("close", onClose);
      peer.off("error", onError);
    };
  }, [peer]);

  // update contacts

  useEffect(() => {
    if (connected) {
      const unconnectedContacts = contacts.filter(contact => !connections.find(conn => conn.peer === contact.id));
      for (const contact of unconnectedContacts) {
        console.log("connecting to", contact.id);
        const connection = peer.connect(contact.id);
        dispatch(addConnection(connection));
      }
    }
  }, [connected, contacts]);

  return connections.map(connection =>
    <Connection key={connection.peer} connection={connection} />
  );
};

export default Network;
