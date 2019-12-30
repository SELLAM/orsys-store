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
     * @description Get the value from data by path
     * @param namespace
     * @param path
     * @param defaultValue 
     */
    function getWithNamespace(namespace, path, defaultValue = null) {
        return _.result(data, namespace + '.' + path, defaultValue);
    }

    /**
     *
     * @description Get the clonned value from data by path
     * @param path
     * @param defaultValue 
     */
    function getClone(path, defaultValue = null) {
        return _.cloneDeep(get(path, defaultValue));
    }

    /**
     *
     * @description Set the value of a key
     * @param path
     * @param newValue
     */
    function set(path, newValue) {
        //added to minimize rendering
        let currentValue = getClone(path);

        if (_.isEqual(currentValue, newValue)) return;

        _.set(data, path, newValue);

        notifySubscribers(path, newValue, currentValue);
    }

    /**
     *
     * @description set with namespace
     * @param namespace
     * @param path 
     * @param value 
     */
    function setWithNamespace(namespace, path, value) {
        set(namespace + '.' + path, value)
    }

    /**
     *
     * @description Send notification to all listners
     * @param path
     * @newValue path
     * @currentValue path
     */
    function notifySubscribers(path, newValue, oldValue) {

        const keys = _.split(path, ".");

        while (keys.length) {
            const p = _.join(keys, ".");
            _.forEach(subscribers[p], l => l && l(newValue, oldValue, p, path));
            keys.pop();
        }
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

        return {
            unsubscribe: () => {
                listnerIndexes.forEach(([key, index]) => {
                    subscribers[key][index] = null;
                });
            }
        };
    }

    function getData() {
        return data
    }

    function getSubscribers() {
        return subscribers
    }

    return {
        get,
        getClone,
        getData,
        set,
        subscribe,
        notifySubscribers,
        getSubscribers,
        getWithNamespace,
        setWithNamespace
    }
}


