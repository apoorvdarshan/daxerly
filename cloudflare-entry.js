let workerPromise;

export default {
  async fetch(request, env, ctx) {
    for (const [key, value] of Object.entries(env)) {
      if (typeof value === "string") process.env[key] = value;
    }

    workerPromise ??= import("./.open-next/worker.js");
    const worker = (await workerPromise).default;
    return worker.fetch(request, env, ctx);
  },
};
