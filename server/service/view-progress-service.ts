import { ViewProgressResponse } from "../../domain/progress";

export const ViewProgressService = () => ({
  getProgress: async (): Promise<ViewProgressResponse> => {
    return {};
  },
});
