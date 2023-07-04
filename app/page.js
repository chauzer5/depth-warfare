"use client";

import { configureAbly, useChannel, usePresence } from '@ably-labs/react-hooks'
import { useEffect, useState } from 'react';

configureAbly({ key: "2KJZGA.aX_e0g:13USKhuP_xe_jQEIP1eUmkGsau-UUNCITFKa-ZqiU1A", clientId: Math.floor(Math.random() * 10000).toString()});

export default function Home() {
  const [allMessages, setAllMessages] = useState([]);
  const [numUsers, setNumUsers] = useState(0);

  const [channel] = useChannel("lobby", (message) => {
    setAllMessages((prev) => [...prev, message]);
  });

  const [presenceData, updateStatus] = usePresence("lobby");
  
  useEffect(() => {
    setNumUsers(presenceData.length);
  }, [presenceData]);

  return (
    <>
      <h1 onClick={() => {
        console.log("ALL MESSAGES");
        console.log(allMessages);
      }}>MESSAGES</h1>
      <p>Number of people in the lobby: {numUsers}</p>
      <ul>
        {allMessages.map((msg, index) => {
          return <li key={index}>{msg.name}</li>;
        })}
      </ul>
      <button onClick={(e) => {
        e.preventDefault();
        channel.publish("test-message", {});
      }}>Add a message</button>
    </>
  );
}
