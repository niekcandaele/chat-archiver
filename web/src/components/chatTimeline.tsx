import React, { ReactElement, useState } from 'react';
import styled from 'styled-components';

import { IMessage } from '../pages/search';


const ChatContainer = styled.div`
  word-wrap: break-word;
`;

const ChatMessage = styled.p`
  white-space: normal;
`;


export function ChatTimeline({ data }: { data?: {messages: IMessage[], main: string} }) {
  if (!data) {
    return <div>Loading..</div>;
  }
  
  const authorToColour: Record<string, string> = {}
  
  const emojiColourCircles = ['🟠', '🟡', '🟢', '🟣', '🟤', '🟥', '🟦', '🟧', '🟨', '🟩', '🟪', '🟫'];
  const items = data.messages.map((item, index) => {
    // If we haven't seen this author before, assign a random colour
    // But prevent duplicate colours
    if (!authorToColour[item.author] && emojiColourCircles.length) {
      authorToColour[item.author] = emojiColourCircles.pop() as string;
    }

    if (data.main === item.id) {
      return (
          <ChatMessage>
            ➡️ {authorToColour[item.author]} <b>{item.content}</b> 
          </ChatMessage>
      );
    }

    return (
        <ChatMessage>{authorToColour[item.author]} {item.content}</ChatMessage>
    );
  });

  return <ChatContainer>{items}</ChatContainer>;
}
