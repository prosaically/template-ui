/**
 * 常量数组
 * @type {number[]}
 */
const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const letters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z"
];
const alphanumeric = [...numbers, ...letters];

/**
 * 随机字符串生成器
 *
 * @param chars 字符数组
 * @param length 长度
 * @returns {string} 随机字符串
 */
const randomizer = function (chars, length) {
    let scope = chars.length - 1;
    return Array(length)
        .fill(0)
        .map(() => letters[Math.round(Math.random() * scope)])
        .join("");
};

module.exports = {
    numbers: length => randomizer(numbers, length),
    letters: length => randomizer(letters, length),
    alphanumeric: length => randomizer(alphanumeric, length)
};
