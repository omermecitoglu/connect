import React, { useEffect } from "react";
import { addConnection, removeConnection } from "~/redux/features/network";
import { useAppDispatch, useAppSelector } from "~/redux/hooks";
import Connection from "./Connection";
import type { DataConnection, Peer, PeerError } from "peerjs";

type NetworkProps = {
  peer: Peer,
};

const Network = ({
  peer,
}: NetworkProps) => {
  const contacts = useAppSelector(state => state.database.contacts);
  const connections = useAppSelector(state => state.network.connections);
  const dispatch = useAppDispatch();

  // register peer connections

  useEffect(() => {
    const onConnect = (id: string) => {
      console.log("I am " + id);
      for (const contact of contacts) {
        const connection = peer.connect(contact.id);
        dispatch(addConnection(connection));
      }
    };

    const handleIncomingConnections = (connection: DataConnection) => {
      dispatch(addConnection(connection));
    };

    const onDisconnect = (id: string) => {
      console.log("closed! " + id);
    };

    const onClose = () => {
      console.log("closed!");
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

  return connections.map(connection =>
    <Connection key={connection.peer} connection={connection} />
  );
};

export default Network;
