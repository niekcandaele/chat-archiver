import { getHttp } from './src/http/http';
import { startIngesters } from './src/service/ingesters';
import { Search } from './src/service/search';

async function main() {
  await Search.setup();
  await getHttp();
  await startIngesters();
}

main()
  .catch(console.error)

