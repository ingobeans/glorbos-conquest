export function clone<Type extends Object>(object: Type): Type {
    let cloned = Object.create(object);
    for (let [key, value] of Object.entries(object)) {
        if (value instanceof Object) {
            value = clone(value);
        }
        cloned[key] = value;
    }
    return cloned;
}