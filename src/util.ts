export function html(data: BodyInit) {
  return new Response(data, { headers: { "Content-Type": "text/html" } });
}

export function redirect(location: string, status: number) {
  return new Response(null, { status, headers: { location } });
}

export function createReadableStream(data: any) {
  if (data === null || data === undefined) return null;

  return new ReadableStream({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    },
  });
}
