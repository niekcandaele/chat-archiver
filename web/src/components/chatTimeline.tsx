import React, { ReactElement, useState } from 'react';
import styled from 'styled-components';

import { IRelatedMessage } from './output';

const ChatContainer = styled.div`
  word-wrap: break-word;
`;

const ChatMessage = styled.p`
  word-break: break-all;
  white-space: normal;
`;


export function ChatTimeline({ data }: { data?: IRelatedMessage[] }) {
  if (!data) {
    return <div>Loading..</div>;
  }
  
  const authorToColour: Record<string, string> = {}
  
  const emojiColourCircles = ['🟠', '🟡', '🟢', '🟣', '🟤', '🟥', '🟦', '🟧', '🟨', '🟩', '🟪', '🟫'];
  const items = data.map((item, index) => {
    // If we haven't seen this author before, assign a random colour
    // But prevent duplicate colours
    if (!authorToColour[item.author] && emojiColourCircles.length) {
      authorToColour[item.author] = emojiColourCircles.pop() as string;
    }


    return (
        <ChatMessage>{authorToColour[item.author]} {item.content}</ChatMessage>
    );
  });

  return <ChatContainer>{items}</ChatContainer>;
}
