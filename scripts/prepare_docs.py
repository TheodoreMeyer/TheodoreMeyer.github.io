from pathlib import Path
import sys
import yaml

project_dir = Path(sys.argv[1]).resolve()

project_yml = project_dir / "_project.yml"

if not project_yml.exists():
    raise RuntimeError(f"Missing {project_yml}")

with open(project_yml, "r", encoding="utf-8") as f:
    project = yaml.safe_load(f)

slug = project["slug"]

def process(md_file: Path):
    text = md_file.read_text(encoding="utf-8")

    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) < 3:
            return
        front = yaml.safe_load(parts[1]) or {}
        body = parts[2]
    else:
        front = {}
        body = text

    front["layout"] = "project"

    # IMPORTANT: DO NOT inject project anymore
    # routing is URL-based now

    with open(md_file, "w", encoding="utf-8") as f:
        f.write("---\n")
        yaml.safe_dump(front, f, sort_keys=False, allow_unicode=True)
        f.write("---\n")
        f.write(body)

for md in project_dir.rglob("*.md"):
    process(md)

print(f"Prepared docs for {slug}")