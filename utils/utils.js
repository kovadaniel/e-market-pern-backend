const approximate = (values) => {
    return values.reduce((cur, acc) => cur+acc, 0)/values.length
}

module.exports = {approximate};