import { reatomResource, withDataAtom, withStatusesAtom } from '@reatom/async';
import { atom } from '@reatom/core';
import { StoryChunk } from '@/src/shared/types/story';
import { generateStoryChunksAction } from './actions';

export const storyAtom = atom<string | null>(null, 'storyAtom');

export const storyChunkAtom = atom<StoryChunk | null>(null, 'storyChunkAtom');

export const nextStoryChunksResource = reatomResource(async (ctx) => {
    const story = ctx.spy(storyAtom);

    if (!story) {
        return null;
    }

    return ctx.schedule(() => generateStoryChunksAction(ctx));
}, 'nextStoryChunksResource').pipe(withDataAtom(null), withStatusesAtom());

export const isInitStoryLoadingAtom = atom<boolean>(false, 'isInitStoryLoadingAtom');
