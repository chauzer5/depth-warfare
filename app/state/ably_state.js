"use client";

import { configureAbly } from "@ably-labs/react-hooks";
import { v4 as uuidv4 } from "uuid";
import { createContext, useContext, useState } from "react";

const selfClientId = uuidv4();
configureAbly({ key: process.env.ABLY_API_KEY, clientId: selfClientId });

const AblyContext = createContext();

export function AblyWrapper({ children }) {
  const [channel, setChannel] = useState();

  return (
    <AblyContext.Provider
      value={{
        selfClientId,
        channel,
        setChannel,
      }}
    >
      {children}
    </AblyContext.Provider>
  );
}

export function useAblyContext() {
  return useContext(AblyContext);
}
