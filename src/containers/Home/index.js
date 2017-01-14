import React, { Component } from 'react';
import './style.scss';
import { browserHistory, Link } from 'react-router';

class Home extends Component {
  
   // static propTypes = { }
   // static defaultProps = {}
   state = {
   }
  
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <div className="nht-app">
        <div className="nht-content">
          { this.props.children }
        </div>
        <div className="nht-app__footer">
          <div>
            <span>Made by </span> <a href="https://satyamdev.firebaseapp.com" target="blank"><b>Satyam Dev</b></a>
          </div>
          <div>
                <span>news powered by </span><a href="https://newsapi.org" target="blank"><b>newsapi.org</b></a>
            </div>
        </div>

      </div>
    );
  }
}

export default Home;
