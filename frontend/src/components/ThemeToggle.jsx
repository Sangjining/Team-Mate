import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        aria-label="테마 설정"
      >
        <option value="light">☀️ 라이트모드</option>
        <option value="dark">🌙 다크모드</option>
        <option value="system">💻 시스템 설정</option>
      </select>
    </div>
  );
}

export default ThemeToggle;