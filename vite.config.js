import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        pinterestTutorials: resolve(import.meta.dirname, 'pinterest-tutorials.html'),
        firstProject: resolve(import.meta.dirname, 'posts/first-crochet-project.html'),
        grannySquare: resolve(import.meta.dirname, 'posts/granny-square.html'),
        yarnGuide: resolve(import.meta.dirname, 'posts/yarn-guide.html'),
        amigurumi: resolve(import.meta.dirname, 'posts/amigurumi.html'),
        crochetFlower: resolve(import.meta.dirname, 'posts/crochet-flower.html'),
        howToReadCrochetPatterns: resolve(import.meta.dirname, 'posts/how-to-read-crochet-patterns.html'),
        singleVsDoubleCrochet: resolve(import.meta.dirname, 'posts/single-vs-double-crochet.html'),
        crochetHookSizesGuide: resolve(import.meta.dirname, 'posts/crochet-hook-sizes-guide.html'),
        howToFixCrochetMistakes: resolve(import.meta.dirname, 'posts/how-to-fix-crochet-mistakes.html'),
        crochetBlanketForBeginners: resolve(import.meta.dirname, 'posts/crochet-blanket-for-beginners.html'),
        magicRingTutorial: resolve(import.meta.dirname, 'posts/magic-ring-tutorial.html'),
        crochetVsKnitting: resolve(import.meta.dirname, 'posts/crochet-vs-knitting.html'),
        bestYarnForAmigurumi: resolve(import.meta.dirname, 'posts/best-yarn-for-amigurumi.html'),
        howToCrochetInTheRound: resolve(import.meta.dirname, 'posts/how-to-crochet-in-the-round.html'),
        crochetStitchAbbreviations: resolve(import.meta.dirname, 'posts/crochet-stitch-abbreviations.html'),
        howToCrochetAScarf: resolve(import.meta.dirname, 'posts/how-to-crochet-a-scarf.html'),
        crochetGiftIdeas: resolve(import.meta.dirname, 'posts/crochet-gift-ideas.html'),
        howToBlockCrochet: resolve(import.meta.dirname, 'posts/how-to-block-crochet.html'),
        crochetTensionGuide: resolve(import.meta.dirname, 'posts/crochet-tension-guide.html'),
        c2cCrochetGuide: resolve(import.meta.dirname, 'posts/c2c-crochet-guide.html'),
        crochetCoastersPattern: resolve(import.meta.dirname, 'posts/crochet-coasters-pattern.html'),
        howToJoinYarn: resolve(import.meta.dirname, 'posts/how-to-join-yarn.html'),
        crochetVsStoreBought: resolve(import.meta.dirname, 'posts/crochet-vs-store-bought.html'),
        crochetMarketBag: resolve(import.meta.dirname, 'posts/crochet-market-bag.html'),
        seasonalCrochetProjects: resolve(import.meta.dirname, 'posts/seasonal-crochet-projects.html')
      }
    }
  }
})
