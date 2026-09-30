import { BUILTIN_THEMES } from '@vibe/core';
import { and, eq } from 'drizzle-orm';
import { getDb, ensureSchema } from '../db';
import { campaigns, creators, testimonials, sites } from '../db/schema';

/** Compact in-head engine (G1–G5). Config is injected as __VIBE_CONFIG__. */
export const ENGINE_IIFE = `(()=>{try{var C=window.__VIBE_CONFIG__;if(!C||C.killSwitch)return;var ua=navigator.userAgent||"";if(/(googlebot|bingbot|baiduspider|yandexbot)/i.test(ua)&&!/Lighthouse/i.test(ua))return;if(document.documentElement.getAttribute("data-vibe-ssr")==="1")return;var u=new URL(location.href),v=(u.searchParams.get("vibe")||"").toLowerCase(),us=(u.searchParams.get("utm_source")||"").toLowerCase(),uc=(u.searchParams.get("utm_campaign")||"").toLowerCase(),rh="";try{rh=document.referrer?new URL(document.referrer).hostname.toLowerCase():""}catch(e){}var m=null,i=0,cm=C.campaigns||[];for(;i<cm.length;i++){var c=cm[i];if(v&&c.vibeCode&&c.vibeCode.toLowerCase()===v){m=c;break}if(us&&c.utmSource&&c.utmSource.toLowerCase()===us&&(!c.utmCampaign||c.utmCampaign.toLowerCase()===uc)){m=c;break}if(rh&&c.referrerRules&&c.referrerRules.some(function(r){return rh.indexOf(r.toLowerCase())>=0})){m=c;break}}if(!m)return;var st=performance.now(),done=0,sid="vibe-prehide";function hide(){if(document.getElementById(sid))return;var s=document.createElement("style");s.id=sid;s.textContent="[data-vibe-slot]{visibility:hidden!important}";(document.head||document.documentElement).appendChild(s)}function show(){var s=document.getElementById(sid);if(s&&s.parentNode)s.parentNode.removeChild(s)}hide();setTimeout(function(){if(!done){done=1;show()}},300);var vid=document.cookie.match(/(?:^|; )_vibe_vid=([^;]*)/);vid=vid?vid[1]:("v_"+Math.random().toString(36).slice(2)+Date.now().toString(36));document.cookie="_vibe_vid="+vid+";path=/;max-age=2592000;SameSite=Lax";var h=2166136261,str=vid+":"+m.id,j=0;for(;j<str.length;j++){h^=str.charCodeAt(j);h=Math.imul(h,16777619)}if((h>>>0)%100<(m.holdoutPct||0)){done=1;show();return}function setTxt(el,t){el.textContent=t;el.style.visibility="visible"}function apply(){if(done)return;var slots=m.slots||{},els=document.querySelectorAll("[data-vibe-slot]");els.forEach(function(el){var n=el.getAttribute("data-vibe-slot");if(!n||slots[n]==null)return;if(n==="hero-image"){var img=el.tagName==="IMG"?el:el.querySelector("img");if(img&&String(slots[n]).indexOf("https://")===0){var p=new Image();p.src=slots[n];var go=function(){img.src=slots[n];img.style.visibility="visible";el.style.visibility="visible"};if(p.decode)p.decode().then(go).catch(go);else p.onload=go;return}}setTxt(el,slots[n]);if(n==="cta"&&el.tagName==="A"&&m.ctaUrl){var href=m.ctaUrl;if(href.indexOf("https://")===0||href.indexOf("/")===0)el.href=href}});if(m.themeTokens){var k;for(k in m.themeTokens)document.documentElement.style.setProperty("--vibe-"+k,m.themeTokens[k])}done=1;show();var exec=Math.round(performance.now()-st);try{navigator.sendBeacon&&navigator.sendBeacon(C.ingestUrl,new Blob([JSON.stringify({publicKey:C.publicKey,events:[{visitorId:vid,siteId:C.siteId,campaignId:m.id,creatorId:m.creatorId,variant:"personalized",type:"slot_applied",metrics:{execMs:exec,hideMs:exec}}]})],{type:"application/json"}))}catch(e){}}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();window.vibe=window.vibe||{};window.vibe.debug=function(){console.log("vibe",m,performance.now()-st)};}catch(e){try{var x=document.getElementById("vibe-prehide");if(x&&x.parentNode)x.parentNode.removeChild(x)}catch(e2){}}})();`;

export async function compileSdkBundle(siteId: string): Promise<string | null> {
  await ensureSchema();
  const db = getDb();
  const siteRows = await db.select().from(sites).where(eq(sites.id, siteId));
  const site = siteRows[0];
  if (!site) return null;

  const active = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.siteId, siteId), eq(campaigns.status, 'active')));

  const creatorRows = await db.select().from(creators);
  const testimonialRows = await db.select().from(testimonials);

  const payload = {
    siteId: site.id,
    publicKey: site.publicKey,
    ingestUrl: '/api/collect',
    killSwitch: site.killSwitch,
    selectorMap: site.selectorMap ? JSON.parse(site.selectorMap) : {},
    campaigns: active.map((cmp) => {
      const creator = creatorRows.find((c) => c.id === cmp.creatorId);
      const ids = JSON.parse(cmp.testimonialIds || '[]') as string[];
      const quote = testimonialRows.find((x) => ids.includes(x.id));
      const theme = BUILTIN_THEMES[cmp.themeId];
      let ctaUrl = cmp.productUrl;
      if (cmp.promoCode) {
        ctaUrl = `/discount/${encodeURIComponent(cmp.promoCode)}?redirect=${encodeURIComponent(cmp.productUrl)}`;
      }
      return {
        id: cmp.id,
        creatorId: cmp.creatorId,
        vibeCode: creator?.vibeCode ?? '',
        utmSource: creator?.utmSource ?? '',
        utmCampaign: creator?.utmCampaign ?? '',
        referrerRules: creator ? (JSON.parse(creator.referrerRules) as string[]) : [],
        holdoutPct: cmp.holdoutPct,
        promoCode: cmp.promoCode,
        productUrl: cmp.productUrl,
        ctaUrl,
        themeTokens: theme
          ? {
              primary: theme.primaryColor,
              bg: theme.backgroundColor,
              text: theme.textColor,
              accent: theme.accentColor,
              radius: theme.borderRadius,
            }
          : {},
        slots: {
          headline: cmp.headline,
          subheadline: cmp.subheadline,
          cta: cmp.cta,
          offer: cmp.offer,
          banner: cmp.offer,
          'hero-image': cmp.hero,
          testimonial: quote ? `${quote.quote} — ${quote.author}` : '',
          bundle: `${cmp.productTitle} ${cmp.productPrice}`,
        },
      };
    }),
  };

  return `window.__VIBE_CONFIG__=${JSON.stringify(payload)};${ENGINE_IIFE}`;
}
