export function upgrade(db: IDBDatabase, oldVersion: Readonly<number>, newVersion: Readonly<number>) {
  const migrations: Record<number, (() => void) | undefined> = {
    1: () => {
      const messages = db.createObjectStore("messages", { keyPath: "id" });
      messages.createIndex("room-and-date", ["roomId", "timestamp"]);
      db.createObjectStore("contacts", { keyPath: "id" });
    },
  };
  let currentVersion = oldVersion;
  while (currentVersion <= newVersion) {
    const migration = migrations[currentVersion];
    if (migration) {
      migration();
    }
    currentVersion++;
  }
}
