class Location {
  constructor(_history, _core) {
    this.historyManager = _history;
    this.core = _core;
  }

  history() {
    return this.historyManager.history;
  }

  move(_path, obj) {

    let history = this.historyManager;
    console.log('Location history: ' + history + ', path: ' + _path, obj);
    if (history) {
      history.push.apply(history, arguments);
    }
  }

  replace(_path, _state) {
    let history = this.historyManager;
    console.log('Location replace: ', history, ', path: ' + _path, ', state: ', _state);
    if (history) {
      history.replace(_path, _state);
    }
  }

  back() {
    this.getHistory().goBack();
  }

  getPath() {
    return this.historyManager.location.pathname;
  }

  getHistory() {
    return this.historyManager;
  }

  setHistory(data) {
    this.historyManager = data;
  }

  get queries() {
    return this.historyManager.getCurrentLocation().query;
  }

}
export default Location;
