import React, { Component, Fragment } from 'react'
import Thumbnail from '../Thumbnail'
import { withApp, Stage, Sprite,Text, Container } from "react-pixi-fiber";
import _ from 'lodash'
import * as PIXI from "pixi.js";


import { SlideInfo, SlideType, DIR } from 'Supporters/SlideInfo';
import keyCodes from 'Supporters/keyCodes';
const KEY = keyCodes.Keymap;

let plusX = 0;

let plusXMap = new Map();
let visibleObjtMap = new Map();

const LOG = true;
const RED = LOG ? (msg, ...args) => {
  console.log('%c ' + msg, 'color: white; background: red', ...args);
} : () => { };

export default class BlockList extends Component {
    state = { 
        beforeIndex :0,
        nextIndex : 0
    }

    onKeyDown = (event) => {
        //RED('[onKeyDown] ');
        const {
          focusedIdx,
          viewIdx: viewStartIdx,
        } = this.state;
        const {
          onKeyDown,
          onFocusChanged
        } = this.props;
    
        if (onKeyDown) {
          if (onKeyDown(event, focusedIdx)) {
            return true;
          }
        }
    
        const { animation } = this.state;
        if (animation) {
          return;
        }
    
        RED('1[onKeyDown] focusedIdx=', focusedIdx, ', viewStartIdx=', viewStartIdx, 'onFocusChanged=', onFocusChanged);
    
        const {
          //id,
          idx,
          children,
          type,
          looping,
          rotate
        } = this.props;
    
        const bLooping = rotate || looping;
    
        const maxItem = SlideInfo[type].maxItem;
        const list = React.Children.toArray(children);
        const totalItem = list.length;
    
        const viewEndIdx = viewStartIdx + maxItem - 1;
        let nextViewStart = viewStartIdx;
        let nextFocusIdx = focusedIdx;
    
        switch (event.keyCode) {
          case KEY.LEFT:
            // 루핑 처리
            if (focusedIdx === 0 && bLooping) {
              nextFocusIdx = totalItem - 1;
              nextViewStart = totalItem - maxItem;
              if (nextViewStart < 0) {
                nextViewStart = 0;
              }
              this.setState({
                focusedIdx: nextFocusIdx,
                viewIdx: nextViewStart
              });
              if (this.fm) {
                this.fm.setListInfo({
                  curIdx: nextFocusIdx,
                  page: nextViewStart
                });
              }
              if (focusedIdx !== nextFocusIdx) {
                if (onFocusChanged) {
                  onFocusChanged(nextFocusIdx);
                }
              }
              return;
            }
    
            nextFocusIdx--;
            if (nextFocusIdx < 0) {
              nextFocusIdx = 0;
            }
    
            RED('nextFocusIdx=', nextFocusIdx, ', viewStartIdx=', viewStartIdx);
    
            // view 가 이동해야되는지 체크해서 slideByDirection를 사용해서 view 이동
            if (nextFocusIdx === viewStartIdx) {
              if (viewStartIdx >= 1) {
                nextViewStart--;
                if (nextViewStart < 0) {
                  nextViewStart = 0;
                }
              }
            } else {
              if (nextFocusIdx < viewStartIdx) {
                nextViewStart = nextFocusIdx;
              }
            }
    
            this.setState({
              focusedIdx: nextFocusIdx
            });
            if (this.fm) {
              // console.error('AEDSlider.onKeyDown => fm의 curIdx 변경', nextFocusIdx);
              this.fm.setListInfo({
                curIdx: nextFocusIdx
              });
            }
    
            //RED('LEFT nextFocusIdx=', nextFocusIdx, ', focusedIdx=', focusedIdx, 'onFocusChanged=', onFocusChanged);
            if (focusedIdx !== nextFocusIdx) {
              if (onFocusChanged) {
                onFocusChanged(nextFocusIdx);
              }
            }
    
            RED('>> viewStartIdx=', viewStartIdx, ', nextViewStart=', nextViewStart);
            if (viewStartIdx !== nextViewStart) {
              // console.error('G2AEDSlider.slideTo', nextViewStart);
              this.slideByDirection(DIR.LEFT, nextViewStart);
              if (this.fm) {
                this.fm.setListInfo({
                  page: nextViewStart
                });
              }
            }
            return true;
    
          case KEY.RIGHT:
            // 루핑 처리
            if (focusedIdx === (totalItem - 1) && bLooping) {
              nextFocusIdx = 0;
              nextViewStart = 0;
    
              this.setState({
                focusedIdx: nextFocusIdx,
                viewIdx: nextViewStart
              });
              if (this.fm) {
                this.fm.setListInfo({
                  curIdx: nextFocusIdx,
                  page: nextViewStart
                });
              }
              if (focusedIdx !== nextFocusIdx) {
                if (onFocusChanged) {
                  onFocusChanged(nextFocusIdx);
                }
              }
              return;
            }
            nextFocusIdx++;
            if (nextFocusIdx >= totalItem) {
              nextFocusIdx = totalItem - 1;
            }
    
            RED('nextFocusIdx=', nextFocusIdx, ', viewEndIdx=', viewEndIdx);
            // view 가 이동해야되는지 체크해서 slideByDirection를 사용해서 view 이동
            if (nextFocusIdx === viewEndIdx) {
              if (viewEndIdx < totalItem) {
                nextViewStart++;
                if (nextViewStart + maxItem > totalItem) {
                  nextViewStart = totalItem - maxItem;
                }
              }
            } else {
              if (nextFocusIdx > viewEndIdx) {
                nextViewStart = totalItem - maxItem;
              }
            }
    
            this.setState({
              focusedIdx: nextFocusIdx
            });
            if (this.fm) {
              this.fm.setListInfo({
                curIdx: nextFocusIdx
              });
            }
    
            if (focusedIdx !== nextFocusIdx) {
              if (onFocusChanged) {
                onFocusChanged(nextFocusIdx);
              }
            }
    
            RED('>> viewStartIdx=', viewStartIdx, ', nextViewStart=', nextViewStart);
            if (viewStartIdx !== nextViewStart) {
              // console.error('G2AEDSlider.slideTo', nextViewStart);
              this.slideByDirection(DIR.RIGHT, nextViewStart);
              if (this.fm) {
                this.fm.setListInfo({
                  page: nextViewStart
                });
              }
            }
            return true;
          case KEY.ENTER:
            const { onSelectChild } = this.props;
            if (onSelectChild) {
              onSelectChild(idx, focusedIdx);
            }
            break;
          case KEY.FAV:
          case KEY.FAV_KEY:
            const { onSelectFavorite } = this.props;
            if (onSelectFavorite) {
              onSelectFavorite(idx, focusedIdx);
            }
            break;
          case KEY.SKIP_NEXT:
          case KEY.NEXT_JUMP_KEY:
            if (focusedIdx === totalItem - 1) { // 맨 마지막 항목에서 next 시
              nextFocusIdx = 0;
              nextViewStart = 0;
            } else { // 아닐경우
              nextFocusIdx += maxItem;
              if (nextFocusIdx >= totalItem) {
                nextFocusIdx = totalItem - 1;
              }
              nextViewStart += maxItem;
              if (nextViewStart + maxItem > totalItem) {
                nextViewStart = totalItem - maxItem;
              }
              if (nextViewStart === nextFocusIdx) {
                if (nextViewStart !== 0) {
                  nextViewStart -= 1;
                }
              }
            }
            if (nextViewStart < 0) {
              nextViewStart = 0;
            }
            this.setState({
              focusedIdx: nextFocusIdx,
              viewIdx: nextViewStart
            });
    
            if (focusedIdx !== nextFocusIdx) {
              if (onFocusChanged) {
                onFocusChanged(nextFocusIdx);
              }
            }
    
            if (this.fm) {
              this.fm.setListInfo({
                curIdx: nextFocusIdx,
                page: nextViewStart
              });
            }
    
            break;
          case KEY.SKIP_PREV:
          case KEY.PRE_JUMP_KEY:
            if (focusedIdx === 0) {
              nextFocusIdx = totalItem - 1;
              nextViewStart = totalItem - maxItem;
            } else {
              nextFocusIdx -= maxItem;
              if (nextFocusIdx < 0) {
                nextFocusIdx = 0;
              }
              nextViewStart -= maxItem;
              if (nextViewStart < 0) {
                nextViewStart = 0;
              }
              if (focusedIdx === totalItem - 1) { // 맨마지막에서 이벤트했을시 page을 -1더 해줌
                if (nextViewStart > 0) {
                  nextViewStart++;
                }
                if (nextViewStart === 0 && nextFocusIdx === maxItem - 1) { // page0에 위치했는데 maxItem에 걸릴때 page를 +1더 해줌
                  nextViewStart++;
                }
              }
            }
            if (nextViewStart < 0) {
              nextViewStart = 0;
            }
            this.setState({
              focusedIdx: nextFocusIdx,
              viewIdx: nextViewStart
            });
    
            if (focusedIdx !== nextFocusIdx) {
              if (onFocusChanged) {
                onFocusChanged(nextFocusIdx);
              }
            }
    
            if (this.fm) {
              this.fm.setListInfo({
                curIdx: nextFocusIdx,
                page: nextViewStart
              });
            }
            break;
          default: break;
        }
      }

    // shouldComponentUpdate(nextProps){
    //     console.log(nextProps.visible)
    //     if(nextProps.visible){
    //         return true;
    //     }else{
    //         if ( this.props.visible ) {
    //             return true
    //         }
    //     }
    //     return false
    // }
    componentDidMount(){
        const { containerIndex } =this.props;
        //default 세팅
        //console.log("componentDidMount ", containerIndex)

        if ( visibleObjtMap.has(containerIndex) ) {
            //console.log('있음!')
            let visibleObj = visibleObjtMap.get(containerIndex)
            visibleObjtMap.set(containerIndex, visibleObj)
        }else{ //초기 세팅 
            //console.log('없음!')
            let visibleObj = this.getVisibleZoneDefault();
            visibleObjtMap.set(containerIndex, visibleObj)
        }

        // const fm = new FM({
        //     id: 'blocks',
        //     type: 'blocks',
        //     row: 1,
        //     col: childList.length,
        //     focusIdx: 0,
        //     page: 0,
        //     maxItem,
        //     curIdx: 0,
        //     startIdx: 0,
        //     lastIdx: childList.length - 1,
        //     bRowRolling: rotate,
        //     onFocusKeyDown: this.onKeyDown,
        //     onFocusContainer: this.onFocused,
        //     onBlurContainer: this.onBlured,
        //     onFocusChild: this.onFocusChanged
        //   });
        //   setFm(id, fm);
        //   this.fm = fm;
        //   this.setState({
        //     focusedIdx: 0
        //   });
    }
    renderBlock = () => { 
        const { 
                thumbnailContainer,
                containerIndex,
                currentFocusList,
                visible,
                cursorMap,
                newCursor,
                dir,
            } = this.props;


        //console.log("visible ", visible)
        //if( thumbnailContainer.type === 'list' && visible ){ // 
        if( thumbnailContainer.type === 'list'){ // 
            
             let visibleObj = new Object();
             //visibleObj = this.getVisibleZone(containerIndex) 

             if( dir === null ) { //default setting
                visibleObj = this.getVisibleZoneDefault();
                visibleObjtMap.set(containerIndex, visibleObj)
             }

             if(currentFocusList.selected ){ //선택된 애들만 
                //console.log(dir)
                if(dir === 'LEFT'){ 
                    let visibleObjPrev = visibleObjtMap.get(containerIndex)
                    visibleObj =this.getVisibleZoneLeft(containerIndex, visibleObjPrev);
                    visibleObjtMap.set(containerIndex, visibleObj)
                }
                else if(dir === 'RIGHT'){
                    let visibleObjPrev = visibleObjtMap.get(containerIndex)
                    visibleObj = this.getVisibleZoneRight(containerIndex, visibleObjPrev);
                    //console.log(visibleObj)
                    visibleObjtMap.set(containerIndex, visibleObj)
                }
                
                // else if(dir === 'UP'){ 
                //     if( containerIndex !== -1 ){
                //         let visibleObj = visibleObjtMap.get(containerIndex + 1)
                //         visibleObjtMap.set(containerIndex, visibleObj)
                //     }
                // }
                // else if(dir === 'DOWN'){
                //     if( containerIndex !== 0 ){
                //         let visibleObj = visibleObjtMap.get(containerIndex -1)
                //         visibleObjtMap.set(containerIndex, visibleObj)
                //         //handleFocusList(visibleObj.indexCounter)
                //     }
                // }
            }

            visibleObj = visibleObjtMap.get(containerIndex)
            //console.log(containerIndex, " ", visibleObj)

            //일단은 이걸로 처리해놈 
            if( _.isNil(visibleObj) ) {
                return
            } 
             let visibleIndexList = visibleObj.visibleIndexList // 썸네일 visible 관리 리스트
             let lastIndexFlag = visibleObj.lastIndexFlag       // 마지막 도달했는지
             let beforeIndex = visibleObj.beforeIndex           // 현재 보여지는 썸네일 최 좌측
             let nextIndex = visibleObj.nextIndex               // 현재 보여지는 썸네일 최 우측
             let indexCounter = visibleObj.indexCounter         // 현재 선택된 썸네일이 보이는 썸네일 중에서 몇번쨰 인덱스인지
             let moveFlag = visibleObj.moveFlag;

             console.log("lastIndexFlag ", lastIndexFlag)

             //이동후 인덱스 카운터 계산 
             let currentIndex = currentFocusList.index
             let indexCounterMoveAfter = 0;
             for(let i = beforeIndex; i < nextIndex; i++){
                indexCounterMoveAfter += 1; 
                 if( currentIndex === i){
                     break;
                  }
             }
             //console.log("indexCounterMoveAfter", indexCounterMoveAfter)
            // 현재 값들 부모 맵에 세팅 
             let focusMoveObj = {
                indexCounterMoveAfter : indexCounterMoveAfter,
                beforeIndex : beforeIndex,
                nextIndex : nextIndex,
                visibleIndexList : visibleIndexList
             }
             cursorMap.set(containerIndex, focusMoveObj)
        
            // if( containerIndex === 0)
            //     console.log("indexCounter " , indexCounter)
    
            //픽시 컨테이너  밀기 
            if(currentFocusList.selected ){ //선택된 애들만 
                if( dir === 'RIGHT'){
                    let selected = currentFocusList.selected && currentFocusList.index > 3
                    if( selected && !lastIndexFlag) {
                        if( currentFocusList.index !==  thumbnailContainer.items.length - 1 ){
                            if( plusXMap.has(containerIndex) ){ //있으면 
                                let temp = plusXMap.get(containerIndex)
                                if(moveFlag){
                                    //console.log(moveFlag)
                                    temp -= 330;
                                }
                                plusXMap.set( containerIndex , temp )
                            }else{ //초기 세팅 겸
                                plusXMap.set( containerIndex , -330 )
                            }     
                        }
                    }
                }else if( dir === 'LEFT'){
                    //현재 index가 전체 리스트 보다 작고
                    let selected = currentFocusList.selected && currentFocusList.index > 0
                    if(selected){
                        if( currentFocusList.index !== 0 ){
                            if( plusXMap.has(containerIndex)){ //있으면 
                                let temp = plusXMap.get(containerIndex)
                                if(moveFlag){
                                    temp += 330;
                                }
                                plusXMap.set( containerIndex , temp )
                            }
                        }
                    }
                }
                // else if(dir === 'DOWN'){
                //     let selected = currentFocusList.selected
                //     if(containerIndex !== 14  && selected){
                //         let temp = plusXMap.get(containerIndex - 1)
                //         //console.log("DOWN ", temp)
                //         if(!_.isNil(temp)){
                //             plusXMap.set( containerIndex , temp )
                //         }
                //     }
                // }
                // else if( dir === 'UP'){
                //     let selected = currentFocusList.selected
                //     if(containerIndex !== -1  && selected){
                //         let temp = plusXMap.get(containerIndex + 1)
                //         //console.log("UP ", temp)
                //         if(!_.isNil(temp)){
                //             plusXMap.set( containerIndex , temp )
                //         }
                //     }
                // }
            }
        
            ///
            // if(containerIndex === 0){
            //     console.log('visibleIndexList ', visibleIndexList)
            // }
            //console.log('plusXMap.get',containerIndex, ' = ', plusXMap.get(containerIndex))
            return (

                <Container x={100 + ( plusXMap.has(containerIndex) ?  plusXMap.get(containerIndex) : 0 ) } y={ 5 * containerIndex }  
                            anchor={new PIXI.Point(0.5,0.5)} 
                            ref = {ref =>{  this.container = ref }} 
                            visible ={visible}
                            >
                    <Text text={thumbnailContainer.title}
                            x ={ -90 - ( plusXMap.has(containerIndex) ?  plusXMap.get(containerIndex) : 0  )}
                            y={ 600 * containerIndex - 270}
                            style={{ fontSize: 30, fontWeight: 'bold' }}  />
                    
                    <Text text={currentFocusList.index + 1 +"/" + thumbnailContainer.items.length }
                            x ={ 1450 - ( plusXMap.has(containerIndex) ?  plusXMap.get(containerIndex) : 0  )}
                            y={ 600 * containerIndex - 270}
                            style={{ fontSize: 30 }}  />
                    {     
                        thumbnailContainer.items.map((thumbnail, key ) => {
                        //thumbnailItems[0].map((thumbnail, key ) => {
                       // console.log("key "  , key)
                       
                            return ( <Thumbnail 
                                            key ={key} 
                                            title = { thumbnail.title }
                                            src = {thumbnail.src} 
                                            x={330 * key + 50 }
                                            y={600 * containerIndex }
                                            //selected = {currentFocusList.selected && currentFocusList.index === key  } 
                                            selected = {currentFocusList.selected && currentFocusList.index === key  } 
                                            containerIndex = {containerIndex}
                                            thumbnailVisible = {visibleIndexList[key]}
                                          
                                            >
                                    </Thumbnail> )
                        })
                    }
                </Container>
            )
        }
    }
    
    //맨 처음 초기 렌더링시 
    getVisibleZoneDefault = () => {
        const { 
                thumbnailContainer,
            } = this.props;
        let beforeIndex = 0 ;
        let nextIndex = 5;
        let visibleIndexList = [];
        thumbnailContainer.items.map((item, key) => {
            if( beforeIndex <= key  && key < nextIndex){
                visibleIndexList.push(true)
            }else{
                visibleIndexList.push(false)
            }
        })
        return {
            visibleIndexList:  visibleIndexList,
            lastIndexFlag : false,
            beforeIndex : beforeIndex,
            nextIndex : nextIndex,
            indexCounter : 0,
        }

    }


    getVisibleZoneRight = (containerIndex, visibleObjPrev) => {
        const { currentFocusList,
                thumbnailContainer,
                } = this.props;
        let thumblength = thumbnailContainer.items.length
        let beforeIndex = visibleObjPrev.beforeIndex
        let nextIndex = visibleObjPrev.nextIndex
        let selected = ( currentFocusList.selected && currentFocusList.index > 0 )
        let visibleIndexList = []
        let lastIndexFlag  = false;
        let moveFlag = false;
        let currentIndex = currentFocusList.index
        let indexCounter = 0;
        for(let i = beforeIndex; i < nextIndex; i++){
            indexCounter += 1; 
            if( currentIndex === i){
                break;
             }
        }
        

        // if(containerIndex === 0){ //debug
        //     console.log("visibleObjPrev.visibleIndexList ", visibleObjPrev.visibleIndexList)
        //     console.log(beforeIndex, nextIndex)
        //     console.log("indexCounter ", indexCounter)
        //     console.log("currentFocusList.index " , currentFocusList.index)
        // }
        
        // 3, 4번째일경우는 보여지는 썸네일은 그대로, 
        //그대로 내려줌 
        // 나중에 동적으로 인덱스 변경 해야함 
        //console.log(" currentFocusList.index", currentFocusList.index)
        if( selected && indexCounter !== 5  || currentFocusList.index === thumblength - 1 ){
            visibleIndexList = visibleObjPrev.visibleIndexList;
        }

        //indexCounter가 1,2인 경우에는 보여지는 컨테이너가 움직여야함 
        else if( ( indexCounter === 5 && selected )){
      
            nextIndex = currentFocusList.index + 2;  
            beforeIndex = nextIndex - 5      

            thumbnailContainer.items.map((item, key) => {
                if( beforeIndex <= key  && key < nextIndex){
                    visibleIndexList.push(true)
                }else{
                    visibleIndexList.push(false)
                }
            })
    
    //        console.log("visibleIndexList ", visibleIndexList)
            if(indexCounter === 5){
                moveFlag = true;
            }
        }

        return { 
                visibleIndexList: visibleIndexList,
                lastIndexFlag : lastIndexFlag,
                beforeIndex : beforeIndex,
                nextIndex : nextIndex,
                indexCounter : indexCounter,
                moveFlag : moveFlag,
            } 
    }
    //프로토타입
    getVisibleZoneLeft = (containerIndex, visibleObjPrev) => {
        const { currentFocusList,
                thumbnailContainer,
                } = this.props;
        let beforeIndex = visibleObjPrev.beforeIndex
        let nextIndex = visibleObjPrev.nextIndex
        let selected = ( currentFocusList.selected && currentFocusList.index >= 0 )
        let visibleIndexList = []
        let lastIndexFlag  = false;
        let moveFlag = false;
        let currentIndex = currentFocusList.index
        let indexCounter = 0;
        for(let i = beforeIndex; i < nextIndex; i++){
            indexCounter += 1; 
            if( currentIndex === i){
                break;
             }
        }

        
        // if(containerIndex === 0){ //debug
        //     console.log("visibleObjPrev.visibleIndexList ", visibleObjPrev.visibleIndexList)
        //     console.log(beforeIndex, nextIndex)
        //     console.log("indexCounter ", indexCounter)
        //     console.log("currentFocusList.index " , currentFocusList.index)
        // }
        
        // 3, 4번째일경우는 보여지는 썸네일은 그대로, 
        //그대로 내려줌 
        // 나중에 동적으로 인덱스 변경 해야함 


        if( selected && indexCounter === 3 || indexCounter === 4 ){
            visibleIndexList = visibleObjPrev.visibleIndexList;
        }
        if( selected && currentFocusList.index === 0 ){
            visibleIndexList = visibleObjPrev.visibleIndexList;
        }
        //indexCounter가 1,2인 경우에는 보여지는 컨테이너가 움직여야함 
        else if( ( indexCounter === 1 || indexCounter === 2 ) && selected ){

            beforeIndex = currentFocusList.index - 1 
            nextIndex = beforeIndex + 5;  

            if( beforeIndex ===  -1 ){
                lastIndexFlag = true;
                nextIndex += 1;
            }  
            thumbnailContainer.items.map((item, key) => {
                if( beforeIndex <= key  && key < nextIndex){
                    visibleIndexList.push(true)
                }else{
                    visibleIndexList.push(false)
                }
            })

            if(indexCounter === 1){
                moveFlag = true;
            }

            //console.log("visibleIndexList ", visibleIndexList)
        }

        return { 
                visibleIndexList: visibleIndexList,
                lastIndexFlag : lastIndexFlag,
                beforeIndex : beforeIndex,
                nextIndex : nextIndex,
                indexCounter : indexCounter,
                moveFlag : moveFlag,
            } 
    }


    render(){
        //console.log('render')Z c
        const { renderBlock } = this; 
        return (
            <Fragment>
                {renderBlock()}
            </Fragment>
        )


    }

    
}
    
