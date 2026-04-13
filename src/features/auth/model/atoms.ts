import { atom } from '@reatom/core';
import { AuthUser } from '@/src/shared/types/auth';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest';

export const authStatusAtom = atom<AuthStatus>('idle', 'authStatusAtom');

export const authAccessTokenAtom = atom<string | null>(null, 'authAccessTokenAtom');

export const authUserAtom = atom<AuthUser | null>(null, 'authUserAtom');
