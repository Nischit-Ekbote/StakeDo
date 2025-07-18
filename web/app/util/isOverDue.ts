export const isOverdue = (deadline: string | null): boolean => {
  if (!deadline) return false;

  const timestamp = parseInt(deadline, 16); // <-- HEX!
  if (isNaN(timestamp)) return false;
  return new Date(timestamp * 1000) < new Date();
};
