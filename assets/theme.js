/* Apply the saved theme before CSS is painted. */
(function(){
  'use strict';
  const KEY='souhaits_theme_v1';const media=typeof matchMedia==='function'?matchMedia('(prefers-color-scheme: dark)'):null;
  let preference='system';try{const saved=localStorage.getItem(KEY);if(['light','dark','system'].includes(saved))preference=saved;}catch(_error){}
  function apply(value,persist=false){
    preference=['light','dark','system'].includes(value)?value:'system';
    const theme=preference==='system'?(media?.matches?'dark':'light'):preference;
    document.documentElement.dataset.theme=theme;document.documentElement.dataset.themePreference=preference;
    if(persist)try{localStorage.setItem(KEY,preference);}catch(_error){}
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='dark'?'#101e19':'#f4f5f0';
    window.dispatchEvent(new CustomEvent('souhaits:themechange',{detail:{theme,preference}}));
    const control=document.getElementById('themeSelect');if(control)control.value=preference;
  }
  apply(preference);
  function bind(){const control=document.getElementById('themeSelect');if(control){control.value=preference;control.addEventListener('change',()=>apply(control.value,true));}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  media?.addEventListener?.('change',()=>{if(preference==='system')apply('system');});
  window.addEventListener('storage',event=>{if(event.key===KEY)apply(event.newValue||'system');});
})();
