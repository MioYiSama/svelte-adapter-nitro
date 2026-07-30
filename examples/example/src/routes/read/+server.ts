import { read } from "$app/server";

import somefile from "./somefile.txt";

export async function GET() {
  return read(somefile);
}
