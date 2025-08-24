
export const SystemApi = {
  reboot: async (): Promise<void> => {
    return (await fetch(`/api/system/command?action=reboot`)).json();
  },
  restartService: async (): Promise<void> => {
    return (await fetch(`/api/system/command?action=restart-service`)).json();
  },
};
