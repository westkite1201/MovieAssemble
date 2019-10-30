import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as PIXI from "pixi.js";
import {TweenLite,  Power2} from "gsap/TweenMax";
import { Container, Sprite, Graphics } from "react-pixi-fiber";

import GlobalMenuBackground from './GlobalMenuBackgound.js';

const DEBUG = false;
const LOG_DEBUG = false;

const log = DEBUG && LOG_DEBUG ? (msg, ...args) => {
    console.log('[GlobalMenuItem] ' + msg, ...args);
  } : () => { };
  
  const blue = DEBUG ? (msg, ...args) => {
    console.log('%c[GlobalMenuItem] ' + msg, 'color: white; background: blue', ...args);
  } : () => { };
  
  const red = DEBUG && LOG_DEBUG ? (msg, ...args) => {
    console.log('%c[GlobalMenuItem] ' + msg, 'color: white; background: red', ...args);
  } : () => { };

  const CENTER = new PIXI.Point(0.5, 0.5);


class GlobalMenuItem extends Component {
    constructor(props){
        super(props);

        this.state = {
            url: '',
            focused: true,
            scale: new PIXI.Point(1, 1),
            currentSelected : props.selected,
            isFocused: props.selected,
        };
    }

    componentWillMount(){
        const { menuItem, selected, idx, focusIdx } = this.props;
        const { currentSelected, isFocused } = this.state;
        
        // console.log('componentDidUpdate / menu_nm: ' + menuItem.menu_nm + ', selected: ' + selected + ', currentSelected: ' + currentSelected + ', isFocused: ' + isFocused);
        // console.log('idx: ' + idx + ', focusIdx: ' + focusIdx);
  
        if( menuItem.menu_nm === 'home' ){
          this.setState({
            url: <img src={require(`${menuItem.imgs.focus}`)} alt=''/>,
            // currentSelected: true,
            // isFocused: true,
          })
          
        }
        else{
          this.setState({
            url: <img src={require(`${menuItem.imgs.normal}`)} alt=''/>,
          });
        }
    }
    componentDidMount(){
      const { menuItem, selected } = this.props;
      const { currentSelected, isFocused } = this.state;
      const { grow } = this;
      console.log(this.spr.width);
      // if( menuItem.menu_nm === 'home' ){
      //   TweenLite.to(this.spr.scale, .2, {x: 1.2, y: 1.2, ease: Power2.easeInOut});
      //   this.setState({
      //     isFocused: true,
      //     currentSelected: true
      //   })
      // }
    }

    shouldComponentUpdate(nextProps, nextState){

      const { menuItem, selected, idx, focusIdx } = nextProps;
      const { currentSelected, isFocused } = nextState;

      // console.log('shouldComponentUpdate / next.menu_nm: ' + menuItem.menu_nm 
      // + ', next.selected: ' + selected
      // + ', next.currentSelected: ' + currentSelected 
      // + ', next.isFocused: ' + isFocused
      // + ', next.idx: ' + idx
      // + ', next.focusIdx: ' + focusIdx);
      
      if( idx === focusIdx && !currentSelected ){
        this.grow();
        // this.setState({
        //   url : <img src={require(`${menuItem.imgs.focus}`)} alt=''/>,
        //   currentSelected: true,
        //   isFocused: true,
        // });

        return true;
      }
      
      else if( idx !== focusIdx && currentSelected ){
        this.shrink();
        // this.setState({
        //   url : <img src={require(`${menuItem.imgs.normal}`)} alt=''/>,
        //   currentSelected: false,
        //   isFocused: false,
        // });

        return true;
      }
      else {
        return false;
      }
      // if( selected && currentSelected ){
      //   return true;
      // }
      // else{
      //   return false;
      // }
    }

    componentDidUpdate(){
      const { selected, menuItem, idx, focusIdx } = this.props;
      const { currentSelected, isFocused, test } = this.state;

      // console.log('componentDidUpdate / menu_nm: ' + menuItem.menu_nm + ', selected: ' + selected + ', currentSelected: ' + currentSelected + ', isFocused: ' + isFocused);
      // console.log('idx: ' + idx + ', focusIdx: ' + focusIdx);

      // this.setState({
      //   test: !test
      // });

      // if( idx === focusIdx ){
      //   this.grow();
      // }

      // if( currentSelected && isFocused ){
      //   this.shrink();
      // }

     
    }

    shrink = () => {
      const { menuItem, selected, idx, focusIdx } = this.props;
      const { currentSelected, isFocused } = this.state;

      // console.log('shrink / menu_nm: ' + menuItem.menu_nm 
      // + ', selected: ' + selected
      // + ', currentSelected: ' + currentSelected 
      // + ', isFocused: ' + isFocused
      // + ', idx: ' + idx
      // + ', focusIdx: ' + focusIdx);

      this.setState({
        url : <img src={require(`${menuItem.imgs.focus}`)} alt=''/>,
        currentSelected: false,
        isFocused: false,
      });

      TweenLite.to(this.spr.scale, .2, {x: 1, y: 1, ease: Power2.easeInOut});
      };
    
    grow = () => {
      const { menuItem, selected, idx, focusIdx } = this.props;
      const { currentSelected, isFocused } = this.state;

      // console.log('grow / menu_nm: ' + menuItem.menu_nm 
      // + ', selected: ' + selected
      // + ', currentSelected: ' + currentSelected 
      // + ', isFocused: ' + isFocused
      // + ', idx: ' + idx
      // + ', focusIdx: ' + focusIdx);

      this.setState({
        url : <img src={require(`${menuItem.imgs.normal}`)} alt=''/>,
        currentSelected: true,
        isFocused: true,
      });

      TweenLite.to(this.spr.scale, .2, {x: 1.2, y: 1.2, ease: Power2.easeInOut});

      // const { x, y } = this.props;
      // let posY = y + 50
      // TweenLite.to(this.spr.scale, .2, {x: 0.9, y: 0.9, ease: Power2.easeInOut})
      // TweenLite.to(this.title, .2, {alpha: 1, ease: Power2.easeInOut})
      //TweenLite.to(this.shadowdSprite, .2, {x: {x}, y: {posY}, ease: Power2.easeInOut})
    };

    render() {
        const { menuWidth, idx, menuItem, selected } = this.props;    //properties
        const { grow, shrink } = this;   //methods
        const { url } = this.state;
        
        const normalImage = <img src={require(`${menuItem.imgs.normal}`)} alt=''/>; 
        const focusImage = <img src={require(`${menuItem.imgs.focus}`)} alt=''/>; 
        
        return(
            <Container
                x={menuWidth*idx}
                y={0}
                height={100}
                // width={menuWidth}
                // anchor={new PIXI.Point(-0.5, -0.5)}
                >
                  {/* <GlobalMenuBackground
                    x={10} 
                    y={0} 
                    width={150} 
                    height={50} 
                    fill={0xffd900}
                  /> */}
                  <Sprite
                    // Can Click Mode
                    // buttonMode
                    // interactive

                    // pointerdown={grow}
                    // pointerup={shrink}
                    
                    ref={ref => {
                      this.spr = ref;
                    }}
                    scale={this.state.scale}
                    
                    anchor={CENTER}
                    x={100}
                    y={20}
                    // height={36}
                    texture={ selected ? PIXI.Texture.fromImage(focusImage.props.src) : PIXI.Texture.fromImage(normalImage.props.src) }
                    key={idx}
                  />
        </Container>
        )
    }
}

export default GlobalMenuItem;