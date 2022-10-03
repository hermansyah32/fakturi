/**
 * get props value
 *  
 * @param {*} value props value
 * @param {*} def default return value if props undefined or null
 */
const getProps = (value, def) => {
    if (value === undefined) return def;
    if (value === null) return def;
    return value;
}

module.exports = { getProps }