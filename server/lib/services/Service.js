class Service {
  constructor(name,configStore) {
    this.name = name;
    this.configStore = configStore;
    this.intervalDelay = 60000;
    this.cachedResponse = null;
  }

  exec() {
    throw new Error('Must override!');
  }

  getCachedOrExec() {
    if (this.cachedResponse) {
      return new Promise((resolve) => resolve(this.cachedResponse));
    } else {
      console.log('No cached response available');
      return this.exec();
    }
  }

  executor() {
    console.log('Fetching updates for ' + this.name);
    this.exec()
      .then((response) => {
        this.cachedResponse = response;
      })
      .catch((err) => {
        console.error(err);
      })
  }

  begin() {
    this.end();
    this.executor();
    this.interval = setInterval(() => {
      this.executor();
    },this.intervalDelay);
  }

  end() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  handleSubError(err) {
    console.error(err);
  }

  thenSleep(data,time) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
      },time);
    })
  }

  promiseIfy(op) {
    return new Promise((resolve,reject) => {
      op((err,data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      })
    })
  }

  loadConfig() {
    return this.configStore.get(this.name)
      .then((config) => {
        if (config) {
          this.config = config;
          this.begin();
        }
      });
  }

  updateConfig(config) {
    this.config = config;
    return this.configStore.set(this.name,this.config)
      .then(() => {
        this.begin();
      })
  }
}

module.exports = Service;
