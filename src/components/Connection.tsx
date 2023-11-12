import { useContext, useEffect, useState } from "react";
import { type Contact, saveContacts } from "~/core/contacts";
import DatabaseContext from "~/core/database/context";
import { patchMessages, saveMessages } from "~/core/messages";
import { addContact, addMessage, updateMessage } from "~/redux/features/database";
import { removeConnection } from "~/redux/features/network";
import { useAppDispatch, useAppSelector } from "~/redux/hooks";
import type { IMessage } from "bootstrap-chat-ui";
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
};

type ConnectionProps = {
  connection: DataConnection,
};

const Connection = ({
  connection,
}: ConnectionProps) => {
  const [established, setEstablished] = useState(false);
  const userId = useAppSelector(state => state.user.id);
  const userName = useAppSelector(state => state.user.name);
  const avatar = useAppSelector(state => state.user.avatar);
  const contacts = useAppSelector(state => state.database.contacts);
  const messages = useAppSelector(state => state.database.messages);
  const db = useContext(DatabaseContext);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onOpen = () => {
      console.log(`${connection.peer} is online 1`);
      connection.send({
        type: "introduction",
        name: userName,
        avatar,
      } as PeerMessage);
      setEstablished(true);
    };

    const onClose = () => {
      console.log(`${connection.peer} is offline`);
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
          const isSaved = contacts.find(c => c.id === connection.peer);
          if (!isSaved) {
            const contact: Contact = {
              id: connection.peer,
              name: data.name,
              avatar: data.avatar,
            };
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
          for (const msg of msgs) {
            dispatch(addMessage(msg));
          }
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
          for (const msg of msgs) {
            dispatch(updateMessage(msg));
          }
          break;
        }
        case "messages-seen": {
          const msgs = messages
            .filter(m => m.status === "delivered" && m.roomId === connection.peer)
            .map<IMessage>(m => ({ ...m, status: "read" }));
          await patchMessages(db, msgs);
          for (const msg of msgs) {
            dispatch(updateMessage(msg));
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
  }, [db, connection, messages]);

  useEffect(() => {
    if (!established) return;
    const undeliveredMessages = messages.filter(m => m.status === "created" && m.authorId === userId);
    if (undeliveredMessages.length) {
      connection.send({ type: "push-message", messages: undeliveredMessages } as PeerMessage);
    }
  }, [established, messages]);

  return null;
};

export default Connection;
