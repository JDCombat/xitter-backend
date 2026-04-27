import requests
import uuid

BASE = "http://localhost:3000"
RUN  = uuid.uuid4().hex[:6]

for i in range(25):
    username = f"user_{RUN}_{i}"
    email    = f"user_{RUN}_{i}@test.local"
    password = "Test1234!"

    requests.post(f"{BASE}/auth/signup", json={"username": username, "email": email, "password": password})

    r = requests.post(f"{BASE}/auth/signin", json={"username": username, "password": password})
    token = r.json()["access_token"]

    requests.post(f"{BASE}/post/create", json={"content": f"post one from {username} #xitter #trending"}, headers={"Authorization": f"Bearer {token}"})
    tag = "#rare" if i < 5 else "#xitter"
    requests.post(f"{BASE}/post/create", json={"content": f"post two from {username} {tag}"}, headers={"Authorization": f"Bearer {token}"})


print("All done. ")
