import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import ToastContainer from "./components/ui/Toast";
import { LanguageProvider } from "./stores/languageStore";

function App() {
  return (
    <LanguageProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </LanguageProvider>
  );
}

export default App;
