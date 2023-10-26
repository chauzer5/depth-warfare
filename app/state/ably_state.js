"use client";

import { configureAbly } from "@ably-labs/react-hooks";
import { v4 as uuidv4 } from "uuid";
import { createContext, useContext, useState } from "react";
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY)

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
        supabase,
      }}
    >
      {children}
    </AblyContext.Provider>
  );
}

export function useAblyContext() {
  return useContext(AblyContext);
}
