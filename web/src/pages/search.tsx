import { Input } from 'antd';
import React, { ReactElement, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { Output } from '../components/output';

const OutputContainer = styled.pre`
  text-align: left;
  padding-top: 2rem;
`;

export interface IMessage {
  uid: string;
  content: string;
  author: string;
  timestamp: number;
  platformType: 'discord';
  platformChannelId: string;
  platformGuildId: string | null;
  platformId: string;
  attachments: IAttachment[]
}
export interface IAttachment {
  data: string;
  url: string;
}

export interface ISearchResult {
  score: number;
  results: IMessage[];
}

export function Search() {
  const navigate = useNavigate();
  const { query } = useParams();
  const [result, setResult] = useState<ISearchResult>();

  const onSearch = (value: React.FormEvent<HTMLInputElement>) => {
    // @ts-expect-error some type shenanigans
    if (value.target && value.target.value) {
      // @ts-expect-error some type shenanigans
      navigate(`/search/${value.target.value}`);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    if (!query) {
      return;
    }

    fetch(`/search?query=${query}`)
      .then((res) => res.json())
      .then((data) => setResult(data))
      .catch(console.error);
  }, [query]);

  const debounce = (func: Function, wait: number) => {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  return (
    <div>
      <Input placeholder="Search query" onInput={debounce(onSearch, 1000)} />
      <OutputContainer>
        <Output data={result} />
      </OutputContainer>
    </div>
  );
}
