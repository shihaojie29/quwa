import { createPool } from "./db/pool";
import { loadConfig } from "./db/config";
import { createApp } from "./http/app";
import { MySqlQuwaStore } from "./store/MySqlQuwaStore";

const config = loadConfig();
const pool = createPool(config.db);
const app = createApp({ store: new MySqlQuwaStore(pool) });

app.listen(config.port, () => {
  console.log(`Quwa API listening on http://127.0.0.1:${config.port}`);
});

