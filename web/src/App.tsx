import './App.less';

import { Layout } from 'antd';
import React from 'react';
import styled from 'styled-components';

import { Search } from './components/search';

const { Header, Content } = Layout;

const SpaceWrapper = styled.div`
  padding: 3rem;
`

function App() {
  return (
    <div className="App">
      <Layout>
        <Header>
          <h1>7D2D Chat archive</h1>
        </Header>
        <Content>
          <SpaceWrapper>
            <Search />
          </SpaceWrapper>
        </Content>
      </Layout>
    </div>
  );
}

export default App;
