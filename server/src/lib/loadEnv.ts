import * as dotenv from "dotenv"
import path from "path"

const envRoot = path.resolve(__dirname, "../../")

// Load the shared defaults first and then allow local-only overrides for
// development, so local work can use a separate database safely.
dotenv.config({ path: path.join(envRoot, ".env") })
dotenv.config({ path: path.join(envRoot, ".env.local"), override: true })
