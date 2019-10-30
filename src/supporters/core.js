import React from 'react'
import { isEmpty, isFunction } from 'lodash';
// import appConfig from "../config/app-config";
//import { utility } from "../utils/utility";
import Location from "./Location";
import GlobalInputDispatcher from "./GlobalInputDispatcher";
// import EpgData from '../routes/liveTv/organization/epgData';
import constants, { PATH, GNB_CODE, STB_PROP, STB_TYPE, STB_COMMAND, CTRL_TYPE, CTRL_VALUE, EPG } from './../config/constants';
// import StbInterface, { CHManager } from './stbInterface';
import HistoryManager from 'Supporters/history';
// import { KidsEndCertification } from './../routes/kids/playguide';
//import PlayGuideEnd from './../routes/kids/playguide/PlayGuideEnd';
// import { Communicate as cm, Communicate } from './communicate';
import keyCodes from 'Supporters/keyCodes';
import Axios from 'axios';
// import Utils from 'Util/utils';
// import { CTSInfo } from 'Supporters/CTSInfo';
// import Str from 'Config/str';
// import PopupConfirm from '../components/popup/PopupConfirm';

window.__coreInstance = null;

// const TIMEUNIT = 1800;         //30min
// const TIMEUNIT = 300;         //5min
// const TIME2PIXEL = 1425 / 5400;  //time * (TIME2PIXEL) = width(px) 1425 = 편성표 화면에 보이는 크기

// let kidsFlag = false;

// let oldKey = "";
// let reCount = 0;
// let timeoutID, runtimeID;

let config = {
    core: {
        maxHistoryLimit: 0,
        consoleLog: false,
        errorLog: false,
        warnLog: false,
    }
};


class Core {
    _log() {
        if (config.core.consoleLog) {
            var args = Array.prototype.slice.call(arguments);
            console.log.apply(console, args);
        }
    }

    _warn() {
        if (config.core.warnLog) {
            var args = Array.prototype.slice.call(arguments);
            console.warn.apply(console, args);
        }
    }

    _error() {
        if (config.core.errorLog) {
            var args = Array.prototype.slice.call(arguments);
            console.error.apply(console, args);
        }
    }

    _reject_non_error() {
        if (typeof arguments === 'object')
            return;

        var args = Array.prototype.slice.call(arguments);
        if (config.core.errorLog)
            console.error.apply(console, args[1]);
        args[0]({ error: args[1] });
    }

    static inst() {
        if (window.__coreInstance === null) {
            // this._error("Core instance is not initialized. Create core first");
            console.error("Core instance is not initialized. Create core first");
        }
        return window.__coreInstance;
    }

    static create() {
        if (window.__coreInstance === null) {
            console.log('create core instance');
            window.__coreInstance = new Core();
        } else {
            this._error("Core instance is already created.")
        }

        return window.__coreInstance;
    }

    resetData() {
        this._saveData = '';
    }

    constructor(_history) {
        if (window.__coreInstance) throw new Error("Core 인스턴스 중복 생성");

        ///////// Fields ////////////
        this._stbInfoFlag = false;
        this._recoverFlag = false;
        this._isLock = false;
        // focus격리 모드 마지막의 뷰에 키이벤트를 가둔다.
        // abandon 제외 이벤트 핸들러를 찾지 못할때 발생하는 undefined 로 인한 상위뷰에 이벤트 전달을 막음
        this._isIsolatedFocusMode = false;
        this.mainFocusStack = [];
        this.popupFocusStack = [];
        this.targetFocusStack = null;
        this._saveData = '';

        this.core = {};
        this.console = [];
        this.keyHandler = [];
        this.keyHandlerIndex = -1;
        // this.keyHandler2 = [];
        // this.keyHandlerIndex2 = -1;
        this.menuKeyHandler = null;

        this.popupContainer = '';
        this.toast = '';
        this.gnbMenu = '';
        this.kidsWidget = '';
        this.kidsHome = '';
        this.webRoot = document.getElementById('root');
        this.webPageView = '';
        this.webMenuView = '';
        this.webShow = false;
        this.showMenu = () => { };
        // this.kidsFlag = false;
        this.statePrepareVod = false;  // prepareVOD 상태를 체크 하는 flag
        this.isBlockBackKey = false;  // block back key 상태를 체크 하는 flag
        this.stateRouting = false;
        this.stateRoutingTime = 600;
        this.menuRouting = false;
        this.menuRoutingTime = 500;

        this.preloaded = false;

      window.addEventListener("load", function(event) {
        this.preloaded = false;
      });
    }

    //////////////////////////
    // Getter / Setter
    //////////////////////////
    get saveData() {
        return this._saveData;
    }

    get recoverFlag() {
        return this._recoverFlag;
    }

    get isLock() {
        return this._isLock;
    }

    get isIsolatedFocusMode() {
        return this._isIsolatedFocusMode;
    }

    get inputDispatcher() {
        return this._inputDispatcher;
    }

    get lastFocus() {
        return this.focusStack[this.focusStack.length - 1] || null;
    }

    get focusLength() {
        return this.focusStack.length;
    }

    // get isRun() {
    //     return this._isRunning;
    // }

    // ActiveView : FocusedView
    // get activeView(){
    //   if( this.bindedComponents && this.bindedComponents.length > 0 ){
    //     return this.bindedComponents[0]
    //   } else {
    //     return null;
    //   }
    // }

    get activatedView() {
        return this._activatedView;
    }

    get focusStack() {
        if (this.targetFocusStack === 'main') {
            return this.mainFocusStack;
        } else if (this.targetFocusStack === 'popup') {
            return this.popupFocusStack;
        }
    }

    set focusStack(_stack) {
        if (this.targetFocusStack === 'main') {
            this.mainFocusStack = _stack;
        } else if (this.targetFocusStack === 'popup') {
            this.popupFocusStack = _stack;
        }
    }

    get historyManager() {
        return this._history;
    }

    get saveConsole() {
        return this.console;
    }

    set saveData(_data) {
        this._saveData = _data;
    }

    set saveConsole(_data) {
        this.console.push(_data);
    }

    reqConsoleClear() {
        this.console = [];
    }

    keyInputLock() {
        this._isLock = true;
    }

    releaseKeyInputLock() {
        this._isLock = false;
    }

    stbInfoFlag() {
        this._stbInfoFlag = true;
    }

    run(callback) {
        if (this.isRunning) {
            this._error("Core already run.")
            return;
        }

        // Communicate.initialize();
        console.log('run')
        this.initCallback = callback;
        this._inputDispatcher = new GlobalInputDispatcher();
        
        this._inputDispatcher.on('keydown', this.inputDispatch.bind(this));
        // window.addEventListener('keydown', this.inputDispatch.bind(this));

        // StbInterface.requestStbInfo(callback);
        // StbInterface.middleWare();

        // 조영선 : 사실상 업데이트 체크가 필요 없다..
        this.updateCheck(true);
        console.log('updateCheck end');
    }

    runAfterRender() {
    //   CHManager.init();  // 채널 데이터 로드
      // console.log('channel data end');
      
    //   setTimeout(() => {
    //       CHManager.init();  // 채널 데이터 로드
    //   }, 5000);
    }

    preloadLocalImage() {
      // console.log('preloadLocalImage', this.preloaded);
      if( !this.preloaded ) {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start!!!");
        // Utils.localImagePreLoad();  // 로컬 사용 이미지 프리로딩
        this.preloaded = true;
      }
    }

    receiveMessageFromNative(obj) {
        // StbInterface.receiveMessageFromNative(obj);

        //     // STB I/F Test // 나중에 삭제해야함
        //     if (utility.checkNullValue(this.location) && this.location.getPath().toLowerCase() === PATH.STB_TEST) {
        //         document.querySelector('#stbTest #response').innerHTML = JSON.stringify(obj);
        //     }
        //     // STB I/F Test
    }

    setHistory(_history) {
        console.log(' history : ', _history);
        this.location = new Location(_history, this);
    }

    setPageView(webPageView, gnbShowFn) {
        // console.log(' history : ', _history);
        this.webPageView = webPageView;
        this.showMenu = gnbShowFn;
    }

    setMenuView(webPageView) {
        // console.log(' history : ', _history);
        this.webMenuView = webPageView;
    }

    /**
     * page가 표시되고 있는지 표시되는지 숨겨졌는지를 반환 한다.
     * true === show, false is hide
     */
    isShowPage() {
        let bool = false;
        try {
            // bool = this.webPageView.style.opacity === 'none' ? false : true;
            bool = this.webPageView.style.opacity === '0' ? false : true;
        } catch (error) {

        }
        console.log('isShowPage bool=', bool);
        return bool;
    }

    /**
     * page를 표시한다. popup은 영향받지않음.
     * page는 route의 부모 엘리먼트
     */
    showPageView() {
        try {
            if( this.webPageView.style.opacity !== '1') {
                this.webPageView.style.opacity = '1'; // visibility 는 child element 를 가리지 않음
                this.webMenuView.style.opacity = '1';
            }
            console.log('showPageView this.webPageView.style.opacity=', this.webPageView.style.opacity);
        } catch (error) {

        }
    }

    /**
     * page를 감춘다. popup은 영향받지않음.
     * page는 route의 부모 엘리먼트
     */
    hidePageView() {
        // this.showMenu(false, false);
        try {
            this.webPageView.style.opacity = '0';
            this.webMenuView.style.opacity = '0';
            console.log('hidePageView this.webPageView.style.opacity=', this.webPageView.style.opacity);
        } catch (error) {

        }
    }

    /**
     * component로 전달된 팝업을 불러오도록 팝업컨테이너에 전달.
     * ex)
     * Core.inst().showPopup(<ConfirmPopup />, {}, this.confirmCallBack);
     * component : 팝업으로 보여질 팝업 component
     * obj : 팝업에서 사용될 변수들의 object
     * callFn : 팝업 종료 후 실행될 callback 함수 
     */
    showPopup = (component, obj, callFn) => {
        // TODO 팝업 컨테이너가 없는경우(null) 에러체크 필요
        if (this.popupContainer.popupList.length === 0 || this.popupContainer.popupList[this.popupContainer.popupList.length - 1].component.type !== component.type) {
            console.log('showPopup()');
            console.log(component);

            // 예외처리, 동일한 팝업을 연달아 호출(키 연타 등)일때, 한번만 호출할 수 있도록 한다.
            this.popupContainer.showPopup(component, obj, callFn);
        }
    }

    /**
     * 모든 팝업을 닫는다.
     * Core.inst().cancelPopup();
     */
    cancelPopup = () => {
        console.log('cancelPopup()');
        this.popupContainer.cancelPopup();
    }

    /**
    * Toast 팝업을 보여준다.
    * component로 전달된 팝업을 불러오도록 팝업컨테이너에 전달.
    * ex)
    * Core.inst().showToast('XPG 에러 9001 입니다. ', , 3000);
    * title : 화면에 1번째 표시될 text
    * detail : 화면 2번째 줄에 표시될 text
    * showTime : toast 메시지가 보여질 시간 showTime이 없는 경우는 기본 3초
    * 한줄로 표시할 경우 title 만 사용
    */
    showToast = (title, detail, showTime) => {
        if (isEmpty(title) && isEmpty(detail)) return;
        // StbInterface.requestOpenToast(title, detail);
        // if (!appConfig.runDevice) {
        //     this.toast.show(title, detail, showTime);
        // }
    }

    /**
    * kidszone widget을 숨긴다.
    */
    hideKidsWidget = () => {
        this.kidsWidget.hide();
    }

    /**
     * kidszone widget을 표시 한다.
     * 
     * data {
     *      type : 알림 타입
     *          alarmBefore - 알림 시간 전
     *          alarmAfter - 알림 시간 후
     *          alarmAtTime - 알림 시간 정각
     *          seeLimitTime - 시청 만료 임박 시간(분)
     *      character : 캐릭터(pororo, pinkfong, octonauts, kongsuni, carrie)
     *      text : 알림 위젯에 노출할 문구
     *      remainTime : 남은 시간(alarmBefore, alarmAfter, seeLimitTime 인 경우 필수)
     * }
     */
    showKidsWidget = (data, animation, isFirst = false) => {
        // this.kidsWidget.show(data, animation, this.kidsHome);
        this.kidsWidget.show(data, animation, isFirst);
    };

    updateKidsWidget = () => {
        console.trace();
        this.kidsWidget.updateInfo();
    };


    deliveryText = (text) => {
        console.log('deliveryText text=', text);

        if (this.keyHandler.length > 0) {
            try {
                this.keyHandler[this.keyHandlerIndex].component.deliveryText(text);
            } catch (error) {
                console.log('error=' + error);
            }
        }
    }

    onBtSearchKidszone = () => {
        console.log('onBtSearchKidszone');
        if (this.keyHandler.length > 0) {
            try {
                this.keyHandler[this.keyHandlerIndex].component.onBtSearchKidszone();
            } catch (error) {
                console.log('error=' + error);
            }
        }
    }

    onChannelChanged = (kidsChannelServiceId) => {
        console.log('onChannelChanged kidsChannelServiceId=', kidsChannelServiceId);
        if (this.keyHandler.length > 0) {
            try {
                this.keyHandler[this.keyHandlerIndex].component.onChannelChanged(kidsChannelServiceId);
                this.showKidsWidget();
            } catch (error) {
                console.log('error=' + error);
            }
        }
    }

    ppmCancelNoti = (data) => {
        console.log('ppmCancelNoti data=', data);
        if (this.keyHandler.length > 0) {
            try {
                this.keyHandler[this.keyHandlerIndex].component.onPPMCancelNoti(data);
            } catch (error) {
                console.log('error=' + error);
            }
        }
    }

    remainPlayTime = (data) => {
        console.log('ppmCancelNoti data=', data);
        if (this.keyHandler.length > 0) {
            try {
                this.keyHandler[this.keyHandlerIndex].component.remainPlayTime(data);
            } catch (error) {
                console.log('error=' + error);
            }
        }
    }

    /**
     * 음성 명령어에 대한 처리를 한다.
     * @param {*} param 
     */
    sendVoiceCommand(param) {
        console.log('sendVoiceCommand param=', param);
        let rsData = {
            result: CTRL_TYPE.COMPLETE, ctrlType: param.ctrlType, ctrlValue: param.ctrlValue,
            hash: param.hash, showOos: 'N'
        };

        if (param.ctrlType === CTRL_TYPE.MENU) {
            this.menuVoiceCommand(rsData, param);
            return;
        }
        if (this.keyHandler.length > 0) {
            try {
                let rs = this.keyHandler[this.keyHandlerIndex].component.sendVoiceCommand(param);
                if (rs.result) {
                    this.normalVoiceCommand(rsData, rs);  //  정상 동작에 대한 응답 처리
                } else {
                    this.abnormalVoiceCommand(rsData, rs);  //  비정상 동작에 대한 응답 처리 
                }
            } catch (error) {
                console.log('error=' + error);
                this.notSupportedVoiceCommand(rsData, param);
            }
        }
    }

    /**
     * 메뉴이동 음성 명령 처리
     * @param {*} rsData 
     * @param {*} param 
     */
    menuVoiceCommand(rsData, param) {
        let fnCallback;
        // let isKidsMode = (StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY) === '1');

        switch (param.ctrlValue) {

            case CTRL_VALUE.MY_BTV:
                fnCallback = () => {
                    // const gnb = StbInterface.getGnbMenuList(GNB_CODE.GNB_MYBTV);
                    Core.inst().cancelPopup();
                    // StbInterface.webMenuState(gnb.gnbTypeCode);
                    // this.gnbMenu.activeMenu(gnb.gnbTypeCode, gnb.menuId);
                    // Core.inst().move(PATH.MYBTV_HOME, { gnbTypeCode: gnb.gnbTypeCode, menuId: gnb.menuId });
                }
                // isKidsMode ? Core.inst().webkidsExit(null, fnCallback) : fnCallback();
                break;
            case CTRL_VALUE.SEARCH:
                // if (!isKidsMode) Core.inst().move(PATH.IDLE);
                Core.inst().move(PATH.SEARCH_HOME);  // 검색 메인 화면으로 이동.
                Core.inst().cancelPopup();
                // StbInterface.webMenuState(PATH.SEARCH_HOME);
                break;
            case CTRL_VALUE.MAIN:
                // if (!isKidsMode) Core.inst().move(PATH.IDLE);
                Core.inst().move(PATH.ALL_MENU, { menuId: '', s_v_style: '' });
                Core.inst().cancelPopup();
                break;
            case CTRL_VALUE.MON_SUB:
                fnCallback = () => {
                    // const gnb = StbInterface.getGnbMenuList(GNB_CODE.GNB_MONTHLY);
                    // Core.inst().move(`${PATH.MONTHLY_HOME}/${GNB_CODE.GNB_MONTHLY}/${GNB_CODE.GNB_MONTHLY}`, { menuId: gnb.menuId, gnbTypeCode: gnb.gnbTypeCode });
                    Core.inst().cancelPopup();
                    // StbInterface.webMenuState(gnb.gnbTypeCode);
                }
                // isKidsMode ? Core.inst().webkidsExit(null, fnCallback) : fnCallback();
                break;
            case CTRL_VALUE.TV_APP:
                fnCallback = () => {
                    // const gnb = StbInterface.getGnbMenuList(GNB_CODE.GNB_TVAPP);
                    // Core.inst().move(PATH.HOME_TVAPP, { menuId: gnb.menuId, gnbTypeCode: gnb.gnbTypeCode });
                    // Core.inst().cancelPopup();
                    // StbInterface.webMenuState(gnb.gnbTypeCode);
                }
                // isKidsMode ? Core.inst().webkidsExit(null, fnCallback) : fnCallback();
                break;
            case CTRL_VALUE.MOVIE:
            case CTRL_VALUE.SERIES:
                fnCallback = () => {
                    // const gnb = StbInterface.getGnbMenuList(GNB_CODE.GNB_MOVIE);
                    // Core.inst().move(`${PATH.HOME}/${GNB_CODE.GNB_MOVIE}/${GNB_CODE.GNB_MOVIE}`, { menuId: gnb.menuId, gnbTypeCode: gnb.gnbTypeCode });
                    Core.inst().cancelPopup();
                    // StbInterface.webMenuState(gnb.gnbTypeCode);
                }
                // isKidsMode ? Core.inst().webkidsExit(null, fnCallback) : fnCallback();
                break;
            case CTRL_VALUE.TV_SHOW:
                fnCallback = () => {
                    // const gnb = StbInterface.getGnbMenuList(GNB_CODE.GNB_TV);
                    // Core.inst().move(`${PATH.HOME}/${GNB_CODE.GNB_TV}/${GNB_CODE.GNB_TV}`, { menuId: gnb.menuId, gnbTypeCode: gnb.gnbTypeCode });
                    Core.inst().cancelPopup();
                    // StbInterface.webMenuState(gnb.gnbTypeCode);
                }
                // isKidsMode ? Core.inst().webkidsExit(null, fnCallback) : fnCallback();
                break;
            case CTRL_VALUE.ANI:
                fnCallback = () => {
                    // const gnb = StbInterface.getGnbMenuList(GNB_CODE.GNB_ANI);
                    // Core.inst().move(`${PATH.HOME}/${GNB_CODE.GNB_ANI}/${GNB_CODE.GNB_ANI}`, { menuId: gnb.menuId, gnbTypeCode: gnb.gnbTypeCode });
                    // Core.inst().cancelPopup();
                    // StbInterface.webMenuState(gnb.gnbTypeCode);
                }
                // isKidsMode ? Core.inst().webkidsExit(null, fnCallback) : fnCallback();
                break;
            case CTRL_VALUE.KIDS:
                Core.inst().cancelPopup();
                this.onBtSearchKidszone();
                this.gnbMenu.kidszoneExecute(GNB_CODE.GNB_KIDS, null);
                break;
            case CTRL_VALUE.DOCU:
            case CTRL_VALUE.LIFE:
                fnCallback = () => {
                    // const gnb = StbInterface.getGnbMenuList(GNB_CODE.GNB_DOCU);
                    // Core.inst().move(`${PATH.HOME}/${GNB_CODE.GNB_DOCU}/${GNB_CODE.GNB_DOCU}`, { menuId: gnb.menuId, gnbTypeCode: gnb.gnbTypeCode });
                    // Core.inst().cancelPopup();
                    // StbInterface.webMenuState(gnb.gnbTypeCode);
                }
                // isKidsMode ? Core.inst().webkidsExit(null, fnCallback) : fnCallback();
                break;
            case CTRL_VALUE.EDU:
                // nothing
                break;
            case CTRL_VALUE.SILVER:
                fnCallback = () => {
                    // const gnb = StbInterface.getGnbMenuList(GNB_CODE.GNB_SENIOR);
                    // Core.inst().move(`${PATH.HOME}/${GNB_CODE.GNB_SENIOR}/${GNB_CODE.GNB_SENIOR}`, { menuId: gnb.menuId, gnbTypeCode: gnb.gnbTypeCode });
                    // Core.inst().cancelPopup();
                    // StbInterface.webMenuState(gnb.gnbTypeCode);
                }
                // isKidsMode ? Core.inst().webkidsExit(null, fnCallback) : fnCallback();
                break;
            default:
                break;
        }
        this.voiceCommandResponse(rsData);
    }

    /**
     * 음성검색 정상 동작에 대한 응답 처리
     * @param {*} rsData 
     * @param {*} rs 
     */
    normalVoiceCommand(rsData, rs) {
        if (rs.showOos) {
            rsData.showOos = rs.showOos;
            rsData.OosText = rs.OosText;
        }
        if (rs.msgTitle) {
            if (rs.msgContents) Core.inst().showToast(rs.msgTitle, rs.msgContents);
            else Core.inst().showToast(rs.msgTitle);
        }
        this.voiceCommandResponse(rsData);
    }

    /**
     * 음성검색이 비정상 동작에 대한 응답 처리
     * @param {*} rsData 
     * @param {*} rs 
     */
    abnormalVoiceCommand(rsData, rs) {
        rsData.result = CTRL_TYPE.OTHER_ABNORMAL;
        if (rs.msgTitle) {
            if (rs.msgContents) Core.inst().showToast(rs.msgTitle, rs.msgContents);
            else Core.inst().showToast(rs.msgTitle);
        } else {
            Core.inst().showToast('음성검색이 정상 동작이 아닌 경우');
        }
        this.voiceCommandResponse(rsData);
    }

    /**
     *  음성검색이 현재화면에서 지원하지 않는 기능에 대한 처리
     */
    notSupportedVoiceCommand(rsData, param) {
        rsData.result = CTRL_TYPE.NOT_SUPPORTED;
        let msg = '';
        if (param.ctrlType === CTRL_TYPE.LIKE_CH) {
            // msg = '선호채널 등록';
            msg = '선호채널 ' + param.ctrlValue === CTRL_VALUE.REG ? '등록' : '해제';
        }
        else if (param.ctrlType === CTRL_TYPE.PICK) {
            msg = '찜 ' + param.ctrlValue === CTRL_VALUE.REG ? '등록' : '해제';
            ;
        }
        Core.inst().showToast('현재 화면에서는 ' + msg + ' 기능을 지원하지 않습니다.');
        this.voiceCommandResponse(rsData);
    }

    /**
    * 음성 명령어에 대한 응답 전달.
    * 
    */
    voiceCommandResponse = (data) => {
        // cm.sendMessageToNative({
        //     TYPE: STB_TYPE.RESPONSE, COMMAND: STB_COMMAND.SEND_VOICE_COMMAND, CONTENTS: '',
        //     DATA: data
        // });
    }

    setPopupContainer(popup) {
        this.popupContainer = popup;
    }

    setToast(toast) {
        this.toast = toast;
    }

    setGnbMenu(gnbMenu) {
        this.gnbMenu = gnbMenu;
    }

    setKidsWidget(kidsWidget) {
        this.kidsWidget = kidsWidget;
    }

    setKidsHome(kidsHome) {
        this.kidsHome = kidsHome;
    }

    move(path, obj) {
        // if( path === PATH.EPG && appConfig.STBInfo.cug !== '0' ){
        //     this.showToast('편성표', '이동');
        //     return;
        // }

        if (this.location && isFunction(this.location.move)) {
            this.gnbMenu.clearAllFocus();
            this.stateRouting = true;
            setTimeout(() => {
                this.stateRouting = false;  // 페이지 이동시 키 블럭 시키기 위한 플래그
            }, this.stateRoutingTime);
            this.location.move(path, obj);
            this.showPageView();
        }
    }

    moveMenu(path, obj) {
    console.log('core/[moveMenu(+)] path: ' + path);
    if (this.location && isFunction(this.location.move)) {
      this.menuRouting = obj.moveMenu;
      setTimeout(() => {
        this.menuRouting = false;
      }, this.menuRoutingTime);
      this.stateRouting = true;
      setTimeout(() => {
        this.stateRouting = false;  // 페이지 이동시 키 블럭 시키기 위한 플래그
      }, this.stateRoutingTime);
      this.location.move(path, obj);
      this.showPageView();
    }
    }

    replace(path, state) {
        if (this.location && isFunction(this.location.move)) {
            this.gnbMenu.clearAllFocus();
            this.stateRouting = true;
            setTimeout(() => {
                this.stateRouting = false;  // 페이지 이동시 키 블럭 시키기 위한 플래그
            }, this.stateRoutingTime);
            this.location.replace(path, state);
            this.showPageView();
        }
    }

    isSamePage(path) {
        if( this.location.historyManager && this.location.historyManager.location && this.location.historyManager.location.pathname === path ) {
            return true;
        }
        return false;
    }

    back() {
        if (this.location && isFunction(this.location.back)) {
            this.stateRouting = true;
            setTimeout(() => {
                this.stateRouting = false;
            }, this.stateRoutingTime / 2);
            // console.log('back HistoryManager.getList().length=' + HistoryManager.getList().length);
          HistoryManager.getList().map((item) => {
            console.log('back HistoryManager item:' + item.path);
          });
            if (HistoryManager.getList().length === 0) {
                // this.move(PATH.IDLE, {  showMenu: this.showMenu  });
                this.move(PATH.IDLE);
            } else {
                this.location.back();
            }
            this.showPageView();
        }
    }

    /**
     * 전달된 component에 키를 보내준다.
     */
    addKeyListener = (key, keyEvent, component) => {
        this.keyHandler.push({
            key,
            keyEvent,
            component,
            pathname: component.keyPathname
        });
        console.log('addKeyListener key=' + key + ' path=' + component.keyPathname);

        this.keyHandlerIndex = this.keyHandler.length - 1;
    }

    addMenuKeyHandler(component) {
      this.menuKeyHandler = component;
    }
    /**
     * 등록된 component를 제거한다.
     */
    removeKeyListener = (key, keyEvent, component) => {
        // const pathname = component.props.location.pathname;
        const pathname = component.keyPathname;
        const handlerList = this.keyHandler.filter(handler => handler.pathname !== pathname);
        console.log('removeKeyListener key=' + key + ' path=' + pathname, handlerList);
        this.keyHandler = handlerList;
        this.keyHandlerIndex = this.keyHandler.length - 1;
    }

    /**
     * Clear 스크린 상태 알림
     * 나가기 키, 채널 재핑 키 눌렸을때 전달
     */
    clearScreen = (callType) => {
        // let isKidsMode = (StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY) === '1');
        // console.log('clearScreen() callType=' + callType + '  isKidsMode=' + isKidsMode, ', statePrepareVod:', this.statePrepareVod);
        // LHSG BTVD-3606
        this.statePrepareVod = false;
        // CTSInfo.requestPurchaseAllCancel(true, false, false);
        this.cancelPopup();
        this.hideKidsWidget();
        this.webHideNoti();  //  peter BTVQ-4222 이슈로 추가
        // if (!isKidsMode) {
        //     this.webVisible(false);
        //     this.move(PATH.IDLE);
        // }
        if (callType === "sleep") {  //  peter 20181114 sleep일경우 모두 clear, kids 모드 일경우(property값이 늦게 반영되는 것 같음.)가 있어서 예외 처리. BTVQ-3958 (키즈존 시청제한팝업에서 BTV종료 후 웜부팅하여 OAP화면 트리거 선택후 시놉 진입 후 RCU 이전키 누르면 키즈존 시청제한팝업 또 노출)
            this.webVisible(false, true);
            this.move(PATH.IDLE);
        }
    }

    /**
     * webView가 화면에 표시 될때 노출됨.
     */
    webShowNoti = (propertyName) => {
        this.webVisible(true);
        // TODO  pip 이전에 있던 경우 처리 필요
        if (this.keyHandler.length > 0) {
            try {
                if (this.isShowPage()) {
                    console.log('this.keyHandler[this.keyHandlerIndex].component');
                    console.log(this.keyHandler[this.keyHandlerIndex].component);
                    this.keyHandler[this.keyHandlerIndex].component.webShowNoti(propertyName);
                }
            } catch (error) {
                console.log('error=' + error);
            }
        }
        console.log('webShowNoti webview가 show 될때 호출됨 NATIVE WEB_SHOW_NOTI');
    };

    /**
     * webView가 화면에 사라질때.
     */
    webHideNoti() {
        if (this.keyHandler.length > 0) {
            try {
                console.log(this.keyHandler[this.keyHandlerIndex].component);
                if( typeof this.keyHandler[this.keyHandlerIndex].component.webHideNoti === 'function') {
                    this.keyHandler[this.keyHandlerIndex].component.webHideNoti();
                }
            } catch (error) {
                console.log('error=' + error);
            }
        }
        // LHSG Web Hide 시 메뉴 이미지 갱신
        if( this.menuKeyHandler ) {
          this.menuKeyHandler.webHideNoti();
        }
    }

    refreshWebScreen = () => {
        if (this.keyHandler.length > 0) {
            try {
                if (this.isShowPage()) {
                    console.log(this.keyHandler[this.keyHandlerIndex].component);
                    if (typeof this.keyHandler[this.keyHandlerIndex].component.refreshWebScreen === 'function')
                        this.keyHandler[this.keyHandlerIndex].component.refreshWebScreen();
                }
            } catch (error) {
                console.log('error=' + error);
            }
        }
    };

    // LHSG BTVD-3606
    setPrepareVOD(flag) {
        console.log('[setPrepareVOD] statePrepareVod', flag, ', this.webShow:', this.webShow,);
        if( flag === 'START' ) {
            this.statePrepareVod = true;
        } else {
            this.statePrepareVod = false;
            // 'END' 후에는 webShowNoti 를 따라야 한다
            // 'CANCEL' 일 경우 이전 화면을 표
            if( flag === 'CANCEL') {
                // delay 되었던 visibility 를 실행
                if( this.webShow ) {
                    this.showPageView();
                }
            }
        }
        // if( flag === 'START' ) {
        //     this.isPrepareVOD = true;
        //     this.webRoot.style.visibility = 'hidden';
        // } else if( flag === 'END' ) {
        //     this.isPrepareVOD = false;
        // } else if( flag === 'CANCEL' ) {
        //     this.isPrepareVOD = false;
        //     this.webRoot.style.visibility = 'visible';
        // }
        // if (this.keyHandler.length > 0) {
        //     try {
        //         if (this.isShowPage()) {
        //             console.log(this.keyHandler[this.keyHandlerIndex].component);
        //             if (typeof this.keyHandler[this.keyHandlerIndex].component.prepareVOD === 'function')
        //                 this.keyHandler[this.keyHandlerIndex].component.prepareVOD(flag);
        //         }
        //     } catch (error) {
        //         console.log('error=' + error);
        //     }
        // }
    }

    webVisible(bool, isNativeHideCall = false, isUpdateCheck = false) {
        this.webShow = bool;
        console.log('[webVisible] this.webShow=', this.webShow, ', isNativeHideCall:', isNativeHideCall, ', isUpdateCheck:', isUpdateCheck);


        // root display none block 처리, webView가 show 되는 시점을 알아야함.
        if (bool) {
            // if (appConfig.runDevice) {
            //     console.log('this.statePrepareVod', this.statePrepareVod);
            //     // LHSG BTVD-3606
            //     if( this.statePrepareVod ) {
            //         // prepare vod 의 경우 WebShowNoti 가 오더라도 prepare 에서 판단하기 전까지 show 를 delay, 최후의 visibility 는 this.webShow 로 판단 가능
            //         // this.showPageView();
            //     } else {
            //         this.showPageView();
            //     }
            // }
        } else {
            this.webHideNoti();  //  peter 20180920 web이 hide 될때 page에서 webHideNoti를 받아야 되는 경우 사용.
            // Utils.sendTasLog();  //  peter 20180928 webhide 될때마다 tas log 보내도록 추가
            // if (appConfig.runDevice) {
            //     // LHSG POPUP 은 가능하고 UI content 만 hidden
            //     this.hidePageView();
            // }

            if (isNativeHideCall) {
                // StbInterface.webHideNoti();
                // CTSInfo.requestPurchaseAllCancel(true, false, false);
                // setTimeout(() => {
                //     // this.webRoot.style.visibility = 'hidden';
                //     // console.log('this.webRoot.style.visibility=', this.webRoot.style.visibility);
                //     this.showPageView();  //  webview hide 될때 pageview 보이도록.
                // }, 100);
            }

            if (isUpdateCheck) {
                this.updateCheck();
            }
        }
    }

    /**
     * webView를 hide 또는 show 시킬때 호출
     * @param {boolean} bool true 화면 보이기 , false는 화면 감추기
     * @param {boolean} isNativeHideCall true native에 webview 감추도록 요청, false native에 요청 안함.
     * @param {boolean} isUpdateCheck true update 파일 로드(bool가 false 일때), false update체크 안함.
     */
    webVisible_old(bool, isNativeHideCall = false, isUpdateCheck = false) {
        this.webShow = bool;
        console.log('[webVisible] this.webShow=', this.webShow, ', isNativeHideCall:', isNativeHideCall, ', isUpdateCheck:', isUpdateCheck);

        // root display none block 처리, webView가 show 되는 시점을 알아야함.
        if (bool) {
            // if (appConfig.runDevice) {
                // this.webRoot.style.visibility = 'visible';
                // 기존 화면 잔상 남는 문제로 100ms 딜레이. peter
                // setTimeout(() => {
                //     this.webRoot.style.visibility = 'visible';
                //     console.log('this.webRoot.style.visibility=', this.webRoot.style.visibility);
                // }, 100);
            // }
        } else {
            this.webHideNoti();  //  peter 20180920 web이 hide 될때 page에서 webHideNoti를 받아야 되는 경우 사용.
            // Utils.sendTasLog();  //  peter 20180928 webhide 될때마다 tas log 보내도록 추가
            // if (appConfig.runDevice) {

            //     setTimeout(() => {
            //         // this.webRoot.style.visibility = 'hidden';
            //         // console.log('this.webRoot.style.visibility=', this.webRoot.style.visibility);
            //         // this.showPageView();  //  webview hide 될때 pageview 보이도록.
            //     }, 100);
            // }

            if (isNativeHideCall) {
                // StbInterface.webHideNoti();
                // CTSInfo.requestPurchaseAllCancel(true, false, false);
            }

            if (isUpdateCheck) {
                this.updateCheck();
            }
        }
    }

    /**
     * 
     */
    isWebShow = () => {
        // return this.webRoot.style.display === 'block' ? true : false;
        return this.webShow;
    }

    /**
     * prepareVOD 전달된 경우 일정 시간 backKey를 block 시킨다.
     */
    setBlockBackKey() {
        this.isBlockBackKey = true;
        setTimeout(() => {
            this.isBlockBackKey = false;
        }, 200);
    }


    /**
     * webapp 버전을 체크하여 버전이 변경된 경우 reload 요청한다.
     */
    updateCheck(isBoot) {
        console.log('updateCheck()');
        // let verPath = '/version.txt?update=' + new Date().getTime();
        // if (!appConfig.runDevice) {
        let verPath = PATH.VERSION_PATH + new Date().getTime();
        // }
        try {
            Axios.get(verPath).then(function (response) {
                // const ver = StbInterface.getProperty(STB_PROP.WEBUI_VERSION);
                // console.log('STB_PROP.WEBUI_VERSION version =' + ver);
                console.log('H/E load version =' + response.data);
                // if (isBoot != undefined && isBoot == true) {
                //     if (ver !== response.data) {
                //         appConfig.STBInfo.uiVersion = response.data;
                //         StbInterface.setProperty(STB_PROP.WEBUI_VERSION, response.data);
                //     }

                // } else {

                //     if (ver !== response.data) {
                //         StbInterface.setProperty(STB_PROP.WEBUI_VERSION, response.data);
                //         console.log(' VERSION UPDATE STB RELOAD CALL !!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                //         StbInterface.reload(1);
                //     }
                //     var localUrl = document.location.href.split(":")[1];
                //     const mode = 'H/E : ' + appConfig.headEnd.NXPG.Live.ip;
                //     document.getElementById('localver').innerHTML = mode + localUrl + ' : ' + response.data;
                // }
            });
        }
        catch (error) {
        }
    }

    setSearchMode(bool, fromClass) {
        console.log('setSearchMode from=' + fromClass + ' bool=' + bool);
        window.tvExt && window.tvExt.utils && window.tvExt.utils.ime && window.tvExt.utils.ime.setSearchMode && window.tvExt.utils.ime.setSearchMode(bool);
    }


    inputDispatch(evt) {

        // evt.nativeEvent = evt;
        // const key = evt.key;
        // const key = keyCodes.getKeyByValue(evt.keyCode);
        // const isKidsMode = (StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY) === '1');
        let fnCallback = '';

        const key = evt.key;
        console.log('%c inputDispatch keyHandler.length=' + this.keyHandler.length + ' key=' + key, 'color: red; background: yellow ', this.menuRouting, this.stateRouting);
        //console.log('showPageView this.webPageView.style.opacity=', this.webPageView.style.opacity);

        // PrepareVod 상태일경우 backkey에 대해 
        if (this.isBlockBackKey && key === 'BACK_SPACE') {
          // console.log('%c inputDispatch >>>>>>>>>>> this.statePrepareVod!!!!', 'color: red; background: yellow ');
            return;
        }

      if (this.menuRouting) {
        console.log('[msmason] %c inputDispatch >>>>>>>>>>> menuRouting!!!!', 'color: red; background: yellow ');
        const rs = this.menuKeyHandler.onKeyDown(evt.nativeEvent);
        // console.log('this.menuKeyHandler/rs', rs);
        return;
      }

      // 페이지 이동중인 상태일 때 키 동작 안되도록 한다.
      if (this.stateRouting) {
        // console.log('%c inputDispatch  >>>>>>>>>>> stateRouting!!!!', 'color: red; background: yellow ');
        return;
      }

        if (this.keyHandler.length > 0) {
            console.log('this.keyHandlerIndex:', this.keyHandlerIndex, ', ', this.keyHandler[this.keyHandlerIndex].component);
            const rs = this.keyHandler[this.keyHandlerIndex].component.onKeyDown(evt.nativeEvent);
            console.log('this.keyHandler/rs', rs);
            // const rs = this.keyHandler[this.keyHandlerIndex].component.onKeyDown(evt);
            if (rs === true) {
                // if ((key === 'BACK_SPACE') || ((!appConfig.runDevice) && (key === 'PC_BACK_SPACE'))) {
                //     return;
                // }
                if( key === 'BACK_SPACE' ){
                    return;
                } 
            }
        }

        if (key === 'STB_HOME' || key === 'HOME') {
            // TODO home 키가 눌려도 history clear 안해야 되는 경우 있는지 검토 필요
            if (this.location.getPath() === PATH.BASE || this.location.getPath() === PATH.HOME) {
                Core.inst().cancelPopup();
                this.move(PATH.IDLE);
                this.webVisible(false, true, true);
            } else {
                // LHSG BTVD-3590
                // StbInterface.requestPlayInfo((result) => {
                //     console.log("requestPlayInfo result: ", result);
                //     if( result.isKidsContents && result.isKidsContents === 'Y' ) {
                //         const param = {
                //             title: 'VOD 시청 종료',
                //             desc: '시청을 중단하고,\nBtv 키즈를 종료하시겠어요?',
                //             btns: ["종료", "취소"]
                //         };
                //         const focused = document.querySelector(":focus");
                //         if( focused ) {
                //             focused.blur();
                //         }
                //         Core.inst().setSearchMode(false, 'popup');
                //         Core.inst().showPopup(<PopupConfirm />, param, (info) => {
                //             console.log("PopupConfirm: ", info);
                //             // Core.inst().setSearchMode(true);
                //             console.log('>>> focused:', focused);
                //             if( focused ) {
                //                 focused.focus();
                //                 if( focused.id === 'searchInput' ) {
                //                     Core.inst().setSearchMode(true, 'popup');
                //                 }
                //             }
                //             if (!isEmpty(info) && info.result) {
                //                 console.log("PopupConfirm: ", info.result);
                //                 fnCallback = () => {
                //                     Core.inst().cancelPopup();
                //                     this.move(PATH.IDLE);
                //                     const data = { "DATA": { "extInfo": { "currentPlayState": "5" }, "menuType": "home" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" };
                //                     const gnb = StbInterface.getGnbMenuList(GNB_CODE.GNB_HOME, data);  // gnb 데이터가 없는 경우가 있어서 gnb 얻은 후 home으로 이동하도록 수정
                //                     if (isEmpty(gnb)) return;

                //                     StbInterface.webMenuState(gnb.gnbTypeCode);
                //                     // LHSG GNB 홈포커스 이동 menuNavi: false
                //                     this.move(PATH.HOME, { menuId: gnb.menuId, gnbTypeCode: gnb.gnbTypeCode, menuNavi: false });
                //                 };
                //                 isKidsMode ? Core.inst().webkidsExit(null, fnCallback) : fnCallback();
                //             }
                //         });
                //     } else {
                //         fnCallback = () => {
                //             Core.inst().cancelPopup();
                //             this.move(PATH.IDLE);
                //             const data = { "DATA": { "extInfo": { "currentPlayState": "5" }, "menuType": "home" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" };
                //             const gnb = StbInterface.getGnbMenuList(GNB_CODE.GNB_HOME, data);  // gnb 데이터가 없는 경우가 있어서 gnb 얻은 후 home으로 이동하도록 수정
                //             if (isEmpty(gnb)) return;

                //             StbInterface.webMenuState(gnb.gnbTypeCode);
                //             // LHSG GNB 홈포커스 이동 menuNavi: false
                //             this.move(PATH.HOME, { menuId: gnb.menuId, gnbTypeCode: gnb.gnbTypeCode, menuNavi: false });
                //         };
                //         isKidsMode ? Core.inst().webkidsExit(null, fnCallback) : fnCallback();
                //     }
                // });
            }
            return;
        }
        // } else if ((key === 'BACK_SPACE') || ((!appConfig.runDevice) && (key === 'PC_BACK_SPACE'))) {
            else if( key === 'BACK_SPACE' ){
            // popup이 있는지 확인
            fnCallback = () => {
                console.log('BACK_SPACE fnCallback() this.popupContainer.hasPopup()=' + this.popupContainer.hasPopup() + ' HistoryManager.getList().length=' + HistoryManager.getList().length);

                if (!this.popupContainer.hasPopup()) {
                    if (HistoryManager.getList().length > 0) {
                        this.back();
                    } else {
                        // this.move(PATH.IDLE);
                        this.back();
                        this.webVisible(false, true, true);
                        // if (!appConfig.runDevice) {
                        //     this.showToast('StbInterface.webHideNoti().', 'STB에서 화면 사라짐');
                        // }
                    }
                    return;
                }
            }
            // console.log('isKidsMode=' + isKidsMode + ' PATH=' + this.location.getPath());

            // isKidsMode && this.location.getPath() === PATH.KIDS_HOME ? Core.inst().webkidsExit(null, fnCallback) : fnCallback();
        }

        // else if ( (key === 'SCHEDULE') ){
            
        // }

        // if (!appConfig.runDevice) {
        //     let data = '';
        //     // peter key test
        //     if (key === 'MENU') {  // w 'key'
        //         // this.showMenu(true, false);
        //         // this.gnbMenu.clearAllFocus();
        //         // data = { "TYPE": "request", "COMMAND": "OpenPopupTvCommerce", "CONTENTS": "", "DATA": { "type": "tvPay", "url": "https://payment.tvhub.co.kr/IPTV-SK-VOD/web/btvMain.mv?storeId=SKITVBV001&g…ack&modelResolution=1920&modelAddress=34:38:b7:6:76:3d&modelName=BHX-UH600" } }
        //         // this.showToast('toast test');
        //         // let data = { "CONTENTS": "", "COMMAND": "NotifyClearScreen", "TYPE": "notify" }
        //         //     data = { "DATA": { "regionCode": "mbc=1^kbs=41^sbs=61", "serverList": "AMS^http://vswu.hanafostv.com:8080^N|EPS^https://agw.sk-iptv.com:8443^Y|PNS^htt…on.hanafostv.com:8443^N|PPM_CANCEL^https://promotion.hanafostv.com:8443^N|", "favChannelList": "332^3^아임쇼핑", "gwIpAddrHttps": "1.255.152.108", "gwIpAddrHttp": "1.255.152.108", "migrationMeTv": "0", "cug": "0", "postcode": "", "idPackage": "20", "gwPortNumHttp": "8080", "blockChList": "", "ppmList": "", "favAppList": "", "userIdSaved": true, "uiVersion": "1.0.0", "gwPortNumHttps": "8443", "pssUseAgree": "", "favVodList": "", "ispType": "1" }, "CONTENTS": "", "COMMAND": "StbInfo", "TYPE": "response" }
        //         //     this.receiveMessageFromNative(data);
        //         // } else if (key === 'N1') {  // 1 'key'
        //         data = { "DATA": { "extInfo": { "currentPlayState": "5", "mode": "autoHide" }, "menuType": "home" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // data = { "DATA": { "remainTime": '20' }, "CONTENTS": "", "COMMAND": "RemainPlayTime", "TYPE": "notify" }
        //         // 키즈 버튼
        //         // data = { "DATA": { "extInfo": { "currentPlayState": "5" }, "menuType": "kidsZoneHome" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // this.receiveMessageFromNative(data);
        //         // } else if (key === 'N2') {  // 2 'key'
        //         //     data = { "CONTENTS": "", "COMMAND": "WebShowNoti", "TYPE": "notify" }
        //         //     this.receiveMessageFromNative(data);
        //         // } else if (key === 'N3') {
        //         //     data = { "DATA": { "propertyName": "PROPERTY_BLUETOOTH_USING" }, "CONTENTS": "", "COMMAND": "RefreshProperty", "TYPE": "notify" }
        //         //     this.receiveMessageFromNative(data);
        //         // } else if (key === 'N4') {
        //         //     data = { "CONTENTS": "", "COMMAND": "WebShowNoti", "TYPE": "notify" }
        //         //     this.receiveMessageFromNative(data);
        //         // } else if (key === 'N5') {
        //         //     data = { "DATA": { "extInfo": { "fromCommerce": false, "seeingPath": "99", "epsd_id": "", "adultCheck": false, "title": "", "isKidsContents": "Y", "epsd_rslu_id": "{6C2C8AFD-1EF4-11E5-87EF-1B0051889B48}", "sris_id": "", "currentPlayState": "6", "search_type": "2" }, "menuType": "synopsis" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         //     this.receiveMessageFromNative(data);
        //         // } else if (key === 'N6') {
        //         //     data = { "DATA": { "contentId": "", "isPlayType": "ETC" }, "CONTENTS": "", "COMMAND": "PlayInfo", "TYPE": "response" }
        //         //     this.receiveMessageFromNative(data);
        //         // } else if (key === 'N7') {
        //         //     data = { "DATA": { "extInfo": { "fromCommerce": false, "seeingPath": "99", "epsd_id": "", "adultCheck": false, "title": "", "isKidsContents": "Y", "epsd_rslu_id": "{6C43203E-1EF4-11E5-87EF-1B0051889B48}", "sris_id": "", "currentPlayState": "6", "search_type": "2" }, "menuType": "synopsis" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         //     this.receiveMessageFromNative(data);
        //         // } else if (key === 'N8') {
        //         //     data = { "CONTENTS": "", "COMMAND": "WebShowNoti", "TYPE": "notify" }
        //         //     this.receiveMessageFromNative(data);
        //         // } else if (key === 'N9') {
        //         //     data = {"DATA":{"extInfo":{"fromCommerce":false,"seeingPath":"60","epsd_id":"CE0001182523","adultCheck":false,"trackId":"","blockTrackId":"","epsd_rslu_id":"{B3578A1A-9EB4-11E7-AA7F-23FB124830D5}","sris_id":"","currentPlayState":"5","search_type":"2","title":"","uxReference":"","sessionId":"","isKidsContents":""},"menuType":"synopsis"},"CONTENTS":"","COMMAND":"MenuNavigationWeb","TYPE":"request"}
        //         this.receiveMessageFromNative(data);

        //     } else if (key === 'EXIT') {  // q 'key'
        //         // 나가기 키
        //         // data = { "CONTENTS": "", "COMMAND": "RefreshWebScreen", "TYPE": "notify" }
        //         // 신과함께 패키지
        //         // data = {"TYPE":"request","COMMAND":"MenuNavigationWeb","CONTENTS":"","DATA":{"menuType":"synopsisGateway","extInfo":{"trackId":"","blockTrackId":"","uxReference":"","sessionId":"","search_type":"1","sris_id":"CS11002091","epsd_id":"CE0000031153","isKidsContents":"","seeingPath":"60","epsd_rslu_id":"","title":"","adultCheck":false,"fromCommerce":false,"currentPlayState":"1"}}}
        //         // 시놉 이동 신과함께
        //         // {"TYPE":"request","COMMAND":"MenuNavigationWeb","CONTENTS":"","DATA":{"menuType":"synopsis","extInfo":{"trackId":"","blockTrackId":"","uxReference":"","sessionId":"","search_type":"2","sris_id":"","epsd_id":"CE0000031153","epsd_rslu_id":"{36183533-85B9-11E8-B712-97970028D4AA}","seeingPath":"60","title":"","isKidsContents":"","adultCheck":false,"fromCommerce":false,"currentPlayState":"1"}}}
        //         // 시놉 이동 물괴
        //         // {"TYPE":"request","COMMAND":"MenuNavigationWeb","CONTENTS":"","DATA":{"menuType":"synopsis","extInfo":{"trackId":"","blockTrackId":"","uxReference":"","sessionId":"","search_type":"2","sris_id":"","epsd_id":"","epsd_rslu_id":"{EFDB2195-9F76-426A-8FA8-43B55B799A4C}","seeingPath":"99","title":"","isKidsContents":"N","adultCheck":false,"fromCommerce":false,"currentPlayState":"6"}}}
        //         // 엔딩 시놉 물괴
        //         // {"TYPE":"request","COMMAND":"MenuNavigationWeb","CONTENTS":"","DATA":{"menuType":"synopsisEnding","extInfo":{"trackId":"","blockTrackId":"","uxReference":"","sessionId":"","search_type":"1","title":"물괴","sris_id":"CS11003034","epsd_id":"CE1000043812","epsd_rslu_id":"{EFDB2195-9F76-426A-8FA8-43B55B799A4C}","ending_cw_call_id_val":"5v_Ending.PAGE","seeingPath":"","adultCheck":false,"fromCommerce":false,"currentPlayState":"6"}}}
        //         // 엔딩 시놉 조선명탐정: 흡혈괴마의 비밀
        //         // { "DATA": { "extInfo": { "fromCommerce": false, "seeingPath": "", "epsd_id": "CE0001359343", "adultCheck": false, "title": "조선명탐정: 흡혈괴마의 비밀", "epsd_rslu_id": "{966E4876-236C-11E8-BA5D-F33514C76BAF}", "sris_id": "CS01116445", "search_type": "1" }, "menuType": "synopsisEnding" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // 인물화면 이동 강호동
        //         // {"TYPE":"request","COMMAND":"MenuNavigationWeb","CONTENTS":"","DATA":{"menuType":"searchPersonDetail","extInfo":{"trackId":"","blockTrackId":"","uxReference":"","sessionId":"","person_id":"MP0000000002","currentPlayState":"5"}}}
        //         //  web 감추기
        //         // data = { "CONTENTS": "", "COMMAND": "WebHideNoti", "TYPE": "notify" }
        //         //  web 보이기
        //         // data = { "CONTENTS": "", "COMMAND": "WebShowNoti", "TYPE": "notify" }
        //         // 다음편 자동 재생 이어보기 팝업
        //         // data = { "TYPE": "request", "COMMAND": "PrepareVodPlay", "CONTENTS": "", "DATA": { "hideContinue": "Y", "playType": "default", "playOption": "next", "search_type": "1", "sris_id": "", "epsd_id": "CE0001392330", "epsd_rslu_id": "", "useStartTime": "N", "startTime": "0", "endTime": "", "repeatIndex": "", "seeingPath": "58", "groupId": "", "cnr_id": "", "previewIndex": "", "fromCommerce": "N", "hideContinue":"N"	, "fromVoiceCommand":"Y",	"ctrlType":"ctrlType1",	"ctrlValue":"ctrlValue1",	"hash":"hash111"	 } }
        //         data = prompt('실행될데이터 입력');
        //         data = JSON.parse(data);
        //         if (!isEmpty(data)) {
        //             this.receiveMessageFromNative(data);
        //         }
        //     } else if (key === 'ALLMENU') {  // m 'key'
        //         // 전체 메뉴 하위뎁스 이동
        //         // let data = { "DATA": { "extInfo": { "currentPlayState": "5", "call_url": "NM1000018142/NM1000018146/NM1000019661" }, "menuType": "allMenu" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // btv pluse 전달
        //         // let data = { "DATA": { "text": "컨" }, "CONTENTS": "", "COMMAND": "DeliveryText", "TYPE": "notify" };
        //         // let data = { "DATA": { "extInfo": { "fromCommerce": false, "seeingPath": "99", "epsd_id": "", "adultCheck": false, "title": "", "isKidsContents": "", "epsd_rslu_id": "{20639824-49E0-11E8-867B-3D11A15194C7}", "sris_id": "", "search_type": "2" }, "menuType": "synopsis" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // let data = { "DATA": { "channelNumber": "325", "serviceId": "200", "state": "join", "channelName": "디자이어TV" }, "CONTENTS": "", "COMMAND": "SetChannelJoinState", "TYPE": "request" }
        //         // let data = { "DATA": { "channelNumber": "320", "serviceId": "184", "state": "join", "channelName": "플레이보이TV" }, "CONTENTS": "", "COMMAND": "SetChannelJoinState", "TYPE": "request" }
        //         // let data = {"DATA":{"point_count":"80000","coupon_new":"N","coupon_count":"0","point_new":"N"},"CONTENTS":"","COMMAND":"RequestCouponPoint","TYPE":"request"}
        //         // let data = { "DATA": { "directDataType": "setting_auth_number", "directData": "" }, "CONTENTS": "", "COMMAND": "DirectMenu", "TYPE": "request" };
        //         // let data = { "DATA": { "keyName": "allMenu","menuId": "allMenu"},"CONTENTS": "","COMMAND": "MenuHotKeyNavigationWeb","TYPE": "request"}
        //         // let data = {"DATA": {coupon_count: '21348',coupon_new: 'Y',bpoint_count: '98345',bpoint_new: ''},"CONTENTS": "","COMMAND": "RequestCouponPoint","TYPE": "request"}
        //         // let test = '"jump": { "sris_id": "CS01010313", "epsd_id": "CE0000006231", "sris_typ_cd": "02" }';
        //         // let data = {"DATA": {"extInfo": {"jumpType": "3","jump": "{ \"sris_id\": \"CS01010313\", \"epsd_id\": \"CE0000006231\", \"sris_typ_cd\": \"02\" }"},"menuType": "smartNotice"},"CONTENTS": "","COMMAND": "MenuNavigationWeb","TYPE": "request"};
        //         // let data = {"DATA": {"extInfo": {"jumpType": "3","jump": { "sris_id": "CS01010313", "epsd_id": "CE0000006231", "sris_typ_cd": "02" }}, "menuType": "smartNotice"},"CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request"}
        //         // 키즈존 -> 음성검색 -> 헬로카봇
        //         // let data = {"DATA":{"extInfo":{"fromCommerce":false,"seeingPath":"60","epsd_id":"CE0001308900","adultCheck":false,"title":"","isKidsContents":"","epsd_rslu_id":"{35EAB2D3-395F-11E8-B7C9-65278E0872EC}","sris_id":"","currentPlayState":"5","search_type":"2"},"menuType":"synopsis"},"CONTENTS":"","COMMAND":"MenuNavigationWeb","TYPE":"request"}
        //         // 바커 채널에서 빨간키
        //         // let data = {"DATA":{"extInfo":{"fromCommerce":false,"seeingPath":"31","epsd_id":"","adultCheck":false,"title":"","isKidsContents":"","epsd_rslu_id":"{33299A12-5E4C-11E8-91B3-AF1AD3B8D2B6}","sris_id":"","currentPlayState":"5","search_type":"2"},"menuType":"synopsisDirect"},"CONTENTS":"","COMMAND":"MenuNavigationWeb","TYPE":"request"}
        //         // 바커 채널에서 빨간키
        //         // let data = {"DATA":{"extInfo":{"fromCommerce":false,"seeingPath":"31","epsd_id":"","adultCheck":false,"title":"","isKidsContents":"","epsd_rslu_id":"{435D2952-624E-11E8-B712-97970028D4AA}","sris_id":"","currentPlayState":"5","search_type":"2"},"menuType":"synopsisDirect"},"CONTENTS":"","COMMAND":"MenuNavigationWeb","TYPE":"request"}
        //         // 키즈존 -> 음성검색 -> 뽀로로
        //         // let data = { "DATA": { "extInfo": { "fromCommerce": false, "seeingPath": "60", "epsd_id": "CE0000942511", "adultCheck": false, "title": "", "isKidsContents": "", "epsd_rslu_id": "{C8EFB6A6-3A94-11E2-A16B-AD79C28776CB}", "sris_id": "", "currentPlayState": "5", "search_type": "2" }, "menuType": "synopsis" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // 바커 채널에서 빨간키
        //         // let data = {"DATA":{"extInfo":{"fromCommerce":false,"seeingPath":"31","epsd_id":"","adultCheck":false,"title":"","isKidsContents":"","epsd_rslu_id":"{EC22430B-5E46-11E8-9F62-211E054CE9F3}","sris_id":"","currentPlayState":"5","search_type":"2"},"menuType":"synopsisDirect"},"CONTENTS":"","COMMAND":"MenuNavigationWeb","TYPE":"request"}
        //         //     Core.inst().webShowNoti();
        //         // vod 재생중 홈키
        //         // data = { "DATA": { "extInfo": { "currentPlayState": "6" }, "menuType": "home" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // clean AV중 홈키
        //         // data = { "DATA": { "extInfo": { "currentPlayState": "5" }, "menuType": "home" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" };
        //         // 나가기 키
        //         // let data = { "CONTENTS": "", "COMMAND": "NotifyClearScreen", "TYPE": "notify" }
        //         // console.log('jump=' + JSON.stringify(test));
        //         // 음성 검색 "키즈존"
        //         // data = { "DATA": { "extInfo": { "currentPlayState": "1" }, "menuType": "kidsZoneHome" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // 키즈존 에서 음성 검색 '키즈존'
        //         // data = { "TYPE": "request", "COMMAND": "MenuNavigationWeb", "CONTENTS": "", "DATA": { "menuType": "kidsZoneHome", "extInfo": { "trackId": "", "blockTrackId": "", "uxReference": "", "sessionId": "", "currentPlayState": "5" } } }
        //         // 핫키로 전체메뉴
        //         // data = { "DATA": { "menuId": "NM10000018142/NM1000020100", "keyName": "allMenu" }, "CONTENTS": "", "COMMAND": "MenuHotKeyNavigationWeb", "TYPE": "request" }
        //         // 핫키로 검색
        //         // data = { "DATA": { "extInfo": { "currentPlayState": "1" }, "menuType": "search" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // 음성검색 -> 킹스맨
        //         // let data = {"DATA":{"extInfo":{"fromCommerce":false,"seeingPath":"60","epsd_id":"CE0000005185","adultCheck":false,"title":"","isKidsContents":"","epsd_rslu_id":"{A0862AC7-B49A-11E7-A772-B559D4D32E8F}","sris_id":"","currentPlayState":"1","search_type":"2"},"menuType":"synopsis"},"CONTENTS":"","COMMAND":"MenuNavigationWeb","TYPE":"request"};
        //         // 음성검색 -> 무한도전
        //         // let data = { "DATA": { "extInfo": { "fromCommerce": false, "seeingPath": "60", "epsd_id": "CE0000716811", "adultCheck": false, "title": "", "isKidsContents": "", "epsd_rslu_id": "{60F3D30E-5887-11E6-BCEE-63002089F0E6}", "sris_id": "", "currentPlayState": "1", "search_type": "2" }, "menuType": "synopsis" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" };
        //         // 빨간키 장르홈 이동
        //         // let data = { "DATA": { "directData": "U5_03//NM1000018171|NM1000000300|NM1000019803", "directDataType": "OPMS" }, "CONTENTS": "", "COMMAND": "DirectMenu", "TYPE": "request" };
        //         // data = { "DATA": { "scnMethodCode": "", "directData": "U5_04\/\/NM1000018171|NM1000000400|NM1000021127", "directDataType": "OPMS" }, "CONTENTS": "", "COMMAND": "DirectMenu", "TYPE": "request" }
        //         // tvapp 이동
        //         // data = { "DATA": { "directData": "U5_09//NM1000018171|NM1000000300|NM1000019828", "directDataType": "OPMS" }, "CONTENTS": "", "COMMAND": "DirectMenu", "TYPE": "request" };
        //         // 빨간키 menunavi 이동
        //         // let data = { "DATA": { "extInfo": { "fromCommerce": false, "seeingPath": "3", "epsd_id": "CE0001274847", "adultCheck": false, "title": "", "isKidsContents": "", "epsd_rslu_id": "", "sris_id": "CS01059416", "currentPlayState": "1", "search_type": "1" }, "menuType": "synopsis" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // 예고편 이전키 -> 시놉
        //         // let data = { "DATA": { "extInfo": { "fromCommerce": false, "seeingPath": "99", "epsd_id": "", "adultCheck": false, "title": "", "isKidsContents": "N", "epsd_rslu_id": "{9EFC08FB-2759-11E8-AF31-6514001B4B4E}", "sris_id": "", "currentPlayState": "6", "search_type": "2" }, "menuType": "synopsis" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // 키즈 알람 5분전
        //         // data = { "DATA": { "alarmType": "0", "type": "alarmBefore", "text": "ㅡㅋ· 친구야이제 곧 유치원 갈 시간이야~", "character": "pinkfong" }, "CONTENTS": "", "COMMAND": "ShowKidsZoneAlarmWidget", "TYPE": "request" }
        //         // 전체 메뉴 이동
        //         // let data = {"DATA":{"extInfo":{"currentPlayState":"5","call_url":"NM1000018142\/NM1000018146\/NM1000019661"},"menuType":"allMenu"},"CONTENTS":"","COMMAND":"MenuNavigationWeb","TYPE":"request"}
        //         // 전체 메뉴 이동
        //         // data = { "DATA": { "extInfo": { "currentPlayState": "5", "call_url": "NM1000018142\/NM1000019694" }, "menuType": "allMenu" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // 핫 키 키즈 이동
        //         // data = { "DATA": { "menuId": "NM1000018142\/NM1000019694", "keyName": "kids" }, "CONTENTS": "", "COMMAND": "MenuHotKeyNavigationWeb", "TYPE": "request" }
        //         // 개그콘서트 코너 모아보기
        //         // let data = { "DATA": { "extInfo": { "fromCommerce": false, "seeingPath": "99", "epsd_id": "", "adultCheck": false, "title": "", "isKidsContents": "N", "epsd_rslu_id": "{7E014A55-9DD8-11E7-AA7F-23FB124830D5}", "sris_id": "", "currentPlayState": "6", "search_type": "2" }, "menuType": "synopsis" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // home auto hide 모드
        //         // let data = { "DATA": { "extInfo": { "currentPlayState": "5", "mode": "autoHide", }, "menuType": "home" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // 키즈 하위 뎁스 이동
        //         // let data = { "DATA": { "directData": "U5_07/20/NM1000020929", "directDataType": "OPMS" }, "CONTENTS": "", "COMMAND": "DirectMenu", "TYPE": "request" };
        //         // 키즈에서 검색키 실행
        //         // data = { "DATA": { "extInfo": { "currentPlayState": "1" }, "menuType": "search" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // 음성으로 마이btv 이동
        //         // data = { "DATA": { "extInfo": { "currentPlayState": "5" }, "menuType": "myBtv" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" };
        //         // vod 재생중 연속 재생을 위한 stb i/f
        //         // data = { "DATA": { "fromCommerce": "N", "seeingPath": "58", "epsd_id": "CE0001289169", "useStartTime": "N", "epsd_rslu_id": "", "sris_id": "", "playType": "default", "endTime": "", "search_type": "1", "previewIndex": "", "startTime": "0", "groupId": "", "repeatIndex": "", "cnr_id": "", "playOption": "next" }, "CONTENTS": "", "COMMAND": "PrepareVodPlay", "TYPE": "request" };
        //         // 최초 홈 로딩
        //         // data = { "DATA": { "extInfo": { "currentPlayState": "1", "mode": "autoHide" }, "menuType": "home" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // 엔딩 time 스타트
        //         // data = { "DATA": { "remainTime": '10'  }, "CONTENTS": "", "COMMAND": "RemainPlayTime", "TYPE": "notify" }
        //         // EPG 편성표
        //         // data = { "TYPE": "request", "COMMAND": "MenuNavigationWeb", "CONTENTS": "", "DATA": { "menuType": "liveTvSchedule", "extInfo": { "lastchannelId": 326, "scheduleGenre": "", "currentPlayState": "5" } } }
        //         // 키즈 버튼
        //         // data = { "DATA": { "extInfo": { "currentPlayState": "5" }, "menuType": "kidsZoneHome" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // 패키지 시놉 이동
        //         // data = { "TYPE": "request", "COMMAND": "MenuNavigationWeb", "CONTENTS": "", "DATA": { "menuType": "synopsisGateway", "extInfo": { "trackId": "", "blockTrackId": "", "uxReference": "", "sessionId": "", "search_type": "1", "sris_id": "CS10000081", "epsd_id": "CE0000007337", "isKidsContents": "", "seeingPath": "60", "epsd_rslu_id": "", "title": "", "adultCheck": false, "fromCommerce": false, "currentPlayState": "5" } } }
        //         // 점프로 패키지 시놉 이동하기
        //         // data = { "DATA": { "extInfo": { "currentPlayState": "5", "jumpType": "4", "uxReference": "", "trackId": "", "blockTrackId": "", "sessionId": "", "jump": "{\"sris_id\":\"CS12000222\",\"sris_typ_cd\":\"04\",\"prd_id\":\"\"}" }, "menuType": "smartNotice" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // 음성 myBtv 이동
        //         // data = { "TYPE": "request", "COMMAND": "MenuNavigationWeb", "CONTENTS": "", "DATA": { "menuType": "myBtv", "extInfo": { "trackId": "", "blockTrackId": "", "uxReference": "", "sessionId": "", "currentPlayState": "5" } } }
        //         // 뽀요tv 뽀로로TV 가기
        //         // data = { "TYPE": "request", "COMMAND": "DirectMenu", "CONTENTS": "", "DATA": { "directData": "U5_07/10/NM1000020178|NM1000022191|NM1000022193", "directDataType": "GNB_MENU", "scnMethodCode": "509" } }
        //         // 뽀요tv 뽀로로랑 놀기
        //         // data = { "TYPE": "request", "COMMAND": "DirectMenu", "CONTENTS": "", "DATA": { "directData": "U5_07/10/NM1000020178|NM1000022173|NM1000022746", "directDataType": "GNB_MENU", "scnMethodCode": "508" } }
        //         // 뽀요tv 타요랑 놀기
        //         // data = { "TYPE": "request", "COMMAND": "DirectMenu", "CONTENTS": "", "DATA": { "directData": "U5_07/10/NM1000020178|NM1000022173|NM1000022754", "directDataType": "GNB_MENU", "scnMethodCode": "508" } }
        //         // 뽀요tv 띠띠뽀랑 놀기
        //         // data = { "TYPE": "request", "COMMAND": "DirectMenu", "CONTENTS": "", "DATA": { "directData": "U5_07/10/NM1000020178|NM1000022191|NM1000022193", "directDataType": "GNB_MENU", "scnMethodCode": "509" } }
        //         // 소장용 화면 이동
        //         // data = { "DATA": { "extInfo": { "fromCommerce": false, "seeingPath": "60", "epsd_id": "CE0000034801", "adultCheck": false, "trackId": "", "blockTrackId": "", "epsd_rslu_id": "", "sris_id": "CS01020672", "currentPlayState": "5", "search_type": "1", "title": "", "uxReference": "", "sessionId": "", "isKidsContents": "" }, "menuType": "synopsisPossession" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
        //         // 월정액 해지
        //         // data = { "DATA": { "result": "ppmcancel" }, "CONTENTS": "", "COMMAND": "PPMCancelNoti", "TYPE": "notify" };
        //         // 이용가이드 시놉시스
        //         // data = { "TYPE": "request", "COMMAND": "MenuNavigationWeb", "CONTENTS": "", "DATA": { "menuType": "synopsis", "extInfo": { "trackId": "", "blockTrackId": "", "uxReference": "", "sessionId": "", "search_type": "2", "sris_id": "", "epsd_id": "", "epsd_rslu_id": "{E02C8901-5ABA-11E5-B4BC-E708E8ECCEF7}", "seeingPath": "99", "title": "", "isKidsContents": "", "adultCheck": false, "fromCommerce": false, "currentPlayState": "6" } } }
        //         // 음성 검색 더보기 '핑크퐁 더보기'
        //         // data = { "TYPE": "request", "COMMAND": "MenuNavigationWeb", "CONTENTS": "", "DATA": { "menuType": "search", "extInfo": { "trackId": "", "blockTrackId": "", "uxReference": "", "sessionId": "", "keyword": "핑크퐁  컨텐츠", "currentPlayState": "1" } } }
        //         // oap 핑크퐁 실행
        //         // data = { "TYPE": "request", "COMMAND": "DirectMenu", "CONTENTS": "", "DATA": { "directData": "U5_07/30/NM1000018171|NM1000000700|NM1000001200|NM1000021428", "directDataType": "OPMS", "scnMethodCode": "" } }
        //         // 복합상품 신용카드 결제 후 전달 받은 값
        //         // data = { "TYPE": "response", "COMMAND": "OpenPopupTvCommerce", "CONTENTS": "", "DATA": { "closed": "Y", "resultCode": "0", "resultMessage": "성공", "seqNumber": "199937099" } }
        //         // nugu 모바일 앱 연결 정보
        //         // data = { "CONTENTS": "", "COMMAND": "CheckConnectionNuguMobile", "TYPE": "response", "DATA": { "isConnect": "1" } };
        //         // 다음편 자동 재생 이어보기 팝업
        //         // data = { "TYPE": "request", "COMMAND": "PrepareVodPlay", "CONTENTS": "", "DATA": { "hideContinue": "Y", "playType": "default", "playOption": "next", "search_type": "1", "sris_id": "", "epsd_id": "CE0001392330", "epsd_rslu_id": "", "useStartTime": "N", "startTime": "0", "endTime": "", "repeatIndex": "", "seeingPath": "58", "groupId": "", "cnr_id": "", "previewIndex": "", "fromCommerce": "N" } }
        //         // 음성 명령어 전달
        //         // data = { "DATA": { ctrlType: 'LikeCH', ctrlValue: 'Reg', hash: '' }, "CONTENTS": "", "COMMAND": "SendVoiceCommand", "TYPE": "request" };
        //         // data = { "DATA": { ctrlType: 'SeasonNext', ctrlValue: '', hash: '' }, "CONTENTS": "", "COMMAND": "SendVoiceCommand", "TYPE": "request" };
        //         // data = { "DATA": { ctrlType: 'SeasonPrev', ctrlValue: '', hash: '' }, "CONTENTS": "", "COMMAND": "SendVoiceCommand", "TYPE": "request" };
        //         // data = { "DATA": { ctrlType: 'SeriesNum', ctrlValue: '3', hash: 'asdklfjals' }, "CONTENTS": "", "COMMAND": "SendVoiceCommand", "TYPE": "request" };
        //         try {
        //             let type = prompt('ctrlType ; ctrlValue 입력 ex) SeriesNum;3 \n\n ' +
        //                 "ctrlType list : 'LikeCH' 'Menu' 'Pick' 'SeasonNext' 'SeasonPrev' 'SeriesNum' " +
        //                 "'SeriesLast' 'SeriesFst' 'SeriesNext' 'SeriesPrev' 'Synop' \n\n" +
        //                 "ctrlVall list : 'MyBtv','Search','Main','MonSub','TVApp','Movie','Series','TVShow','Ani','Kids','Docu','Life','Edu','Silver','Reg','Unreg','Summary','Trailer',"
        //             ).split(';');
        //             data = { "DATA": { ctrlType: type[0], ctrlValue: type[1], hash: '' }, "CONTENTS": "", "COMMAND": "SendVoiceCommand", "TYPE": "request" };
        //             this.receiveMessageFromNative(data);
        //         } catch (error) {

        //         }
        //         // StbInterface.resizeMainPlayer('N', 2, 5, 600, 500);
        //     }
        //     // else if ( (key === 'SCHEDULE') ){
        //     //     console.log('[msmason] Key Input ', key);
        //     //     Core().inst().move(constants.EPG);
        //     // }
        // }
    }

    /**
     * 키즈 이탈 로직 실행
     * @param {String} menuType 
     * @param {Function} callback 
     */
    // webkidsExit(menuType = null, callback) {
    //     const isKidsSafty = appConfig.runDevice ? StbInterface.getProperty(STB_PROP.KIDS_SAFETY_PASSWORD) : appConfig.STBInfo.kidsSafty;
    //     console.log('webkidsExit() isKidsSafty=' + isKidsSafty + '  menuType=' + menuType);
    //     const fnCallback = (menuType) => {
    //         // if (isHistoryclear) {
    //         //     HistoryManager.clear();  //  키즈존 이탈은 모든 history 삭제
    //         // }
    //         if (menuType != null) {
    //             Core.inst().webVisible(true);
    //             cm.sendMessageToNative({
    //                 TYPE: STB_TYPE.RESPONSE,
    //                 COMMAND: STB_COMMAND.MENU_NAVIGATION_WEB,
    //                 CONTENTS: '',
    //                 DATA: {
    //                     menuType,
    //                     result: 'success'
    //                 }
    //             });
    //         }
    //     }

    //     if (isKidsSafty === '0') { // 1. 키즈존 잠금 미설정 시
    //         // 1-1. 키즈존 종료 가이드 호출,  20180619 peter 시나리오쪽에서 키즈존 종료 가이드 안보이도록 요청 받음.
    //         // Core.inst().showPopup(<PlayGuideEnd />, '', () => {
    //         // console.log('%c[PlayGuideEnd CallBack] ===>','color:#0000ff', data);
    //         // if (callback && typeof callback === 'function') {
    //         Core.inst().hideKidsWidget();
    //         StbInterface.kidszoneState('exit');
    //         !appConfig.runDevice && StbInterface.setProperty(STB_PROP.KIDS_MODE_ENTRY, '0');
    //         if (callback) {
    //             callback();
    //         }
    //         fnCallback(menuType);
    //         // }
    //         // });

    //     } else { // 2. 키즈존 잠금 설정 시
    //         // 2-1. 키즈존 종료 인증 팝업 호출
    //         Core.inst().showPopup(<KidsEndCertification name={'KidsEndCertification'} />, '', (data) => {
    //             // console.log('%c[KidsEndCertification CallBack] ===>','color:#0000ff', data);
    //             if (data && data.result === '0000') {
    //                 Core.inst().hideKidsWidget();
    //                 StbInterface.kidszoneState('exit');
    //                 !appConfig.runDevice && StbInterface.setProperty(STB_PROP.KIDS_MODE_ENTRY, '0');
    //                 if (callback && typeof callback) {
    //                     callback();
    //                 }
    //                 fnCallback(menuType);
    //             }
    //         });
    //     }
    // }

//     webkidsExitSync(menuType = null) {
//     const isKidsSafty = appConfig.runDevice ? StbInterface.getProperty(STB_PROP.KIDS_SAFETY_PASSWORD) : appConfig.STBInfo.kidsSafty;
//     console.log('webkidsExit() Promise isKidsSafty=' + isKidsSafty + '  menuType=' + menuType);
//     const fnCallback = (menuType) => {
//       // if (isHistoryclear) {
//       //     HistoryManager.clear();  //  키즈존 이탈은 모든 history 삭제
//       // }
//       if (menuType != null) {
//         Core.inst().webVisible(true);
//         cm.sendMessageToNative({
//           TYPE: STB_TYPE.RESPONSE,
//           COMMAND: STB_COMMAND.MENU_NAVIGATION_WEB,
//           CONTENTS: '',
//           DATA: {
//             menuType,
//             result: 'success'
//           }
//         });
//       }
//     };

//     if (isKidsSafty === '0') { // 1. 키즈존 잠금 미설정 시
//       // 1-1. 키즈존 종료 가이드 호출,  20180619 peter 시나리오쪽에서 키즈존 종료 가이드 안보이도록 요청 받음.
//       // Core.inst().showPopup(<PlayGuideEnd />, '', () => {
//       // console.log('%c[PlayGuideEnd CallBack] ===>','color:#0000ff', data);
//       // if (callback && typeof callback === 'function') {
//       Core.inst().hideKidsWidget();
//       StbInterface.kidszoneState('exit');
//       !appConfig.runDevice && StbInterface.setProperty(STB_PROP.KIDS_MODE_ENTRY, '0');
//       fnCallback(menuType);
//     } else { // 2. 키즈존 잠금 설정 시
//       // 2-1. 키즈존 종료 인증 팝업 호출
//       return new Promise((resolve, reject) => {
//         Core.inst().showPopup(<KidsEndCertification name={'KidsEndCertification'} />, '', (data) => {
//           // console.log('%c[KidsEndCertification CallBack] ===>','color:#0000ff', data);
//           if (data && data.result === '0000') {
//             Core.inst().hideKidsWidget();
//             StbInterface.kidszoneState('exit');
//             !appConfig.runDevice && StbInterface.setProperty(STB_PROP.KIDS_MODE_ENTRY, '0');
//             fnCallback(menuType);
//             resolve(true);
//           } else {
//               reject(false);
//           }
//         });
//       });
//     }
//   };

    getGnbIndex(gnbIndex) {
        return this.gnbMenu && this.gnbMenu.getGnbIndex(gnbIndex);
    }
}

window.CoreClass = Core;

export default Core





// STB I / F communicate.js: [sendMessage] { "TYPE": "request", "COMMAND": "PlayOap", "CONTENTS": "", "DATA": { "playState": 1 } }
// communicate.js: 46 STB I / F communicate.js: [getMessage] { "TYPE": "request", "COMMAND": "EncryptData", "CONTENTS": "", "DATA": { "target": "scs", "cryptType": "encrypt", "text": "{081E6E12-25AA-11E8-AD34-21E42E7495CA}^cc:4e:ec:d0:94:18^{A1449540-4850-11E8-9F62-211E054CE9F3}^6326286^10", "dateTime": "0608160724" } }
// communicate.js: 88 STB I / F communicate.js: [sendMessage] { "TYPE": "request", "COMMAND": "PlayInfo", "CONTENTS": "", "DATA": "" }
// stbInterface.js: 1392 STB I / F static js: [receiveMessage] { "DATA": { "contentId": "{34B14B5D-4947-11E8-9F62-211E054CE9F3}", "isPlayType": "VOD" }, "CONTENTS": "", "COMMAND": "PlayInfo", "TYPE": "response" }
// communicate.js: 88 STB I / F communicate.js: [sendMessage] { "TYPE": "request", "COMMAND": "PlayVod", "CONTENTS": "", "DATA": { "playType": "preview", "playOption": "normal", "cnt_url": "skbvod://cdn2.hanafostv.com:554/movie/34950/M349243_2_180426.ts.pac?ci={A14…0-4850-11E8-9F62-211E054CE9F3}&oi=747aM349243_2_180426&op=4a0d4431437&rp=0", "type": "2", "repeatIndex": "", "useStartTime": "", "kids_yn": "N", "synopType": "normal", "seamless": "N", "seeingPath": "47", "gCode": "", "iptvSetProdBuyFlag": "N", "trailerTitle": "일반용UI 예고편 [곤지암]", "menuId": "", "fromCommerce": "", "uxReference": "", "kidschar_id": "", "synopsisInfo": { "title": "곤지암", "sris_id": "CS01067093", "epsd_rslu_id": "{65CC0B1F-484E-11E8-9F62-211E054CE9F3}", "kids_yn": "N", "genreCode": "", "currentMenu": "", "openg_tmtag_tmsc": "", "endg_tmtag_tmsc": "", "org_epsd_rslu_id": "{65CC0B1F-484E-11E8-9F62-211E054CE9F3}", "isMovie": "Y", "isFree": "N", "linkType": "Y", "isSample": "N", "isAdult": "N", "poster": "", "mediaType": "", "wat_lvl_cd": "15", "play_tms_val": "94", "ending_cw_call_id_val": "TEST.ENDING.SYNOPSIS.PAGE", "isSeries": "N", "mtx_capt_yn": "", "meta_typ_cd": "000", "cornerList": null, "preview_start_index": "0", "preview": [{ "pcim_addn_typ_nm": "예고편", "prd_prc_id": "6326286", "epsd_rslu_id": "{A1449540-4850-11E8-9F62-211E054CE9F3}", "img_path": "/movie/34950/M349243_2_trailer.jpg", "title": "일반용UI 예고편 [곤지암]" }] }, "wscsInfo": { "chargePeriod": "5", "contentId": "{A1449540-4850-11E8-9F62-211E054CE9F3}", "contentUrl": "tvsrtsp://cdn2.hanafostv.com:554/movie/34950/M349243_2_180426.ts.pac", "productType": "10", "productId": "6326286", "wmUseFlag": "N", "wmExtension": "", "wmMode": "0", "id": "747aM349243_2_180426", "password": "4a0d4431437" }, "startTime": "0" } }
// stbInterface.js: 1392 STB I / F static js: [receiveMessage] { "CONTENTS": "", "COMMAND": "WebHideNoti", "TYPE": "notify" }
// communicate.js: 88 STB I / F communicate.js: [sendMessage] { "TYPE": "notify", "COMMAND": "WebHideNoti", "CONTENTS": "", "DATA": "" }
// stbInterface.js: 1392 STB I / F static js: [receiveMessage]
// let data = {
//     "DATA": {
//         "extInfo": {
//             "fromCommerce": false, "seeingPath": "99", "epsd_id": "", 
//             "adultCheck": false,
//              "title": "", 
//              "isKidsContents": "",
//               "epsd_rslu_id": "{65CC0B1F-484E-11E8-9F62-211E054CE9F3}",
//                "sris_id": "", "currentPlayState": "5", "search_type": "2"
//         }, "menuType": "synopsis"
//     }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request"
// }
// communicate.js: 88 STB I / F communicate.js: [sendMessage] { "TYPE": "response", "COMMAND": "MenuNavigationWeb", "CONTENTS": "", "DATA": { "menuType": "synopsis", "result": "success" } }
// stbInterface.js: 1392 STB I / F static js: [receiveMessage] { "CONTENTS": "", "COMMAND": "WebShowNoti", "TYPE": "notify" }
