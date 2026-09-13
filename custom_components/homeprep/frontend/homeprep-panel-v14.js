import "./homeprep-panel-v13.js?v=1";

const HomePrepPanel = customElements.get("homeprep-panel");

if (HomePrepPanel && !HomePrepPanel.prototype.__homePrepV14Applied) {
  const proto = HomePrepPanel.prototype;
  proto.__homePrepV14Applied = true;

  const replaceDateValue = (html, name, value) => {
    const safe = String(value || "").replaceAll("&", "&amp;").replaceAll('"', "&quot;");
    const pattern = new RegExp(`(<input[^>]*name=["']${name}["'][^>]*value=["'])[^"']*(["'])`);
    return html.replace(pattern, `$1${safe}$2`);
  };

  const oldRenderItemForm = proto.renderItemForm;
  proto.renderItemForm = function renderItemForm(item) {
    let html = oldRenderItemForm.call(this, item);
    const inspection = item
      ? (this._tasks || []).find((task) => task.task_kind === "inspection" && task.linked_item_id === item.id)
      : null;
    if (inspection?.enabled) {
      html = replaceDateValue(html, "next_check_at", inspection.next_due_at || item?.next_check_at || "");
    }
    return html.replace("Next check / first inspection due", "First due / next check");
  };

  const oldRenderContainerForm = proto.renderContainerForm;
  proto.renderContainerForm = function renderContainerForm(container) {
    let html = oldRenderContainerForm.call(this, container);
    const inspection = container ? this.containerInspection(container.id) : null;
    if (inspection?.enabled) {
      html = replaceDateValue(html, "next_check_at", inspection.next_due_at || container?.next_check_at || "");
    }
    return html.replace("<span>Next check</span>", "<span>First due / next check</span>");
  };

  /*
   * The desktop dropdown is intentionally offset a few pixels below its
   * top-level navigation item. Without a hit area across that visual gap,
   * pointerleave fires before the cursor can reach the submenu and closes it.
   * This invisible bridge keeps the pointer inside the <details> hit area
   * while moving from the top-level item into the dropdown.
   */
  const oldStyles = proto.styles;
  proto.styles = function styles() {
    return `${oldStyles.call(this)}
      .hp-side-nav details[open]::after {
        content:"";
        position:absolute;
        left:0;
        right:0;
        top:100%;
        height:8px;
        z-index:19;
      }
    `;
  };
}
