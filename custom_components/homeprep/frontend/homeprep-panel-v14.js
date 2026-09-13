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
}
