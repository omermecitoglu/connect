import "bootstrap-chat-ui/dist/style.css";
import BootstrapChatUI, { type IMessage } from "bootstrap-chat-ui";
import React, { useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import DatabaseContext from "~/core/database/context";
import { saveMessages } from "~/core/messages";
import { activateRoom } from "~/redux/features/app";
import { addMessage, updateMessage } from "~/redux/features/database";
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
  const db = useContext(DatabaseContext);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsavedMessages = messages
      .filter(m => m.status === "new" && m.authorId === userId)
      .map<IMessage>(m => ({ ...m, status: "created" }));
    if (!unsavedMessages.length) return;
    (async () => {
      try {
        await saveMessages(db, unsavedMessages);
        for (const message of unsavedMessages) {
          dispatch(updateMessage(message));
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, [db, messages]);

  const createNewMessage = (roomId: string, content: string, isDummy: boolean) => {
    dispatch(addMessage({
      id: uuidv4(),
      content,
      authorId: originUserId,
      roomId: roomId,
      timestamp: Date.now(),
      status: isDummy ? "dummy" : "new",
    }));
  };

  return (
    <BootstrapChatUI
      originUserId={originUserId}
      allMessages={messages}
      onMessageCreate={createNewMessage}
      activeRoom={activeRoom}
      onRoomChange={roomId => dispatch(activateRoom(roomId))}
      getContactAvatar={id => contacts.find(c => c.id === id)?.avatar || "/chat-avatar-placeholder.svg"}
      getContactName={id => contacts.find(c => c.id === id)?.name || "Unknown"}
      isContactOnline={id => onlineContactIds.includes(id)}
    />
  );
};

export default Chat;
