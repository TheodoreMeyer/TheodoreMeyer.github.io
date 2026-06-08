# scripts/extract_meta.py
import yaml

data = yaml.safe_load(open("svg/docs/_project.yml"))

print(f"slug={data['slug']}")
print(f"title={data['title']}")