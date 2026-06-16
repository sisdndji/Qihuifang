const {
  seedCrawledDataIfEmpty,
  crawlAndUpdate
} = require('../services/masterDistribution');

async function main() {
  const seeded = await seedCrawledDataIfEmpty();
  if (seeded) {
    console.log('✓ 已写入初始地域分布基数');
  }
  await crawlAndUpdate();
  console.log('✓ 地域分布爬虫更新完成');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
