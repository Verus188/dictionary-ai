import { StoryActions } from "../model/types";

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
  systemPrompt: string,
  actions?: StoryActions,
  continuationSize?: string,
  mood?: string,
  language?: string,
  languageDifficulty?: string
) => {
  const actionsPrompt = actions
    ? `action-1: ${actions?.action1},\naction-2: ${actions?.action2}`
    : "";
  const languagePrompt = language ? "The story have to be in " + language : "";
  const continuationSizePrompt = continuationSize
    ? `The continuation of the story should be about ${continuationSize} characters.`
    : "";

  const languageDifficultyPrompt = languageDifficulty
    ? `Use the language complexity level = ${languageDifficulty}, where 1 is the simplest and 6 is the most complex.
	1.	Very simple language — short sentences, basic words, minimal descriptions (suitable for children).
	2.	Simple language — slightly longer sentences, easy vocabulary, simple imagery.
	3.	Intermediate level — everyday conversational style, clear language, a moderate amount of detail.
	4.	Advanced level — more complex sentences, diverse vocabulary, metaphors and descriptions.
	5.	Complex level — rich literary language, rare words, long sentences, sophisticated structures.
	6.	Very complex language — almost academic style, high density of metaphors and literary devices, abundance of details.`
    : "";

  return [
    story,
    actionsPrompt,
    systemPrompt,
    continuationSizePrompt,
    mood,
    languagePrompt,
    languageDifficultyPrompt,
  ].join("\n");
};
