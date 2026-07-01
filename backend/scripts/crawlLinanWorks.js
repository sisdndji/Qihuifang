const { syncLinanWorkImages, getLinanWorksGallery } = require('../services/linanWorksCrawler');

async function main() {
  const result = await syncLinanWorkImages();
  console.log('爬虫结果:', result);
  const gallery = await getLinanWorksGallery();
  console.log(`作品数量: ${gallery.works.length}`);
  gallery.works.forEach((w) => console.log(`  - ${w.title}: ${w.image_url}`));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
