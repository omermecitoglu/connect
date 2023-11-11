export function upgrade(db: IDBDatabase, oldVersion: Readonly<number>, newVersion: Readonly<number>) {
  const migrations: Record<number, (() => void) | undefined> = {
    1: () => {
      db.createObjectStore("messages", { keyPath: "id" });
    },
    4: () => {
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
