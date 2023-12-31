import { useContext, useEffect, useState } from "react";
import { type Contact, patchContacts, saveContacts } from "~/core/contacts";
import DatabaseContext from "~/core/database/context";
import { patchMessages, saveMessages } from "~/core/messages";
import { addOnlineContact, removeOnlineContact } from "~/redux/features/app";
import { addContact, updateContact } from "~/redux/features/contacts";
import { addMessages, updateMessages } from "~/redux/features/messages";
import { removeConnection } from "~/redux/features/network";
import { useAppDispatch, useAppSelector } from "~/redux/hooks";
import type { IMessage } from "@omer-x/bootstrap-chat-ui";
import type { DataConnection } from "peerjs";

type PeerMessage = {
  type: "introduction",
  name: string,
  avatar: string,
} | {
  type: "push-message",
  messages: IMessage[],
} | {
  type: "messages-delivered",
  messageIds: string[],
} | {
  type: "messages-seen",
} | {
  type: "handshake",
};

type ConnectionProps = {
  connection: DataConnection,
};

const Connection = ({
  connection,
}: ConnectionProps) => {
  const [established, setEstablished] = useState(false);
  const activeRoom = useAppSelector(state => state.app.activeRoom);
  const userId = useAppSelector(state => state.user.id);
  const userName = useAppSelector(state => state.user.name);
  const avatar = useAppSelector(state => state.user.avatar);
  const contacts = useAppSelector(state => state.contacts.collection);
  const messages = useAppSelector(state => state.messages.collection);
  const db = useContext(DatabaseContext);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onOpen = () => {
      dispatch(addOnlineContact(connection.peer));
      connection.send({
        type: "introduction",
        name: userName,
        avatar,
      } as PeerMessage);
      setEstablished(true);
    };

    const onClose = () => {
      dispatch(removeOnlineContact(connection.peer));
      dispatch(removeConnection(connection.peer));
      setEstablished(false);
    };

    const onError = () => {
      console.error("Peer Connection Error:");
    };

    const handleIncomingData = async (incomingData: unknown) => {
      const data = incomingData as PeerMessage;
      switch (data.type) {
        case "introduction": {
          const contact: Contact = {
            id: connection.peer,
            name: data.name,
            avatar: data.avatar,
          };
          const found = contacts.find(c => c.id === connection.peer);
          if (found) {
            await patchContacts(db, [contact]);
            dispatch(updateContact(contact));
          } else {
            await saveContacts(db, [contact]);
            dispatch(addContact(contact));
          }
          break;
        }
        case "push-message": {
          const msgs = data.messages.map<IMessage>(m => ({
            ...m,
            roomId: connection.peer,
            authorId: connection.peer,
            status: "delivered",
          }));
          await saveMessages(db, msgs);
          dispatch(addMessages(msgs));
          connection.send({
            type: "messages-delivered",
            messageIds: msgs.map(m => m.id),
          } as PeerMessage);
          break;
        }
        case "messages-delivered": {
          const msgs = messages
            .filter(m => data.messageIds.includes(m.id))
            .map<IMessage>(m => ({
              ...m,
              status: "delivered",
            }));
          await patchMessages(db, msgs);
          dispatch(updateMessages(msgs));
          connection.send({ type: "handshake" } as PeerMessage);
          break;
        }
        case "messages-seen": {
          const msgs = messages
            .filter(m => m.status === "delivered" && m.roomId === connection.peer)
            .map<IMessage>(m => ({ ...m, status: "seen" }));
          await patchMessages(db, msgs);
          dispatch(updateMessages(msgs));
          break;
        }
        case "handshake": {
          if (activeRoom === connection.peer) {
            connection.send({ type: "messages-seen" } as PeerMessage);
          }
          break;
        }
      }
    };

    connection.on("data", handleIncomingData);
    connection.on("open", onOpen);
    connection.on("close", onClose);
    connection.on("error", onError);

    return () => {
      connection.off("data", handleIncomingData);
      connection.off("open", onOpen);
      connection.off("close", onClose);
      connection.off("error", onError);
    };
  }, [db, connection, activeRoom, contacts, messages]);

  // push undelivered messages

  useEffect(() => {
    if (!established) return;
    const undeliveredMessages = messages.filter(message => {
      if (message.status !== "created") return false;
      if (message.roomId !== connection.peer) return false;
      if (message.authorId !== userId) return false;
      return true;
    });
    if (undeliveredMessages.length) {
      connection.send({ type: "push-message", messages: undeliveredMessages } as PeerMessage);
    }
  }, [established, messages]);

  // send messages seen event

  useEffect(() => {
    if (activeRoom !== connection.peer) return;
    connection.send({ type: "messages-seen" } as PeerMessage);
  }, [activeRoom]);

  return null;
};

export default Connection;
