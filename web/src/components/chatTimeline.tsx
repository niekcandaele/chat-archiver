import { Tooltip } from 'antd';
import ms from 'ms';
import React, { ReactElement, useState } from 'react';
import styled from 'styled-components';

import { IMessage } from '../pages/search';
import { ChatMessage } from './chatMessage';

const ChatContainer = styled.div`
  word-wrap: break-word;
  display: flex;
  align-items: center;
  justify-content: center;
`;


const SideIcon = styled.div`
  width: 2.5rem;
  height: 100%;
  display: inline-block;
  text-align: center;
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

    if (data.main === item.uid) {
      sideIcons.push(<SideIcon>➡️</SideIcon>);
    } else {
      sideIcons.push(<SideIcon></SideIcon>);
    }

    if (index) {
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
        <ChatMessage message={item}/>
      </ChatContainer>
    );
  });

  return <>{items}</>;
}
