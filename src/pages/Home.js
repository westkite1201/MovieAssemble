import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { withApp, Stage, Sprite,Text, Container } from "react-pixi-fiber";
import * as PIXI from "pixi.js";
import {TweenLite,  Power2,scrollTo} from "gsap/TweenMax";
import _ from 'lodash'
import BlockList from '../components/BlockList'
import TopBanner from '../components/TopBanner'
import GlobalMenu from '../components/GlobalMenu'

import itemListJson from './itemList.json';

import Core from 'Supporters/core';
import keyCodes from 'Supporters/keyCodes';

import FocusManager from 'Supporters/FocusManager';

// import GlobalMenuItem from '../components/GlobalMenuItem'

// http://pixijs.io/examples/#/basics/basic.js
const OPTIONS = {
  backgroundColor: 0xced4da
};
let cursor = {
  x : 0 ,
  y : 0 ,
}
//현재의 문제는 커서가 단일 

let cursorMap = new Map();
const centerAnchor = new PIXI.Point(0.5, 0.5);
// class Home extends Component {
class Home extends FocusManager {
  constructor(props){
    super(props);
  }
  tHandle = null
  isMoving = false
  state = {
    isChanged: false
    ,
    dir : null,
    cursor: {
      x: 0,
      y: 0
    },
    bannerFocus: false,
    scrollPos: 50,
    focusList: {
      gnb: {
        selected: true,
        index: 3,
        length: 12,
        priority: 'index'
      },
      topBanner: {
        selected: false,
        index: null,
        length: 3
      },

      currentMovie: {
        selected: false,
        index: 0,
        length: 15
      },
      currentMovie2: {
        selected: false,
        index: 0,
        length: 15,
        scrollPos: 700
      },
      currentMovie3: {
        selected: false,
        index: 0,
        length: 15,
        scrollPos: 1300
      },
      currentMovie4: {
        selected: false,
        index: 0,
        length: 15,
        scrollPos: 1900
      },
      currentMovie5: {
        selected: false,
        index: 0,
        length: 15,
        scrollPos: 2450
      },
      currentMovie6: {
        selected: false,
        index: 0,
        length: 15,
        scrollPos: 3050
      },
      currentMovie7: {
        selected: false,
        index: 0,
        length: 15,
        scrollPos: 3650
      },
      currentMovie8: {
        selected: false,
        index: 0,
        length: 15,
        scrollPos: 4250
      },
      currentMovie9: {
        selected: false,
        index: 0,
        length: 15,
        scrollPos: 4850
      },
      currentMovie10: {
        selected: false,
        index: 0,
        length: 15,
        scrollPos: 5400
      },
    },
    rotation: 0,
    textures : '',
    gnbMenuList : [
      {
        type: 'list',
        src: [
          {menu_nm: "allMenu", imgs: {normal: './gnb/gnbmenu_all_def.png', focus: './gnb/gnbmenu_all_foc.png'}},
          {menu_nm: "momthly", imgs: {normal: './gnb/gnbmenu_NM1000000100_def.png', focus: './gnb/gnbmenu_NM1000000100_foc.png'}},
          {menu_nm: "myBtv", imgs: {normal: './gnb/gnbmenu_NM1000000200_def.png', focus: './gnb/gnbmenu_NM1000000200_foc.png'}},
          {menu_nm: "home", imgs: {normal: './gnb/gnbmenu_NM1000000300_def.png', focus: './gnb/gnbmenu_NM1000000300_foc.png'}},
          {menu_nm: "movie", imgs: {normal: './gnb/gnbmenu_NM1000000400_def.png', focus: './gnb/gnbmenu_NM1000000400_foc.png'}},
          {menu_nm: "tv", imgs: {normal: './gnb/gnbmenu_NM1000000500_def.png', focus: './gnb/gnbmenu_NM1000000500_foc.png'}},
          {menu_nm: "ani", imgs: {normal: './gnb/gnbmenu_NM1000000600_def.png', focus: './gnb/gnbmenu_NM1000000600_foc.png'}},
          {menu_nm: "kids", imgs: {normal: './gnb/gnbmenu_NM1000000700_def.png', focus: './gnb/gnbmenu_NM1000000700_foc.png'}},
          {menu_nm: "docu", imgs: {normal: './gnb/gnbmenu_NM1000000800_def.png', focus: './gnb/gnbmenu_NM1000000800_foc.png'}},
          {menu_nm: "tvApp", imgs: {normal: './gnb/gnbmenu_NM1000000900_def.png', focus: './gnb/gnbmenu_NM1000000900_foc.png'}},
          {menu_nm: "gold", imgs: {normal: './gnb/gnbmenu_NM1000001700_def.png', focus: './gnb/gnbmenu_NM1000001700_foc.png'}},
          {menu_nm: "search", imgs: {normal: './gnb/gnbmenu_search_def.png', focus: './gnb/gnbmenu_search_foc.png'}},
        ]
      }
    ],
    TopBannerInfo : [
      {
        type: 'banner',
        src: [
          {url: './NA1000019988_20190321094120.jpg'},
          {url: './NA1000019992_20190326091433.jpg'},
          {url: './NA1000019997_20190326095719.jpg'}
        ]
      },
    ],
  itemList: itemListJson
  };

  componentDidMount() {
    // console.log('componentDidMount')
    this.tHandle = _.throttle(this.keydownHandler, 50);
    window.addEventListener('keydown', this.tHandle);
    // window.addEventListener('keydown', this.keydownHandler);
  }

  componentWillUnmount() {
    // console.log('componentWillUnmount')
    // window.removeEventListener('keydown', this.keydownHandler)
    window.removeEventListener('keydown', this.tHandle);
    //this.props.app.ticker.remove(this.animate);
  }

  componentWillMount(){
    //Core.inst().run();
  }
  //visibleIndexList를 세팅 
  getVisibleIndexList = (containerNameList) => {
       const { itemList, focusList } = this.state;  
       let visibleIndexList = [];
       let visibleIndexTop = 0;
       let visibleIndexMiddle = 1;
       let visibleIndexBottem = 1;
      // //list형 일 경우 
      // //현재 blocklist는 gnb, banner와 다르고
      for(let containerIndex = 0 ; containerIndex < itemList.length; containerIndex++){

        let selected =  ( focusList[containerNameList[containerIndex + 2]].selected )
       //console.log("selected ", selected ," containerIndex " , containerIndex)
        if( selected && containerIndex > 0 ){
            visibleIndexTop = containerIndex - 1;
            visibleIndexMiddle = containerIndex;
            visibleIndexBottem = containerIndex + 1;
        }
      }
      visibleIndexList.push(visibleIndexTop)
      visibleIndexList.push(visibleIndexMiddle)
      visibleIndexList.push(visibleIndexBottem)
      visibleIndexList.push(visibleIndexBottem + 1)
      // console.log(visibleIndexList)
      return visibleIndexList;
  }
  componentDidUpdate(){
   // window.scrollTo(window.width/2, this.state.scrollPos)
  }
  
  renderBlocks = () => {
    const { itemList, 
            focusList, 
            scrollPos, 
            dir } = this.state; 
    let containerNameList =  Object.keys(focusList);
    let visibleIndexList = this.getVisibleIndexList(containerNameList)

    if ( !_.isNil(this.wrapper)) {
        TweenLite.to(this.wrapper.position, 0.5, {y: -scrollPos});
    }

    return  (
      itemList.map((thumbnailContainer, containerIndex) => {
        let currentFocusList = focusList[containerNameList[containerIndex + 2]]
        // console.log("currentFocusList ",  currentFocusList.selected )
       
        //컨테이너를 렌더링 할지 안할지를 결정
        let visible = false;
        for(let i = 0 ; i < visibleIndexList.length; i++){
          if(visibleIndexList[i] === containerIndex ){
            visible = true
          }
        }


        return ( 
          <Fragment>
            { visible  ? 
              (   
                <BlockList thumbnailContainer = {thumbnailContainer}
                            containerIndex = {containerIndex}
                            currentFocusList = {currentFocusList} //gnb, topBanner는 렌더 안하기 때문
                            dir = {dir}
                            setFocusIndex = {this.setFocusIndex}
                            handleFocusList = {this.handleFocusList}
                            cursorMap = {cursorMap}
                />  
              ) 
              :
              (
                <Fragment/>
              )
            }
            </Fragment>
      
          ) 
        })
    )
  }

   copyObj = (obj) => {
    var copy = {};
    if (Array.isArray(obj)) {
      copy = obj.slice().map((v) => {
        return this.copyObj(v);
      });
    } else if (typeof obj === 'object' && obj !== null) {
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          copy[attr] = this.copyObj(obj[attr]);
        }
      }
    } else {
      copy = obj;
    }
    return copy;
  }
  

  keydownHandler = (e) => {
   // console.log(cursorMap)
    //불변성
    let focusList = this.state.focusList;
    let scrollPos = this.state.scrollPos;
    let dir;
   // let focusList = this.copyObj(this.state.focusList)
    //let scrollPos = this.copyObj(this.state.scrollPos)

    let containerNameList =  Object.keys(focusList);
    
    if (this.isMoving || (e.keyCode !== 40 && e.keyCode !== 39 && e.keyCode !== 38 && e.keyCode !== 37 )) {

      return

    } else {
      // Up
    if (e.keyCode === 38 && cursor.y > 0) {
      //console.log('Keymap.UP: ' + keyCodes.Keymap.UP);
      cursor.y --
      dir = "UP"
    }
    // Down
    else if (e.keyCode === 40 && cursor.y < containerNameList.length - 1) {
      //console.log('Keymap.DOWN: ' + keyCodes.Keymap.DOWN);
        cursor.y ++
        dir = "DOWN"
    }
    // Right
    else if (e.keyCode === 39 ) {
        //rolling
        // cursor.x ++
        // if (cursor.x > focusList[containerNameList[cursor.y]].length - 1) {
        // //if (cursor.x > 5) {
        //   cursor.x = 0
        // }
       // not rolling
       if (cursor.x < focusList[containerNameList[cursor.y]].length - 1) {
          cursor.x ++
        }
        dir = "RIGHT"
    }
      // Left
    else if (e.keyCode === 37) { 
      //rolling
      // cursor.x --
      // if (cursor.x < 0) {
      //     cursor.x = focusList[containerNameList[cursor.y]].length - 1
      // }
      // not rolling
      if (cursor.x > 0) {
          cursor.x --
      }
      dir = "LEFT"
    }
    
    else if (e.keyCode === 13 && cursor.y === 1) {
      this.setState({
        bannerFocus: true
      });
    }

    else {
      this.setState({
        bannerFocus: false
      });
      return;
    }
    containerNameList.forEach(el => {
      if (el === containerNameList[cursor.y]) { //현재 cursor value에 따른 el을 선택함 
          focusList[el].selected = true
        if (focusList[el].selected === false &&  //현재 선택된 컨테이너가 아니고 
            focusList[containerNameList[cursor.y]].priority === 'index' &&  //gnb 메뉴고 
            cursor.x !== focusList[containerNameList[cursor.y]].index) { // index 는 무엇 때문인지?
              cursor.x = focusList[containerNameList[cursor.y]].index  
        }
      } else {//현재 curser 컨테이너가 아닌 경우 
          focusList[el].selected = false
      }
    })
  

    //scroll pos 
    if ( focusList[containerNameList[cursor.y]].scrollPos ) {
        scrollPos = focusList[containerNameList[cursor.y]].scrollPos
    } else {
        scrollPos = 0
    }
    


    if( dir === 'DOWN'){
      let cursorMapIdx = cursor.y - 2;
      //위에서 내려온것 즉 배너에서 내려옴 
      if(cursorMapIdx === 0){
        focusList[containerNameList[cursor.y]].index = 0
        cursor.x = 0
      } 
      else if( cursorMapIdx > 0){
        if ( cursorMap.has(cursorMapIdx - 1) ){
          let curserPrevObj =cursorMap.get(cursorMapIdx - 1) //이전 
          let curserCurrentObj =cursorMap.get(cursorMapIdx ) //지금 현재 
          let downFocusIndex = curserCurrentObj.beforeIndex + curserPrevObj.indexCounterMoveAfter -1
          
          //이전 인덱스가 제일 최하단 
          if(curserPrevObj.nextIndex === 15 && 
            curserPrevObj.indexCounterMoveAfter === 5 &&
            curserCurrentObj.nextIndex !== 15 &&
            curserCurrentObj.indexCounterMoveAfter !== 5 ){
              downFocusIndex -= 1;
          }
          //좌측 최하단 다운시 
          else if(curserPrevObj.nextIndex === 5 && 
            curserPrevObj.indexCounterMoveAfter === 1 &&
            curserCurrentObj.nextIndex !== 5 &&
            curserCurrentObj.indexCounterMoveAfter !== 1 ){
              downFocusIndex += 1;
          }

          focusList[containerNameList[cursor.y]].index = downFocusIndex
          cursor.x = downFocusIndex
        }
      }
    }
    else if( dir === 'UP'){
      let cursorMapIdx = cursor.y - 2;
      if( cursorMapIdx >= 0){
        if ( cursorMap.has(cursorMapIdx + 1) ){
          let curserPrevObj = cursorMap.get(cursorMapIdx + 1) //이전 
          let curserCurrentObj = cursorMap.get(cursorMapIdx ) //지금 현재 
          let upFocusIndex = curserCurrentObj.beforeIndex + curserPrevObj.indexCounterMoveAfter -1
          
          if( curserPrevObj.nextIndex === 15 && 
            curserPrevObj.indexCounterMoveAfter === 5 &&
            curserCurrentObj.nextIndex !== 15 &&
            curserCurrentObj.indexCounterMoveAfter !== 5 ){
              upFocusIndex -= 1;
          }
          else if( curserPrevObj.nextIndex === 5 && 
            curserPrevObj.indexCounterMoveAfter === 1 &&
            curserCurrentObj.nextIndex !== 5 &&
            curserCurrentObj.indexCounterMoveAfter !== 1 ){
              upFocusIndex += 1;
          }
        
          focusList[containerNameList[cursor.y]].index = upFocusIndex
          cursor.x = upFocusIndex
        }
      }
    }
    
    else{ //RIGHT LEFT 
      
      focusList[ containerNameList[cursor.y] ].index = cursor.x
    }

    
     
  
    setTimeout(() => {
        this.isMoving = false
    }, 50)
    this.isMoving = true

    this.setState({
      focusList : focusList,
      scrollPos: scrollPos,
      dir : dir
    })

  }
    
  }
  
  handleFocusList = (setX) => {
    let focusList = this.state.focusList;
    let containerNameList =  Object.keys(focusList);
    focusList[containerNameList[cursor.y]].index = setX

    this.setState({
      focusList : focusList
    })
  }

  render() {
    const{ TopBannerInfo, gnbMenuList, focusList } = this.state;
    const { step, ...props } = this.props;

    return  ( 
      <Stage width={1980} height={1080} options={OPTIONS} >
        <Container ref ={ref => {this.wrapper = ref}}>

          <Container>
            <TopBanner src ={TopBannerInfo[0].src}
                      focusList={focusList.topBanner}
                      setFm = {this.setFm}/>
          </Container>
          
          <Container x={100} y={650}>
            {this.renderBlocks()}
          </Container>
          
          <Container>
            <GlobalMenu list={gnbMenuList[0]} focusList = {focusList.gnb}/>
          </Container>
        </Container>
        
      </Stage>
    )
  }
}


export default (Home);
