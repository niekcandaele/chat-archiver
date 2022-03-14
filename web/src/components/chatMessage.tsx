import { PaperClipOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import React, { ReactElement, useState } from 'react';
import styled from 'styled-components';

import { IMessage } from '../pages/search';

const ChatMessageSpan = styled.span`
  white-space: normal;
  width: 100%;
  line-height: 1rem;
  margin-top: 0.3rem;
`;

const ChatLine = styled.p`
  margin-bottom: 0;
`;

export function ChatMessage({ message }: { message: IMessage }) {
  if (!message) {
    return <div>Loading..</div>;
  }

  const attachments = message.attachments.map((a) => {
    return (
      <a href={a.url} target="_blank" rel="noreferrer">
        <Tag>
          <PaperClipOutlined />
        </Tag>
      </a>
    );
  });

  return (
    <ChatMessageSpan>
      {attachments}
      {message.content.split("\n").map((c) => (
        <ChatLine>{c}</ChatLine>
      ))}
    </ChatMessageSpan>
  );
}
