import { getAllItems, patchItems, saveItems } from "./database";
import type { IMessage } from "bootstrap-chat-ui";

export function getAllMessages(db: IDBDatabase): Promise<IMessage[]> {
  return getAllItems(db, "messages", "room-and-date");
}

export function saveMessages(db: IDBDatabase, messages: IMessage[]) {
  return saveItems(db, "messages", messages);
}

export function patchMessages(db: IDBDatabase, messages: IMessage[]) {
  return patchItems(db, "messages", messages);
}
