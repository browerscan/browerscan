import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  // R2-backed incremental cache for ISR/route cache persistence
  incrementalCache: r2IncrementalCache,
});
