import React, { Component } from 'react';
import './style.scss';

class App extends Component {
  // static propTypes = {}
  // static defaultProps = {}
  // state = {}

  render() {
    return (
      <div className="app">
          {this.props.children}
      </div>
    );
  }
}

export default App;