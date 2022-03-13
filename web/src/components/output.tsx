import { Collapse } from 'antd';
import React, { ReactElement, useState } from 'react';

import { ChatTimeline } from './chatTimeline';
import { ISearchResult } from './search';

const { Panel } = Collapse;

export interface IRelatedMessage {
  id: string,
  timestamp: string,
  content: string,
  score: number,
  channel: string,
  author: string
}

export function Output({ data }: { data?: ISearchResult }) {
  const [relatedMessages, setRelatedMessages] = useState<{results: IRelatedMessage[]}>({results: []});
  if (!data || !data.results) {
    return <div>Search something first :)</div>;
  }

  const callback = (key: string | string[]) => {
    console.log(key)
    if (!key) {
      return;
    }
    fetch(`/search/${key}/related`)
    .then(res => res.json())
    .then(data => setRelatedMessages(data))
    .catch(err => setRelatedMessages({results: []}))
  }

  const panels = data.results.map((result, index) => {
    return (
      <Panel
        header={`${result.timestamp} - ${result.content}`}
        key={result.id}
      >
        <ChatTimeline data={relatedMessages.results}/>
      </Panel>
    );
  });

  return (
    <Collapse defaultActiveKey={["1"]} onChange={callback} accordion={true}>
      {panels}
    </Collapse>
  );
}
