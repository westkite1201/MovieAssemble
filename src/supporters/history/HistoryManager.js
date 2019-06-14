import _ from 'lodash';

var historyList = [];

export const PUSH = 'PUSH';
export const POP = 'POP';
export const REPLACE = 'REPLACE';

export function push(path, data) {
    // add = (data) => {
    historyList.push({
        path,
        data
    });
    // 히스토리 31개째 쌓이면 제일 첫번째 히스토리 삭제 (히스토리30개유지)
    if (historyList.length === 31) {
        historyList.splice(0, 1);
    }

    console.log('====================================');
    console.log('path', path);
    console.log('push historyList.length=', historyList, historyList.length);
    console.log('====================================');
};

export function pop() {
    let rs = historyList.pop();
    rs = rs ? rs.data : '';
    console.log('====================================');
    console.log('pop historyList.length=', historyList, historyList.length, rs);
    console.log('====================================');
    return rs;
};

export function getList() {
    return historyList;
}

export function clear() {
    console.log('====================================');
    console.log('historyList clear ');
    console.log('====================================');
    historyList = [];
}

window.historyList = historyList;
// export default HistoryManager;