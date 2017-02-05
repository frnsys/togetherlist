import React from 'react';
import {Link} from 'react-router';

const Header = (props) => {
  return (
    <header>
      <div className="header-bar">
        <h1 className="logo"><Link to="/"><img src="/assets/logo.png" alt="togetherlist logo" /><b>together</b>list</Link></h1>
        <ul className="get-involved">
          <li><a href="https://twitter.com/thetogetherlist" target="_blank">Contact Us</a></li>
          <li><a href="https://docs.google.com/forms/d/e/1FAIpQLScS3scl2_LiNyDk0jf1CCPF9qsZlmrlvTWW_ckMlhGeEL0OXw/viewform?c=0&w=1" target="_blank">Submit Your Organization</a></li>
        </ul>
      </div>
      <section className="content">{props.content}</section>
    </header>
  );
};

export default Header;
