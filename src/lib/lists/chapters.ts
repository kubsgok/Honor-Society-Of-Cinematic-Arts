const G = globalThis as any
G.__CHAPTER_NUMBER = typeof G.__CHAPTER_NUMBER === 'number' ? G.__CHAPTER_NUMBER : 1

export function getChapterNumber(): number {
  return G.__CHAPTER_NUMBER
}

export function setChapterNumber(value: number) {
  G.__CHAPTER_NUMBER = value
}

export default {
  getChapterNumber,
  setChapterNumber,
}