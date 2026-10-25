// Runs inline in <head> before first paint (app/layout.tsx): copies the saved theme choice to <html data-theme>, so a
// reader who picked Dark never sees a flash of Light. With no choice, CSS follows prefers-color-scheme.
// A plain module (not "use client"), so the server layout can inline the string.
export const THEME_KEY = "clearlease-theme";
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
