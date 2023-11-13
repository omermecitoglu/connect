import "bootstrap-chat-ui/dist/style.css";
import BootstrapChatUI, { type IMessage } from "bootstrap-chat-ui";
import React, { useCallback, useContext, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { type Contact, saveContacts } from "~/core/contacts";
import DatabaseContext from "~/core/database/context";
import { saveMessages } from "~/core/messages";
import { activateRoom } from "~/redux/features/app";
import { addContact, addMessage, updateMessages } from "~/redux/features/database";
import { useAppDispatch, useAppSelector } from "~/redux/hooks";

type ChatProps = {
  originUserId: string,
};

const Chat = ({
  originUserId,
}: ChatProps) => {
  const activeRoom = useAppSelector(state => state.app.activeRoom);
  const onlineContactIds = useAppSelector(state => state.app.onlineContactIds);
  const userId = useAppSelector(state => state.user.id);
  const contacts = useAppSelector(state => state.database.contacts);
  const messages = useAppSelector(state => state.database.messages);
  const savingMessagesLock = useRef(false);
  const db = useContext(DatabaseContext);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (savingMessagesLock.current) return;
    const unsavedMessages = messages
      .filter(m => m.status === "new" && m.authorId === userId)
      .map<IMessage>(m => ({ ...m, status: "created" }));
    if (!unsavedMessages.length) return;
    (async () => {
      try {
        savingMessagesLock.current = true;
        await saveMessages(db, unsavedMessages);
        dispatch(updateMessages(unsavedMessages));
      } catch (error) {
        if (error instanceof DOMException && error.message === "Key already exists in the object store.") {
          // do nothing.
        } else {
          console.error(error);
        }
      } finally {
        savingMessagesLock.current = false;
      }
    })();
  }, [db, messages]);

  const getContactAvatar = useCallback((contactId: string) => {
    const found = contacts.find(c => c.id === contactId);
    if (!found) return "/chat-avatar-placeholder.svg";
    return found.avatar;
  }, [contacts]);

  const getContactName = useCallback((contactId: string) => {
    const found = contacts.find(c => c.id === contactId);
    if (!found) return "Unknown";
    return found.name;
  }, [contacts]);

  const isContactOnline = useCallback((contactId: string) => {
    return onlineContactIds.includes(contactId);
  }, [onlineContactIds]);


  const createNewMessage = async (roomId: string, content: string, isDummy: boolean) => {
    dispatch(addMessage({
      id: uuidv4(),
      content,
      authorId: originUserId,
      roomId: roomId,
      timestamp: isDummy ? 1 : Date.now(),
      status: isDummy ? "dummy" : "new",
    }));
    if (isDummy) {
      const newContact: Contact = {
        id: roomId,
        name: "",
        avatar: "",
      };
      try {
        await saveContacts(db, [newContact]);
        dispatch(addContact(newContact));
      } catch (error) {
        if (error instanceof DOMException && error.message === "Key already exists in the object store.") {
          // do nothing.
        } else {
          console.error(error);
        }
      }
    }
  };

  return (
    <BootstrapChatUI
      originUserId={originUserId}
      allMessages={messages}
      onMessageCreate={createNewMessage}
      activeRoom={activeRoom}
      onRoomChange={roomId => dispatch(activateRoom(roomId))}
      getContactAvatar={getContactAvatar}
      getContactName={getContactName}
      isContactOnline={isContactOnline}
    />
  );
};

export default Chat;
