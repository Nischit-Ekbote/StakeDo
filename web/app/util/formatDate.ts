export const formatDate = (hexTimestamp: string | null): string => {
  if (!hexTimestamp) return "No deadline";

  try {
    // Convert hex string to a decimal number
    const timestamp = parseInt(hexTimestamp, 16);

    // If it's in milliseconds, convert to seconds
    const adjusted = timestamp > 9999999999 ? Math.floor(timestamp / 1000) : timestamp;

    const date = new Date(adjusted * 1000);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (err) {
    console.error("Failed to parse timestamp:", hexTimestamp, err);
    return "Invalid date";
  }
};
