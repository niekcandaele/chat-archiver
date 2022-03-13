import { MessageOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Collapse, Tag, Tooltip } from 'antd';
import React, { ReactElement, useState } from 'react';

import { IMessage, ISearchResult } from '../pages/search';
import { ChatTimeline } from './chatTimeline';

const { Panel } = Collapse;

function truncateString(str: string, length: number) {
  if (str.length > length) {
    return str.substring(0, length) + "...";
  }
  return str;
}

export function Output({ data }: { data?: ISearchResult }) {
  const [relatedMessages, setRelatedMessages] = useState<{messages: IMessage[], main: string}>();
  if (!data || !data.results) {
    return <div>Search something first :)</div>;
  }

  const callback = (key: string | string[]) => {
    if (!key || Array.isArray(key)) {
      return;
    }
    Promise.all([
      fetch(`/search/${key}/related?direction=older&limit=5`),
      fetch(`/search/${key}/related?direction=newer&limit=20`),
    ])
      // Transform all to JSON
      .then((data) =>
        Promise.all(data.map((d) => d.json() as Promise<ISearchResult>))
      )
      .then((data) => {
        const messages = data
          // Flatten
          .reduce((acc, cur) => acc.concat(cur.results), [] as IMessage[])
          // Only uniques
          .filter(
            (item, index, self) =>
              self.findIndex((t) => t.id === item.id) === index
          )
          // Sort
          .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));
        setRelatedMessages({ messages, main: key });
      });
  };

  const handleType = (result: IMessage) => {
    if (result.type === "message") {
      return (
        <Tooltip title="Plain chat message">
          <MessageOutlined />
        </Tooltip>
      );
    }

    if (result.type === "messageWithAttachments") {
      return (
        <Tooltip title="Message has attachments, the contents of those attachments are not shown for privacy reasons but the conversation is still here">
          <PaperClipOutlined />
        </Tooltip>
      );
    }
  };

  const panels = data.results.map((result, index) => {
    return (
      <Panel
        header={truncateString(`${new Date(result.timestamp).toLocaleString()} - ${result.content}`, 150)}
        key={result.id}
        extra={
          <>
            <Tooltip title="Score of the result">
              <Tag>{Math.round(result.score * 100) / 100}</Tag>
            </Tooltip>
            {handleType(result)}
          </>
        }
      >
        <ChatTimeline data={relatedMessages} />
      </Panel>
    );
  });

  return (
    <Collapse defaultActiveKey={["1"]} onChange={callback} accordion={true}>
      {panels}
    </Collapse>
  );
}
