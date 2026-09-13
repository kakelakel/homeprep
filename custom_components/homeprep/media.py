"""Media support for HomePrep inventory and household assets."""
from __future__ import annotations

import base64
import binascii
from pathlib import Path
from typing import Any
from uuid import uuid4

import voluptuous as vol
from aiohttp import web

from homeassistant.components import websocket_api
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .core.service import HomePrepService

MEDIA_SERVICE_KEY = "media_service"
ASSET_SERVICE_KEY = "asset_service"
MAX_IMAGE_BYTES = 5 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def _inventory_service(hass: HomeAssistant) -> HomePrepService | None:
    for value in hass.data.get(DOMAIN, {}).values():
        if isinstance(value, HomePrepService):
            return value
    return None


def _asset_service(hass: HomeAssistant):
    return hass.data.get(DOMAIN, {}).get(ASSET_SERVICE_KEY)


class HomePrepMediaService:
    """Store useful HomePrep images outside Home Assistant Store JSON."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._directory = Path(hass.config.path(".storage", "homeprep_media"))

    def _inventory(self) -> HomePrepService:
        service = _inventory_service(self._hass)
        if service is None:
            raise RuntimeError("HomePrep inventory service is not loaded")
        return service

    def _assets(self):
        service = _asset_service(self._hass)
        if service is None:
            raise RuntimeError("HomePrep asset service is not loaded")
        return service

    async def _ensure_directory(self) -> None:
        def _mkdir() -> None:
            self._directory.mkdir(parents=True, exist_ok=True)
        await self._hass.async_add_executor_job(_mkdir)

    @staticmethod
    def image_url(resource: dict[str, Any]) -> str | None:
        image_id = resource.get("image_id")
        token = resource.get("image_token")
        if not image_id or not token:
            return None
        return f"/api/homeprep/media/{image_id}/{token}"

    async def _write_image(
        self,
        resource: dict[str, Any],
        update_callback,
        content_type: str,
        encoded_data: str,
        filename: str | None = None,
    ) -> tuple[str, str]:
        if content_type not in ALLOWED_CONTENT_TYPES:
            raise ValueError("Only JPEG, PNG and WebP images are supported")
        try:
            raw = base64.b64decode(encoded_data, validate=True)
        except (binascii.Error, ValueError) as err:
            raise ValueError("Invalid image data") from err
        if not raw or len(raw) > MAX_IMAGE_BYTES:
            raise ValueError("Image must be between 1 byte and 5 MB")

        await self._ensure_directory()
        old_image_id = resource.get("image_id")
        image_id = str(uuid4())
        token = uuid4().hex
        suffix = ALLOWED_CONTENT_TYPES[content_type]
        path = self._directory / f"{image_id}{suffix}"
        await self._hass.async_add_executor_job(path.write_bytes, raw)
        try:
            await update_callback({
                "image_id": image_id,
                "image_token": token,
                "image_content_type": content_type,
                "image_filename": filename or f"{image_id}{suffix}",
            })
        except Exception:
            await self._hass.async_add_executor_job(path.unlink, True)
            raise
        if old_image_id:
            await self._async_delete_files(old_image_id)
        return image_id, token

    async def async_set_image(
        self,
        item_id: str,
        content_type: str,
        encoded_data: str,
        filename: str | None = None,
    ) -> dict[str, Any]:
        inventory = self._inventory()
        item = inventory.get_item(item_id)
        if item is None:
            raise KeyError(item_id)

        async def update(values: dict[str, Any]) -> None:
            updated = await inventory.async_update_item(item_id, values)
            if not updated:
                raise KeyError(item_id)

        image_id, _ = await self._write_image(item, update, content_type, encoded_data, filename)
        refreshed = inventory.get_item(item_id) or {}
        return {"item_id": item_id, "image_id": image_id, "image_url": self.image_url(refreshed)}

    async def async_set_asset_image(
        self,
        asset_id: str,
        content_type: str,
        encoded_data: str,
        filename: str | None = None,
    ) -> dict[str, Any]:
        assets = self._assets()
        asset = assets.get_asset(asset_id)
        if asset is None:
            raise KeyError(asset_id)

        async def update(values: dict[str, Any]) -> None:
            await assets.async_update(asset_id, values)

        image_id, _ = await self._write_image(asset, update, content_type, encoded_data, filename)
        refreshed = assets.get_asset(asset_id) or {}
        return {"asset_id": asset_id, "image_id": image_id, "image_url": self.image_url(refreshed)}

    async def async_remove_image(self, item_id: str) -> None:
        inventory = self._inventory()
        item = inventory.get_item(item_id)
        if item is None:
            raise KeyError(item_id)
        await self._remove_resource_image(
            item,
            lambda values: inventory.async_update_item(item_id, values),
        )

    async def async_remove_asset_image(self, asset_id: str) -> None:
        assets = self._assets()
        asset = assets.get_asset(asset_id)
        if asset is None:
            raise KeyError(asset_id)
        await self._remove_resource_image(
            asset,
            lambda values: assets.async_update(asset_id, values),
        )

    async def _remove_resource_image(self, resource: dict[str, Any], update_callback) -> None:
        image_id = resource.get("image_id")
        if not image_id:
            return
        await update_callback({
            "image_id": None,
            "image_token": None,
            "image_content_type": None,
            "image_filename": None,
        })
        await self._async_delete_files(image_id)

    async def _async_delete_files(self, image_id: str) -> None:
        def _delete() -> None:
            for suffix in ALLOWED_CONTENT_TYPES.values():
                (self._directory / f"{image_id}{suffix}").unlink(missing_ok=True)
        await self._hass.async_add_executor_job(_delete)

    def resolve(self, image_id: str, token: str) -> tuple[Path, str] | None:
        candidates: list[dict[str, Any]] = []
        inventory = _inventory_service(self._hass)
        if inventory is not None:
            candidates.extend(inventory.items)
        assets = _asset_service(self._hass)
        if assets is not None:
            candidates.extend(assets.assets)
        resource = next(
            (
                candidate
                for candidate in candidates
                if candidate.get("image_id") == image_id
                and candidate.get("image_token") == token
            ),
            None,
        )
        if resource is None:
            return None
        content_type = resource.get("image_content_type")
        suffix = ALLOWED_CONTENT_TYPES.get(content_type)
        if not suffix:
            return None
        path = self._directory / f"{image_id}{suffix}"
        if not path.is_file():
            return None
        return path, content_type


class HomePrepMediaView(HomeAssistantView):
    """Serve one HomePrep image using an unguessable resource token."""

    url = "/api/homeprep/media/{image_id}/{token}"
    name = "api:homeprep:media"
    requires_auth = False

    async def get(self, request: web.Request, image_id: str, token: str) -> web.StreamResponse:
        hass: HomeAssistant = request.app["hass"]
        media_service = hass.data.get(DOMAIN, {}).get(MEDIA_SERVICE_KEY)
        if not isinstance(media_service, HomePrepMediaService):
            raise web.HTTPNotFound()
        resolved = media_service.resolve(image_id, token)
        if resolved is None:
            raise web.HTTPNotFound()
        path, content_type = resolved
        return web.FileResponse(
            path,
            headers={"Content-Type": content_type, "Cache-Control": "private, max-age=3600"},
        )


@websocket_api.websocket_command({
    vol.Required("type"): "homeprep/image/set",
    vol.Required("item_id"): str,
    vol.Required("content_type"): vol.In(list(ALLOWED_CONTENT_TYPES)),
    vol.Required("data"): str,
    vol.Optional("filename"): str,
})
@websocket_api.async_response
async def websocket_set_image(hass, connection, msg) -> None:
    media_service = hass.data.get(DOMAIN, {}).get(MEDIA_SERVICE_KEY)
    if not isinstance(media_service, HomePrepMediaService):
        connection.send_error(msg["id"], "not_loaded", "HomePrep media service is not loaded")
        return
    try:
        result = await media_service.async_set_image(msg["item_id"], msg["content_type"], msg["data"], msg.get("filename"))
    except (KeyError, RuntimeError, ValueError) as err:
        connection.send_error(msg["id"], "invalid_image", str(err)); return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "homeprep/image/remove", vol.Required("item_id"): str})
@websocket_api.async_response
async def websocket_remove_image(hass, connection, msg) -> None:
    media_service = hass.data.get(DOMAIN, {}).get(MEDIA_SERVICE_KEY)
    if not isinstance(media_service, HomePrepMediaService):
        connection.send_error(msg["id"], "not_loaded", "HomePrep media service is not loaded"); return
    try:
        await media_service.async_remove_image(msg["item_id"])
    except (KeyError, RuntimeError) as err:
        connection.send_error(msg["id"], "not_found", str(err)); return
    connection.send_result(msg["id"], {"removed": True})


@websocket_api.websocket_command({
    vol.Required("type"): "homeprep/asset/image/set",
    vol.Required("asset_id"): str,
    vol.Required("content_type"): vol.In(list(ALLOWED_CONTENT_TYPES)),
    vol.Required("data"): str,
    vol.Optional("filename"): str,
})
@websocket_api.async_response
async def websocket_set_asset_image(hass, connection, msg) -> None:
    media_service = hass.data.get(DOMAIN, {}).get(MEDIA_SERVICE_KEY)
    if not isinstance(media_service, HomePrepMediaService):
        connection.send_error(msg["id"], "not_loaded", "HomePrep media service is not loaded"); return
    try:
        result = await media_service.async_set_asset_image(msg["asset_id"], msg["content_type"], msg["data"], msg.get("filename"))
    except (KeyError, RuntimeError, ValueError) as err:
        connection.send_error(msg["id"], "invalid_image", str(err)); return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "homeprep/asset/image/remove", vol.Required("asset_id"): str})
@websocket_api.async_response
async def websocket_remove_asset_image(hass, connection, msg) -> None:
    media_service = hass.data.get(DOMAIN, {}).get(MEDIA_SERVICE_KEY)
    if not isinstance(media_service, HomePrepMediaService):
        connection.send_error(msg["id"], "not_loaded", "HomePrep media service is not loaded"); return
    try:
        await media_service.async_remove_asset_image(msg["asset_id"])
    except (KeyError, RuntimeError) as err:
        connection.send_error(msg["id"], "not_found", str(err)); return
    connection.send_result(msg["id"], {"removed": True})


def async_register_media(hass: HomeAssistant) -> None:
    """Register image commands and the tokenized media endpoint once."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    if MEDIA_SERVICE_KEY not in domain_data:
        domain_data[MEDIA_SERVICE_KEY] = HomePrepMediaService(hass)
        hass.http.register_view(HomePrepMediaView)
    websocket_api.async_register_command(hass, websocket_set_image)
    websocket_api.async_register_command(hass, websocket_remove_image)
    websocket_api.async_register_command(hass, websocket_set_asset_image)
    websocket_api.async_register_command(hass, websocket_remove_asset_image)
