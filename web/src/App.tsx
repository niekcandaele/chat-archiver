import './App.less';

import { HomeFilled, InfoCircleFilled } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import React, { useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';

import { About } from './pages/about';
import { Search } from './pages/search';

const { Content } = Layout;

const SpaceWrapper = styled.div`
  padding: 3rem;
`;

function App() {
  const [current, setCurrent] = useState<string>("home");

  const handleClick = (e: any) => {
    setCurrent(e.key);
  };

  return (
    <div className="App">
      <Layout>
        <Menu onClick={handleClick} selectedKeys={[current]} mode="horizontal">
          <Menu.Item key="home" icon={<HomeFilled />}>
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="about" icon={<InfoCircleFilled />}>
            <Link to="/about">About</Link>
          </Menu.Item>
        </Menu>
          
        <Content>
          <SpaceWrapper>
            <Routes>
              <Route path="/" element={<Search />} />
              <Route path="/search/:query" element={<Search />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </SpaceWrapper>
        </Content>
      </Layout>
    </div>
  );
}

export default App;
