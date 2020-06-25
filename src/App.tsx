import React from 'react';
import { hot } from "react-hot-loader/root";
import Map3DView from './Map3DView';

import './App.css';

function App() {
  return (
    <div className="App">
        <Map3DView />
    </div>
  );
}

export default hot(App);
