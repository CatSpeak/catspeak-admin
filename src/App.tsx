import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import ToastContainer from "./components/ui/Toast";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}

export default App;
