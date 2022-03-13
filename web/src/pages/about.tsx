import { Col, Row, Statistic } from 'antd';
import React, { ReactElement, useEffect, useState } from 'react';
import styled from 'styled-components';

const AboutDiv = styled.div`
  text-align: left;
`;

export function About() {
  const [stats, setStats] = useState<{
    total: number;
    channels: number;
    oldest: string;
    newest: string;
  }>({
    total: 0,
    channels: 0,
    oldest: "",
    newest: "",
  });

  useEffect(() => {
    fetch("/search/stats")
      .then((res) => res.json())
      .then(({ stats }) => setStats(stats))
      .catch(console.error);
  }, []);

  return (
    <AboutDiv>
      <h1>Chat archive and search engine</h1>
      <p>
        Lots and lots of questions get asked and answered daily in different
        chats. When you are a user looking for answers, it can be hard to find
        answers when everything is scattered in different channels and servers
        This is a tool to help you find answers to your questions. It will
        search through the chat archives and provide you with a list of answers.
        You can also search for specific keywords and get a list of answers that
        contain those keywords.
      </p>

      <p>
        This application was made by{" "}
        <a href="https://catalysm.net" target="_blank" rel="noreferrer">
          Catalysm
        </a>{" "}
        for the 7 Days to Die community. You can find the source code on{" "}
        <a
          href="https://github.com/niekcandaele/chat-archiver"
          target="_blank"
          rel="noreferrer"
        >
          Github
        </a>
      </p>

      <h2>Is this only for CSMM?</h2>

      <p>
        <strong>No, this is a tool for everyone and everything.</strong> It is
        not only for CSMM or CPM. If you are the maintainer for a 7D2D help
        channel or a mod developer (or maybe something else) and you want your
        chats indexed here too, send a message to Catalysm and we'll make it
        happen.
      </p>

      <h2>But what about my privacy ?!</h2>

      <p>
        This application is very specific in what messages it scrapes. Only
        public support channels get included, this application does not expose
        any information that is not already exposed. The application does keep
        track of who sent which message in order to provide a better search
        result view (the coloured emojis in front of messages). However, the
        actual authors ID is <strong>NEVER</strong> stored in the database
        directly. Instead, the real ID is passed through a one-way hashing
        algorithm (SHA-512). This means it's possible to know that 2 messages
        were sent by the same user but there is no way to reconstruct the
        original authors ID.
      </p>

      <h2>By the power of GDPR I compel you to delete my data !!</h2>

      <p>Alright, send Catalysm a message and we'll figure something out.</p>

      <h2>Stats</h2>

      <Row gutter={16}>
        <Col span={4}>
          <Statistic title="Total chat messages" value={stats.total} />
        </Col>
        <Col span={4}>
          <Statistic
            title="Discord channels monitored"
            value={stats.channels}
          />
        </Col>
        <Col span={4}>
          <Statistic title="Oldest message" value={new Date(stats.oldest).toLocaleString()} />
        </Col>
        <Col span={4}>
          <Statistic title="Newest message" value={new Date(stats.newest).toLocaleString()} />
        </Col>
      </Row>
    </AboutDiv>
  );
}
