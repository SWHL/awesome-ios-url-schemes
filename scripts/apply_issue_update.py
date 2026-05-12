#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import re
from datetime import date
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
SCHEMES_PATH = ROOT / "src" / "data" / "schemes.json"
CATEGORIES_PATH = ROOT / "src" / "data" / "categories.json"
SOURCE_ID = "user-submission"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def field(body: str, name: str) -> str:
    inline_pattern = re.compile(rf"^{re.escape(name)}[：:]\s*(.+?)\s*$", re.MULTILINE)
    inline_match = inline_pattern.search(body)
    if inline_match:
        return clean_field_value(inline_match.group(1))

    form_pattern = re.compile(rf"^###\s+{re.escape(name)}\s*\n+(.*?)(?=\n###\s+|\Z)", re.MULTILINE | re.DOTALL)
    form_match = form_pattern.search(body)
    if form_match:
        return clean_field_value(form_match.group(1))

    return ""


def clean_field_value(value: str) -> str:
    cleaned = value.strip()
    if cleaned in {"_No response_", "No response"}:
        return ""
    return cleaned


def extract_payload(body: str, marker: str) -> dict:
    match = re.search(rf"<!--\s*{re.escape(marker)}\s*(\{{.*?\}})\s*-->", body, re.DOTALL)
    if not match:
        return {}
    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError:
        return {}


def slugify(value: str, fallback: str) -> str:
    ascii_slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    if ascii_slug:
        return ascii_slug
    return re.sub(r"[^a-z0-9]+", "-", fallback.lower()).strip("-") or "app"


def unique_slug(base: str, apps: list[dict]) -> str:
    existing = {app["slug"] for app in apps}
    candidate = base
    index = 2
    while candidate in existing:
        candidate = f"{base}-{index}"
        index += 1
    return candidate


def params_for(url: str) -> list[str]:
    params: list[str] = []
    for match in re.findall(r"\{([A-Za-z0-9_\-\u4e00-\u9fff]+)\}", url):
        if match not in params:
            params.append(match)
    return params


def capability_for(action: str, url: str) -> str:
    text = f"{action} {url}"
    if any(keyword in text for keyword in ["扫一扫", "扫码"]):
        return "scan"
    if "付款码" in text:
        return "payment-code"
    if any(keyword in text for keyword in ["搜索", "search"]):
        return "app-search"
    if any(keyword in text for keyword in ["网页", "url", "http"]):
        return "open-url"
    if any(keyword in text for keyword in ["用户", "profile", "主页"]):
        return "profile"
    return "open-app"


def apply_feedback(apps: list[dict], title: str, body: str) -> bool:
    payload = extract_payload(body, "scheme-feedback")
    url = payload.get("url") or field(body, "URL Scheme")
    result = payload.get("result")
    if not result:
        if title.startswith(("Report broken scheme:", "Broken scheme:")):
            result = "broken"
        elif title.startswith("Verified scheme:"):
            result = "verified"
    if not url or result not in {"verified", "broken"}:
        return False

    next_status = "verified" if result == "verified" else "deprecated"
    for app in apps:
        for scheme in app["schemes"]:
            if scheme["url"] == url:
                if scheme.get("status") == next_status:
                    return False
                scheme["status"] = next_status
                scheme["lastVerified"] = date.today().isoformat()
                note = "User reported this scheme as usable." if result == "verified" else "User reported this scheme as broken."
                scheme["notes"] = note
                if SOURCE_ID not in app["sourceIds"]:
                    app["sourceIds"].append(SOURCE_ID)
                return True
    return False


def apply_submission(apps: list[dict], body: str) -> bool:
    payload = extract_payload(body, "scheme-submission")
    app_name = field(body, "App 名称") or payload.get("app", "")
    bundle_id = field(body, "Bundle ID") or payload.get("bundleId", "")
    url = field(body, "URL Scheme") or payload.get("url", "")
    action = field(body, "用途") or payload.get("action", "")
    category = field(body, "分类") or payload.get("category", "")
    status = field(body, "验证状态") or payload.get("status", "unknown")
    source = field(body, "来源/测试说明") or payload.get("source", "")
    if not source:
        source = field(body, "来源")

    if not app_name or not url or not action:
        return False
    if not urlparse(url).scheme:
        return False

    categories = {item["id"] for item in load_json(CATEGORIES_PATH)}
    if category not in categories:
        category = "tools"
    if status not in {"verified", "partial", "deprecated", "unknown"}:
        status = "unknown"

    for app in apps:
        for scheme in app["schemes"]:
            if scheme["url"] == url:
                return False

    app = next((item for item in apps if item.get("localizedName") == app_name or item["app"] == app_name), None)
    if app is None:
        scheme_name = urlparse(url).scheme
        slug = unique_slug(slugify(app_name, scheme_name), apps)
        app = {
            "app": re.sub(r"[^A-Za-z0-9]+", "", slug.title()) or scheme_name.title(),
            "localizedName": app_name,
            "slug": slug,
            "bundleId": bundle_id or f"unknown.{slug}",
            "category": category,
            "platforms": ["iPhone", "iPad"],
            "tags": ["User Submitted"],
            "sourceIds": [SOURCE_ID],
            "schemes": [],
        }
        apps.append(app)
    elif SOURCE_ID not in app["sourceIds"]:
        app["sourceIds"].append(SOURCE_ID)

    app["schemes"].append(
        {
            "url": url,
            "action": action,
            "description": f"{app_name} - {action}",
            "capability": capability_for(action, url),
            "regions": ["CN"],
            "params": params_for(url),
            "type": "scheme",
            "status": status,
            "lastVerified": date.today().isoformat() if status == "verified" else None,
            "iosVersion": None,
            "appVersion": None,
            "notes": source,
        }
    )
    return True


def main() -> None:
    title = os.environ.get("ISSUE_TITLE", "")
    body = os.environ.get("ISSUE_BODY", "")
    apps = load_json(SCHEMES_PATH)
    changed = apply_feedback(apps, title, body) or apply_submission(apps, body)
    if changed:
        save_json(SCHEMES_PATH, apps)
        print("updated=true")
    else:
        print("updated=false")


if __name__ == "__main__":
    main()
