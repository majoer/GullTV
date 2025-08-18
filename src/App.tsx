import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MatsflixComponent } from "./components/matsflix/MatsflixComponent";
import { GullTVComponent } from "./components/common/GullTVComponent";
import { MatsTubeComponent } from "./components/matstube/MatsTubeComponent";
import { BreadcrumbsComponent } from "./components/common/Breadcrumbs";

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
            <Route path="/matstube" element={<MatsTubeComponent />}></Route>
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
