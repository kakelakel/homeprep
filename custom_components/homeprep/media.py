"""Inventory image support for HomePrep."""
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


class HomePrepMediaService:
    """Store inventory images outside Home Assistant Store JSON."""

    def __init__(self, hass: HomeAssistant, inventory_service: HomePrepService) -> None:
        self._hass = hass
        self._inventory_service = inventory_service
        self._directory = Path(hass.config.path(".storage", "homeprep_media"))

    async def async_setup(self) -> None:
        await self._hass.async_add_executor_job(self._directory.mkdir, 0o755, True, True)

    def image_url(self, item: dict[str, Any]) -> str | None:
        image_id = item.get("image_id")
        token = item.get("image_token")
        if not image_id or not token:
            return None
        return f"/api/homeprep/media/{image_id}/{token}"

    async def async_set_image(
        self,
        item_id: str,
        content_type: str,
        encoded_data: str,
        filename: str | None = None,
    ) -> dict[str, Any]:
        item = self._inventory_service.get_item(item_id)
        if item is None:
            raise KeyError(item_id)
        if content_type not in ALLOWED_CONTENT_TYPES:
            raise ValueError("Only JPEG, PNG and WebP images are supported")

        try:
            raw = base64.b64decode(encoded_data, validate=True)
        except (binascii.Error, ValueError) as err:
            raise ValueError("Invalid image data") from err

        if not raw or len(raw) > MAX_IMAGE_BYTES:
            raise ValueError("Image must be between 1 byte and 5 MB")

        old_image_id = item.get("image_id")
        image_id = str(uuid4())
        token = uuid4().hex
        suffix = ALLOWED_CONTENT_TYPES[content_type]
        path = self._directory / f"{image_id}{suffix}"
        await self._hass.async_add_executor_job(path.write_bytes, raw)

        updated = await self._inventory_service.async_update_item(
            item_id,
            {
                "image_id": image_id,
                "image_token": token,
                "image_content_type": content_type,
                "image_filename": filename or f"{image_id}{suffix}",
            },
        )
        if not updated:
            await self._hass.async_add_executor_job(path.unlink, True)
            raise KeyError(item_id)

        if old_image_id:
            await self._async_delete_files(old_image_id)

        refreshed = self._inventory_service.get_item(item_id) or {}
        return {
            "item_id": item_id,
            "image_id": image_id,
            "image_url": self.image_url(refreshed),
        }

    async def async_remove_image(self, item_id: str) -> None:
        item = self._inventory_service.get_item(item_id)
        if item is None:
            raise KeyError(item_id)
        image_id = item.get("image_id")
        if not image_id:
            return
        await self._inventory_service.async_update_item(
            item_id,
            {
                "image_id": None,
                "image_token": None,
                "image_content_type": None,
                "image_filename": None,
            },
        )
        await self._async_delete_files(image_id)

    async def _async_delete_files(self, image_id: str) -> None:
        def _delete() -> None:
            for suffix in ALLOWED_CONTENT_TYPES.values():
                (self._directory / f"{image_id}{suffix}").unlink(missing_ok=True)
        await self._hass.async_add_executor_job(_delete)

    def resolve(self, image_id: str, token: str) -> tuple[Path, str] | None:
        item = next(
            (
                candidate
                for candidate in self._inventory_service.items
                if candidate.get("image_id") == image_id
                and candidate.get("image_token") == token
            ),
            None,
        )
        if item is None:
            return None
        content_type = item.get("image_content_type")
        suffix = ALLOWED_CONTENT_TYPES.get(content_type)
        if not suffix:
            return None
        path = self._directory / f"{image_id}{suffix}"
        if not path.is_file():
            return None
        return path, content_type


class HomePrepMediaView(HomeAssistantView):
    """Serve one inventory image using an unguessable item token."""

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
        return web.FileResponse(path, headers={"Content-Type": content_type, "Cache-Control": "private, max-age=3600"})


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
        result = await media_service.async_set_image(
            msg["item_id"], msg["content_type"], msg["data"], msg.get("filename")
        )
    except (KeyError, ValueError) as err:
        connection.send_error(msg["id"], "invalid_image", str(err))
        return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({
    vol.Required("type"): "homeprep/image/remove",
    vol.Required("item_id"): str,
})
@websocket_api.async_response
async def websocket_remove_image(hass, connection, msg) -> None:
    media_service = hass.data.get(DOMAIN, {}).get(MEDIA_SERVICE_KEY)
    if not isinstance(media_service, HomePrepMediaService):
        connection.send_error(msg["id"], "not_loaded", "HomePrep media service is not loaded")
        return
    try:
        await media_service.async_remove_image(msg["item_id"])
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Inventory item not found")
        return
    connection.send_result(msg["id"], {"removed": True})


def async_register_media_websocket(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, websocket_set_image)
    websocket_api.async_register_command(hass, websocket_remove_image)
