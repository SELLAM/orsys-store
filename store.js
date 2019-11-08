import * as _ from 'lodash';

export function Store() {
    const data = {};
    const subscribers = {};

    /**
     *
     * @description Get the value from data by path
     * @param path
     * @param defaultValue 
     */
    function get(path, defaultValue = null) {
        return _.result(data, path, defaultValue);
    }

    /**
     *
     * @description Get the clonned value from data by path
     * @param path
     * @param defaultValue 
     */
    function getClone(path, defaultValue = null) {
        return _.cloneDeep(this.get(path, defaultValue));
    }

    /**
     *
     * @description Set the value of a key
     * @param path
     * @param newValue
     */
    function set(path, newValue) {
        //added to minimize rendering
        let currentValue = _.clone(get(path));

        if (_.isEqual(currentValue, newValue)) return;

        _.set(data, path, newValue);

        _.chain(path)
            .split(".")
            .forEach(key => {
                notifySubscribers(key, newValue, currentValue);
            });

        notifySubscribers(path, newValue, currentValue);
    }

    /**
     *
     * @description Send notification to all listners
     * @param path
     * @newValue path
     * @currentValue path
     */
    function notifySubscribers(path, newValue, oldValue) {
        _.forEach(subscribers[path], listener => {
            if (listener) listener(newValue, oldValue);
        });
    }

    /**
     *
     * @description Add a listner to call when the value changed
     * @param paths
     * @param listener
     */
    function subscribe(paths, listener) {
        const listnerIndexes = [];
        paths.forEach(path => {
            subscribers[path] = subscribers[path] || [];

            listnerIndexes.push([path, subscribers[path].length]);

            subscribers[path] = _.concat(subscribers[path], listener);

            notifySubscribers(path, get[path], null);
        });

        // const unsubscribe = ;

        return {
            unsubscribe: () => {
                listnerIndexes.forEach(([key, index]) => {
                    subscribers[key][index] = null;
                });
            }
        };
    }

    return {
        get,
        getClone,
        set,
        subscribe,
        notifySubscribers
    }
}


