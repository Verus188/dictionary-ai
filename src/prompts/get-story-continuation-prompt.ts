import { storySystemPrompt } from "./story-system-prompt";

/**
 * Возвращает промпт для составления продолжения истории
 * @param story - история, которую надо продолжить
 * @param action - действие, которое выполняет главный герой
 * @param continuationSize - размер продолжения
 * @param mood - настроение истории. Например, абсурдная, смешная, в виде стихотворения и тд
 * @param language - какой язык используется для продолжения
 * @param languageDifficulty - насколько сложная лексика используется
 * @example getStoryContinuationPrompt('какая то история...', 'открыл дверь','история должна быть абсурдная', 'вся история должна быть на французском', 'используй детскую лексику')
 */
export const getStoryContinuationPrompt = (
  story: string,
  action?: string,
  continuationSize?: string,
  mood?: string,
  language?: string,
  languageDifficulty?: string
) => {
  const languagePrompt = language ? "The story have to be in " + language : "";

  return [
    story,
    action,
    storySystemPrompt,
    continuationSize,
    mood,
    languagePrompt,
    languageDifficulty,
  ].join("\n");
};
