/**
 * Room can be both string and number.
 * Decide based on 'allowStringIds' param
 * @param {string|number} roomRaw
 * @param {boolean} allowStringIds
 * @returns {string|number}
 */
function parseRoom(roomRaw, allowStringIds) {
    if (allowStringIds) return `${roomRaw}`;

    return parseInt(roomRaw);
}

module.exports.parseRoom = parseRoom;