import { createContext } from "react";

const dummy = {} as IDBDatabase;

const DatabaseContext = createContext<IDBDatabase>(dummy);

export default DatabaseContext;
