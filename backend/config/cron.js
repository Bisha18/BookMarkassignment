import cron from "node-cron";
import axios from "axios";

const URL = "https://bookmarkassignmentx.onrender.com";

cron.schedule("*/5 * * * *", async () => {
  try {
    const response = await axios.get(URL);
    console.log(`Ping successful: ${new Date().toISOString()} - Status: ${response.status}`);
  } catch (error) {
    console.error(`Ping failed: ${new Date().toISOString()}`, error.message);
  }
});

console.log("Cron job started. Pinging every 5 minutes...");
