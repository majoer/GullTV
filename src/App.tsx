import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MatsflixComponent } from "./components/MatsflixComponent";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();
function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <MatsflixComponent />
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
