import { Tooltip } from 'antd';
import ms from 'ms';
import React, { ReactElement, useState } from 'react';
import styled from 'styled-components';

import { IMessage } from '../pages/search';

const ChatContainer = styled.div`
  word-wrap: break-word;
  display: flex;
`;

const ChatMessage = styled.span`
  white-space: normal;
  width: 100%;
  line-height: 0.5rem;
`;

const SideIcon = styled.div`
  width: 2.5rem;
  display: inline-block;
`;

export function ChatTimeline({
  data,
}: {
  data?: { messages: IMessage[]; main: string };
}) {
  if (!data) {
    return <div>Loading..</div>;
  }

  const authorToColour: Record<string, string> = {};

  const emojiColourCircles = [
    "🟠",
    "🟤",
    "🟡",
    "🟣",
    "🟢",
    "🟨",
    "🟥",
    "🟦",
    "🟩",
    "🟧",
    "🟪",
    "🟫",
  ];

  const items = data.messages.map((item, index) => {
    // If we haven't seen this author before, assign a random colour
    // But prevent duplicate colours
    if (!authorToColour[item.author] && emojiColourCircles.length) {
      authorToColour[item.author] = emojiColourCircles.pop() as string;
    }

    const sideIcons = [];

    if (data.main === item.id) {
      sideIcons.push(<SideIcon>➡️</SideIcon>);
    } else {
      sideIcons.push(<SideIcon></SideIcon>);
    }

    if (index) {
      console.log(item.timestamp);
      console.log(data.messages[index - 1].timestamp);
      console.log(
        new Date(item.timestamp).valueOf() -
          new Date(data.messages[index - 1].timestamp).valueOf()
      );
      sideIcons.push(
        <Tooltip title={new Date(item.timestamp).toLocaleString()}>
          <SideIcon>
            +
            {ms(
              new Date(item.timestamp).valueOf() -
                new Date(data.messages[index - 1].timestamp).valueOf()
            )}
          </SideIcon>
        </Tooltip>
      );
    } else {
      sideIcons.push(<SideIcon></SideIcon>);
    }

    sideIcons.push(<SideIcon>{authorToColour[item.author]}</SideIcon>);

    return (
      <ChatContainer>
        {sideIcons}
        <ChatMessage>{item.content.split('\n').map(c => <p>{c}</p>)}</ChatMessage>
      </ChatContainer>
    );
  });

  return <>{items}</>;
}
