export const SystemService = () => {
  return {
    reboot: () => {},
    restartService: () => {
      process.exit(1);
    },
  };
};
