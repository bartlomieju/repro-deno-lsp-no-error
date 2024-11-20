import { Hono, HonoRequest } from 'hono'
import { logger } from "hono/logger"
import { delay } from "@std/async"

const app = new Hono()
app.use(logger())

async function checkDisconnect(req: HonoRequest) {
  while(!req.raw.signal.aborted) {
    await delay(1000);
  }

  console.log("Aborted");
  return;
}

app.get('/hello', async (c) => {

  // Simulate a long-running task
  // The cancel should immediately happen and finish the request
  // On Mac, this behavior is correct, but on Windows, the cancellation never fires
  await Promise.race([
    delay(10000),
    checkDisconnect(c.req),
  ]);

  return c.text("Hello from Hono!");
})

Deno.serve(app.fetch)