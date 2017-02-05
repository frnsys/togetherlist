import React from 'react';
import {Link} from 'react-router';

const Footer = (props) => {
  return (
    <footer>
      <div className="footer-left">
        <img src="/assets/logo.png" alt="togetherlist logo" />
        <Link to="/about">About</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/resources">Resources</Link>
        <a href="https://twitter.com/thetogetherlist">Contact</a>
      </div>
      <div className="copyright">&copy; Togetherlist 2016-2017. All rights reserved.</div>
      <div className="footer-right">
        <span>Follow Us</span>
        <a href="https://www.facebook.com/thetogetherlist"><i className="fa fa-facebook"></i></a>
        <a href="https://twitter.com/thetogetherlist"><i className="fa fa-twitter"></i></a>
      </div>
    </footer>
  );
};

export default Footer;
