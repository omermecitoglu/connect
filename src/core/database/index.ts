import { upgrade } from "./migrations";

export async function connectDatabase(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(name, 1);
    request.onupgradeneeded = (event) => {
      const target = event.target as IDBOpenDBRequest;
      const db = target.result;
      if (event.newVersion) {
        upgrade(db, event.oldVersion, event.newVersion);
      } else {
        // the database is being deleted
      }
    };
    request.onerror = () => {
      reject(new Error("Couldn't connect to the database: " + name));
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

function readAllItems<T>(
  db: IDBDatabase,
  tableName: string,
  keyRange: IDBKeyRange | null,
  operation: (item: T, collection: T[]) => void,
  indexName?: string
) {
  return new Promise<T[]>((resolve, reject) => {
    const collection: T[] = [];
    const transaction = db.transaction([tableName], "readonly");
    transaction.onerror = (event) => reject((event.target as IDBTransaction).error);
    transaction.oncomplete = () => resolve(collection);
    const store = transaction.objectStore(tableName);
    const table = indexName ? store.index(indexName) : store;
    table.openCursor(keyRange, "prev").onsuccess = (event) => {
      const target = event.target as IDBRequest<IDBCursorWithValue | null>;
      const cursor = target.result;
      if (cursor) {
        operation(cursor.value, collection);
        cursor.continue();
      }
    };
  });
}

export function getAllItems<T>(
  db: IDBDatabase,
  tableName: string,
  indexName?: string
) {
  return readAllItems<T>(db, tableName, null, (item, collection) => collection.unshift(item), indexName);
}

export function getItemsWithReducer<T>(
  db: IDBDatabase,
  tableName: string,
  keyRange: IDBKeyRange | null,
  reducer: (item: T, collection: T[]) => void,
  indexName?: string
) {
  return readAllItems<T>(db, tableName, keyRange, reducer, indexName);
}

export function saveItems<T>(db: IDBDatabase, tableName: string, items: T[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([tableName], "readwrite");
    transaction.onerror = (event) => reject((event.target as IDBTransaction).error);
    transaction.oncomplete = () => resolve();
    const table = transaction.objectStore(tableName);
    for (const item of items) {
      const request = table.add(item);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    }
  });
}

export function patchItems<T>(db: IDBDatabase, tableName: string, items: T[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([tableName], "readwrite");
    transaction.onerror = (event) => reject((event.target as IDBTransaction).error);
    transaction.oncomplete = () => resolve();
    const table = transaction.objectStore(tableName);
    for (const item of items) {
      const request = table.put(item);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    }
  });
}
