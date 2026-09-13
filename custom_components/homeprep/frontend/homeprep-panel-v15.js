import "./homeprep-panel-v14.js?v=1";

const HomePrepPanel = customElements.get("homeprep-panel");

if (HomePrepPanel && !HomePrepPanel.prototype.__homePrepV15Applied) {
  const proto = HomePrepPanel.prototype;
  proto.__homePrepV15Applied = true;

  const oldRender = proto.render;
  proto.render = function render() {
    const result = oldRender.call(this);

    // Shopping attention already lives in the Attention queue. Remove the
    // redundant inline cart stat from the readiness section header.
    this.querySelector(".hp-readiness-panel .hp-inline-stat")?.remove();

    // Keep desktop dropdowns open while the pointer crosses the visual gap
    // between the top-level group and its submenu.
    const nav = this.querySelector(".hp-side-nav");
    if (nav && window.matchMedia?.("(hover:hover) and (pointer:fine)").matches) {
      nav.querySelectorAll("details").forEach((details) => {
        if (details.dataset.hpHoverBridge === "1") return;
        details.dataset.hpHoverBridge = "1";
        let closeTimer = null;
        const cancelClose = () => {
          if (closeTimer) window.clearTimeout(closeTimer);
          closeTimer = null;
          details.open = true;
        };
        const scheduleClose = () => {
          if (closeTimer) window.clearTimeout(closeTimer);
          closeTimer = window.setTimeout(() => {
            if (!details.matches(":hover") && !details.querySelector(".hp-nav-menu:hover")) {
              details.open = false;
            }
          }, 180);
        };
        details.addEventListener("pointerenter", cancelClose);
        details.addEventListener("pointerleave", scheduleClose);
        details.querySelector(".hp-nav-menu")?.addEventListener("pointerenter", cancelClose);
        details.querySelector(".hp-nav-menu")?.addEventListener("pointerleave", scheduleClose);
      });
    }

    return result;
  };

  const oldStyles = proto.styles;
  proto.styles = function styles() {
    return `${oldStyles.call(this)}
      @media (hover:hover) and (pointer:fine) {
        .hp-side-nav details::after {
          content:"";
          position:absolute;
          left:0;
          right:0;
          top:100%;
          height:10px;
          pointer-events:auto;
        }
      }
    `;
  };
}
