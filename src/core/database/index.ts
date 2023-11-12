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

export async function runTransaction(db: IDBDatabase, tableName: string, mode: "readonly" | "readwrite", operation: (table: IDBObjectStore) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([tableName], mode);
    transaction.onerror = (event) => {
      const target = event.target as IDBTransaction;
      reject(new Error(target.error?.message ?? "Transaction has failed!"));
    };
    transaction.oncomplete = () => {
      resolve();
    };
    const table = transaction.objectStore(tableName);
    operation(table);
  });
}

export async function getAllItems<T>(db: IDBDatabase, tableName: string, indexName?: string) {
  const collection: T[] = [];
  await runTransaction(db, tableName, "readonly", store => {
    const table = indexName ? store.index(indexName) : store;
    table.openCursor().onsuccess = (event) => {
      const target = event.target as IDBRequest<IDBCursorWithValue | null>;
      const cursor = target.result;
      if (cursor) {
        collection.push(cursor.value);
        cursor.continue();
      }
    };
  });
  return collection;
}

export function saveItems<T>(db: IDBDatabase, tableName: string, items: T[]) {
  return runTransaction(db, tableName, "readwrite", table => {
    for (const item of items) {
      table.add(item);
    }
  });
}

export function patchItems<T>(db: IDBDatabase, tableName: string, items: T[]) {
  return runTransaction(db, tableName, "readwrite", table => {
    for (const item of items) {
      table.put(item);
    }
  });
}
