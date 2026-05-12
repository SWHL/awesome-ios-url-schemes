#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SCHEMES_PATH = ROOT / "src" / "data" / "schemes.json"
SOURCES_PATH = ROOT / "src" / "data" / "sources.json"
CATEGORIES_PATH = ROOT / "src" / "data" / "categories.json"
CAPABILITIES_PATH = ROOT / "src" / "data" / "capabilities.json"

ALLOWED_STATUSES = {"verified", "partial", "deprecated", "unknown"}
ALLOWED_SCHEME_TYPES = {"scheme", "universal_link", "webview"}
SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"{path}: invalid JSON: {exc}")


def fail(message: str) -> None:
    print(f"data validation failed: {message}", file=sys.stderr)
    raise SystemExit(1)


def require_string(record: dict, key: str, context: str) -> str:
    value = record.get(key)
    if not isinstance(value, str) or not value.strip():
        fail(f"{context}: `{key}` must be a non-empty string")
    return value


def validate_date(value, context: str) -> None:
    if value is None:
        return
    if not isinstance(value, str):
        fail(f"{context}: date must be a string or null")
    try:
        date.fromisoformat(value)
    except ValueError:
        fail(f"{context}: `{value}` must use YYYY-MM-DD")


def validate_url_scheme(value: str, context: str) -> None:
    parsed = urlparse(value)
    if not parsed.scheme:
        fail(f"{context}: `{value}` is missing a URL scheme")
    if any(char.isspace() for char in value):
        fail(f"{context}: `{value}` must not contain whitespace")


def validate_string_list(
    value, key: str, context: str, *, allow_empty: bool = False
) -> None:
    if not isinstance(value, list):
        fail(f"{context}: `{key}` must be a list")
    if not allow_empty and not value:
        fail(f"{context}: `{key}` must not be empty")
    for item in value:
        if not isinstance(item, str) or not item.strip():
            fail(f"{context}: `{key}` values must be non-empty strings")


def main() -> None:
    schemes = load_json(SCHEMES_PATH)
    sources = load_json(SOURCES_PATH)
    categories = load_json(CATEGORIES_PATH)
    capabilities = load_json(CAPABILITIES_PATH)

    if not isinstance(schemes, list):
        fail("schemes.json must contain a list")
    if not isinstance(sources, list):
        fail("sources.json must contain a list")
    if not isinstance(categories, list):
        fail("categories.json must contain a list")
    if not isinstance(capabilities, list):
        fail("capabilities.json must contain a list")

    source_ids = set()
    for source in sources:
        source_id = require_string(source, "id", "source")
        if source_id in source_ids:
            fail(f"duplicate source id `{source_id}`")
        source_ids.add(source_id)
        require_string(source, "title", f"source `{source_id}`")
        url = require_string(source, "url", f"source `{source_id}`")
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            fail(f"source `{source_id}` has invalid URL `{url}`")

    category_ids = set()
    for category in categories:
        category_id = require_string(category, "id", "category")
        if category_id in category_ids:
            fail(f"duplicate category id `{category_id}`")
        category_ids.add(category_id)
        require_string(category, "name", f"category `{category_id}`")

    capability_ids = set()
    for capability in capabilities:
        capability_id = require_string(capability, "id", "capability")
        if capability_id in capability_ids:
            fail(f"duplicate capability id `{capability_id}`")
        capability_ids.add(capability_id)
        require_string(capability, "name", f"capability `{capability_id}`")

    slugs = set()
    urls = set()
    for app in schemes:
        app_name = require_string(app, "app", "app")
        slug = require_string(app, "slug", f"app `{app_name}`")
        if not SLUG_PATTERN.match(slug):
            fail(f"app `{app_name}` has invalid slug `{slug}`")
        if slug in slugs:
            fail(f"duplicate app slug `{slug}`")
        slugs.add(slug)

        require_string(app, "bundleId", f"app `{app_name}`")
        category = require_string(app, "category", f"app `{app_name}`")
        if category not in category_ids:
            fail(f"app `{app_name}` uses unknown category `{category}`")

        source_ids_for_app = app.get("sourceIds")
        if not isinstance(source_ids_for_app, list) or not source_ids_for_app:
            fail(f"app `{app_name}` must have at least one source id")
        for source_id in source_ids_for_app:
            if source_id not in source_ids:
                fail(f"app `{app_name}` references unknown source `{source_id}`")

        app_schemes = app.get("schemes")
        if not isinstance(app_schemes, list) or not app_schemes:
            fail(f"app `{app_name}` must have at least one scheme")

        for index, scheme in enumerate(app_schemes):
            context = f"app `{app_name}` scheme #{index + 1}"
            url = require_string(scheme, "url", context)
            validate_url_scheme(url, context)
            if url in urls:
                fail(f"duplicate scheme URL `{url}`")
            urls.add(url)

            require_string(scheme, "action", context)
            capability = require_string(scheme, "capability", context)
            if capability not in capability_ids:
                fail(f"{context}: unknown capability `{capability}`")
            validate_string_list(scheme.get("regions"), "regions", context)
            validate_string_list(
                scheme.get("params"), "params", context, allow_empty=True
            )
            scheme_type = require_string(scheme, "type", context)
            if scheme_type not in ALLOWED_SCHEME_TYPES:
                fail(f"{context}: invalid type `{scheme_type}`")
            status = require_string(scheme, "status", context)
            if status not in ALLOWED_STATUSES:
                fail(f"{context}: invalid status `{status}`")
            validate_date(scheme.get("lastVerified"), context)

    print(
        f"Validated {len(schemes)} apps, {len(urls)} schemes, "
        f"{len(source_ids)} sources, {len(category_ids)} categories, "
        f"{len(capability_ids)} capabilities."
    )


if __name__ == "__main__":
    main()
