import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BreadcrumbsComponent } from "./components/common/Breadcrumbs";
import { GullTVComponent } from "./components/common/GullTVComponent";
import { MatsflixComponent } from "./components/matsflix/MatsflixComponent";
import { NoobTubeComponent } from "./components/noobtube/NoobTubeComponent";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <BreadcrumbsComponent />
        <div className="m-2">
          <Routes>
            <Route path="/" element={<GullTVComponent />}></Route>
            <Route path="/matsflix*" element={<MatsflixComponent />}></Route>
            <Route path="/noobtube" element={<NoobTubeComponent />}></Route>
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
