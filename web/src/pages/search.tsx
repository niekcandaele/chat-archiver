import { Input } from 'antd';
import React, { ReactElement, useState } from 'react';
import styled from 'styled-components';

import { Output } from '../components/output';

const OutputContainer = styled.pre`
  padding: 4rem;
  text-align: left;
`

export interface ISearchResult {
  score: number,
  results: Record<string,any>[]
}

export function Search() {
  const [result, setResult] = useState<ISearchResult>();

  const onSearch = (value: React.FormEvent<HTMLInputElement>) => {
    // @ts-expect-error Some types are missing
    fetch(`/search?query=${value.target.value}`)
    .then(res => res.json())
    .then(data => setResult(data))
    .catch(err => setResult({score: 0, results: [{error: err.message}]}))
  }

  const debounce = (func: Function, wait: number) => {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    }
  }


  return (
    <div >
      <Input placeholder="Search query" onInput={debounce(onSearch, 1000)} />
      <OutputContainer>
        <Output data={result} />
        </OutputContainer>
    </div>
  );
}


