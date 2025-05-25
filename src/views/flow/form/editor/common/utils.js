/**
 * Created by Liu.Jun on 2019/11/28 18:37.
 */

export function deepFreeze(obj) {
    for (let key in obj) {
        let value = obj[key];
        if (typeof value === "object") {
            deepFreeze(value);
        }
    }
    return Object.freeze(obj);
}
