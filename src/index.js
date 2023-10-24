import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link, Switch, withRouter} from 'react-router-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

import MyNavbar from './MyNavbar';
import PageOfCalendar from './PageOfCalendar.js';
import PageOfMakeRule from './PageOfMakeRule.js';
import PageOfRuleList from './PageOfRuleList';
import PageOfSettings from './PageOfSettings.js';

import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MyNavbar/>
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<PageOfCalendar />}/>
          <Route path="/make" element={<PageOfMakeRule />}/>
          <Route path="/calendar" element={<PageOfCalendar />}/>
          <Route path="/list" element={<PageOfRuleList />}/>
          <Route path="/settings" element={<PageOfSettings />}/>
        </Routes>
      </div>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
