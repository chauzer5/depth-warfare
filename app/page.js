"use client";

import { configureAbly, useChannel } from '@ably-labs/react-hooks'
import { useEffect, useState } from 'react';

configureAbly({ key: "2KJZGA.aX_e0g:13USKhuP_xe_jQEIP1eUmkGsau-UUNCITFKa-ZqiU1A", clientId: Math.floor(Math.random() * 10000).toString()});

export default function Home() {
  const [allMessages, setAllMessages] = useState([]);

  const [channel, ably] = useChannel("new-channel", (message) => {
    addMessageToState(message);
  });

  const addMessageToState = (message) => {
    console.log("PREXISTING MESSAGES");
    console.log(allMessages);
    setAllMessages((prev) => [...prev, message]);
  };

  useEffect(() => {
    channel.publish("connected", {});
  }, []);

  return (
    <>
      <h1 onClick={() => {
        console.log(allMessages);
      }}>MESSAGES</h1>
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
