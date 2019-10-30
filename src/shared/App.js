import React, { Component } from 'react';
import { Route, withRouter } from 'react-router-dom';
import { Home, Test, Test2 } from '../pages';

import Core from '../supporters/core.js'

class App extends Component {
    render() {
        const { setHistory } = this;

        return (
            <div>
                <HistoryListener setHistory={setHistory}/>
                <Route exact path="/" component={Home}/>
                <Route exact path="/test" component={Test}/>
                <Route exact path="/test2" component={Test2}/>
            </div>
        );
    }

    setHistory = (history) => {
        // Core.inst().setHistory(history);
        Core.inst().setHistory(history);
    };
}

const HistoryListener = withRouter(class Listener extends Component {
    constructor(props) {
        super(props);
        // console.log(this.props.setHistory);
    }
    componentDidMount() {
        // console.log('HistoryManager');
        const { setHistory } = this.props;
        if (setHistory && typeof setHistory === 'function') {
            // console.log('history:', this.props.history);
            setHistory(this.props.history);
        }
    }
    render() {
        return null;
    }
  })

export default withRouter(App);