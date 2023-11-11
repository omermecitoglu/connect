import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import Peer, { type DataConnection } from "peerjs";

interface NetworkState {
  peer: Peer | null,
  connections: DataConnection[],
}

const initialState: NetworkState = {
  peer: null,
  connections: [],
};

const network = createSlice({
  name: "network",
  initialState,
  reducers: {
    initPeer(state, action: PayloadAction<string>) {
      state.peer = new Peer(action.payload);
    },
    killPeer(state) {
      if (state.peer) {
        state.peer.destroy();
        state.peer = null;
      }
    },
    addConnection(state, action: PayloadAction<DataConnection>) {
      const found = state.connections.find(c => c.peer === action.payload.peer);
      if (found) {
        state.connections = state.connections.map(c => c.peer === action.payload.peer ? action.payload : c);
      } else {
        state.connections = [...state.connections, action.payload];
      }
    },
    removeConnection(state, action: PayloadAction<string>) {
      state.connections = state.connections.filter(c => c.peer !== action.payload);
    },
  },
});

export const { initPeer, killPeer, addConnection, removeConnection } = network.actions;

export default network.reducer;
