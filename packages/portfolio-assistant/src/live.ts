let script: Promise<void> | undefined;
export async function challenge(
  sitekey: string,
  host: HTMLElement,
  signal: AbortSignal,
): Promise<string> {
  if (!script)
    script = new Promise((resolve, reject) => {
      const node = document.createElement("script");
      node.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      node.async = true;
      node.onload = () => resolve();
      node.onerror = () => {
        script = undefined;
        reject(
          new Error(
            "Verification could not load. Cached search remains available.",
          ),
        );
      };
      document.head.append(node);
    });
  await new Promise<void>((resolve, reject) => {
    const cancel = () => finish(new DOMException("Cancelled", "AbortError"));
    const timer = setTimeout(
      () => finish(new Error("Verification script timed out")),
      10000,
    );
    const finish = (error?: Error) => {
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
      error ? reject(error) : resolve();
    };
    if (signal.aborted) {
      finish(new DOMException("Cancelled", "AbortError"));
      return;
    }
    signal.addEventListener("abort", cancel, { once: true });
    script!.then(() => finish(), finish);
  });
  if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
  return new Promise((resolve, reject) => {
    const api = (window as any).turnstile;
    let widget: string | undefined;
    const finish = (error?: Error, value?: string) => {
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
      if (widget) api.remove(widget);
      error ? reject(error) : resolve(value!);
    };
    const cancel = () => finish(new DOMException("Cancelled", "AbortError"));
    const timer = setTimeout(
      () => finish(new Error("Verification timed out")),
      120000,
    );
    signal.addEventListener("abort", cancel, { once: true });
    widget = api.render(host, {
      sitekey,
      action: "pace-rag-generate",
      callback: (value: string) => finish(undefined, value),
      "error-callback": () => finish(new Error("Verification failed")),
      "expired-callback": () => finish(new Error("Verification expired")),
    });
  });
}
