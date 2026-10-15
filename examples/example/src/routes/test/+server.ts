import { read } from "$app/server";

import asset from "./somefile.txt?url&no-inline";

export async function GET() {
  const response = read(asset);
  return response;
}
