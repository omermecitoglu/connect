import { getAllItems, getItemsWithReducer, patchItems, saveItems } from "./database";
import type { IMessage } from "@omer-x/bootstrap-chat-ui";

export function getAllMessages(db: IDBDatabase): Promise<IMessage[]> {
  return getAllItems(db, "messages", "room-and-date");
}

export function getLatestMessages(
  db: IDBDatabase,
  limit: number,
  roomId: string | null,
  cursorTimestamp?: number
) {
  const records: Record<string, number> = {};
  const reducer = (message: IMessage, collection: IMessage[]) => {
    if (roomId && roomId !== message.roomId) return;
    if (!records[message.roomId]) {
      records[message.roomId] = 0;
    }
    if (records[message.roomId] < limit) {
      records[message.roomId]++;
      collection.unshift(message);
    }
  };
  const range = roomId ? IDBKeyRange.upperBound([roomId, cursorTimestamp], true) : null;
  return getItemsWithReducer(db, "messages", range, reducer, "room-and-date");
}

export function saveMessages(db: IDBDatabase, messages: IMessage[]) {
  return saveItems(db, "messages", messages);
}

export function patchMessages(db: IDBDatabase, messages: IMessage[]) {
  return patchItems(db, "messages", messages);
}
