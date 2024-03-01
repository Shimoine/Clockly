import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Link, Switch, withRouter} from 'react-router-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

import MyNavbar from './MyNavbar';
import PageOfCalendar from './PageOfCalendar.js';
import PageOfMakeRule from './PageOfMakeRule.js';
import PageOfEditRule from './PageOfEditRule.js';
import PageOfRuleList from './PageOfRuleList';
import PageOfSettings from './PageOfSettings.js';

import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
  <React.StrictMode>
    <MyNavbar/>
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<PageOfCalendar />}/>
          <Route path="/make" element={<PageOfMakeRule />}/>
          <Route path="/edit/:name" element={<PageOfEditRule />}/>
          <Route path="/calendar" element={<PageOfCalendar />}/>
          <Route path="/list" element={<PageOfRuleList />}/>
          <Route path="/settings" element={<PageOfSettings />}/>
        </Routes>
      </div>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
