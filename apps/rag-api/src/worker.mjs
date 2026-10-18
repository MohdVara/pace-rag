import { DurableObject } from "cloudflare:workers";
import { BudgetLedger } from "./budget.mjs";
import { handle } from "./handler.mjs";
export class BudgetCoordinator extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ledger = new BudgetLedger(ctx.storage.sql, (fn) =>
      ctx.storage.transactionSync(fn),
    );
  }
  async fetch(request) {
    try {
      const { action, args } = await request.json();
      let result;
      if (action === "admit") result = this.ledger.admit(args);
      else if (action === "start") result = this.ledger.start(args.id);
      else if (action === "cancel") result = this.ledger.cancel(args.id);
      else if (action === "settle")
        result = this.ledger.settle(args.id, args.actual);
      else if (action === "pause") {
        this.ledger.pause(args.until, args.reason);
        result = { ok: true };
      } else if (action === "mint")
        result = this.ledger.mint(args.network, args.id);
      else throw new Error("Invalid coordinator action");
      return Response.json(result);
    } catch (error) {
      return Response.json(
        {
          code: error.code || "COORDINATOR_UNAVAILABLE",
          message: error.message,
        },
        { status: 503 },
      );
    }
  }
}
export default { fetch: (request, env) => handle(request, env) };
