import * as _ from "lodash";

export class Store {
  data: Object;
  subscribers: Object;
  // options: any;
  // preGetters: Object;
  // preSetters: Object;
  // endpoints: Object;
  // api: AxiosInstance;

  [propName: string]: any

  constructor(opts?: any) {}

  /**
   *
   * @description Get the value from data by path
   * @param path
   * @param defaultValue
   */
  get(path: string, defaultValue?: any): any {
    return _.result(this.data, path, defaultValue);
  }

  /**
   *
   * @description Set the value of a key
   * @param path
   * @param newValue
   */
  set(path: string, newValue: any): void {
    //added to minimize rendering
    let currentValue = _.clone(this.get(path));

    if (_.isEqual(currentValue, newValue)) return;

    _.set(this.data, path, newValue);

    _.chain(path)
      .split(".")
      .forEach(key => {
        this.notifySubscribers(key, newValue, currentValue);
      });

    this.notifySubscribers(path, newValue, currentValue);
  }

  /**
   *
   * @description Send notification to all listners
   * @param path
   * @newValue path
   * @currentValue path
   */
  notifySubscribers(path: string, newValue: any, currentValue: any): void {
    _.forEach(this.subscribers[path], listener => {
      if (listener) listener(newValue, currentValue);
    });
  }

  /**
   *
   * @description Add a listner to call when the value changed
   * @param paths
   * @param listener
   */
  subscribe(paths: string[], listener: Function): any {
    const listnerIndexes = [];
    paths.forEach(path => {
      this.subscribers[path] = this.subscribers[path] || [];

      listnerIndexes.push([path, this.subscribers[path].length]);

      this.subscribers[path] = _.concat(this.subscribers[path], listener);

      this.notifySubscribers(path, this.get[path], null);
    });

    // const unsubscribe = ;

    return {
      unsubscribe: () => {
        listnerIndexes.forEach(([key, index]) => {
          this.subscribers[key][index] = null;
        });
      }
    };
  }
}
