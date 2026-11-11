import { act, renderHook } from '@testing-library/react';
import {
  resolveLessonHlsSrc,
  useLessonVideoHlsSrc,
} from './useLessonVideoHlsSrc';
import { useModulesStore } from '../store/modulesStore';
import { DEFAULT_MODULES, type ModulesConfig } from '../types/modulesConfig';

const MASTER = 'https://cdn.test/hls/abc/master.m3u8';

const setModules = (modules: ModulesConfig) =>
  act(() => {
    useModulesStore.setState({ modules });
  });

describe('resolveLessonHlsSrc', () => {
  it('hands the master to the player when HLS is on', () => {
    expect(resolveLessonHlsSrc(MASTER, false)).toBe(MASTER);
  });

  it('plays the MP4 (no hlsSrc) while the lesson is not converted', () => {
    expect(resolveLessonHlsSrc(null, false)).toBeUndefined();
    expect(resolveLessonHlsSrc(undefined, false)).toBeUndefined();
  });

  it('treats a blank master as not converted', () => {
    expect(resolveLessonHlsSrc('', false)).toBeUndefined();
    expect(resolveLessonHlsSrc('   ', false)).toBeUndefined();
  });

  it('trims the master it hands over', () => {
    expect(resolveLessonHlsSrc(`  ${MASTER} `, false)).toBe(MASTER);
  });

  it('drops the master when the MP4-only switch is on', () => {
    expect(resolveLessonHlsSrc(MASTER, true)).toBeUndefined();
  });
});

describe('useLessonVideoHlsSrc', () => {
  afterEach(() => {
    setModules(DEFAULT_MODULES);
  });

  it('returns the master with the default modules (switch off)', () => {
    setModules(DEFAULT_MODULES);

    const { result } = renderHook(() => useLessonVideoHlsSrc(MASTER));

    expect(result.current).toBe(MASTER);
  });

  it('returns undefined when the institution switched to the MP4', () => {
    setModules({ ...DEFAULT_MODULES, lessonVideoMp4Only: true });

    const { result } = renderHook(() => useLessonVideoHlsSrc(MASTER));

    expect(result.current).toBeUndefined();
  });

  it('keeps HLS when the key is missing (backend or persisted state without it)', () => {
    const { lessonVideoMp4Only: _omitted, ...withoutKey } = DEFAULT_MODULES;
    setModules(withoutKey as ModulesConfig);

    const { result } = renderHook(() => useLessonVideoHlsSrc(MASTER));

    expect(result.current).toBe(MASTER);
  });

  it('only a real `true` switches HLS off', () => {
    setModules({
      ...DEFAULT_MODULES,
      lessonVideoMp4Only: 'true' as unknown as boolean,
    });

    const { result } = renderHook(() => useLessonVideoHlsSrc(MASTER));

    expect(result.current).toBe(MASTER);
  });

  it('follows the switch when the modules arrive after the first render', () => {
    setModules(DEFAULT_MODULES);
    const { result } = renderHook(() => useLessonVideoHlsSrc(MASTER));
    expect(result.current).toBe(MASTER);

    setModules({ ...DEFAULT_MODULES, lessonVideoMp4Only: true });

    expect(result.current).toBeUndefined();
  });

  it('returns undefined for a lesson without HLS, whatever the switch', () => {
    const { result } = renderHook(() => useLessonVideoHlsSrc(null));

    expect(result.current).toBeUndefined();
  });
});
