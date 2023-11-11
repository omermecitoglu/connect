import { getAllItems, patchItems, saveItems } from "./database";

export type Contact = {
  id: string,
  name: string,
  avatar: string,
};

export function getAllContacts(db: IDBDatabase): Promise<Contact[]> {
  return getAllItems(db, "contacts");
}

export function saveContacts(db: IDBDatabase, contacts: Contact[]) {
  return saveItems(db, "contacts", contacts);
}

export function patchContacts(db: IDBDatabase, contacts: Contact[]) {
  return patchItems(db, "contacts", contacts);
}

