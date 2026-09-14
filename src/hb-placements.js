const IN_ARTICLE = `<div class="hb-ad-inpage"><div class="hb-ad-inner"><div class="hbagency_cls hbagency_space_341648"></div></div></div>`
const INTERSTITIAL = `<div id='hbagency_space_341646'></div>`
const FLOOR = `<div id='HB_Footer_Close_hbagency_space_341644'><div id='HB_CLOSE_hbagency_space_341644'></div><div id='HB_OUTER_hbagency_space_341644'><div id='hbagency_space_341644'></div></div></div>`
const MAGIC_LEFT = `<div id='HB_Footer_Close_hbagency_space_341645'><div id='HB_CLOSE_hbagency_space_341645'></div><div id='HB_OUTER_hbagency_space_341645'><div id='hbagency_space_341645'></div></div></div>`

const hbPlacementsPlugin = {
  name: 'hbagency-tutorial-placements',
  enforce: 'post',
  transformIndexHtml(html, ctx) {
    const path = ctx.path || ''
    if (!path.includes('/posts/')) return html

    let output = html

    // Keep the existing in-article placement when already present; otherwise add one
    // immediately after the article opens so the ad is part of the tutorial flow.
    if (!output.includes('hbagency_space_341648')) {
      output = output.replace(/(<article\b[^>]*>)/i, `$1\n${IN_ARTICLE}`)
    }

    // Add the HBAgency interstitial as a static placement near the end of the page.
    if (!output.includes('hbagency_space_341646')) {
      output = output.replace('</article>', `${INTERSTITIAL}\n</article>`)
    }

    // Add both sticky placements once, immediately before </body>.
    if (!output.includes('hbagency_space_341644')) {
      output = output.replace('</body>', `${FLOOR}\n</body>`)
    }
    if (!output.includes('hbagency_space_341645')) {
      output = output.replace('</body>', `${MAGIC_LEFT}\n</body>`)
    }

    return output
  }
}

export default hbPlacementsPlugin
