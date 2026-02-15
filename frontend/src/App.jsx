// src/App.jsx
import { ThemeProvider } from "./context/ThemeContext.jsx";
import BookmarksPage from "./pages/BookmarksPage.jsx";

const App = () => (
  <ThemeProvider>
    <BookmarksPage />
  </ThemeProvider>
);

export default App;