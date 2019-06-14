import React, { Component } from 'react'
import { Container } from "react-pixi-fiber";

import GlobalMenuBackground from './GlobalMenuBackgound.js';
import GlobalMenuItem from './GlobalMenuItem.js';

const DEBUG = false;
const LOG_DEBUG = false;

const log = DEBUG && LOG_DEBUG ? (msg, ...args) => {
    console.log('[GlobalMenu] ' + msg, ...args);
  } : () => { };
  
  const blue = DEBUG ? (msg, ...args) => {
    console.log('%c[GlobalMenu] ' + msg, 'color: white; background: blue', ...args);
  } : () => { };
  
  const red = DEBUG && LOG_DEBUG ? (msg, ...args) => {
    console.log('%c[GlobalMenu] ' + msg, 'color: white; background: red', ...args);
  } : () => { };

class GlobalMenu extends Component {
  constructor(props){
    super(props)
  }

  render(){
    const { list } = this.props;

    return (
      <Container>
        <Container
          alpha={0.5}>
          <GlobalMenuBackground
            x={0} 
            y={0} 
            width={1980} 
            height={50} 
            fill={0x111111}
          />
        </Container>
        {this.renderGlobalMenuList(list)}
      </Container>
    )
  }

  renderGlobalMenuList = (list) => {
    const { focusList } = this.props;
    const menuWidth = (1920 / list.src.length);
    // console.log(this.props);

    return list.src.map( (menuItem, idx) => {
      return (
        <GlobalMenuItem
          menuItem={menuItem}
          menuWidth={menuWidth}
          focusIdx={focusList.index}
          idx={idx}
          key={idx}
          selected={focusList.selected && focusList.index === idx}
        />
      )
    })
  }
}

export default GlobalMenu;