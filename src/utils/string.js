/**
 * Replaces all occurrences of {key} in a string with corresponding values from an object
 * @param {Object} obj - Object containing replacement values
 * @param {string} str - String with placeholders like {key}
 * @return {string} - String with placeholders replaced by values from the object
 * @example
 * const obj = { name: "John", age: 30 };
 * const str = "Hello {name}, you are {age} years old";
 * format(obj, str); // "Hello John, you are 30 years old"
 */
export const replaceWithObj = (obj, str) => {
  return str.replace(/\{([^{}]+)\}/g, (match, key) => {
    const value = obj[key]
    return value !== undefined ? value : match
  })
}
