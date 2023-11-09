import "bootstrap-chat-ui/dist/style.css";
import BootstrapChatUI, { type IMessage } from "bootstrap-chat-ui";
import React, { useState } from "react";

type ChatProps = {
  originUserId: string,
};

const Chat = ({
  originUserId,
}: ChatProps) => {
  const [messages, setMessages] = useState<IMessage[]>([]);

  const createNewMessage = (text: string, roomId: string) => {
    setMessages(m => {
      return [...m, {
        id: Date.now().toString(),
        content: text,
        authorId: originUserId,
        roomId: roomId,
        timestamp: Date.now(),
        status: "new",
      }];
    });
  };

  return (
    <BootstrapChatUI
      originUserId={originUserId}
      allMessages={messages}
      addMessage={createNewMessage}
      getContactAvatar={() => "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTGNBuKZS2dQ8gViURYxqj0ih63BJgwf4e1KAPzMc1AyYVjDkc_"}
      getContactName={() => "Isaac Newton"}
    />
  );
};

export default Chat;
