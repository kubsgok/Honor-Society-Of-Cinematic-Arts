let chapterNumber: number = 1;

export function getChapterNumber(): number {
    return chapterNumber;
}

export function setChapterNumber(value: number) {
    chapterNumber = value;
}

export default {
    getChapterNumber,
    setChapterNumber,
}