import requests

services = {
    "NGINX (todo-app frontend)": "http://localhost:8080",
    "MongoDB (проверка соединения)": "http://localhost:27017",
    "Prometheus": "http://localhost:9090/-/ready",
    "Grafana": "http://localhost:3000/login"
}

print("🔍 Health check started...\n")

for name, url in services.items():
    try:
        response = requests.get(url, timeout=5)
        if response.status_code in [200, 302]:
            print(f"✅ {name} is UP (Status {response.status_code})")
        else:
            print(f"⚠️  {name} is UNSTABLE (Status {response.status_code})")
    except requests.exceptions.RequestException as e:
        print(f"❌ {name} is DOWN ({e})")

print("\n✅ Health check completed.")
