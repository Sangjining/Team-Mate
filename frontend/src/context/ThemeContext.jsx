import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'team-mate-theme';

// 저장된 사용자 설정 가져오기
function getInitialTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY);

  if (['light', 'dark', 'system'].includes(savedTheme)) {
    return savedTheme;
  }

  return 'system';
}

// 시스템 다크모드 여부 확인
function isSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // 실제 적용할 테마 결정
    const applyTheme = () => {
      const resolvedTheme =
        theme === 'system'
          ? mediaQuery.matches
            ? 'dark'
            : 'light'
          : theme;

      document.documentElement.setAttribute(
        'data-theme',
        resolvedTheme
      );
    };

    applyTheme();

    // 사용자가 선택한 테마 저장
    localStorage.setItem(STORAGE_KEY, theme);

    // 시스템 테마 변경 감지
    mediaQuery.addEventListener('change', applyTheme);

    return () => {
      mediaQuery.removeEventListener('change', applyTheme);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 다른 컴포넌트에서 테마를 사용하기 위한 Hook
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme는 ThemeProvider 내부에서 사용해야 합니다.'
    );
  }

  return context;
}