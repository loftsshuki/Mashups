(function () {
  var loader = document.currentScript;
  var loaderBase = loader && loader.src ? new URL(loader.src).origin : "https://mashups.agency";
  class MashupsLaunch extends HTMLElement {
    connectedCallback() {
      if (this.querySelector("iframe")) return;
      var slug = (this.getAttribute("slug") || "").replace(/[^a-z0-9-]/g, "");
      if (!slug) return;
      var base = loaderBase;
      var frame = document.createElement("iframe");
      var key = (this.getAttribute("key") || "").replace(/[^A-Za-z0-9_-]/g, "");
      frame.src = base + "/embed/launch/" + slug + (key ? "?key=" + encodeURIComponent(key) : "");
      frame.title = "Mashups launch: " + slug;
      frame.loading = "lazy";
      frame.allow = "clipboard-write; autoplay";
      frame.style.cssText = "display:block;width:100%;height:330px;border:0;overflow:hidden";
      this.appendChild(frame);
    }
  }
  if (!customElements.get("mashups-launch")) customElements.define("mashups-launch", MashupsLaunch);
})();
